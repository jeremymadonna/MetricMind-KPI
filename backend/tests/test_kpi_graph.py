import pytest
from unittest.mock import AsyncMock, patch
from app.graphs.kpi_graph import build_kpi_graph

@pytest.mark.asyncio
async def test_kpi_graph_execution():
    # Mock LLM clients used within nodes
    with patch('app.services.llm_client.LLMClient.chat', new=AsyncMock()) as mock_chat:
        # Mock KPI extraction response
        mock_chat.side_effect = [
            '[{"name": "Revenue", "description": "Total revenue", "formula": "df[\'revenue\'].sum()", "display_format": "currency"}]',
            "Executive Summary: Revenue is good."
        ]
        
        app = build_kpi_graph()
        initial_state = {
            "context": "test context",
            "schema": "dummy schema",
            "kpis": [],
            "visualizations": [],
            "narrative": ""
        }
        
        final_state = await app.ainvoke(initial_state)
        
        assert len(final_state["kpis"]) == 1
        assert final_state["kpis"][0]["name"] == "Revenue"
        assert len(final_state["visualizations"]) == 1
        assert final_state["narrative"] == "Executive Summary: Revenue is good."
