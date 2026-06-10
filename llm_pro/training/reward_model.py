# ── FILE: llm_pro/training/reward_model.py ─────────────────────────────────
"""
Reward model architecture and training loop for RLHF.
Replaces the LM head with a scalar value head.
"""

import torch
import torch.nn as nn
from model import LanguageModel, ModelConfig

class RewardModel(nn.Module):
    """
    Reward model that outputs a scalar value for a sequence.
    """
    def __init__(self, config: ModelConfig):
        super().__init__()
        # Use the underlying LM, but we don't need the lm_head
        self.lm = LanguageModel(config)
        self.lm.output = nn.Identity() # Remove LM head
        
        # Add scalar value head
        self.value_head = nn.Linear(config.d_model, 1, bias=False)

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """
        Returns scalar rewards for the given sequences.
        Typically, we take the value at the EOS token.
        """
        # Get hidden states from LM (logits returned by LM are now just the hidden states)
        hidden_states, _, _ = self.lm(input_ids)
        
        # Pass through value head
        values = self.value_head(hidden_states).squeeze(-1) # (batch, seq_len)
        
        # Extract the value at the last valid token (EOS)
        batch_size = input_ids.size(0)
        sequence_lengths = attention_mask.sum(dim=-1) - 1
        
        rewards = values[torch.arange(batch_size, device=values.device), sequence_lengths]
        return rewards

def compute_reward_loss(rewards_chosen: torch.Tensor, rewards_rejected: torch.Tensor) -> torch.Tensor:
    """
    Standard Bradley-Terry reward modeling loss.
    -log(sigmoid(reward_chosen - reward_rejected))
    """
    return -torch.nn.functional.logsigmoid(rewards_chosen - rewards_rejected).mean()
