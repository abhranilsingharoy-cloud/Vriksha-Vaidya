# ── FILE: llm_pro/data/quality_filter.py ─────────────────────────────────
"""
Filters datasets based on perplexity, repetition, and document length.
Uses a small fastText/KenLM model for perplexity filtering in a real setup.
"""

from typing import Dict, Any
import re
from loguru import logger

def length_filter(example: Dict[str, Any], min_chars: int = 200, max_chars: int = 100000) -> bool:
    """Filter out documents that are too short or unreasonably long."""
    text_len = len(example.get("text", ""))
    return min_chars <= text_len <= max_chars

def repetition_filter(example: Dict[str, Any], max_dupe_fraction: float = 0.2) -> bool:
    """
    Filter documents with too much repeating text (n-gram repetition).
    Simple heuristic: check unique word ratio.
    """
    text = example.get("text", "").lower()
    words = text.split()
    if not words:
        return False
        
    unique_words = set(words)
    unique_ratio = len(unique_words) / len(words)
    
    # If the unique ratio is very low, it's likely heavily repetitive spam
    return unique_ratio > max_dupe_fraction

def perplexity_filter(example: Dict[str, Any], threshold: float = 1000.0) -> bool:
    """
    Placeholder for KenLM perplexity filtering.
    In production, you would load a KenLM model trained on Wikipedia 
    and filter out texts with perplexity > threshold.
    """
    # Dummy implementation
    return True

def apply_quality_filters(dataset, num_proc: int = 8):
    """Apply all quality filters to a HuggingFace dataset."""
    logger.info("Applying quality filters...")
    
    def combined_filter(example):
        return (
            length_filter(example) and 
            repetition_filter(example) and 
            perplexity_filter(example)
        )
        
    filtered = dataset.filter(combined_filter, num_proc=num_proc)
    return filtered
