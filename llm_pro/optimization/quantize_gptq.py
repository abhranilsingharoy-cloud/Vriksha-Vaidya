# ── FILE: llm_pro/optimization/quantize_gptq.py ─────────────────────────────────
"""
GPTQ INT4 quantization with group_size=128.
"""

from loguru import logger

def quantize_gptq(model_path: str, output_path: str, dataset_name: str = "c4", bits: int = 4):
    """
    Applies GPTQ quantization using AutoGPTQ.
    """
    try:
        from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
        from transformers import AutoTokenizer
        
        logger.info(f"Preparing GPTQ config for {bits}-bit quantization...")
        quantize_config = BaseQuantizeConfig(
            bits=bits,
            group_size=128,
            desc_act=False
        )
        
        logger.info(f"Loading model {model_path}...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoGPTQForCausalLM.from_pretrained(
            model_path, 
            quantize_config=quantize_config
        )
        
        # Load calibration data
        # In practice, load a small subset of the training data
        examples = ["The quick brown fox jumps over the lazy dog." for _ in range(128)]
        examples_tokenized = [tokenizer(ex, return_tensors="pt") for ex in examples]
        
        logger.info("Running GPTQ quantization algorithm...")
        model.quantize(examples_tokenized)
        
        logger.info(f"Saving quantized model to {output_path}...")
        model.save_quantized(output_path, use_safetensors=True)
        tokenizer.save_pretrained(output_path)
        logger.info("GPTQ Quantization complete.")
        
    except ImportError:
        logger.error("auto-gptq is not installed. Please install it to use GPTQ.")
