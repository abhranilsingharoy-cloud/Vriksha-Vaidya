# ── FILE: llm_pro/monitoring/metrics.py ─────────────────────────────────
"""
Prometheus metrics registry for tracking inference and training statistics.
"""

from prometheus_client import start_http_server, Counter, Gauge, Histogram

class MetricsRegistry:
    def __init__(self):
        # Serving metrics
        self.request_counter = Counter(
            "llm_requests_total", 
            "Total number of API requests", 
            ["model", "status"]
        )
        
        self.token_counter = Counter(
            "llm_tokens_total", 
            "Total number of generated tokens", 
            ["type"] # prompt or completion
        )
        
        self.latency_histogram = Histogram(
            "llm_request_latency_seconds", 
            "Latency of requests", 
            buckets=[0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0]
        )
        
        self.queue_depth = Gauge(
            "llm_queue_depth", 
            "Current number of requests in the waiting queue"
        )
        
        # Training metrics
        self.train_loss = Gauge(
            "llm_train_loss",
            "Current training loss"
        )
        self.throughput = Gauge(
            "llm_train_throughput",
            "Tokens per second across cluster"
        )

# Global registry
registry = MetricsRegistry()

def start_metrics_server(port: int = 8001):
    """Start Prometheus metrics HTTP server."""
    start_http_server(port)
