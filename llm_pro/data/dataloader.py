# ── FILE: llm_pro/data/dataloader.py ─────────────────────────────────
"""
PyTorch IterableDataset for reading memory-mapped packed shards,
including a multi-source sampler for weighted dataset blending.
"""

import os
import glob
import numpy as np
import torch
from torch.utils.data import IterableDataset, DataLoader
from typing import List, Dict
import random

class PackedIterableDataset(IterableDataset):
    """
    Reads from memory-mapped numpy binary files containing packed uint16 tokens.
    """
    def __init__(self, data_dir: str, seq_len: int = 4096, seed: int = 42):
        super().__init__()
        self.data_dir = data_dir
        self.seq_len = seq_len
        self.seed = seed
        self.files = sorted(glob.glob(os.path.join(data_dir, "*.bin")))
        
        if not self.files:
            raise ValueError(f"No .bin files found in {data_dir}")

    def __iter__(self):
        worker_info = torch.utils.data.get_worker_info()
        worker_id = worker_info.id if worker_info is not None else 0
        num_workers = worker_info.num_workers if worker_info is not None else 1
        
        # Distributed setup info (if using DDP/DeepSpeed)
        try:
            import torch.distributed as dist
            if dist.is_initialized():
                rank = dist.get_rank()
                world_size = dist.get_world_size()
            else:
                rank = 0
                world_size = 1
        except ImportError:
            rank = 0
            world_size = 1

        # Global worker ID to partition shards uniquely
        global_worker_id = rank * num_workers + worker_id
        global_num_workers = world_size * num_workers

        # Shuffle files deterministically per epoch based on seed
        rng = random.Random(self.seed)
        shuffled_files = list(self.files)
        rng.shuffle(shuffled_files)
        
        # Assign files to this specific worker
        worker_files = [f for i, f in enumerate(shuffled_files) if i % global_num_workers == global_worker_id]

        for filepath in worker_files:
            # Memory map the array
            # mode='r' means read-only, preventing copy-on-write overhead
            mmap_array = np.memmap(filepath, dtype=np.uint16, mode='r')
            
            # Total chunks in this file
            total_tokens = len(mmap_array)
            # We need seq_len + 1 tokens (input + target)
            chunk_size = self.seq_len + 1
            num_chunks = total_tokens // chunk_size
            
            for i in range(num_chunks):
                start_idx = i * chunk_size
                end_idx = start_idx + chunk_size
                
                # Slicing a memmap returns a view
                chunk = mmap_array[start_idx:end_idx]
                
                # Convert to torch tensor (copies the data to RAM finally)
                tensor_chunk = torch.from_numpy(chunk.astype(np.int64))
                
                input_ids = tensor_chunk[:-1]
                labels = tensor_chunk[1:]
                
                yield {
                    "input_ids": input_ids,
                    "labels": labels
                }


def create_dataloader(
    data_dir: str,
    batch_size: int,
    seq_len: int = 4096,
    num_workers: int = 2,
    seed: int = 42
) -> DataLoader:
    """Create a DataLoader for the packed dataset."""
    dataset = PackedIterableDataset(data_dir=data_dir, seq_len=seq_len, seed=seed)
    
    return DataLoader(
        dataset,
        batch_size=batch_size,
        num_workers=num_workers,
        pin_memory=True,
        drop_last=True
    )
