# ── FILE: llm_pro/model/utils.py ─────────────────────────────────
"""
Utility functions for the model, including dtype casting and parameter counting.
"""

import torch
import torch.nn as nn
from loguru import logger
from typing import Dict

def get_dtype(dtype_str: str) -> torch.dtype:
    """Convert string dtype to torch dtype."""
    mapping = {
        "float32": torch.float32,
        "fp32": torch.float32,
        "float16": torch.float16,
        "fp16": torch.float16,
        "bfloat16": torch.bfloat16,
        "bf16": torch.bfloat16,
    }
    if dtype_str.lower() not in mapping:
        raise ValueError(f"Unknown dtype: {dtype_str}")
    return mapping[dtype_str.lower()]

def print_param_counts(model: nn.Module) -> Dict[str, int]:
    """Calculate and log active and total parameter counts (useful for MoE)."""
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    # Calculate "active" parameters (params used in a single forward pass)
    # For dense models, active == total. For MoE, active < total.
    active_params = 0
    expert_params = 0
    has_moe = False
    
    for name, module in model.named_modules():
        # Avoid double counting
        if list(module.children()):
            continue
            
        params_in_module = sum(p.numel() for p in module.parameters())
        if "experts" in name:
            has_moe = True
            expert_params += params_in_module
        else:
            active_params += params_in_module
            
    if has_moe:
        # Get MoE config details from the model if available
        # Approximation: active = dense + (top_k / n_experts) * expert_params
        # Since we don't have direct access to top_k here easily, we rely on the 
        # parent model's config if passed, or just report the raw numbers.
        
        # Look for model config
        cfg = getattr(model, "config", None)
        if cfg:
            active_expert_params = int(expert_params * (cfg.top_k_experts / cfg.n_experts))
            active_params += active_expert_params
            
        logger.info(f"Total Parameters: {total_params / 1e9:.2f}B")
        logger.info(f"Active Parameters (per token): {active_params / 1e9:.2f}B")
        logger.info(f"Expert Parameters: {expert_params / 1e9:.2f}B")
    else:
        logger.info(f"Total Parameters: {total_params / 1e9:.2f}B")
        
    logger.info(f"Trainable Parameters: {trainable_params / 1e9:.2f}B")
    
    return {
        "total": total_params,
        "active": active_params if has_moe else total_params,
        "trainable": trainable_params
    }
