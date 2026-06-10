#!/bin/bash
# ── FILE: llm_pro/scripts/launch_eval.sh ─────────────────────────────────
# Launches evaluation suite using LM Evaluation Harness (assumed installed).

set -e

MODEL_PATH="checkpoints/llm_pro_final"
TASKS="hellaswag,mmlu,gsm8k,truthfulqa_gen"
BATCH_SIZE=16

echo "Starting evaluation on tasks: $TASKS"

lm_eval --model hf \
    --model_args pretrained=$MODEL_PATH,dtype=bfloat16 \
    --tasks $TASKS \
    --batch_size $BATCH_SIZE \
    --output_path evals/results \
    --log_samples
