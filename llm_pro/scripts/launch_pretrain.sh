#!/bin/bash
# ── FILE: llm_pro/scripts/launch_pretrain.sh ─────────────────────────────────
# Launches distributed pretraining using DeepSpeed.

set -e

CONFIG_PATH="configs/train_pretrain.yaml"
NUM_GPUS=8

echo "Starting DeepSpeed pretraining with $NUM_GPUS GPUs..."

deepspeed --num_gpus=$NUM_GPUS \
    training/pretrain.py \
    --config $CONFIG_PATH \
    --deepspeed \
    --deepspeed_config "configs/ds_zero3_config.json"
