import json
import logging
from typing import List, Dict

from .llm_client import LLMClient

logger = logging.getLogger(__name__)


class KPIExtractionAgent:
    """Agent that extracts KPI definitions from a DataFrame schema using an LLM.
    The `schema` argument is a string representation of column names and types.
    Returns a list of KPI dicts with keys: name, description, formula, display_format.
    """

    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def run(self, schema: str, context: str = "", data_summary: str = "") -> List[Dict]:
        prompt = f"You are a data analyst. Given the following DataFrame schema:\n{schema}\n"
        if data_summary:
            prompt += f"Data Summary (Statistics):\n{data_summary}\n"
        if context:
            prompt += f"Business context: {context}\n"
        prompt += (
            "Return a JSON array of KPI objects with the fields: name, description, "
            "formula (as a Python expression using the column names), value (extract or estimate from summary if possible, else 'N/A'), and display_format. "
            "Only include KPIs that reference existing columns."
        )
        messages = [{"role": "user", "content": prompt}]
        response = await self.llm.chat(messages)

        cleaned_response = response.strip()
        if cleaned_response.startswith("```"):
            cleaned_response = cleaned_response.split("```", 2)[1]
            if cleaned_response.startswith("json"):
                cleaned_response = cleaned_response[4:]
        cleaned_response = cleaned_response.strip()

        try:
            return json.loads(cleaned_response)
        except json.JSONDecodeError:
            logger.error("Failed to parse KPI LLM response as JSON: %s", cleaned_response[:500])
            # Graceful fallback to avoid 500s when the model returns malformed output.
            return []
