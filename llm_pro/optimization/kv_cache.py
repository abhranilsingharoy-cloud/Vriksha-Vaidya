# ── FILE: llm_pro/optimization/kv_cache.py ─────────────────────────────────
"""
Paged Attention and INT8 KV Cache infrastructure (similar to vLLM blocks).
"""

import torch
from dataclasses import dataclass
from typing import List

@dataclass
class KVCacheBlock:
    """Represents a single block (page) of KV cache in GPU memory."""
    block_id: int
    num_tokens: int
    k_cache: torch.Tensor
    v_cache: torch.Tensor

class PagedKVCache:
    """
    Manages memory for KV caches by splitting them into fixed-size blocks (pages).
    Reduces memory fragmentation drastically during continuous batching.
    """
    def __init__(self, block_size: int = 16, num_blocks: int = 10000, 
                 n_kv_heads: int = 8, head_dim: int = 128, dtype: torch.dtype = torch.float16,
                 device: torch.device = torch.device('cuda')):
        self.block_size = block_size
        self.num_blocks = num_blocks
        self.free_blocks: List[int] = list(range(num_blocks))
        
        # Pre-allocate contiguous memory pools
        self.k_pool = torch.empty((num_blocks, block_size, n_kv_heads, head_dim), dtype=dtype, device=device)
        self.v_pool = torch.empty((num_blocks, block_size, n_kv_heads, head_dim), dtype=dtype, device=device)
        
    def allocate_block(self) -> int:
        if not self.free_blocks:
            raise RuntimeError("KV Cache OOM: No free blocks available.")
        return self.free_blocks.pop(0)
        
    def free_block(self, block_id: int):
        self.free_blocks.append(block_id)
        
    def write_to_block(self, block_id: int, token_offset: int, k: torch.Tensor, v: torch.Tensor):
        """
        Writes sequence of tokens to a specific block.
        k, v shapes: (seq_len, n_kv_heads, head_dim)
        """
        seq_len = k.size(0)
        assert token_offset + seq_len <= self.block_size
        
        self.k_pool[block_id, token_offset:token_offset+seq_len] = k
        self.v_pool[block_id, token_offset:token_offset+seq_len] = v
