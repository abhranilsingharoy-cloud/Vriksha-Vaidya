# ── FILE: llm_pro/data/tokenizer_train.py ─────────────────────────────────
"""
Trains a BPE tokenizer using Hugging Face's tokenizers library.
"""

import os
import argparse
from typing import List, Iterator
from loguru import logger
from tokenizers import Tokenizer, models, pre_tokenizers, decoders, trainers, processors
from datasets import load_dataset
from .constants import SPECIAL_TOKENS, TOKENIZER_PATH

def get_training_corpus(dataset_name: str, split: str = "train", batch_size: int = 1000) -> Iterator[List[str]]:
    """Yield batches of text from a HuggingFace dataset."""
    logger.info(f"Loading dataset {dataset_name} for tokenizer training...")
    dataset = load_dataset(dataset_name, split=split, streaming=True)
    batch = []
    for row in dataset:
        batch.append(row["text"])
        if len(batch) == batch_size:
            yield batch
            batch = []
    if batch:
        yield batch

def train_tokenizer(dataset_name: str = "wikipedia", subset: str = "20220301.en", vocab_size: int = 65536):
    """Train a BPE tokenizer."""
    logger.info(f"Initializing BPE tokenizer (vocab_size={vocab_size})")
    
    # Initialize a tokenizer
    tokenizer = Tokenizer(models.BPE(unk_token=SPECIAL_TOKENS["unk_token"]))
    
    # Pre-tokenizer (byte-level for fallback)
    tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
    
    # Decoder
    tokenizer.decoder = decoders.ByteLevel()
    
    # Post-processor
    tokenizer.post_processor = processors.ByteLevel(trim_offsets=False)
    
    # Setup trainer
    trainer = trainers.BpeTrainer(
        vocab_size=vocab_size,
        special_tokens=list(SPECIAL_TOKENS.values()),
        initial_alphabet=pre_tokenizers.ByteLevel.alphabet(),
        show_progress=True
    )
    
    # Train
    corpus_iterator = get_training_corpus(f"{dataset_name}", split=f"train")
    
    # In a real scenario, you'd combine iterators from multiple sources
    logger.info("Starting training...")
    tokenizer.train_from_iterator(corpus_iterator, trainer=trainer)
    
    # Save
    os.makedirs(os.path.dirname(TOKENIZER_PATH), exist_ok=True)
    tokenizer.save(TOKENIZER_PATH)
    logger.info(f"Tokenizer saved to {TOKENIZER_PATH}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--vocab_size", type=int, default=65536)
    parser.add_argument("--dataset", type=str, default="wikitext")
    args = parser.parse_args()
    
    train_tokenizer(dataset_name=args.dataset, vocab_size=args.vocab_size)
