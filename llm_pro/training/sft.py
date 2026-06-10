# ── FILE: llm_pro/training/sft.py ─────────────────────────────────
"""
Supervised Fine-Tuning script. Integrates LoRA / QLoRA using PEFT.
"""

import torch
from loguru import logger
from model import LanguageModel, ModelConfig
from configs import SFTConfig
from .losses import SequenceCrossEntropyLoss

def apply_lora(model: torch.nn.Module, config: SFTConfig):
    """
    Applies LoRA to the model.
    In production, this wraps modules with PEFT LoraConfig.
    Here we provide a stub for the integration logic.
    """
    try:
        from peft import LoraConfig, get_peft_model
        peft_config = LoraConfig(
            r=config.lora_rank,
            lora_alpha=config.lora_alpha,
            target_modules=config.lora_target_modules,
            lora_dropout=0.05,
            bias="none",
            task_type="CAUSAL_LM",
        )
        model = get_peft_model(model, peft_config)
        model.print_trainable_parameters()
        return model
    except ImportError:
        logger.warning("PEFT not installed. LoRA will not be applied.")
        return model

def train_sft(model_path: str, data_path: str, config: SFTConfig):
    """Main SFT loop."""
    logger.info("Initializing SFT...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load model
    model_cfg = ModelConfig()
    model = LanguageModel.from_config(model_cfg)
    
    # Apply LoRA
    model = apply_lora(model, config)
    model.to(device)
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=config.lr)
    criterion = SequenceCrossEntropyLoss(ignore_index=-100)
    
    # Mock dataloader for chat formatted sequences
    # Expects input_ids and labels (where user prompt tokens in labels are set to -100)
    
    model.train()
    # Dummy loop
    for epoch in range(config.epochs):
        logger.info(f"Epoch {epoch+1}/{config.epochs}")
        # for batch in dataloader:
        #     logits, _, _ = model(batch["input_ids"])
        #     loss = criterion(logits, batch["labels"])
        #     loss.backward()
        #     optimizer.step()
        #     optimizer.zero_grad()
        
    logger.info("SFT Complete.")

if __name__ == "__main__":
    train_sft("path/to/base", "path/to/data", SFTConfig())
