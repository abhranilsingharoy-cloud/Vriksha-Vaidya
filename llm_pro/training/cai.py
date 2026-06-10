# ── FILE: llm_pro/training/cai.py ─────────────────────────────────
"""
Constitutional AI (CAI) critique and revise loop.
Uses an LLM to critique and revise responses to build an alignment dataset.
"""

from loguru import logger
from typing import List, Dict

class ConstitutionalAI:
    def __init__(self, model_interface, principles: List[Dict[str, str]]):
        """
        Args:
            model_interface: An interface to generate text from a model (e.g. an API or local wrapper).
            principles: List of dicts with 'critique_prompt' and 'revision_prompt'.
        """
        self.model = model_interface
        self.principles = principles

    def critique_and_revise(self, prompt: str, initial_response: str) -> str:
        """
        Runs the critique and revision loop based on the constitutional principles.
        """
        current_response = initial_response
        
        for principle in self.principles:
            # 1. Critique
            critique_req = f"User: {prompt}\n\nAssistant: {current_response}\n\n{principle['critique_prompt']}"
            critique = self.model.generate(critique_req)
            
            # 2. Revise
            revise_req = f"{critique_req}\n\nCritique: {critique}\n\n{principle['revision_prompt']}"
            revised_response = self.model.generate(revise_req)
            
            current_response = revised_response
            logger.debug(f"CAI applied principle. New response length: {len(current_response)}")
            
        return current_response

    def build_dataset(self, prompts: List[str]) -> List[Dict[str, str]]:
        """
        Generates a synthetic DPO/RLHF dataset by keeping the final revised response
        as 'chosen' and the initial response as 'rejected'.
        """
        dataset = []
        for prompt in prompts:
            initial = self.model.generate(prompt)
            revised = self.critique_and_revise(prompt, initial)
            
            dataset.append({
                "prompt": prompt,
                "chosen": revised,
                "rejected": initial
            })
            
        return dataset
