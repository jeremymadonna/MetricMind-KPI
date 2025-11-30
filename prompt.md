You are a senior full-stack + AI engineer helping me build an open-source project called **MetricMind**.

---

## 1. Context & Goal

We’re building **MetricMind – an AI-Powered KPI Dashboard Builder for Business Analytics**.

High-level objective:  
Automatically transform raw business data (e.g., CSVs) into interactive KPI dashboards, including:

- KPI extraction and definition
- Chart selection and visualization
- AI-generated executive narratives
- Reuse of previous dashboards via RAG

Target users: business analysts & data engineers who want executive-ready KPI dashboards in minutes.

---

## 2. Tech Stack (Hard Requirements)

**Runtime / Infra**

- Backend: **FastAPI** with a `/kpi` endpoint (Python).
- Frontend: **React** + **Plotly.js** for charts.
- State management: **Redux** (or Redux Toolkit).
- Databases:
  - **PostgreSQL** for KPI & dashboard metadata.
  - **Chroma** for vector search over past dashboards (RAG).
- AI:
  - Local LLMs via **Ollama (ollama.linux-box)**:
    - `codellama:13b` → data wrangling / KPI extraction / code-like reasoning.
    - `llama3:8b` → narrative / explanation.
  - Optional fallback: **Claude 3.5 Sonnet** (design the interfaces so swapping models is easy).
- AI / orchestration:
  - **LangChain**
  - **LangGraph** (for multi-agent orchestration).
  - **scikit-learn** for basic anomaly detection in KPI time series.
- DevOps:
  - **Docker** for backend + frontend.
  - **GitHub Actions** for CI (tests + Docker build).
  - **AWS S3** (or compatible) for serving frontend static assets.
- Developer tooling:
  - A **VS Code extension** that helps users define KPI specs quickly (later phase).

Use Python 3.11+ where relevant.

---

## 3. Core AI Concepts & Workflow

Design the system around a **multi-agent pipeline**, orchestrated via LangGraph:

1. **Ingestion Agent**
   - Input: CSV file path / URL or uploaded file.
   - Load as Pandas DataFrame, perform basic type inference and profiling (column types, null counts, ranges).

2. **KPI Extraction Agent** (codellama:13b)
   - Prompted with DataFrame schema (column names + inferred types) + short business context.
   - Outputs:
     - Top N KPIs (e.g., Revenue, Conversion Rate, Avg Order Value).
     - KPI definitions (natural language).
     - KPI formulas referencing column names, in a structured JSON format (for evaluation in Python).
   - Must be careful about hallucinating non-existent columns → require validation.

3. **Visualization Agent**
   - Select appropriate chart types based on:
     - Data types (time series vs categorical vs numerical).
     - Number of KPIs.
     - Business context (e.g., “executive overview”).
   - Outputs a JSON spec per KPI:
     - Chart type (line, bar, pie, gauge, etc.).
     - Axes mappings.
     - Aggregations (sum, avg, count, etc.).
   - These specs should map cleanly to Plotly.js configs on the frontend.

4. **Narrative Agent** (llama3:8b)
   - Given KPI values, trends, anomalies, and chosen visualizations:
     - Generate an executive-style narrative (1–3 paragraphs).
     - Optional bullet-point “Key Takeaways” and “Recommended Actions”.
   - Use consistent, business-friendly tone (no emojis, no overly casual language).

5. **RAG Component (Chroma)**
   - Store embeddings of past dashboard specs (KPI + visualization decisions + narratives).
   - For a new dataset, retrieve similar past dashboards to:
     - Suggest KPI templates.
     - Suggest chart layouts.
     - Improve consistency across dashboards.

6. **Memory / Session**
   - Cache KPI schema & decisions per session so repeated calls are efficient.
   - Design clear data models for:
     - Dataset
     - KPI
     - Dashboard
     - Visualization spec
     - Narrative

---

## 4. Implementation Tasks (Backend-First)

We will work iteratively. For each phase, you should:

1. Propose file structure.
2. Write concrete code (no pseudo-code).
3. Explain briefly how to run and test.

### 4.1 Environment Setup

Use this as the baseline:

