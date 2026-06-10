# ── FILE: llm_pro/setup.py ─────────────────────────────────
from setuptools import setup, find_packages

setup(
    name="llm_pro",
    version="0.1.0",
    description="Production LLM training and serving repository",
    packages=find_packages(),
    python_requires=">=3.11",
)
