# ── FILE: llm_pro/serving/__init__.py ─────────────────────────────────
"""
Serving module implementing an OpenAI-compatible REST API, continuous batching,
and server-sent events streaming.
"""

from .schema import ChatCompletionRequest, ChatCompletionResponse
from .api_server import app

__all__ = ["ChatCompletionRequest", "ChatCompletionResponse", "app"]
