# ── FILE: llm_pro/model/architecture.py ─────────────────────────────────
"""
Full Language Model Architecture including TransformerBlocks and the top-level LanguageModel.
"""

import torch
import torch.nn as nn
from typing import Optional, Tuple, List

from .config import ModelConfig
from .embeddings import RotaryEmbedding
from .normalization import RMSNorm
from .attention import GroupedQueryAttention, SlidingWindowAttention
from .feedforward import SwiGLUFFN, MoELayer
from .generation import GenerationMixin
from .utils import print_param_counts


class TransformerBlock(nn.Module):
    """
    A single Transformer layer combining Attention and Feedforward networks.
    """
    def __init__(self, config: ModelConfig, layer_idx: int):
        super().__init__()
        self.layer_idx = layer_idx
        self.config = config
        
        self.attention_norm = RMSNorm(config.d_model)
        
        # Interleave Sliding Window Attention every other layer
        if layer_idx % 2 == 1:
            self.attention = SlidingWindowAttention(config, layer_idx)
        else:
            self.attention = GroupedQueryAttention(config, layer_idx)
            
        self.ffn_norm = RMSNorm(config.d_model)
        
        # Use MoE on specified layers
        if config.moe_layers and layer_idx in config.moe_layers:
            self.ffn = MoELayer(config)
        else:
            self.ffn = SwiGLUFFN(config)

    def forward(
        self,
        x: torch.Tensor,
        freqs_cis: torch.Tensor,
        mask: Optional[torch.Tensor] = None,
        use_cache: bool = False,
        kv_cache: Optional[tuple[torch.Tensor, torch.Tensor]] = None
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], Optional[tuple[torch.Tensor, torch.Tensor]]]:
        """
        Args:
            x: Input tensor (batch, seq, d_model)
            freqs_cis: RoPE frequencies
            mask: Attention mask
            use_cache: Enable KV cache
            kv_cache: Existing KV cache
            
        Returns:
            output: Layer output
            moe_loss: MoE auxiliary loss (if applicable)
            new_kv_cache: Updated KV cache
        """
        # Pre-norm Attention
        h, new_kv_cache = self.attention(
            self.attention_norm(x),
            freqs_cis=freqs_cis,
            mask=mask,
            use_cache=use_cache,
            kv_cache=kv_cache
        )
        x = x + h
        
        # Pre-norm FFN
        ffn_out = self.ffn(self.ffn_norm(x))
        
        moe_loss = None
        if isinstance(ffn_out, tuple):
            h, moe_loss = ffn_out
        else:
            h = ffn_out
            
        x = x + h
        return x, moe_loss, new_kv_cache


class LanguageModel(nn.Module, GenerationMixin):
    """
    The top-level causal language model.
    Inherits GenerationMixin for decoding algorithms.
    """
    def __init__(self, config: ModelConfig):
        super().__init__()
        self.config = config
        
        self.tok_embeddings = nn.Embedding(config.vocab_size, config.d_model)
        
        self.layers = nn.ModuleList([
            TransformerBlock(config, i) for i in range(config.n_layers)
        ])
        
        self.norm = RMSNorm(config.d_model)
        self.output = nn.Linear(config.d_model, config.vocab_size, bias=False)
        
        if config.tie_embeddings:
            self.output.weight = self.tok_embeddings.weight
            
        self.rope = RotaryEmbedding(
            dim=config.d_model // config.n_heads,
            max_seq_len=config.max_seq_len,
            base=config.rope_base,
            scaling_type=config.rope_scaling
        )

    def forward(
        self,
        input_ids: torch.Tensor,
        use_cache: bool = False,
        kv_caches: Optional[List[tuple[torch.Tensor, torch.Tensor]]] = None
    ) -> Tuple[torch.Tensor, List[torch.Tensor], Optional[List[tuple[torch.Tensor, torch.Tensor]]]]:
        """
        Args:
            input_ids: Input tokens (batch, seq)
            use_cache: Enable KV cache
            kv_caches: List of KV cache tuples per layer
            
        Returns:
            logits: Output logits (batch, seq, vocab_size)
            moe_losses: List of auxiliary losses from MoE layers
            new_kv_caches: Updated KV caches
        """
        seq_len = input_ids.shape[1]
        
        if kv_caches is not None:
            # When using cache, we only pass the new sequence length for RoPE
            # But the full position is past_len + seq_len
            past_len = kv_caches[0][0].shape[1]
            total_len = past_len + seq_len
            freqs_cis = self.rope(total_len)[past_len:total_len]
        else:
            freqs_cis = self.rope(seq_len)

        x = self.tok_embeddings(input_ids)
        
        moe_losses = []
        new_kv_caches = [] if use_cache else None
        
        for i, layer in enumerate(self.layers):
            layer_cache = kv_caches[i] if kv_caches is not None else None
            x, moe_loss, new_layer_cache = layer(
                x,
                freqs_cis=freqs_cis,
                use_cache=use_cache,
                kv_cache=layer_cache
            )
            
            if moe_loss is not None:
                moe_losses.append(moe_loss)
            if use_cache:
                new_kv_caches.append(new_layer_cache)
                
        x = self.norm(x)
        logits = self.output(x)
        
        return logits, moe_losses, new_kv_caches

    @classmethod
    def from_config(cls, config: ModelConfig) -> "LanguageModel":
        """Initialize model from a ModelConfig instance."""
        model = cls(config)
        return model
        
    def print_params(self):
        """Log the total, trainable, and expert parameter counts."""
        return print_param_counts(self)
