# ── FILE: llm_pro/training/stability.py ─────────────────────────────────
"""
Loss spike detection and rollback mechanisms.
"""

from collections import deque
from loguru import logger
import math

class LossSpikeDetector:
    """
    Tracks loss and detects sudden spikes. If a spike is severe, 
    triggers a rollback to the previous checkpoint.
    """
    def __init__(self, window_size: int = 50, spike_threshold_ratio: float = 1.2):
        self.window_size = window_size
        self.spike_threshold_ratio = spike_threshold_ratio
        self.loss_history = deque(maxlen=window_size)
        
    def update(self, current_loss: float) -> bool:
        """
        Updates history and returns True if a spike is detected.
        """
        if math.isnan(current_loss) or math.isinf(current_loss):
            logger.error("NaN/Inf loss detected!")
            return True
            
        if len(self.loss_history) == self.window_size:
            avg_loss = sum(self.loss_history) / self.window_size
            if current_loss > avg_loss * self.spike_threshold_ratio:
                logger.warning(f"Loss spike detected! Current: {current_loss:.4f}, Avg: {avg_loss:.4f}")
                return True
                
        self.loss_history.append(current_loss)
        return False
