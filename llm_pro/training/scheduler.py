# ── FILE: llm_pro/training/scheduler.py ─────────────────────────────────
"""
Learning rate schedulers.
"""

import math
from torch.optim.lr_scheduler import LRScheduler
from torch.optim import Optimizer

class CosineWarmupScheduler(LRScheduler):
    """
    Learning rate scheduler with linear warmup followed by cosine decay,
    incorporating a final cooldown period.
    """
    def __init__(
        self, 
        optimizer: Optimizer, 
        warmup_steps: int, 
        total_steps: int, 
        min_lr_ratio: float = 0.1, 
        last_epoch: int = -1
    ):
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps
        self.min_lr_ratio = min_lr_ratio
        super().__init__(optimizer, last_epoch)

    def get_lr(self) -> list[float]:
        step = self.last_epoch
        
        # 1. Warmup phase
        if step < self.warmup_steps:
            warmup_factor = float(step) / float(max(1, self.warmup_steps))
            return [base_lr * warmup_factor for base_lr in self.base_lrs]
            
        # 2. Cosine decay phase
        if step < self.total_steps:
            progress = float(step - self.warmup_steps) / float(max(1, self.total_steps - self.warmup_steps))
            cosine_decay = 0.5 * (1.0 + math.cos(math.pi * progress))
            decay_factor = self.min_lr_ratio + (1.0 - self.min_lr_ratio) * cosine_decay
            return [base_lr * decay_factor for base_lr in self.base_lrs]
            
        # 3. Post-training / cooldown
        return [base_lr * self.min_lr_ratio for base_lr in self.base_lrs]
