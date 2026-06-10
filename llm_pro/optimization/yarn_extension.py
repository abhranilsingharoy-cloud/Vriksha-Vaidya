# ── FILE: llm_pro/optimization/yarn_extension.py ─────────────────────────────────
"""
YaRN (Yet another RoPE extensioN).
Scales Rotary Embeddings to allow the model to handle much longer contexts
(e.g., 4k -> 128k) than it was originally trained on, without catastrophic forgetting.
"""

import math
import torch
from loguru import logger

def apply_yarn_scaling(
    model, 
    original_max_seq_len: int, 
    new_max_seq_len: int,
    beta_fast: int = 32,
    beta_slow: int = 1
):
    """
    Modifies the model's RoPE module in-place to use YaRN scaling.
    """
    scale = new_max_seq_len / original_max_seq_len
    if scale <= 1.0:
        return
        
    logger.info(f"Applying YaRN scaling to extend context from {original_max_seq_len} to {new_max_seq_len} (scale factor {scale})")
    
    # We find the RotaryEmbedding module
    # Assuming LanguageModel structure: model.rope
    rope = getattr(model, "rope", None)
    if not rope:
        logger.warning("Could not find 'rope' attribute on model. YaRN not applied.")
        return
        
    dim = rope.dim
    base = rope.base
    
    # YaRN computes a blended scaling factor per frequency
    inv_freq = rope.inv_freq.clone()
    
    # For each dimension pair (i), calculate the wavelength
    for i in range(0, dim, 2):
        freq = base ** (i / dim)
        
        # YaRN blending logic
        if freq < beta_fast:
            # High frequencies (local context) are not scaled
            pass
        elif freq > beta_slow * scale:
            # Low frequencies (global context) are linearly scaled
            inv_freq[i // 2] = inv_freq[i // 2] / scale
        else:
            # Intermediate frequencies use a ramp function
            m = (freq - beta_fast) / (beta_slow * scale - beta_fast)
            inv_freq[i // 2] = (1 - m) * inv_freq[i // 2] + m * (inv_freq[i // 2] / scale)
            
    # Apply a temperature scaling to attention logits to compensate for increased entropy
    # This is typically handled during generation, but we store the multiplier
    temperature_multiplier = 0.1 * math.log(scale) + 1.0
    model.config.yarn_temperature_multiplier = temperature_multiplier
    
    # Update the buffer
    rope.inv_freq.copy_(inv_freq)
    rope.max_seq_len = new_max_seq_len
    rope._precompute_freqs(new_max_seq_len, factor=1.0) # We applied factor to inv_freq directly
    
    logger.info("YaRN scaling successfully applied.")
