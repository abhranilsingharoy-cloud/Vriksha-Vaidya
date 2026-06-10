#!/bin/bash
# ── FILE: llm_pro/scripts/launch_sft.sh ─────────────────────────────────
# Launches Supervised Fine-Tuning.

set -e

export CUDA_VISIBLE_DEVICES=0,1,2,3

torchrun --nproc_per_node=4 training/sft.py \
    --config configs/train_sft.yaml \
    --model_path checkpoints/base_model \
    --data_path data/processed/sft_dataset.jsonl
