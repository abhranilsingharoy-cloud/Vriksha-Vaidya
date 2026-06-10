# ── FILE: llm_pro/data/preprocess.py ─────────────────────────────────
"""
Text cleaning, exact deduplication, and PII scrubbing.
"""

import re
from typing import Dict, Any
from loguru import logger
import hashlib
from presidio_analyzer import AnalyzerEngine

# Initialize PII Analyzer once
analyzer = AnalyzerEngine()

def scrub_pii(text: str) -> str:
    """Scrub Personally Identifiable Information using Presidio."""
    # Analyze text for PII (Email, Phone, IP Address, etc.)
    results = analyzer.analyze(text=text, entities=["EMAIL_ADDRESS", "PHONE_NUMBER", "IP_ADDRESS"], language='en')
    
    # Replace entities backward to not mess up indices
    results_sorted = sorted(results, key=lambda x: x.start, reverse=True)
    for res in results_sorted:
        text = text[:res.start] + f"<{res.entity_type}>" + text[res.end:]
        
    return text

def compute_hash(text: str) -> str:
    """Compute MD5 hash for exact deduplication."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()

def clean_text(example: Dict[str, Any]) -> Dict[str, Any]:
    """Basic text cleaning pipeline."""
    text = example.get("text", "")
    
    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text)
    
    # Scrub PII
    text = scrub_pii(text)
    
    example["text"] = text.strip()
    example["hash"] = compute_hash(example["text"])
    return example

def deduplicate_dataset(dataset, num_proc: int = 4):
    """Remove exact duplicates based on pre-computed hashes."""
    logger.info(f"Original size: {len(dataset)}")
    
    unique_hashes = set()
    def filter_dupes(example):
        h = example["hash"]
        if h in unique_hashes:
            return False
        unique_hashes.add(h)
        return True
        
    deduped = dataset.filter(filter_dupes, num_proc=1) # stateful filter needs num_proc=1 or careful sharding
    logger.info(f"Deduped size: {len(deduped)}")
    return deduped
