import asyncio
from backend.rag.llm import LLMClient


async def generate_response(query: str) -> str:
    llm_service = LLMClient()
    await asyncio.sleep(1)
    return f"Answer: {query}"

class rag:
    def __init__(self):
        pass

    async def a_call(self, prompt: str) -> str:
        llm_service = LLMClient()
        response = await llm_service.a_call(prompt)
        return response
    
    async def testllm(self, prompt: str) -> str:
        llm_service = LLMClient()
        response = await llm_service.a_call(prompt)
        return response