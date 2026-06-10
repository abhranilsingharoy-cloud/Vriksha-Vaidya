# ── FILE: llm_pro/README.md ─────────────────────────────────
# LLM Pro

Production-grade end-to-end repository for LLM training and serving, structured to support advanced features like DeepSpeed 3D parallelism, Flash Attention 2, PPO/DPO, and continuous batching serving.

## Setup

```bash
pip install -r requirements.txt
pip install -e .
```

## Features
- **Pretraining**: DeepSpeed ZeRO-3, Megatron-Core 3D Parallelism
- **Alignment**: SFT, PPO, DPO, Constitutional AI
- **Architecture**: SwiGLU, MoE, GQA, RoPE, Sliding Window Attention
- **Serving**: FastAPI, vLLM-style continuous batching, SSE streaming
- **Optimization**: AWQ/GPTQ INT4, FP8, Speculative Decoding
