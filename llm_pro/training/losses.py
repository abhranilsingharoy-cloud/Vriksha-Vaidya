# ── FILE: llm_pro/training/losses.py ─────────────────────────────────
"""
Loss functions for LLM training (CrossEntropy, DPO).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class SequenceCrossEntropyLoss(nn.Module):
    """
    Standard auto-regressive cross entropy loss with ignore index.
    """
    def __init__(self, ignore_index: int = -100):
        super().__init__()
        self.ignore_index = ignore_index

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            logits: (batch, seq_len, vocab_size)
            targets: (batch, seq_len)
        Returns:
            Scalar loss tensor
        """
        # Flatten the batches
        logits_flat = logits.view(-1, logits.size(-1))
        targets_flat = targets.view(-1)
        
        return F.cross_entropy(logits_flat, targets_flat, ignore_index=self.ignore_index)


class DPOLoss(nn.Module):
    """
    Direct Preference Optimization Loss.
    """
    def __init__(self, beta: float = 0.1, reference_free: bool = False, ipo: bool = False):
        super().__init__()
        self.beta = beta
        self.reference_free = reference_free
        self.ipo = ipo

    def forward(
        self,
        policy_chosen_logps: torch.Tensor,
        policy_rejected_logps: torch.Tensor,
        ref_chosen_logps: torch.Tensor,
        ref_rejected_logps: torch.Tensor
    ) -> torch.Tensor:
        """
        Args:
            policy_chosen_logps: Log probabilities of chosen responses under policy model
            policy_rejected_logps: Log probs of rejected responses under policy model
            ref_chosen_logps: Log probs under reference model
            ref_rejected_logps: Log probs under reference model
        Returns:
            Scalar loss
        """
        policy_log_ratios = policy_chosen_logps - policy_rejected_logps
        
        if self.reference_free:
            ref_log_ratios = 0
        else:
            ref_log_ratios = ref_chosen_logps - ref_rejected_logps
            
        logits = policy_log_ratios - ref_log_ratios
        
        if self.ipo:
            # Identity Preference Optimization: (logits - 1/(2*beta))^2
            loss = (logits - 1.0 / (2.0 * self.beta)).pow(2).mean()
        else:
            # Standard DPO: -logsigmoid(beta * logits)
            loss = -F.logsigmoid(self.beta * logits).mean()
            
        return loss
