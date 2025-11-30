from pydantic import BaseModel
from typing import List, Dict, Any

class VisualizationSpec(BaseModel):
    chart_type: str  # e.g., "bar", "line", "pie"
    title: str
    x_axis: str
    y_axis: str
    aggregation: str = "sum"
    plotly_config: Dict[str, Any]  # Full Plotly layout/data spec
