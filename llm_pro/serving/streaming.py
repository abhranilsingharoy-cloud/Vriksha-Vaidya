# ── FILE: llm_pro/serving/streaming.py ─────────────────────────────────
"""
Server-Sent Events (SSE) generator for streaming API responses.
"""

import json
from .schema import ChatCompletionStreamResponse, StreamChoice

async def sse_generator(engine, request_id: str, prompt: str, request, created: int):
    """
    Yields Server-Sent Events formats from the engine's token generator.
    """
    stream_gen = engine.get_stream_generator(prompt, request)
    
    # First chunk (role)
    initial_chunk = ChatCompletionStreamResponse(
        id=request_id,
        created=created,
        model=request.model,
        choices=[StreamChoice(index=0, delta={"role": "assistant"}, finish_reason=None)]
    )
    yield f"data: {json.dumps(initial_chunk.model_dump(exclude_none=True))}\n\n"
    
    # Token chunks
    async for token in stream_gen:
        chunk = ChatCompletionStreamResponse(
            id=request_id,
            created=created,
            model=request.model,
            choices=[StreamChoice(index=0, delta={"content": token}, finish_reason=None)]
        )
        yield f"data: {json.dumps(chunk.model_dump(exclude_none=True))}\n\n"
        
    # Final chunk (finish reason)
    final_chunk = ChatCompletionStreamResponse(
        id=request_id,
        created=created,
        model=request.model,
        choices=[StreamChoice(index=0, delta={}, finish_reason="stop")]
    )
    yield f"data: {json.dumps(final_chunk.model_dump(exclude_none=True))}\n\n"
    yield "data: [DONE]\n\n"