```bash
pip install fastapi uvicorn pandas plotly langchain langgraph ollama chromadb psycopg2-binary scikit-learn pydantic python-dotenv
ollama pull codellama:13b
ollama pull llama3:8b
Also include any additional required dependencies (but keep them minimal and justify them).

4.2 Backend Skeleton (FastAPI)
Create a metricmind/backend structure, e.g.:

arduino
Copy code
backend/
  app/
    main.py
    api/
      routes_kpi.py
    core/
      config.py
      db.py        # PostgreSQL + Chroma init
    models/
      kpi.py
      dashboard.py
    services/
      ingestion.py
      kpi_agent.py
      viz_agent.py
      narrative_agent.py
      rag_service.py
    graphs/
      kpi_graph.py
  tests/
    test_kpi_flow.py
  pyproject.toml or requirements.txt
  Dockerfile
Initial FastAPI example:

python
Copy code
# app/main.py
from fastapi import FastAPI
from app.api.routes_kpi import router as kpi_router

app = FastAPI(title="MetricMind API")

app.include_router(kpi_router, prefix="/kpi", tags=["kpi"])
Route:

python
Copy code
# app/api/routes_kpi.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class KPIRequest(BaseModel):
    file_url: str | None = None
    csv_content: str | None = None   # optional inline CSV
    context: str | None = None       # e.g., "e-commerce sales dashboard"

@router.post("/")
async def generate_kpi_dashboard(req: KPIRequest):
    # Placeholder: later wire into LangGraph pipeline
    return {"status": "queued", "message": "KPI pipeline not implemented yet"}
Expand this to a full pipeline as we progress.

4.3 Ollama Client Abstraction
Define a small abstraction so swapping models / providers is easy:

python
Copy code
# app/services/llm_client.py
class LLMClient:
    def __init__(self, base_url: str, model: str):
        ...

    def chat(self, messages: list[dict]) -> str:
        ...
Provide implementations for:

codellama:13b (KPI extraction / wrangling).

llama3:8b (narratives).

Fallback hooks for Claude 3.5 Sonnet (just define interfaces; no keys in code).

4.4 KPI Extraction Agent
Implement something like:

python
Copy code
# app/services/kpi_agent.py
class KPIExtractionAgent:
    def __init__(self, llm_client: LLMClient):
        ...

    def run(self, df) -> list[dict]:
        """
        Returns a list of KPI definitions like:
        [
          {
            "name": "Total Revenue",
            "description": "...",
            "formula": "df['revenue'].sum()",
            "display_format": "currency"
          },
          ...
        ]
        """
        ...
Design prompts that:

Only use existing columns.

Output strict JSON, with clear validation.

4.5 Visualization Agent
Implement a service that:

Takes KPI definitions + DF schema.

Chooses chart types and Plotly-friendly specs.

Encodes them in serializable Python/Pydantic models.

4.6 Narrative Agent
Implement the narrative generator:

Input: KPI values, anomalies (from scikit-learn), chart types.

Output: executive summary + bullet points.

Ensure the narrative references KPI names accurately.

4.7 LangGraph Orchestration
Create a LangGraph pipeline (in app/graphs/kpi_graph.py) that:

Nodes: ingestion → KPI extraction → visualization → narrative → persistence (Postgres + Chroma).

Edges: clearly defined passing of structured data models.

Expose a simple function run_kpi_pipeline(request: KPIRequest) -> DashboardResponse.

4.8 Data Models & Persistence
Design Pydantic models & SQLAlchemy (or similar) schemas:

Dataset

KPI

Dashboard

VisualizationSpec

Narrative

Persist:

Dashboard metadata in PostgreSQL.

Vector embeddings (e.g., of serialized dashboard spec) in Chroma.

5. Frontend (React + Plotly)
Create a metricmind/frontend structure, e.g.:

lua
Copy code
frontend/
  src/
    api/
      client.ts
    components/
      DashboardView.tsx
      ChartGrid.tsx
      KpiCards.tsx
    pages/
      UploadPage.tsx
      DashboardPage.tsx
    store/
      index.ts
      dashboardSlice.ts
  package.json
  vite.config.ts or next.config.js
  Dockerfile
Frontend requirements:

Page to upload CSV / paste URL, add short context, call /kpi.

Show:

KPI cards (name, value, change vs previous period if available).

Plotly charts in a responsive grid layout.

Narrative panel with executive summary + key takeaways.

Redux slice to manage loading state, current dashboard, errors.

6. CLI Tool (metric-cli)
Design a simple Python CLI (e.g., with typer) under metricmind/cli:

Command: metric-cli generate --file data/sales.csv --context "ecommerce dashboard"

Behavior:

Calls FastAPI backend.

Prints dashboard ID + basic text summary.

Optional: open the dashboard URL in browser.

7. DevOps & Project Layout
Target repo layout:

powershell
Copy code
metricmind/
├─ backend/
├─ frontend/
├─ cli/
├─ docs/
├─ tests/
├─ Dockerfile           # root-level docker-compose or multi-service setup
└─ README.md
Add:

Dockerfiles for backend and frontend.

A simple docker-compose.yml for local dev (Postgres + Chroma + backend + frontend).

GitHub Actions workflow:

Run backend tests (pytest).

Run frontend tests or lint.

Build Docker images.

Basic architecture diagram in docs/ (you can provide Mermaid code).

8. Testing Strategy
Unit tests:

Each agent (KPI, visualization, narrative) with small synthetic dataframes.

Integration test:

End-to-end: CSV → /kpi → Dashboard response → validate shapes.

Make tests deterministic by mocking LLM calls where necessary.

9. Non-Functional & Design Constraints
Avoid over-engineering; prefer clear, readable code.

Keep external dependencies minimal and standard.

Do not hardcode secrets.

Assume local development environment (Linux box with Ollama running).

Write docstrings and short in-file comments for critical flows.

Maintain clear separation of concerns: API layer vs services vs LangGraph graph.

10. How I Want You To Work
When responding:

Phase your work.

Phase 1: Project structure + backend skeleton.

Phase 2: LLM client + KPI agent.

Phase 3: Visualization + narrative agents.

Phase 4: LangGraph orchestration.

Phase 5: Frontend React implementation.

Phase 6: CLI + Docker + CI.

In each phase:

Show the updated file/folder structure (only relevant parts).

Provide concrete code snippets for key files.

Explain briefly how to run/test that phase.

Use the stack and patterns described above; don’t swap major technologies.

When something is ambiguous, make a reasonable assumption and document it in comments.

First task:
Start with Phase 1 – propose the full repository structure and implement the minimal FastAPI backend skeleton with a /kpi POST endpoint plus basic request/response models. Then explain how to run the backend locally.