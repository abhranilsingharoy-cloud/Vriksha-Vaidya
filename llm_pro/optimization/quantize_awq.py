# ── FILE: llm_pro/optimization/quantize_awq.py ─────────────────────────────────
"""
Activation-aware Weight Quantization (AWQ).
Compresses INT4 weights while preserving salient weights based on activation magnitude.
"""

from loguru import logger

def quantize_awq(model_path: str, output_path: str, w_bit: int = 4, q_group_size: int = 128):
    """
    Applies AWQ quantization to a HuggingFace format model.
    """
    try:
        from awq import AutoAWQForCausalLM
        from transformers import AutoTokenizer
        
        logger.info(f"Loading model {model_path} for AWQ quantization...")
        model = AutoAWQForCausalLM.from_pretrained(model_path, safetensors=True)
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        
        quant_config = {
            "zero_point": True, 
            "q_group_size": q_group_size, 
            "w_bit": w_bit, 
            "version": "GEMM"
        }
        
        logger.info("Starting AWQ quantization (this may take a while)...")
        model.quantize(tokenizer, quant_config=quant_config)
        
        logger.info(f"Saving quantized model to {output_path}...")
        model.save_quantized(output_path)
        tokenizer.save_pretrained(output_path)
        logger.info("AWQ Quantization complete.")
        
    except ImportError:
        logger.error("autoawq is not installed. Please install it to use AWQ.")
