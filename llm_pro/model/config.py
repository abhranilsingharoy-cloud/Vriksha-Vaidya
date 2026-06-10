# ── FILE: llm_pro/model/config.py ─────────────────────────────────
"""
Internal model configuration class that mirrors the Pydantic configuration,
providing a strict interface for the model classes.
"""

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ModelConfig:
    """Dataclass holding model architecture hyperparameters."""
    d_model: int = 4096
    n_heads: int = 32
    n_kv_heads: int = 8
    n_layers: int = 32
    ffn_hidden_dim: Optional[int] = None
    max_seq_len: int = 131072
    vocab_size: int = 65536
    rope_base: int = 500000
    rope_scaling: str = "dynamic"
    window_size: int = 4096
    moe_layers: List[int] = None
    n_experts: int = 8
    top_k_experts: int = 2
    tie_embeddings: bool = True
    dtype: str = "bfloat16"
    use_flash_attn: bool = True
    use_alibi: bool = False
    soft_prompt_len: int = 0

    def __post_init__(self):
        if self.moe_layers is None:
            self.moe_layers = [3, 7, 11, 15, 19, 23, 27, 31]
        
        # Calculate optimal SwiGLU hidden dimension if not provided
        if self.ffn_hidden_dim is None:
            hidden_dim = int(2 / 3 * 4 * self.d_model)
            # Round up to nearest multiple of 256 for optimal Tensor Core utilization
            self.ffn_hidden_dim = 256 * ((hidden_dim + 255) // 256)

    @classmethod
    def from_pydantic(cls, pydantic_cfg) -> "ModelConfig":
        """Convert from Pydantic config."""
        return cls(
            d_model=pydantic_cfg.d_model,
            n_heads=pydantic_cfg.n_heads,
            n_kv_heads=pydantic_cfg.n_kv_heads,
            n_layers=pydantic_cfg.n_layers,
            ffn_hidden_dim=pydantic_cfg.ffn_hidden_dim,
            max_seq_len=pydantic_cfg.max_seq_len,
            vocab_size=pydantic_cfg.vocab_size,
            rope_base=pydantic_cfg.rope_base,
            rope_scaling=pydantic_cfg.rope_scaling,
            window_size=pydantic_cfg.window_size,
            moe_layers=pydantic_cfg.moe_layers,
            n_experts=pydantic_cfg.n_experts,
            top_k_experts=pydantic_cfg.top_k_experts,
            tie_embeddings=pydantic_cfg.tie_embeddings,
            dtype=pydantic_cfg.dtype,
            use_flash_attn=pydantic_cfg.use_flash_attn,
            use_alibi=pydantic_cfg.use_alibi,
            soft_prompt_len=pydantic_cfg.soft_prompt_len
        )
