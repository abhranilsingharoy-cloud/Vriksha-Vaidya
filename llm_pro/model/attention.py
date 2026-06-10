# ── FILE: llm_pro/model/attention.py ─────────────────────────────────
"""
Attention mechanisms, including Grouped Query Attention (GQA) and Sliding Window Attention.
Integrates Flash Attention 2 if available.
"""

import torch
import torch.nn as nn
from typing import Optional
from .config import ModelConfig
from .embeddings import apply_rotary_emb
from .normalization import QKNorm

try:
    from flash_attn import flash_attn_func
    HAS_FLASH_ATTN = True
except ImportError:
    HAS_FLASH_ATTN = False

class GroupedQueryAttention(nn.Module):
    """
    Grouped Query Attention (GQA) module.
    Supports standard global attention with Flash Attention 2 acceleration.
    """
    def __init__(self, config: ModelConfig, layer_idx: int):
        super().__init__()
        self.config = config
        self.layer_idx = layer_idx
        
        self.n_heads = config.n_heads
        self.n_kv_heads = config.n_kv_heads
        self.n_rep = self.n_heads // self.n_kv_heads
        self.head_dim = config.d_model // self.n_heads
        
        self.q_proj = nn.Linear(config.d_model, self.n_heads * self.head_dim, bias=False)
        self.k_proj = nn.Linear(config.d_model, self.n_kv_heads * self.head_dim, bias=False)
        self.v_proj = nn.Linear(config.d_model, self.n_kv_heads * self.head_dim, bias=False)
        self.o_proj = nn.Linear(self.n_heads * self.head_dim, config.d_model, bias=False)
        
        self.qk_norm = QKNorm(self.head_dim)

    def forward(
        self,
        x: torch.Tensor,
        freqs_cis: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
        use_cache: bool = False,
        kv_cache: Optional[tuple[torch.Tensor, torch.Tensor]] = None
    ):
        """
        Args:
            x: Input tensor (batch, seq, d_model)
            freqs_cis: Precomputed rotary embeddings
            mask: Optional causal mask
            use_cache: Whether to use and return KV cache (for generation)
            kv_cache: Past KV states
        """
        bsz, seq_len, _ = x.shape
        
        xq = self.q_proj(x).view(bsz, seq_len, self.n_heads, self.head_dim)
        xk = self.k_proj(x).view(bsz, seq_len, self.n_kv_heads, self.head_dim)
        xv = self.v_proj(x).view(bsz, seq_len, self.n_kv_heads, self.head_dim)
        
        # Apply QK-Norm
        xq, xk = self.qk_norm(xq, xk)
        
        # Apply RoPE
        xq, xk = apply_rotary_emb(xq, xk, freqs_cis=freqs_cis)
        
        # KV Cache handling
        if kv_cache is not None:
            prev_k, prev_v = kv_cache
            xk = torch.cat([prev_k, xk], dim=1)
            xv = torch.cat([prev_v, xv], dim=1)
            
        new_kv_cache = (xk, xv) if use_cache else None
        
        # GQA: Expand KV heads to match Q heads
        # xk shape: (bsz, seq_len, n_kv_heads, head_dim) -> (bsz, seq_len, n_heads, head_dim)
        xk = xk.unsqueeze(3).expand(-1, -1, -1, self.n_rep, -1).reshape(bsz, xk.shape[1], self.n_heads, self.head_dim)
        xv = xv.unsqueeze(3).expand(-1, -1, -1, self.n_rep, -1).reshape(bsz, xv.shape[1], self.n_heads, self.head_dim)

        if self.config.use_flash_attn and HAS_FLASH_ATTN and x.is_cuda and x.dtype in (torch.float16, torch.bfloat16):
            # Flash Attention 2 expects (batch, seqlen, nheads, headdim)
            output = flash_attn_func(xq, xk, xv, dropout_p=0.0, causal=True)
        else:
            # Fallback to PyTorch standard scaled dot-product attention
            xq = xq.transpose(1, 2) # (bsz, n_heads, seq_len, head_dim)
            xk = xk.transpose(1, 2)
            xv = xv.transpose(1, 2)
            
            output = torch.nn.functional.scaled_dot_product_attention(
                xq, xk, xv,
                attn_mask=mask,
                is_causal=(mask is None),
                dropout_p=0.0
            )
            output = output.transpose(1, 2).contiguous() # (bsz, seq_len, n_heads, head_dim)
            
        output = output.reshape(bsz, seq_len, -1)
        return self.o_proj(output), new_kv_cache


