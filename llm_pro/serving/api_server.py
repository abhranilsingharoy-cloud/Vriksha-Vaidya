# ── FILE: llm_pro/serving/api_server.py ─────────────────────────────────
"""
FastAPI application providing an OpenAI-compatible REST API.
Integrates with the continuous batching engine.
"""

import time
import uuid
import asyncio
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from .schema import ChatCompletionRequest, ChatCompletionResponse, Choice, Message, Usage
from .batching import AsyncBatchingEngine
from .streaming import sse_generator

# This would typically be initialized with the real model
engine = AsyncBatchingEngine()

app = FastAPI(title="LLM Pro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Start the continuous batching loop in the background
    asyncio.create_task(engine.run_loop())

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    req_id = str(uuid.uuid4())
    logger.info(f"Incoming request {req_id}: {request.method} {request.url}")
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Process-Time"] = str(process_time)
    logger.info(f"Completed request {req_id} in {process_time:.3f}s with status {response.status_code}")
    return response

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    request_id = f"chatcmpl-{uuid.uuid4().hex}"
    created = int(time.time())
    
    # Simple template application
    prompt = ""
    for msg in request.messages:
        prompt += f"<|{msg.role}|>\n{msg.content}\n"
    prompt += "<|assistant|>\n"
    
    if request.stream:
        # Return StreamingResponse for Server-Sent Events
        return StreamingResponse(
            sse_generator(engine, request_id, prompt, request, created),
            media_type="text/event-stream"
        )
    else:
        # Non-streaming
        try:
            result = await engine.add_request(prompt, request)
            
            choice = Choice(
                index=0,
                message=Message(role="assistant", content=result["text"]),
                finish_reason="stop"
            )
            
            usage = Usage(
                prompt_tokens=result["prompt_tokens"],
                completion_tokens=result["completion_tokens"],
                total_tokens=result["prompt_tokens"] + result["completion_tokens"]
            )
            
            return ChatCompletionResponse(
                id=request_id,
                created=created,
                model=request.model,
                choices=[choice],
                usage=usage
            )
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "queue_depth": engine.get_queue_depth()}

# For Prometheus metrics, see monitoring/metrics.py
