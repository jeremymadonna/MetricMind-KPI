from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from ..graphs.kpi_graph import create_kpi_graph
from ..models.viz import VisualizationSpec

router = APIRouter()

class KPIRequest(BaseModel):
    file_url: Optional[str] = None
    csv_content: Optional[str] = None
    context: Optional[str] = None

class KPIResponse(BaseModel):
    status: str
    message: str
    kpis: List[Dict[str, Any]]
    visualizations: List[VisualizationSpec]
    narrative: str

@router.post("/", response_model=KPIResponse)
async def generate_kpi_dashboard(req: KPIRequest):
    # Mock schema for demonstration
    mock_schema = "column1: int, column2: float, revenue: float"
    
    # Initialize graph input state
    initial_state = {
        "context": req.context or "",
        "schema": mock_schema,
        "kpis": [],
        "visualizations": [],
        "narrative": ""
    }
    
    # Run the graph
    app = create_kpi_graph()
    # ainvoke returns the final state
    final_state = await app.ainvoke(initial_state)
    
    return KPIResponse(
        status="completed",
        message="Dashboard generated successfully via LangGraph",
        kpis=final_state["kpis"],
        visualizations=final_state["visualizations"],
        narrative=final_state["narrative"]
    )

