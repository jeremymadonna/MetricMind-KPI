from typing import List, Dict, Any
from ..models.viz import VisualizationSpec
import pandas as pd


class VisualizationAgent:
    """
    Heuristic, data-aware visualization mapper.
    Uses sample data to build Plotly configs so charts render without manual tweaks.
    """

    def run(self, kpi_definitions: List[Dict[str, Any]], schema: str, sample_data: List[Dict[str, Any]] | None = None) -> List[VisualizationSpec]:
        df = pd.DataFrame(sample_data or [])
        specs: List[VisualizationSpec] = []

        date_col = None
        if not df.empty:
            # Prefer explicit date/time column
            for col in df.columns:
                if "date" in col.lower() or "time" in col.lower():
                    date_col = col
                    break

        # If we have data, build plots from actual columns
        if not df.empty:
            numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
            if not numeric_cols and not date_col:
                return specs

            # Build one spec per numeric column (up to 6 to avoid overload)
            for col in numeric_cols[:6]:
                chart_type = "line"
                if any(keyword in col.lower() for keyword in ["rate", "ratio", "percent", "%"]):
                    chart_type = "line"
                elif any(keyword in col.lower() for keyword in ["share", "split"]):
                    chart_type = "bar"

                x_values = df[date_col].tolist() if date_col else list(range(len(df)))
                y_values = df[col].tolist()

                specs.append(
                    VisualizationSpec(
                        chart_type=chart_type,
                        title=f"{col.replace('_', ' ').title()} Overview",
                        x_axis=date_col or "index",
                        y_axis=col,
                        plotly_config={
                            "data": [
                                {
                                    "type": chart_type,
                                    "x": x_values,
                                    "y": y_values,
                                    "name": col,
                                    "marker": {"color": "#22d3ee"},
                                }
                            ],
                            "layout": {
                                "title": f"{col.replace('_', ' ').title()}",
                                "xaxis": {"title": date_col or "Index"},
                                "yaxis": {"title": col},
                            },
                        },
                    )
                )

        # If no data or no numeric columns, fall back to KPI-only stubs
        if not specs:
            for kpi in kpi_definitions:
                chart_type = "bar"
                if "trend" in kpi.get("name", "").lower() or "rate" in kpi.get("name", "").lower():
                    chart_type = "line"
                specs.append(
                    VisualizationSpec(
                        chart_type=chart_type,
                        title=f"{kpi.get('name', 'KPI')} Overview",
                        x_axis="index",
                        y_axis=kpi.get("name", "value"),
                        plotly_config={
                            "data": [{"type": chart_type, "x": [], "y": []}],
                            "layout": {"title": kpi.get("name", "KPI")},
                        },
                    )
                )

        return specs
