# ── FILE: llm_pro/configs/base.py ─────────────────────────────────
"""
Base configuration definitions using Pydantic BaseSettings.
"""

from typing import List, Tuple, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
import yaml

class ModelConfig(BaseSettings):
    """Configuration for the Language Model architecture."""
    d_model: int = Field(default=4096, description="Hidden dimension size.")
    n_heads: int = Field(default=32, description="Number of query attention heads.")
    n_kv_heads: int = Field(default=8, description="Number of KV attention heads for GQA.")
    n_layers: int = Field(default=32, description="Number of transformer layers.")
    ffn_hidden_dim: Optional[int] = Field(default=None, description="Hidden dim for SwiGLU FFN.")
    max_seq_len: int = Field(default=131072, description="Maximum sequence length.")
    vocab_size: int = Field(default=65536, description="Vocabulary size.")
    rope_base: int = Field(default=500000, description="Base frequency for RoPE.")
    rope_scaling: str = Field(default="dynamic", description="RoPE scaling type.")
    window_size: int = Field(default=4096, description="Window size for sliding window attention.")
    moe_layers: List[int] = Field(default_factory=lambda: [3, 7, 11, 15, 19, 23, 27, 31], description="Indices of layers that use MoE.")
    n_experts: int = Field(default=8, description="Number of experts in MoE layers.")
    top_k_experts: int = Field(default=2, description="Number of experts to route to.")
    tie_embeddings: bool = Field(default=True, description="Whether to tie input/output embeddings.")
    dtype: str = Field(default="bfloat16", description="Data type for model parameters.")
    use_flash_attn: bool = Field(default=True, description="Use Flash Attention 2.")
    use_alibi: bool = Field(default=False, description="Use ALiBi instead of RoPE (unsupported in this branch).")
    soft_prompt_len: int = Field(default=0, description="Number of soft prompt tokens.")

    @classmethod
    def from_yaml(cls, path: str) -> "ModelConfig":
        with open(path, "r") as f:
            data = yaml.safe_load(f)
        return cls(**data)


class TrainConfig(BaseSettings):
    """Configuration for pretraining."""
    peak_lr: float = 3e-4
    warmup_steps: int = 2000
    total_steps: int = 500000
    weight_decay: float = 0.1
    beta1: float = 0.9
    beta2: float = 0.95
    eps: float = 1e-8
    grad_clip: float = 1.0
    batch_tokens: int = 4_000_000
    seq_len_schedule: List[Tuple[float, int]] = Field(default_factory=lambda: [(0.5, 4096), (0.9, 8192), (1.0, 32768)])
    moe_aux_loss_coef: float = 0.01
    z_loss_coef: float = 0.001
    checkpoint_every: int = 1000
    keep_last_n: int = 3
    s3_bucket: str = "llm-pro-checkpoints"

    @classmethod
    def from_yaml(cls, path: str) -> "TrainConfig":
        with open(path, "r") as f:
            data = yaml.safe_load(f)
        return cls(**data)


class SFTConfig(BaseSettings):
    """Configuration for Supervised Fine-Tuning."""
    lr: float = 2e-5
    epochs: int = 3
    batch_size: int = 512
    loss_mask_user_tokens: bool = True
    lora_rank: int = 128
    lora_alpha: int = 256
    lora_target_modules: List[str] = Field(default_factory=lambda: ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"])

    @classmethod
    def from_yaml(cls, path: str) -> "SFTConfig":
        with open(path, "r") as f:
            data = yaml.safe_load(f)
        return cls(**data)


class RLHFConfig(BaseSettings):
    """Configuration for Reinforcement Learning from Human Feedback."""
    method: str = "dpo"
    kl_coef: float = 0.04
    clip_range: float = 0.2
    ppo_epochs: int = 4
    rollout_batch: int = 512
    beta: float = 0.1
    reward_model_ensemble: int = 3

    @classmethod
    def from_yaml(cls, path: str) -> "RLHFConfig":
        with open(path, "r") as f:
            data = yaml.safe_load(f)
        return cls(**data)
