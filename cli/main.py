import typer
import httpx
import pandas as pd
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown
from typing import Optional
import json
import asyncio

app = typer.Typer(name="metric-cli", help="MetricMind CLI Tool")
console = Console()

API_URL = "http://localhost:8000/kpi/"

async def generate_dashboard(file_path: str, context: str):
    """
    Async function to call the backend API.
    """
    try:
        # Read CSV to get content
        try:
            df = pd.read_csv(file_path)
            csv_content = df.to_csv(index=False)
            console.print(f"[green]Successfully read {file_path} ({len(df)} rows)[/green]")
        except Exception as e:
            console.print(f"[red]Error reading file: {e}[/red]")
            return

        payload = {
            "csv_content": csv_content,
            "context": context
        }

        console.print("[yellow]Sending request to MetricMind Backend...[/yellow]")
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(API_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            
            return data

    except httpx.HTTPStatusError as e:
        console.print(f"[red]API Error: {e.response.status_code} - {e.response.text}[/red]")
    except httpx.RequestError as e:
        console.print(f"[red]Connection Error: {e}[/red]")
    except Exception as e:
        console.print(f"[red]Unexpected Error: {e}[/red]")

@app.command()
def generate(
    file: str = typer.Option(..., "--file", "-f", help="Path to the CSV data file"),
    context: str = typer.Option(..., "--context", "-c", help="Business context for the dashboard")
):
    """
    Generate a KPI dashboard from a CSV file and context.
    """
    console.print(Panel(f"Generating dashboard for [bold]{file}[/bold]\nContext: [italic]{context}[/italic]", title="MetricMind CLI"))

    # Run async function
    data = asyncio.run(generate_dashboard(file, context))

    if data:
        # Display KPIs
        console.print("\n[bold blue]Extracted KPIs:[/bold blue]")
        kpi_table = Table(show_header=True, header_style="bold magenta")
        kpi_table.add_column("Name")
        kpi_table.add_column("Value")
        kpi_table.add_column("Format")
        kpi_table.add_column("Description")

        for kpi in data.get("kpis", []):
            kpi_table.add_row(
                kpi.get("name", "N/A"),
                str(kpi.get("value", "N/A")),
                kpi.get("display_format", "N/A"),
                kpi.get("description", "N/A")
            )
        console.print(kpi_table)

        # Display Visualizations
        console.print("\n[bold blue]Suggested Visualizations:[/bold blue]")
        viz_table = Table(show_header=True, header_style="bold cyan")
        viz_table.add_column("Title")
        viz_table.add_column("Chart Type")
        
        for viz in data.get("visualizations", []):
            viz_table.add_row(
                viz.get("title", "N/A"),
                viz.get("chart_type", "N/A")
            )
        console.print(viz_table)

        # Display Narrative
        console.print("\n[bold blue]Executive Summary:[/bold blue]")
        narrative = data.get("narrative", "No narrative generated.")
        console.print(Markdown(narrative))
        
        console.print("\n[green]Dashboard generated successfully![/green]")

if __name__ == "__main__":
    app()
