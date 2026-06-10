# ── FILE: llm_pro/serving/router.py ─────────────────────────────────
"""
Request routing and load balancing across multiple worker nodes.
Useful when deploying behind an API Gateway in a cluster.
"""

from loguru import logger
import random

class RequestRouter:
    """
    Routes incoming API requests to the least loaded inference node.
    """
    def __init__(self, node_urls: list[str]):
        self.nodes = node_urls
        # In a real system, this tracks active connections or queries /health
        self.node_loads = {url: 0 for url in node_urls}

    def get_best_node(self) -> str:
        """Returns the URL of the node with the lowest current load."""
        if not self.nodes:
            raise ValueError("No healthy nodes available.")
            
        best_node = min(self.node_loads, key=self.node_loads.get)
        
        # Update pseudo-load
        self.node_loads[best_node] += 1
        return best_node

    def mark_request_complete(self, node_url: str):
        """Decrements load counter when request finishes."""
        if node_url in self.node_loads and self.node_loads[node_url] > 0:
            self.node_loads[node_url] -= 1
