# ── FILE: llm_pro/training/pretrain.py ─────────────────────────────────
"""
Main pretraining script. Sets up DeepSpeed, distributed environment,
and the main training loop with stability features.
"""

import os
import argparse
import torch
from loguru import logger

# Try importing DeepSpeed, fallback to standard torch if not available for testing
try:
    import deepspeed
    HAS_DEEPSPEED = True
except ImportError:
    HAS_DEEPSPEED = False
    logger.warning("DeepSpeed not found. Pretraining script will fail if actually executed.")

from model import LanguageModel, ModelConfig
from configs import TrainConfig
from data import create_dataloader
from .scheduler import CosineWarmupScheduler
from .optimizer import create_optimizer
from .losses import SequenceCrossEntropyLoss
from .checkpoint import AsyncCheckpointManager
from .stability import LossSpikeDetector

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to config yaml")
    if HAS_DEEPSPEED:
        parser = deepspeed.add_config_arguments(parser)
    parser.add_argument("--local_rank", type=int, default=-1)
    return parser.parse_args()

def main():
    args = parse_args()
    
    # Initialize distributed
    if HAS_DEEPSPEED:
        deepspeed.init_distributed()
    else:
        if "LOCAL_RANK" in os.environ:
            torch.distributed.init_process_group(backend="nccl")
        
    local_rank = int(os.environ.get("LOCAL_RANK", 0))
    torch.cuda.set_device(local_rank)
    device = torch.device(f"cuda:{local_rank}")
    
    # Load configs
    model_cfg = ModelConfig.from_pydantic(ModelConfig()) # In practice, load from args.config
    train_cfg = TrainConfig.from_pydantic(TrainConfig())
    
    # Setup model
    logger.info("Initializing model...")
    model = LanguageModel.from_config(model_cfg)
    model.to(device)
    
    if local_rank == 0:
        model.print_params()
        
    # Setup Dataloader
    # In a real run, this path would come from config
    dataloader = create_dataloader("data/packed/", batch_size=2, seq_len=model_cfg.max_seq_len)
    
    # Setup Optimizer & Scheduler
    optimizer = create_optimizer(
        model, 
        lr=train_cfg.peak_lr, 
        weight_decay=train_cfg.weight_decay,
        beta1=train_cfg.beta1, 
        beta2=train_cfg.beta2, 
        eps=train_cfg.eps
    )
    
    scheduler = CosineWarmupScheduler(
        optimizer, 
        warmup_steps=train_cfg.warmup_steps,
        total_steps=train_cfg.total_steps
    )
    
    # DeepSpeed engine setup
    if HAS_DEEPSPEED:
        model_engine, optimizer, _, scheduler = deepspeed.initialize(
            args=args,
            model=model,
            optimizer=optimizer,
            lr_scheduler=scheduler,
            config=args.deepspeed_config
        )
    else:
        model_engine = model
        
    criterion = SequenceCrossEntropyLoss()
    checkpoint_mgr = AsyncCheckpointManager("checkpoints/pretrain", keep_last_n=train_cfg.keep_last_n)
    spike_detector = LossSpikeDetector()
    
    model_engine.train()
    
    # Training Loop
    step = 0
    for batch in dataloader:
        if step >= train_cfg.total_steps:
            break
            
        input_ids = batch["input_ids"].to(device)
        labels = batch["labels"].to(device)
        
        # Forward pass
        logits, moe_losses, _ = model_engine(input_ids)
        
        # Compute losses
        ce_loss = criterion(logits, labels)
        
        total_loss = ce_loss
        if moe_losses:
            total_loss = total_loss + sum(moe_losses)
            
        # Spike detection
        if spike_detector.update(total_loss.item()):
            # Handle rollback in a real system:
            # 1. Load previous checkpoint
            # 2. Halve learning rate
            # 3. Continue
            logger.error(f"Rollback triggered at step {step}!")
            
        # Backward and step
        if HAS_DEEPSPEED:
            model_engine.backward(total_loss)
            model_engine.step()
        else:
            total_loss.backward()
            torch.nn.utils.clip_grad_norm_(model_engine.parameters(), train_cfg.grad_clip)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()
            
        # Logging
        if step % 10 == 0 and local_rank == 0:
            logger.info(f"Step {step} | Loss: {total_loss.item():.4f} | LR: {scheduler.get_last_lr()[0]:.2e}")
            
        # Checkpointing
        if step > 0 and step % train_cfg.checkpoint_every == 0 and local_rank == 0:
            if HAS_DEEPSPEED:
                model_engine.save_checkpoint("checkpoints/pretrain")
            else:
                checkpoint_mgr.save_checkpoint(model_engine, optimizer, scheduler, step)
                
        step += 1

if __name__ == "__main__":
    main()
