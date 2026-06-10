# ── FILE: llm_pro/optimization/__init__.py ─────────────────────────────────
"""
Optimization module for deployment. Includes quantization (AWQ, GPTQ, FP8),
context extension (YaRN), and inference acceleration (Speculative Decoding, Paged KV Cache).
"""

from .speculative import SpeculativeDecoder
from .kv_cache import PagedKVCache
from .yarn_extension import apply_yarn_scaling

__all__ = ["SpeculativeDecoder", "PagedKVCache", "apply_yarn_scaling"]
