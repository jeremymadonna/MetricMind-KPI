import pytest
from unittest.mock import AsyncMock, patch
from app.services.narrative_agent import NarrativeAgent
from app.services.llm_client import LLMClient

@pytest.mark.asyncio
async def test_narrative_agent_run():
    mock_llm = AsyncMock(spec=LLMClient)
    mock_llm.chat.return_value = "Executive Summary: Sales are up."
    
    agent = NarrativeAgent(mock_llm)
    kpis = [{"name": "Revenue", "value": 100}]
    result = await agent.run(kpis, "context")
    
    assert result == "Executive Summary: Sales are up."
    mock_llm.chat.assert_called_once()
