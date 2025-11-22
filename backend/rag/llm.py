"""Robust LLM client wrapper for the rag module.

This file provides a small wrapper around ChatOllama (if available).
It exposes a synchronous `chat(prompt)` and an async `a_call(prompt)`.
Both methods fall back to a deterministic mock response when the
external library or runtime call fails, making it safe to import and
use in environments without the model installed.
"""
from __future__ import annotations

import asyncio
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from langchain_ollama import ChatOllama  # type: ignore
else:
    try:
        import importlib

        _mod = importlib.import_module("langchain_ollama")
        ChatOllama = getattr(_mod, "ChatOllama", None)
    except Exception:
        ChatOllama = None


class LLMClient:
    """Simple wrapper for ChatOllama with safe fallbacks.

    Methods:
      - chat(prompt: str) -> str : synchronous wrapper (may call blocking client)
      - a_call(prompt: str) -> str : async wrapper (runs blocking client in thread)
    """

    def __init__(self, model: str = "llama3.1:8b", temperature: float = 0.4):
        self._model = model
        self._temperature = temperature
        self.client: Optional[object] = None
        if ChatOllama is not None:
            try:
                self.client = ChatOllama(model=self._model, temperature=self._temperature)
            except Exception:
                # If ChatOllama cannot be constructed, keep client as None and fall back
                self.client = None

    def chat(self, prompt: str) -> str:
        """Synchronous chat wrapper.

        Tries to use the underlying client; if unavailable or if the call
        raises, returns a deterministic mock response.
        """
        if self.client is not None:
            try:
                # Try common method names in a defensive way.
                if hasattr(self.client, "chat"):
                    resp = self.client.chat(prompt)
                    # some implementations return object with .content
                    return getattr(resp, "content", str(resp))
                if hasattr(self.client, "invoke"):
                    resp = self.client.invoke(prompt)
                    return getattr(resp, "content", str(resp))
                # Last-resort: attempt call as callable
                if callable(self.client):
                    resp = self.client(prompt)
                    return getattr(resp, "content", str(resp))
            except Exception:
                # Fall through to mock
                pass

        # Safe fallback
        return f"[mock sync] LLM response for prompt: {prompt}"

    async def a_call(self, prompt: str) -> str:
        """Async wrapper that runs the blocking client call in a thread.

        If the underlying client is missing or the call fails, returns a
        deterministic mock after a short sleep to mimic async behavior.
        """
        if self.client is not None:
            try:
                # Run blocking client calls in a thread to avoid blocking event loop
                if hasattr(self.client, "chat") or hasattr(self.client, "invoke") or callable(self.client):
                    def _call():
                        if hasattr(self.client, "chat"):
                            r = self.client.chat(prompt)
                            return getattr(r, "content", str(r))
                        if hasattr(self.client, "invoke"):
                            r = self.client.invoke(prompt)
                            return getattr(r, "content", str(r))
                        # callable
                        r = self.client(prompt)
                        return getattr(r, "content", str(r))

                    return await asyncio.to_thread(_call)
            except Exception:
                pass

        # small delay to better emulate a real async call
        await asyncio.sleep(0.02)
        return f"[mock async] LLM response for prompt: {prompt}"


__all__ = ["LLMClient"]