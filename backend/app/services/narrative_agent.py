from .llm_client import LLMClient

class NarrativeAgent:
    """
    Generates a text summary using Llama 3.
    """
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def run(self, kpis: list, context: str) -> str:
        prompt = (
            f"Context: {context}\n"
            f"KPI Data: {kpis}\n"
            "Write a concise executive summary (1 paragraph) analyzing these KPIs."
        )
        messages = [{"role": "user", "content": prompt}]
        # Use a different model if needed, e.g. self.llm.model = "llama3:8b"
        # For now assuming the client handles model switching or we instantiate a new client.
        return await self.llm.chat(messages)
