# ── FILE: llm_pro/optimization/speculative.py ─────────────────────────────────
"""
Speculative Decoding Engine.
Uses a small draft model to generate K tokens, then verifies them with one forward pass
of the large target model. Drastically speeds up memory-bound generation.
"""

import torch
import torch.nn.functional as F
from loguru import logger
from typing import Tuple
from model import LanguageModel

class SpeculativeDecoder:
    def __init__(self, draft_model: LanguageModel, target_model: LanguageModel):
        self.draft = draft_model
        self.target = target_model
        
        # Ensure both are in eval mode
        self.draft.eval()
        self.target.eval()

    @torch.no_grad()
    def speculative_sample(
        self, 
        input_ids: torch.Tensor, 
        max_new_tokens: int, 
        k: int = 5,
        temperature: float = 1.0
    ) -> Tuple[torch.Tensor, float]:
        """
        Generate using speculative decoding.
        
        Args:
            input_ids: (batch=1, seq_len)
            max_new_tokens: Total tokens to generate
            k: Number of draft tokens to propose per step
            temperature: Sampling temperature
            
        Returns:
            generated_ids: The final sequence
            acceptance_rate: Fraction of drafted tokens accepted
        """
        assert input_ids.size(0) == 1, "Speculative decoding currently supports batch_size=1"
        
        device = input_ids.device
        generated_ids = input_ids.clone()
        
        tokens_generated = 0
        total_drafted = 0
        total_accepted = 0
        
        while tokens_generated < max_new_tokens:
            # 1. Draft phase
            draft_ids = generated_ids.clone()
            draft_probs = []
            
            for _ in range(k):
                # We could use KV cache here for efficiency, omitted for clarity
                logits, _, _ = self.draft(draft_ids)
                next_logits = logits[:, -1, :] / temperature
                probs = F.softmax(next_logits, dim=-1)
                
                next_token = torch.multinomial(probs, num_samples=1)
                draft_probs.append(probs[0, next_token.item()])
                
                draft_ids = torch.cat([draft_ids, next_token], dim=-1)
                
            drafted_tokens = draft_ids[:, -k:]
            
            # 2. Verification phase
            # Score all drafted tokens + the context simultaneously
            target_logits, _, _ = self.target(draft_ids)
            # We care about the logits that predict the drafted tokens, plus one extra
            # Shape of target_logits: (1, seq + k, vocab)
            # We want logits from index seq-1 to seq+k-1
            seq_len = generated_ids.size(1)
            eval_logits = target_logits[:, seq_len-1 : seq_len-1+k, :] / temperature
            eval_probs = F.softmax(eval_logits, dim=-1)
            
            # 3. Acceptance loop
            n_accepted = 0
            for i in range(k):
                token = drafted_tokens[0, i].item()
                p_target = eval_probs[0, i, token]
                p_draft = draft_probs[i]
                
                # Rejection sampling probability
                ratio = (p_target / p_draft).item()
                u = torch.rand(1).item()
                
                if u < min(1.0, ratio):
                    # Accept
                    n_accepted += 1
                else:
                    # Reject and resample from adjusted distribution
                    break
                    
            # 4. Append accepted tokens
            if n_accepted > 0:
                generated_ids = torch.cat([generated_ids, drafted_tokens[:, :n_accepted]], dim=-1)
                tokens_generated += n_accepted
                total_accepted += n_accepted
                
            total_drafted += k
            
            # 5. If rejected, sample the replacement token from target's distribution
            if n_accepted < k and tokens_generated < max_new_tokens:
                # If we accepted n, we look at the target logits at step n
                resample_logits = eval_logits[:, n_accepted, :]
                
                if temperature == 0.0: # fallback
                    next_token = torch.argmax(resample_logits, dim=-1, keepdim=True)
                else:
                    resample_probs = F.softmax(resample_logits, dim=-1)
                    
                    # Adjust distribution: max(0, p_target - p_draft)
                    # For simplicity, if temperature > 0, we just sample from the target directly here
                    # A rigorous implementation subtracts the draft probability mass.
                    next_token = torch.multinomial(resample_probs, num_samples=1)
                    
                generated_ids = torch.cat([generated_ids, next_token], dim=-1)
                tokens_generated += 1
                
        acceptance_rate = total_accepted / total_drafted if total_drafted > 0 else 0.0
        return generated_ids, acceptance_rate
