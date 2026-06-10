# ── FILE: llm_pro/tests/test_model.py ─────────────────────────────────
"""
Unit tests for the model architecture.
"""

import torch
import pytest
from model import LanguageModel, ModelConfig

def test_model_initialization():
    config = ModelConfig(
        d_model=128,
        n_heads=4,
        n_kv_heads=2,
        n_layers=2,
        vocab_size=1000,
        max_seq_len=512
    )
    model = LanguageModel(config)
    assert model.tok_embeddings.weight.shape == (1000, 128)

def test_model_forward():
    config = ModelConfig(
        d_model=128,
        n_heads=4,
        n_kv_heads=2,
        n_layers=2,
        vocab_size=1000,
        max_seq_len=512
    )
    model = LanguageModel(config)
    input_ids = torch.randint(0, 1000, (2, 64))
    
    logits, moe_losses, _ = model(input_ids)
    
    assert logits.shape == (2, 64, 1000)
    assert len(moe_losses) == 2 # 2 layers, both use MoE by default
