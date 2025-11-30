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
    # Parse CSV content
    schema_str = "N/A"
    data_summary = "N/A"
    sample_data = []
    
    if req.csv_content:
        try:
            import pandas as pd
            import io
            
            df = pd.read_csv(io.StringIO(req.csv_content))
            
            # Generate schema string
            buffer = io.StringIO()
            df.info(buf=buffer)
            schema_str = buffer.getvalue()
            
            # Generate data summary
            data_summary = df.describe().to_string()
            
            # Get sample data (up to 100 rows for anomaly detection)
            sample_data = df.head(100).to_dict(orient="records")
            
        except Exception as e:
            print(f"Error parsing CSV: {e}")
            schema_str = f"Error parsing CSV: {e}"

    # Initialize graph input state
    initial_state = {
        "context": req.context or "",
        "schema": schema_str,
        "data_summary": data_summary,
        "sample_data": sample_data,
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

