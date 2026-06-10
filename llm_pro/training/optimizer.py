# ── FILE: llm_pro/training/optimizer.py ─────────────────────────────────
"""
Optimizers including standard AdamW and custom implementations if required (like Sophia or Muon).
"""

import torch
from torch.optim import Optimizer
import math
from typing import Iterable, Dict, Any, Tuple

def create_optimizer(model: torch.nn.Module, lr: float, weight_decay: float, beta1: float, beta2: float, eps: float) -> Optimizer:
    """
    Creates an AdamW optimizer, separating parameters that require weight decay
    from those that do not (biases and LayerNorm/RMSNorm weights).
    """
    decay_params = []
    nodecay_params = []
    
    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
            
        # Do not apply weight decay to biases or LayerNorm/RMSNorm weights
        if len(param.shape) == 1 or name.endswith(".bias"):
            nodecay_params.append(param)
        else:
            decay_params.append(param)
            
    optim_groups = [
        {"params": decay_params, "weight_decay": weight_decay},
        {"params": nodecay_params, "weight_decay": 0.0}
    ]
    
    # In a full DeepSpeed setup, we would return FusedAdam here.
    # We return PyTorch's native AdamW for fallback/testing.
    try:
        from deepspeed.ops.adam import FusedAdam
        return FusedAdam(optim_groups, lr=lr, betas=(beta1, beta2), eps=eps)
    except ImportError:
        return torch.optim.AdamW(optim_groups, lr=lr, betas=(beta1, beta2), eps=eps)

# ----------------------------------------------------------------------------
# Example Muon Implementation (Conceptual based on recent research)
# ----------------------------------------------------------------------------
class Muon(Optimizer):
    """
    Muon: Momentum Orthogonalized by Newton-Schulz
    A research-grade optimizer for extreme large-scale LLMs.
    """
    def __init__(self, params: Iterable[torch.Tensor], lr: float = 0.02, momentum: float = 0.95):
        defaults = dict(lr=lr, momentum=momentum)
        super().__init__(params, defaults)

    @torch.no_grad()
    def step(self, closure=None):
        loss = None
        if closure is not None:
            with torch.enable_grad():
                loss = closure()

        for group in self.param_groups:
            lr = group['lr']
            momentum = group['momentum']

            for p in group['params']:
                if p.grad is None:
                    continue
                grad = p.grad
                state = self.state[p]

                # State initialization
                if len(state) == 0:
                    state['momentum_buffer'] = torch.zeros_like(p)

                buf = state['momentum_buffer']
                
                # Update momentum
                buf.mul_(momentum).add_(grad, alpha=1 - momentum)
                
                # Apply Newton-Schulz orthogonalization if 2D
                if len(p.shape) == 2:
                    update = self._newton_schulz(buf)
                else:
                    update = buf
                    
                p.add_(update, alpha=-lr)
                
        return loss

    def _newton_schulz(self, G: torch.Tensor, steps: int = 5) -> torch.Tensor:
        """Approximates the orthogonal factor of a matrix using Newton-Schulz iteration."""
        a, b, c = (3.4445, -4.7750, 2.0315) # Optimized coefficients
        X = G.bfloat16()
        X = X / (X.norm() + 1e-7)
        for _ in range(steps):
            A = X @ X.T
            B = b * A + c * A @ A
            X = a * X + B @ X
        return X.to(G.dtype)
