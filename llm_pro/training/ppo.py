# ── FILE: llm_pro/training/ppo.py ─────────────────────────────────
"""
Proximal Policy Optimization (PPO) for RLHF.
Includes Generalized Advantage Estimation (GAE) and clipping.
"""

import torch
import torch.nn.functional as F
from loguru import logger
from dataclasses import dataclass
from typing import List, Tuple

from model import LanguageModel
from .reward_model import RewardModel
from configs import RLHFConfig

@dataclass
class RolloutBuffer:
    input_ids: torch.Tensor
    attention_mask: torch.Tensor
    logprobs: torch.Tensor
    values: torch.Tensor
    rewards: torch.Tensor
    advantages: torch.Tensor
    returns: torch.Tensor

class PPOTrainer:
    def __init__(
        self,
        actor: LanguageModel,
        critic: RewardModel,
        ref_model: LanguageModel,
        reward_models: List[RewardModel],
        config: RLHFConfig
    ):
        self.actor = actor
        self.critic = critic
        self.ref_model = ref_model
        self.reward_models = reward_models
        self.config = config
        
        # Ensure reference and reward models are frozen
        for m in [self.ref_model] + self.reward_models:
            m.eval()
            for p in m.parameters():
                p.requires_grad = False

    @torch.no_grad()
    def collect_rollouts(self, prompts: torch.Tensor) -> RolloutBuffer:
        """Generate responses and calculate advantages."""
        batch_size = prompts.size(0)
        device = prompts.device
        
        # 1. Generate responses using actor
        self.actor.eval()
        generated_seqs = self.actor.generate(
            prompts, 
            max_new_tokens=256, 
            temperature=0.7, 
            top_p=0.9
        )
        attention_mask = (generated_seqs != 2).long() # Assume 2 is pad/eos
        
        # 2. Get log probs from actor and reference
        actor_logits, _, _ = self.actor(generated_seqs)
        ref_logits, _, _ = self.ref_model(generated_seqs)
        
        # Helper to get log probs for chosen tokens
        def get_logprobs(logits, ids):
            logprobs = F.log_softmax(logits[:, :-1, :], dim=-1)
            return torch.gather(logprobs, 2, ids[:, 1:].unsqueeze(-1)).squeeze(-1)
            
        actor_logprobs = get_logprobs(actor_logits, generated_seqs)
        ref_logprobs = get_logprobs(ref_logits, generated_seqs)
        
        # 3. Get value estimates from critic
        hidden, _, _ = self.critic.lm(generated_seqs)
        values = self.critic.value_head(hidden).squeeze(-1)[:, :-1]
        
        # 4. Get rewards from RM ensemble
        rm_scores = []
        for rm in self.reward_models:
            score = rm(generated_seqs, attention_mask)
            rm_scores.append(score)
        
        # Mean over ensemble
        r = torch.stack(rm_scores).mean(dim=0)
        
        # Normalize rewards
        r = (r - r.mean()) / (r.std() + 1e-8)
        r = torch.clamp(r, -5.0, 5.0)
        
        # 5. Compute KL penalty and modified rewards per token
        # r_adjusted = r - kl_coef * (log_π - log_πref)
        kl_penalty = self.config.kl_coef * (actor_logprobs - ref_logprobs)
        
        # Rewards are only applied at the end of the sequence, KL penalty at every token
        token_rewards = -kl_penalty
        
        # Add actual reward to the last token of each sequence
        seq_lengths = attention_mask.sum(dim=-1) - 1
        for i in range(batch_size):
            end_idx = seq_lengths[i] - 1 # -1 because logprobs are length-1
            if end_idx >= 0 and end_idx < token_rewards.size(1):
                token_rewards[i, end_idx] += r[i]
                
        # 6. Generalized Advantage Estimation (GAE)
        gamma = 1.0
        lam = 0.95
        advantages = torch.zeros_like(token_rewards)
        lastgaelam = 0
        
        # Reverse iterate through sequence
        for t in reversed(range(token_rewards.size(1))):
            nextvalues = values[:, t + 1] if t + 1 < token_rewards.size(1) else 0.0
            delta = token_rewards[:, t] + gamma * nextvalues - values[:, t]
            advantages[:, t] = lastgaelam = delta + gamma * lam * lastgaelam
            
        returns = advantages + values
        
        return RolloutBuffer(
            input_ids=generated_seqs,
            attention_mask=attention_mask,
            logprobs=actor_logprobs,
            values=values,
            rewards=token_rewards,
            advantages=advantages,
            returns=returns
        )

    def ppo_step(self, buffer: RolloutBuffer, optimizer_actor: torch.optim.Optimizer, optimizer_critic: torch.optim.Optimizer):
        """Perform PPO update epochs."""
        self.actor.train()
        self.critic.train()
        
        # Normalize advantages
        adv = buffer.advantages
        adv = (adv - adv.mean()) / (adv.std() + 1e-8)
        
        for _ in range(self.config.ppo_epochs):
            # Recalculate logprobs and values
            actor_logits, _, _ = self.actor(buffer.input_ids)
            
            def get_logprobs(logits, ids):
                logprobs = F.log_softmax(logits[:, :-1, :], dim=-1)
                return torch.gather(logprobs, 2, ids[:, 1:].unsqueeze(-1)).squeeze(-1)
                
            new_logprobs = get_logprobs(actor_logits, buffer.input_ids)
            
            hidden, _, _ = self.critic.lm(buffer.input_ids)
            new_values = self.critic.value_head(hidden).squeeze(-1)[:, :-1]
            
            # Policy Loss
            ratio = torch.exp(new_logprobs - buffer.logprobs)
            pg_losses = -adv * ratio
            pg_losses2 = -adv * torch.clamp(ratio, 1.0 - self.config.clip_range, 1.0 + self.config.clip_range)
            policy_loss = torch.max(pg_losses, pg_losses2).mean()
            
            # Value Loss
            v_loss = 0.5 * F.mse_loss(new_values, buffer.returns)
            
            # Entropy
            entropy = -torch.sum(torch.exp(new_logprobs) * new_logprobs, dim=-1).mean()
            
            # Total loss (actor and critic are separate optimizers typically, but shown together here)
            actor_loss = policy_loss - 0.01 * entropy
            critic_loss = v_loss
            
            optimizer_actor.zero_grad()
            actor_loss.backward()
            torch.nn.utils.clip_grad_norm_(self.actor.parameters(), 1.0)
            optimizer_actor.step()
            
            optimizer_critic.zero_grad()
            critic_loss.backward()
            torch.nn.utils.clip_grad_norm_(self.critic.parameters(), 1.0)
            optimizer_critic.step()
            
        logger.info(f"PPO Step Complete. Policy Loss: {policy_loss.item():.4f}, Value Loss: {v_loss.item():.4f}")
