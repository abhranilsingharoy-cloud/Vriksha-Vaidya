# ── FILE: llm_pro/training/dpo.py ─────────────────────────────────
"""
Direct Preference Optimization (DPO).
A simpler alternative to PPO that doesn't require a reward model.
"""

import torch
import torch.nn.functional as F
from loguru import logger
from model import LanguageModel
from .losses import DPOLoss

class DPOTrainer:
    def __init__(self, policy: LanguageModel, ref_model: LanguageModel, beta: float = 0.1):
        self.policy = policy
        self.ref_model = ref_model
        self.beta = beta
        self.criterion = DPOLoss(beta=beta, ipo=False)
        
        self.ref_model.eval()
        for p in self.ref_model.parameters():
            p.requires_grad = False

    def get_batch_logprobs(
        self, 
        model: LanguageModel, 
        input_ids: torch.Tensor, 
        attention_mask: torch.Tensor, 
        labels: torch.Tensor
    ) -> torch.Tensor:
        """Compute the log probabilities of the given labels."""
        logits, _, _ = model(input_ids)
        
        # Shift so that tokens < n predict n
        shift_logits = logits[..., :-1, :].contiguous()
        shift_labels = labels[..., 1:].contiguous()
        shift_mask = attention_mask[..., 1:].contiguous()
        
        # Flatten
        loss_fct = torch.nn.CrossEntropyLoss(reduction='none')
        logprobs = -loss_fct(
            shift_logits.view(-1, shift_logits.size(-1)), 
            shift_labels.view(-1)
        )
        
        # Reshape and mask
        logprobs = logprobs.view(shift_labels.size())
        logprobs = logprobs * shift_mask
        
        # Sum over sequence length to get total log prob per sequence
        return logprobs.sum(dim=-1)

    def step(self, batch_chosen: dict, batch_rejected: dict, optimizer: torch.optim.Optimizer):
        """Perform a single DPO step."""
        self.policy.train()
        
        # Compute policy logprobs
        policy_chosen_logps = self.get_batch_logprobs(self.policy, **batch_chosen)
        policy_rejected_logps = self.get_batch_logprobs(self.policy, **batch_rejected)
        
        # Compute reference logprobs
        with torch.no_grad():
            ref_chosen_logps = self.get_batch_logprobs(self.ref_model, **batch_chosen)
            ref_rejected_logps = self.get_batch_logprobs(self.ref_model, **batch_rejected)
            
        # Compute loss
        loss = self.criterion(
            policy_chosen_logps, 
            policy_rejected_logps, 
            ref_chosen_logps, 
            ref_rejected_logps
        )
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.policy.parameters(), 1.0)
        optimizer.step()
        
        # Logging metrics implicitly
        chosen_rewards = self.beta * (policy_chosen_logps - ref_chosen_logps).detach()
        rejected_rewards = self.beta * (policy_rejected_logps - ref_rejected_logps).detach()
        reward_margin = (chosen_rewards - rejected_rewards).mean().item()
        
        logger.debug(f"DPO Loss: {loss.item():.4f} | Margin: {reward_margin:.4f}")
        return loss.item()
