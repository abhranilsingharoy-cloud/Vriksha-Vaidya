# ── FILE: llm_pro/model/generation.py ─────────────────────────────────
"""
Generation mixin providing auto-regressive decoding strategies (Greedy, Top-P, Top-K).
"""

import torch
import torch.nn.functional as F
from typing import List

class GenerationMixin:
    """
    Provides generation capabilities to the LanguageModel.
    Must be mixed into a class that implements `forward(input_ids, use_cache, kv_caches)`.
    """
    
    @torch.no_grad()
    def generate(
        self,
        input_ids: torch.Tensor,
        max_new_tokens: int,
        temperature: float = 1.0,
        top_p: float = 0.9,
        top_k: int = 50,
        repetition_penalty: float = 1.0,
        eos_token_id: int = 2
    ) -> torch.Tensor:
        """
        Generate tokens auto-regressively.
        
        Args:
            input_ids: (batch_size, seq_len)
            max_new_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0.0 = greedy)
            top_p: Nucleus sampling probability
            top_k: Top-K sampling
            repetition_penalty: Penalty for repeating tokens
            eos_token_id: End of sequence token
            
        Returns:
            Output sequence tensor (batch_size, seq_len + max_new_tokens)
        """
        batch_size = input_ids.shape[0]
        device = input_ids.device
        
        # Keep track of generated ids
        generated_ids = input_ids.clone()
        kv_caches = None
        
        # Track which sequences have hit EOS
        unfinished_sequences = torch.ones(batch_size, dtype=torch.bool, device=device)
        
        for _ in range(max_new_tokens):
            # Pass only the last generated token if using cache, else pass all
            curr_input = generated_ids[:, -1:] if kv_caches is not None else generated_ids
            
            # Forward pass
            logits, _, kv_caches = self.forward(
                curr_input,
                use_cache=True,
                kv_caches=kv_caches
            )
            
            # Get logits for the last generated token
            next_token_logits = logits[:, -1, :]
            
            # Apply repetition penalty
            if repetition_penalty != 1.0:
                for i in range(batch_size):
                    for token in set(generated_ids[i].tolist()):
                        if next_token_logits[i, token] < 0:
                            next_token_logits[i, token] *= repetition_penalty
                        else:
                            next_token_logits[i, token] /= repetition_penalty
            
            # Sampling logic
            if temperature == 0.0:
                # Greedy
                next_tokens = torch.argmax(next_token_logits, dim=-1)
            else:
                # Temperature scaling
                next_token_logits = next_token_logits / temperature
                
                # Top-K
                if top_k > 0:
                    indices_to_remove = next_token_logits < torch.topk(next_token_logits, top_k)[0][..., -1, None]
                    next_token_logits[indices_to_remove] = -float('Inf')
                
                # Top-P (Nucleus)
                if top_p < 1.0:
                    sorted_logits, sorted_indices = torch.sort(next_token_logits, descending=True)
                    cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                    
                    # Remove tokens with cumulative probability above the threshold
                    sorted_indices_to_remove = cumulative_probs > top_p
                    
                    # Shift to keep the first token above the threshold
                    sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                    sorted_indices_to_remove[..., 0] = 0
                    
                    # Scatter back
                    indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
                    next_token_logits[indices_to_remove] = -float('Inf')
                
                # Sample
                probs = F.softmax(next_token_logits, dim=-1)
                next_tokens = torch.multinomial(probs, num_samples=1).squeeze(-1)
            
            # Update unfinished sequences
            next_tokens = next_tokens * unfinished_sequences + eos_token_id * (~unfinished_sequences)
            unfinished_sequences = unfinished_sequences & (next_tokens != eos_token_id)
            
            # Append generated tokens
            generated_ids = torch.cat([generated_ids, next_tokens.unsqueeze(-1)], dim=-1)
            
            # Early stopping
            if not unfinished_sequences.any():
                break
                
        return generated_ids
