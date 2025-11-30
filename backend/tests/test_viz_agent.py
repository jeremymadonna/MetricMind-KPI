import pytest
from app.services.viz_agent import VisualizationAgent

def test_viz_agent_heuristics():
    agent = VisualizationAgent()
    kpis = [
        {"name": "Total Revenue", "description": "...", "formula": "...", "display_format": "currency"},
        {"name": "Conversion Rate", "description": "...", "formula": "...", "display_format": "percent"}
    ]
    schema = "dummy"
    specs = agent.run(kpis, schema)
    
    assert len(specs) == 2
    # Revenue -> Bar
    assert specs[0].chart_type == "bar"
    assert specs[0].title == "Total Revenue Overview"
    # Rate -> Line
    assert specs[1].chart_type == "line"
    assert specs[1].title == "Conversion Rate Overview"
