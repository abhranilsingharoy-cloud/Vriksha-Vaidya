# ── FILE: llm_pro/training/checkpoint.py ─────────────────────────────────
"""
Async checkpoint manager. Saves checkpoints locally and uploads to S3
in a background thread to prevent blocking the training loop.
"""

import os
import glob
import torch
import boto3
from loguru import logger
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional

class AsyncCheckpointManager:
    """Manages asynchronous checkpoint saving and loading."""
    
    def __init__(self, save_dir: str, keep_last_n: int = 3, s3_bucket: Optional[str] = None):
        self.save_dir = save_dir
        self.keep_last_n = keep_last_n
        self.s3_bucket = s3_bucket
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.s3_client = boto3.client('s3') if s3_bucket else None
        
        os.makedirs(save_dir, exist_ok=True)

    def save_checkpoint(
        self, 
        model: torch.nn.Module, 
        optimizer: torch.optim.Optimizer, 
        scheduler: torch.optim.lr_scheduler.LRScheduler, 
        step: int, 
        extra_state: Dict[str, Any] = None
    ):
        """Saves a checkpoint asynchronously."""
        # CPU copies must be made synchronously to ensure state is accurate at this step
        # Note: If using DeepSpeed, DeepSpeed's engine.save_checkpoint() handles this automatically.
        # This is a generic PyTorch implementation.
        state_dict = {
            "model": {k: v.cpu().clone() for k, v in model.state_dict().items()},
            "optimizer": optimizer.state_dict(),
            "scheduler": scheduler.state_dict(),
            "step": step,
            "extra_state": extra_state or {}
        }
        
        path = os.path.join(self.save_dir, f"checkpoint-{step}.pt")
        
        # Fire and forget
        self.executor.submit(self._save_and_upload, state_dict, path, step)

    def _save_and_upload(self, state_dict: Dict[str, Any], path: str, step: int):
        try:
            logger.info(f"Saving checkpoint to {path}...")
            torch.save(state_dict, path)
            logger.info(f"Successfully saved checkpoint {step}.")
            
            self._cleanup_old_checkpoints()
            
            if self.s3_client and self.s3_bucket:
                s3_key = os.path.basename(path)
                logger.info(f"Uploading {s3_key} to S3 bucket {self.s3_bucket}...")
                self.s3_client.upload_file(path, self.s3_bucket, f"checkpoints/{s3_key}")
                logger.info(f"Successfully uploaded {s3_key} to S3.")
                
        except Exception as e:
            logger.error(f"Failed to save/upload checkpoint {step}: {e}")

    def _cleanup_old_checkpoints(self):
        """Deletes older checkpoints keeping only the last N."""
        checkpoints = sorted(glob.glob(os.path.join(self.save_dir, "checkpoint-*.pt")), 
                             key=os.path.getmtime)
        
        if len(checkpoints) > self.keep_last_n:
            to_delete = checkpoints[:-self.keep_last_n]
            for ckpt in to_delete:
                try:
                    os.remove(ckpt)
                    logger.debug(f"Deleted old checkpoint {ckpt}")
                except Exception as e:
                    logger.warning(f"Could not delete old checkpoint {ckpt}: {e}")

    def load_checkpoint(self, path: str) -> Dict[str, Any]:
        """Loads a checkpoint synchronously."""
        logger.info(f"Loading checkpoint from {path}...")
        state_dict = torch.load(path, map_location="cpu")
        return state_dict
