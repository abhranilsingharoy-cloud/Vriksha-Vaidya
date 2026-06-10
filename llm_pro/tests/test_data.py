# ── FILE: llm_pro/tests/test_data.py ─────────────────────────────────
"""
Unit tests for the data pipeline.
"""

import pytest
import numpy as np
import tempfile
import os
from data import PackedIterableDataset

def test_packed_dataset():
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a dummy bin file
        file_path = os.path.join(temp_dir, "shard_0000.bin")
        data = np.arange(100, dtype=np.uint16)
        data.tofile(file_path)
        
        dataset = PackedIterableDataset(data_dir=temp_dir, seq_len=9)
        iterator = iter(dataset)
        
        # 100 tokens, seq_len=9, chunk_size=10 (9 inputs + 1 target)
        # So exactly 10 chunks
        batch1 = next(iterator)
        assert len(batch1["input_ids"]) == 9
        assert len(batch1["labels"]) == 9
        assert batch1["input_ids"][0].item() == 0
        assert batch1["labels"][0].item() == 1
