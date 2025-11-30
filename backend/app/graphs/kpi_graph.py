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
    narrative: str

async def node_extract_kpis(state: GraphState):
    # In a real scenario, we might inject the client or config
    llm_client = LLMClient(model="codellama:13b")
    agent = KPIExtractionAgent(llm_client)
    kpis = await agent.run(state["schema"], state["context"])
    return {"kpis": kpis}

def node_visualize(state: GraphState):
    agent = VisualizationAgent()
    specs = agent.run(state["kpis"], state["schema"])
    return {"visualizations": specs}

async def node_narrate(state: GraphState):
    llm_client = LLMClient(model="llama3:8b")
    agent = NarrativeAgent(llm_client)
    narrative = await agent.run(state["kpis"], state["context"])
    return {"narrative": narrative}

def build_kpi_graph():
    workflow = StateGraph(GraphState)
    
    workflow.add_node("extract_kpis", node_extract_kpis)
    workflow.add_node("visualize", node_visualize)
    workflow.add_node("narrate", node_narrate)
    
    workflow.set_entry_point("extract_kpis")
    workflow.add_edge("extract_kpis", "visualize")
    workflow.add_edge("visualize", "narrate")
    workflow.add_edge("narrate", END)
    
    return workflow.compile()
