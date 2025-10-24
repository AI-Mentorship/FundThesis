"""RAG (Retrieval-Augmented Generation) implementation.

This module provides the main RAG functionality, including the base rag class
and helper functions for generating responses using the LLM client.
"""
from __future__ import annotations

import asyncio
from typing import Optional

try:
    from .llm import LLMClient
except ImportError:
    # Fallback to absolute import if relative fails
    from backend.rag.llm import LLMClient


class RAG:
    """Main RAG implementation class."""
    
    def __init__(self):
        """Initialize RAG with an LLM client instance."""
        self._llm: Optional[LLMClient] = None
    
    @property
    def llm(self) -> LLMClient:
        """Lazy initialization of LLM client."""
        if self._llm is None:
            self._llm = LLMClient()
        return self._llm

    async def a_call(self, prompt: str) -> str:
        """Async call to generate a response for the given prompt."""
        return await self.llm.a_call(prompt)
    
    async def testllm(self, prompt: str) -> str:
        """Test method to verify LLM functionality."""
        return await self.llm.a_call(prompt)


async def generate_response(query: str) -> str:
    """Generate a response for the given query using the LLM.
    
    This is a standalone function that creates its own LLM client.
    For multiple calls, prefer instantiating a RAG class instead.
    """
    client = LLMClient()
    response = await client.a_call(query)
    return f"Answer: {response}"


# Add proper exports
__all__ = ['RAG', 'generate_response']


# Simple test function
async def _test():
    """Test the RAG functionality."""
    r = RAG()
    test_prompt = "Hello, this is a test."
    response = await r.testllm(test_prompt)
    print(f"Test response: {response}")
    return response


# Allow running this file directly for testing
if __name__ == "__main__":
    asyncio.run(_test())