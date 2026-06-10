# ── FILE: llm_pro/evals/run_benchmarks.py ─────────────────────────────────
"""
Wrapper script to run standard benchmarks (MMLU, HumanEval) on the trained model.
"""

import os
import argparse
from loguru import logger

def run_lm_eval(model_path: str, tasks: str, batch_size: int):
    """
    Executes LM Evaluation Harness.
    """
    logger.info(f"Running LM Eval Harness on {tasks}...")
    cmd = f"lm_eval --model hf --model_args pretrained={model_path} --tasks {tasks} --batch_size {batch_size}"
    os.system(cmd)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", type=str, required=True)
    parser.add_argument("--tasks", type=str, default="mmlu,hellaswag")
    parser.add_argument("--batch_size", type=int, default=8)
    args = parser.parse_args()
    
    run_lm_eval(args.model_path, args.tasks, args.batch_size)
