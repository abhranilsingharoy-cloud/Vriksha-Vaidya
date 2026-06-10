# ── FILE: llm_pro/training/__init__.py ─────────────────────────────────
"""
Training engine containing pretraining, fine-tuning, and alignment algorithms.
"""

from .optimizer import create_optimizer
from .scheduler import CosineWarmupScheduler
from .losses import SequenceCrossEntropyLoss, DPOLoss
from .checkpoint import AsyncCheckpointManager
from .stability import LossSpikeDetector

__all__ = [
    "create_optimizer",
    "CosineWarmupScheduler",
    "SequenceCrossEntropyLoss",
    "DPOLoss",
    "AsyncCheckpointManager",
    "LossSpikeDetector"
]
