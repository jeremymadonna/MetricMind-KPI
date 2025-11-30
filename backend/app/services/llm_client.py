import os
import httpx
from typing import List, Dict

class LLMClient:
    """Simple Ollama HTTP client.
    Allows swapping model name and base URL via env variables.
    """
    def __init__(self, model: str = None, base_url: str = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "codellama:13b")
        self.client = httpx.AsyncClient(base_url=self.base_url)

    async def chat(self, messages: List[Dict[str, str]]) -> str:
        payload = {"model": self.model, "messages": messages}
        resp = await self.client.post("/api/chat", json=payload)
        resp.raise_for_status()
        return resp.json()["message"]["content"]
