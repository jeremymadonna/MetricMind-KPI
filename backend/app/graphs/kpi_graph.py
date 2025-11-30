from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

from ..services.llm_client import LLMClient
from ..services.kpi_agent import KPIExtractionAgent
from ..services.viz_agent import VisualizationAgent
from ..services.narrative_agent import NarrativeAgent
from ..models.viz import VisualizationSpec

class GraphState(TypedDict):
    context: str
    schema: str
    kpis: List[Dict[str, Any]]
    visualizations: List[VisualizationSpec]
    anomalies: List[str]
    narrative: str
    data_summary: str
    sample_data: List[Dict[str, Any]]

async def node_extract_kpis(state: GraphState):
    # Using qwen2.5-coder:3b for KPI extraction (code generation capabilities)
    llm_client = LLMClient(model="qwen2.5-coder:3b")
    agent = KPIExtractionAgent(llm_client)
    kpis = await agent.run(state["schema"], state["context"], state.get("data_summary", ""))
    return {"kpis": kpis}

def node_visualize(state: GraphState):
    agent = VisualizationAgent()
    specs = agent.run(state["kpis"], state["schema"], state.get("sample_data", []))
    return {"visualizations": specs}

from ..services.anomaly_service import AnomalyService
import pandas as pd
import io

def node_detect_anomalies(state: GraphState):
    # Use sample_data if available
    data = state.get("sample_data", [])
    
    if not data:
        return {"anomalies": ["Anomaly detection skipped (no data provided)"]}
    
    # For this "Advanced Feature", we will try to detect anomalies in the first numerical column found in KPIs
    # or just use the first numerical column in the data.
    
    service = AnomalyService()
    anomalies = []
    
    # Simple logic: Check first numerical column
    if data and isinstance(data[0], dict):
        # Find a numerical key
        num_key = next((k for k, v in data[0].items() if isinstance(v, (int, float))), None)
        if num_key:
            values = [row[num_key] for row in data if isinstance(row.get(num_key), (int, float))]
            outliers = service.detect_outliers(values)
            if any(outliers):
                anomalies.append(f"Found {sum(outliers)} anomalies in column '{num_key}'")
            else:
                anomalies.append(f"No anomalies found in column '{num_key}'")
    
    return {"anomalies": anomalies}

async def node_narrate(state: GraphState):
    # Using llama3.2:3b for narrative generation
    llm_client = LLMClient(model="llama3.2:3b")
    agent = NarrativeAgent(llm_client)
    narrative = await agent.run(state["kpis"], state["context"], state.get("anomalies"))
    return {"narrative": narrative}

from app.core.db import engine, init_db
from app.models.dashboard import Dashboard
from app.services.rag_service import RAGService
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic.json import pydantic_encoder
import json

async def node_persist(state: GraphState):
    # 1. Save to Database (Postgres/SQLite)
    # We need to create a session manually here since we are outside the request context
    # In a real app, we might pass the session in the state, but for now:
    async with AsyncSession(engine) as session:
        safe_visualizations = json.loads(json.dumps(state["visualizations"], default=pydantic_encoder))
        dashboard = Dashboard(
            context=state["context"],
            data={
                "kpis": state["kpis"],
                "visualizations": safe_visualizations,
                "narrative": state["narrative"],
            },
        )
        session.add(dashboard)
        await session.commit()
        await session.refresh(dashboard)
        dashboard_id = dashboard.id

    # 2. Save to RAG (Chroma)
    rag = RAGService()
    rag.add_dashboard(
        dashboard_id=str(dashboard_id),
        context=state["context"],
        kpis=state["kpis"],
        visualizations=state["visualizations"]
    )
    
    return {"dashboard_id": dashboard_id}

def create_kpi_graph():
    workflow = StateGraph(GraphState)
    
    workflow.add_node("extract_kpis", node_extract_kpis)
    workflow.add_node("visualize", node_visualize)
    workflow.add_node("detect_anomalies", node_detect_anomalies)
    workflow.add_node("narrate", node_narrate)
    workflow.add_node("persist", node_persist)
    
    workflow.set_entry_point("extract_kpis")
    workflow.add_edge("extract_kpis", "visualize")
    workflow.add_edge("visualize", "detect_anomalies")
    workflow.add_edge("detect_anomalies", "narrate")
    workflow.add_edge("narrate", "persist")
    workflow.add_edge("persist", END)
    
    return workflow.compile()
