from typing import List, Dict
from ..models.viz import VisualizationSpec

class VisualizationAgent:
    """
    Heuristic-based agent to select charts.
    (Later can be enhanced with LLM if needed, but heuristics are faster/reliable for basic charts).
    """
    def run(self, kpi_definitions: List[Dict], schema: str) -> List[VisualizationSpec]:
        specs = []
        for kpi in kpi_definitions:
            # Simple heuristic: if 'revenue' or 'sales' in name, use Bar chart
            chart_type = "bar"
            if "trend" in kpi["name"].lower() or "rate" in kpi["name"].lower():
                chart_type = "line"
            
            spec = VisualizationSpec(
                chart_type=chart_type,
                title=f"{kpi['name']} Overview",
                x_axis="date", # Assumption for now
                y_axis=kpi["name"],
                plotly_config={
                    "data": [{"type": chart_type, "x": [], "y": []}],
                    "layout": {"title": kpi["name"]}
                }
            )
            specs.append(spec)
        return specs
