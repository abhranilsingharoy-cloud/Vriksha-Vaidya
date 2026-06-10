# ── FILE: llm_pro/model/embeddings.py ─────────────────────────────────
"""
Embedding layers, specifically Rotary Position Embeddings (RoPE) with dynamic scaling.
"""

import torch
import torch.nn as nn
from typing import Tuple

class RotaryEmbedding(nn.Module):
    """
    Rotary Position Embedding (RoPE) module with precomputed frequencies
    and NTK-aware dynamic scaling for length extrapolation.
    """
    def __init__(self, dim: int, max_seq_len: int = 131072, base: int = 500000, scaling_type: str = "dynamic"):
        """
        Args:
            dim: Dimension of each attention head.
            max_seq_len: Maximum sequence length to precompute.
            base: Base wavelength for RoPE.
            scaling_type: "none", "linear", or "dynamic" (NTK-aware).
        """
        super().__init__()
        self.dim = dim
        self.max_seq_len = max_seq_len
        self.base = base
        self.scaling_type = scaling_type
        
        # Precompute frequencies
        inv_freq = 1.0 / (self.base ** (torch.arange(0, self.dim, 2).float() / self.dim))
        self.register_buffer("inv_freq", inv_freq, persistent=False)
        self._precompute_freqs(max_seq_len)

    def _precompute_freqs(self, seq_len: int, factor: float = 1.0):
        """Precompute freqs_cis for a given sequence length and scaling factor."""
        t = torch.arange(seq_len, device=self.inv_freq.device, dtype=self.inv_freq.dtype)
        if self.scaling_type == "linear" and factor > 1.0:
            t = t / factor
            
        freqs = torch.outer(t, self.inv_freq)
        
        # NTK-aware dynamic scaling adjusts the base instead of the positions
        if self.scaling_type == "dynamic" and factor > 1.0:
            base = self.base * (
                (factor * self.dim / (self.dim - 2)) - (2 / (self.dim - 2))
            ) ** (self.dim / (self.dim - 2))
            inv_freq = 1.0 / (base ** (torch.arange(0, self.dim, 2).float() / self.dim))
            freqs = torch.outer(t, inv_freq)

        # Convert to complex plane (cos + i*sin)
        freqs_cis = torch.polar(torch.ones_like(freqs), freqs)
        self.register_buffer("freqs_cis", freqs_cis, persistent=False)

    def forward(self, seq_len: int) -> torch.Tensor:
        """
        Get freqs_cis for the current sequence length. Dynamically scale if needed.
        """
        if seq_len > self.freqs_cis.shape[0]:
            scale_factor = seq_len / self.max_seq_len if self.max_seq_len > 0 else 1.0
            self._precompute_freqs(seq_len, factor=scale_factor)
            
        return self.freqs_cis[:seq_len]


def apply_rotary_emb(
    xq: torch.Tensor,
    xk: torch.Tensor,
    freqs_cis: torch.Tensor,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """
    Apply Rotary Embeddings to Queries and Keys.
    
    Args:
        xq: Query tensor of shape (batch, seq_len, n_heads, head_dim)
        xk: Key tensor of shape (batch, seq_len, n_kv_heads, head_dim)
        freqs_cis: Precomputed freqs of shape (seq_len, head_dim // 2)
        
    Returns:
        Rotated q and k tensors.
    """
    # Reshape to complex numbers
    # (batch, seq_len, heads, head_dim // 2, 2) -> complex
    xq_ = torch.view_as_complex(xq.float().reshape(*xq.shape[:-1], -1, 2))
    xk_ = torch.view_as_complex(xk.float().reshape(*xk.shape[:-1], -1, 2))
    
    # Reshape freqs_cis for broadcasting
    # freqs_cis: (seq_len, head_dim // 2) -> (1, seq_len, 1, head_dim // 2)
    freqs_cis = freqs_cis.unsqueeze(0).unsqueeze(2)
    
    # Multiply by complex numbers (rotates in the 2D plane)
    xq_out = torch.view_as_real(xq_ * freqs_cis).flatten(3)
    xk_out = torch.view_as_real(xk_ * freqs_cis).flatten(3)
    
    # Cast back to original dtype
    return xq_out.type_as(xq), xk_out.type_as(xk)