class SlidingWindowAttention(GroupedQueryAttention):
    """
    Attention with a sliding window, heavily optimized for local context.
    Inherits GQA mechanism.
    """
    def __init__(self, config: ModelConfig, layer_idx: int):
        super().__init__(config, layer_idx)
        self.window_size = config.window_size
        
    def forward(
        self,
        x: torch.Tensor,
        freqs_cis: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
        use_cache: bool = False,
        kv_cache: Optional[tuple[torch.Tensor, torch.Tensor]] = None
    ):
        bsz, seq_len, _ = x.shape
        
        xq = self.q_proj(x).view(bsz, seq_len, self.n_heads, self.head_dim)
        xk = self.k_proj(x).view(bsz, seq_len, self.n_kv_heads, self.head_dim)
        xv = self.v_proj(x).view(bsz, seq_len, self.n_kv_heads, self.head_dim)
        
        xq, xk = self.qk_norm(xq, xk)
        xq, xk = apply_rotary_emb(xq, xk, freqs_cis=freqs_cis)
        
        if kv_cache is not None:
            prev_k, prev_v = kv_cache
            # Evict old tokens from cache beyond window size (keep first 4 as sink tokens)
            if prev_k.shape[1] + seq_len > self.window_size:
                sink_k, sink_v = prev_k[:, :4, :], prev_v[:, :4, :]
                keep_k = prev_k[:, -(self.window_size - seq_len - 4):, :]
                keep_v = prev_v[:, -(self.window_size - seq_len - 4):, :]
                xk = torch.cat([sink_k, keep_k, xk], dim=1)
                xv = torch.cat([sink_v, keep_v, xv], dim=1)
            else:
                xk = torch.cat([prev_k, xk], dim=1)
                xv = torch.cat([prev_v, xv], dim=1)
                
        new_kv_cache = (xk, xv) if use_cache else None
        
        xk = xk.unsqueeze(3).expand(-1, -1, -1, self.n_rep, -1).reshape(bsz, xk.shape[1], self.n_heads, self.head_dim)
        xv = xv.unsqueeze(3).expand(-1, -1, -1, self.n_rep, -1).reshape(bsz, xv.shape[1], self.n_heads, self.head_dim)

        if self.config.use_flash_attn and HAS_FLASH_ATTN and x.is_cuda and x.dtype in (torch.float16, torch.bfloat16):
            # Flash Attention 2 supports window_size natively
            output = flash_attn_func(
                xq, xk, xv, 
                dropout_p=0.0, 
                causal=True,
                window_size=(self.window_size, self.window_size)
            )
        else:
            # Fallback (very slow for SWA)
            xq = xq.transpose(1, 2)
            xk = xk.transpose(1, 2)
            xv = xv.transpose(1, 2)
            
            # Construct SWA mask manually
            if mask is None:
                mask = torch.ones((seq_len, xk.shape[2]), dtype=torch.bool, device=x.device)
                mask = torch.tril(mask)
                # Apply sliding window (keep sink tokens if implemented fully in standard mask, here simplified)
                mask = torch.triu(mask, diagonal=-self.window_size)
            
            output = torch.nn.functional.scaled_dot_product_attention(
                xq, xk, xv,
                attn_mask=mask,
                dropout_p=0.0
            )
            output = output.transpose(1, 2).contiguous()
            
        output = output.reshape(bsz, seq_len, -1)
        return self.o_proj(output), new_kv_cache
