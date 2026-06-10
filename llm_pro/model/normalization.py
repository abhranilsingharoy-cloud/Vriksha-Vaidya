# ── FILE: llm_pro/model/normalization.py ─────────────────────────────────
"""
Normalization layers including RMSNorm and QK-Norm.
"""

import torch
import torch.nn as nn

class RMSNorm(nn.Module):
    """
    Root Mean Square Normalization.
    """
    def __init__(self, dim: int, eps: float = 1e-6):
        """
        Args:
            dim: Dimension of the hidden state.
            eps: Small value for numerical stability.
        """
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input tensor of shape (..., dim)
        Returns:
            Normalized tensor of shape (..., dim)
        """
        # x.pow(2).mean(-1, keepdim=True) calculates the variance
        # rsqrt is 1 / sqrt(x)
        variance = x.pow(2).mean(-1, keepdim=True)
        x = x * torch.rsqrt(variance + self.eps)
        return self.weight * x


class QKNorm(nn.Module):
    """
    Applies RMSNorm to Queries and Keys to stabilize training at scale.
    """
    def __init__(self, head_dim: int, eps: float = 1e-6):
        """
        Args:
            head_dim: Dimension of each attention head.
            eps: Small value.
        """
        super().__init__()
        self.q_norm = RMSNorm(head_dim, eps)
        self.k_norm = RMSNorm(head_dim, eps)
        
    def forward(self, q: torch.Tensor, k: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Normalizes Q and K.
        Assumes q and k have shape (..., head_dim).
        """
        return self.q_norm(q), self.k_norm(k)
