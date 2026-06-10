# ── FILE: llm_pro/Makefile ─────────────────────────────────
.PHONY: train sft eval serve test lint docker-train docker-serve clean

train:
	bash scripts/launch_pretrain.sh

sft:
	bash scripts/launch_sft.sh

eval:
	bash scripts/launch_eval.sh

serve:
	uvicorn serving.api_server:app --host 0.0.0.0 --port 8000

test:
	pytest tests/ -v

lint:
	ruff check .
	mypy .

docker-train:
	docker build -t llm_pro_train -f docker/Dockerfile.train .

docker-serve:
	docker build -t llm_pro_serve -f docker/Dockerfile.serve .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .mypy_cache .ruff_cache
