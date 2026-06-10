# ── FILE: llm_pro/data/pack_sequences.py ─────────────────────────────────
"""
Bin-packing and sharding scripts to pack variable-length documents into fixed-length 
sequences separated by EOS tokens. Outputs memory-mapped uint16 numpy arrays.
"""

import os
import argparse
import numpy as np
from tqdm import tqdm
from tokenizers import Tokenizer
from loguru import logger
from .constants import TOKENIZER_PATH, SPECIAL_TOKENS

def pack_documents(
    dataset,
    tokenizer: Tokenizer,
    seq_len: int = 4096,
    output_dir: str = "data/packed/",
    shard_size: int = 100_000_000 # number of tokens per shard
):
    """
    Pack tokenized documents into fixed-length sequences and save to disk as numpy arrays.
    """
    os.makedirs(output_dir, exist_ok=True)
    eos_id = tokenizer.token_to_id(SPECIAL_TOKENS["eos_token"])
    
    current_shard = 0
    buffer = []
    
    def save_shard():
        nonlocal current_shard, buffer
        if not buffer:
            return
            
        arr = np.array(buffer, dtype=np.uint16)
        path = os.path.join(output_dir, f"shard_{current_shard:04d}.bin")
        
        # We save as memmap-friendly binary
        arr.tofile(path)
        logger.info(f"Saved {path} with {len(arr)} tokens")
        
        current_shard += 1
        buffer = []

    for item in tqdm(dataset, desc="Packing sequences"):
        text = item["text"]
        # Tokenize
        tokens = tokenizer.encode(text).ids
        
        # Append to buffer with EOS
        buffer.extend(tokens)
        buffer.append(eos_id)
        
        # If buffer exceeds shard_size, truncate to nearest multiple of seq_len and save
        if len(buffer) >= shard_size:
            # Round down to nearest multiple of seq_len
            save_len = (len(buffer) // seq_len) * seq_len
            save_buffer = buffer[:save_len]
            
            # Save
            arr = np.array(save_buffer, dtype=np.uint16)
            path = os.path.join(output_dir, f"shard_{current_shard:04d}.bin")
            arr.tofile(path)
            logger.info(f"Saved {path} with {len(arr)} tokens")
            current_shard += 1
            
            # Keep remainder
            buffer = buffer[save_len:]
            
    # Save final shard (padded to seq_len)
    if buffer:
        remainder = len(buffer) % seq_len
        if remainder != 0:
            pad_len = seq_len - remainder
            pad_id = tokenizer.token_to_id(SPECIAL_TOKENS["pad_token"]) or eos_id
            buffer.extend([pad_id] * pad_len)
        save_shard()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seq_len", type=int, default=4096)
    parser.add_argument("--shard_size", type=int, default=100000000)
    args = parser.parse_args()
    
    tokenizer = Tokenizer.from_file(TOKENIZER_PATH)
    
    # Dummy dataset loader for script entrypoint
    from datasets import load_dataset
    dataset = load_dataset("wikitext", "wikitext-103-v1", split="train")
    
    pack_documents(dataset, tokenizer, seq_len=args.seq_len, shard_size=args.shard_size)
