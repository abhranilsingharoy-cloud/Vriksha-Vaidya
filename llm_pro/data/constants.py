# ── FILE: llm_pro/data/constants.py ─────────────────────────────────
"""
Constants, special tokens, and default paths for the data pipeline.
"""

SPECIAL_TOKENS = {
    "unk_token": "<unk>",
    "bos_token": "<s>",
    "eos_token": "</s>",
    "pad_token": "<pad>",
    "mask_token": "<mask>",
    "system_token": "<|system|>",
    "user_token": "<|user|>",
    "assistant_token": "<|assistant|>",
}

DATASET_WEIGHTS = {
    "wikipedia": 0.20,
    "github": 0.25,
    "arxiv": 0.15,
    "stackexchange": 0.10,
    "books": 0.20,
    "c4_filtered": 0.10,
}

RAW_DATA_PATH = "data/raw/"
PROCESSED_DATA_PATH = "data/processed/"
PACKED_DATA_PATH = "data/packed/"
TOKENIZER_PATH = "data/tokenizer.json"
