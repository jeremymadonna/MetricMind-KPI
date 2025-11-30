import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.main import app

client = TestClient(app)

# Mock LLM response for KPI extraction
MOCK_KPI_JSON = '[{"name": "Revenue", "description": "Total revenue", "formula": "df[\'revenue\'].sum()", "display_format": "currency"}]'

@pytest.fixture
def mock_llm_chat():
    with patch('app.services.llm_client.LLMClient.chat', new=AsyncMock(return_value=MOCK_KPI_JSON)):
        yield

def test_kpi_endpoint_success(mock_llm_chat):
    response = client.post("/kpi/", json={"context": "ecommerce sales"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["message"] == "Dashboard generated successfully via LangGraph"
