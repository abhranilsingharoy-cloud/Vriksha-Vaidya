# ── FILE: llm_pro/model/feedforward.py ─────────────────────────────────
"""
Feedforward network components, including standard SwiGLU and Mixture of Experts (MoE).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple, Optional
from .config import ModelConfig

class SwiGLUFFN(nn.Module):
    """
    SwiGLU Feedforward Network.
    Formula: (SiLU(x * W_gate) * (x * W_up)) * W_down
    """
    def __init__(self, config: ModelConfig):
        super().__init__()
        self.gate_proj = nn.Linear(config.d_model, config.ffn_hidden_dim, bias=False)
        self.up_proj = nn.Linear(config.d_model, config.ffn_hidden_dim, bias=False)
        self.down_proj = nn.Linear(config.ffn_hidden_dim, config.d_model, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Input tensor of shape (..., d_model)
        Returns:
            Output tensor of shape (..., d_model)
        """
        return self.down_proj(F.silu(self.gate_proj(x)) * self.up_proj(x))


class MoELayer(nn.Module):
    """
    Mixture of Experts Layer with Top-K routing, capacity limits, and auxiliary load-balancing loss.
    """
    def __init__(self, config: ModelConfig):
        super().__init__()
        self.config = config
        self.n_experts = config.n_experts
        self.top_k = config.top_k_experts
        
        # Router
        self.router = nn.Linear(config.d_model, self.n_experts, bias=False)
        
        # Experts
        self.experts = nn.ModuleList([SwiGLUFFN(config) for _ in range(self.n_experts)])
        
        # Capacity factor (usually 1.25 for training to allow some load imbalance without dropping too much)
        self.capacity_factor = 1.25

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            x: Input tensor of shape (batch_size, seq_len, d_model)
        Returns:
            output: Output tensor of shape (batch_size, seq_len, d_model)
            moe_loss: Combined aux loss + z-loss scalar tensor
        """
        batch_size, seq_len, d_model = x.shape
        x_flat = x.view(-1, d_model)
        num_tokens = x_flat.shape[0]
        
        # Routing logits
        router_logits = self.router(x_flat) # (num_tokens, n_experts)
        
        # Z-loss: encourages router logits to remain small to prevent overflow in softmax
        # mean(log(sum(exp(router_logits)))^2)
        z_loss = torch.logsumexp(router_logits, dim=-1).pow(2).mean() * self.config.z_loss_coef
        
        # Routing probabilities
        routing_probs = F.softmax(router_logits, dim=-1) # (num_tokens, n_experts)
        
        # Top-K selection
        routing_weights, selected_experts = torch.topk(routing_probs, self.top_k, dim=-1) # (num_tokens, top_k)
        
        # Normalize top-K weights so they sum to 1
        routing_weights = routing_weights / routing_weights.sum(dim=-1, keepdim=True)
        
        # Calculate expert capacity
        capacity = int((num_tokens / self.n_experts) * self.capacity_factor)
        if capacity < 4:
            capacity = 4 # Minimum capacity
            
        # Initialize output
        final_output = torch.zeros_like(x_flat)
        
        # Token assignment to experts
        expert_mask = F.one_hot(selected_experts, num_classes=self.n_experts).float() # (num_tokens, top_k, n_experts)
        
        # Auxiliary load balancing loss calculation
        # f_i: fraction of tokens routed to expert i
        # P_i: average routing probability for expert i
        tokens_per_expert = expert_mask.sum(dim=(0, 1)) # (n_experts,)
        fraction_per_expert = tokens_per_expert / (num_tokens * self.top_k)
        prob_per_expert = routing_probs.mean(dim=0)
        aux_loss = torch.mean(fraction_per_expert * prob_per_expert) * self.n_experts * self.n_experts
        aux_loss = aux_loss * self.config.moe_aux_loss_coef
        
        # Compute expert outputs
        for i, expert in enumerate(self.experts):
            # Find which tokens (and which of their top_k slots) chose this expert
            token_indices, k_indices = torch.where(selected_experts == i)
            
            if len(token_indices) == 0:
                continue
                
            # Handle capacity
            if self.training and len(token_indices) > capacity:
                # Truncate tokens exceeding capacity (dropped tokens)
                token_indices = token_indices[:capacity]
                k_indices = k_indices[:capacity]
                
            # Gather inputs for this expert
            expert_inputs = x_flat[token_indices]
            
            # Forward pass through expert
            expert_outputs = expert(expert_inputs)
            
            # Get weights for these specific assignments
            weights = routing_weights[token_indices, k_indices].unsqueeze(-1)
            
            # Add to final output (index_add_ avoids race conditions in scatter_add_)
            final_output.index_add_(0, token_indices, expert_outputs * weights)
            
        return final_output.view(batch_size, seq_len, d_model), aux_loss + z_loss
