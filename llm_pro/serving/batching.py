# ── FILE: llm_pro/serving/batching.py ─────────────────────────────────
"""
Continuous batching engine similar to vLLM.
Handles request queuing, dynamic batch formation, and iteration-level scheduling.
"""

import asyncio
from typing import Dict, Any, List
from loguru import logger
from .schema import ChatCompletionRequest

class SequenceGroup:
    def __init__(self, request_id: str, prompt: str, sampling_params: ChatCompletionRequest):
        self.request_id = request_id
        self.prompt = prompt
        self.sampling_params = sampling_params
        
        # In a real engine, these are tokenized
        self.prompt_tokens = len(prompt.split())
        self.generated_tokens: List[str] = []
        
        self.status = "waiting" # waiting, running, finished
        self.is_finished = False
        
        # Async event to signal completion or stream tokens
        self.event = asyncio.Event()
        self.output_queue = asyncio.Queue()

class AsyncBatchingEngine:
    """
    Simulates a continuous batching inference engine.
    In a real implementation, this manages GPU memory via PagedKVCache and executes 
    forward passes on the model.
    """
    def __init__(self, max_batch_size: int = 256):
        self.max_batch_size = max_batch_size
        self.waiting_queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self.running_queue: List[SequenceGroup] = []
        self._request_counter = 0

    def get_queue_depth(self) -> int:
        return self.waiting_queue.qsize()

    async def add_request(self, prompt: str, sampling_params: ChatCompletionRequest) -> Dict[str, Any]:
        """Add a request and wait for the complete result."""
        self._request_counter += 1
        seq_group = SequenceGroup(f"req-{self._request_counter}", prompt, sampling_params)
        
        # Priority queue (using counter to ensure FIFO for same priority)
        await self.waiting_queue.put((1, self._request_counter, seq_group))
        
        # Wait until the engine marks it finished
        await seq_group.event.wait()
        
        return {
            "text": " ".join(seq_group.generated_tokens),
            "prompt_tokens": seq_group.prompt_tokens,
            "completion_tokens": len(seq_group.generated_tokens)
        }
        
    async def get_stream_generator(self, prompt: str, sampling_params: ChatCompletionRequest):
        """Add a request and return an async generator for streaming tokens."""
        self._request_counter += 1
        seq_group = SequenceGroup(f"req-{self._request_counter}", prompt, sampling_params)
        await self.waiting_queue.put((1, self._request_counter, seq_group))
        
        while not seq_group.is_finished or not seq_group.output_queue.empty():
            try:
                # Wait for next token with a small timeout to check finished status
                token = await asyncio.wait_for(seq_group.output_queue.get(), timeout=0.1)
                yield token
            except asyncio.TimeoutError:
                continue

    async def run_loop(self):
        """The main continuous batching loop running in the background."""
        logger.info("Starting continuous batching engine loop...")
        
        while True:
            # 1. Schedule new requests if there's room
            while len(self.running_queue) < self.max_batch_size and not self.waiting_queue.empty():
                _, _, seq_group = await self.waiting_queue.get()
                seq_group.status = "running"
                self.running_queue.append(seq_group)
                
            if not self.running_queue:
                await asyncio.sleep(0.01)
                continue
                
            # 2. Execute one iteration (generate 1 token for all running sequences)
            # In reality, this is `model.forward(...)`
            await self._simulate_forward_pass()
            
            # 3. Handle finished sequences
            finished_seqs = [s for s in self.running_queue if s.is_finished]
            for seq in finished_seqs:
                self.running_queue.remove(seq)
                seq.event.set() # Wake up non-streaming clients

    async def _simulate_forward_pass(self):
        """Simulates the latency of a single GPU forward pass."""
        await asyncio.sleep(0.02) # ~20ms per token
        
        for seq in self.running_queue:
            # Generate dummy token
            token = " token"
            seq.generated_tokens.append(token)
            seq.output_queue.put_nowait(token)
            
            # Check stopping criteria
            if len(seq.generated_tokens) >= seq.sampling_params.max_tokens:
                seq.is_finished = True
