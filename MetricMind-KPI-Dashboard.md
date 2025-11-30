# MetricMind: KPI Dashboard Generator with AI Insights

## 1. PROJECT TITLE
**MetricMind** – AI‑Powered KPI Dashboard Builder for Business Analytics

## 2. OBJECTIVE
Automatically transforms raw business data into interactive KPI dashboards, generating visualizations and AI‑driven insights. Enables analysts to deliver executive‑ready reports in minutes.

## 3. TECH STACK
- **LLM Configuration:** Ollama (`ollama.linux-box`) – `codellama:13b` (data wrangling), `llama3:8b` (insight narration). Optional fallback: Claude 3.5 Sonnet.
- **Frameworks:** LangChain, LangGraph, Plotly, FastAPI, React, Redux.
- **Backend:** FastAPI exposing `/kpi` endpoint.
- **Frontend:** React + Plotly.js for dynamic charts.
- **Databases:** PostgreSQL (store KPI definitions), Chroma (vector store for past dashboards).
- **AI/ML:** Ollama SDK, scikit‑learn for anomaly detection.
- **DevOps:** Docker, GitHub Actions, AWS S3 for static assets.
- **Developer Tools:** VS Code extension for quick KPI spec creation.

## 4. CORE AI CONCEPTS
- Multi‑agent pipeline: *Ingestion → KPI Extraction → Visualization → Narrative.
- RAG: Retrieve similar past KPI dashboards from Chroma to suggest best visualizations.
- Prompt engineering for consistent business language.
- Autonomous decision‑making to select chart types based on data distribution.
- Memory: Cache KPI schema per session.

## 5. IMPLEMENTATION STEPS
1. **Setup Environment & Ollama**
```bash
pip install fastapi uvicorn pandas plotly langchain langgraph ollama chromadb
ollama pull codellama:13b
ollama pull llama3:8b
```
2. **FastAPI Skeleton**
```python
# main.py
from fastapi import FastAPI
app = FastAPI()
@app.post("/kpi")
async def generate(req: dict):
    return {"status":"queued"}
```
3. **KPI Extraction Agent** – uses LLM to infer key metrics from column names.
4. **Visualization Agent** – auto‑selects bar, line, gauge charts via Plotly.
5. **Narrative Agent** – writes executive summary.
6. **LangGraph Orchestration** – chain agents.
7. **React Dashboard** – fetches JSON report, renders Plotly components.
8. **Dockerize** – `Dockerfile` exposing FastAPI.
9. **CLI (`metric-cli`)** – submit CSV and receive dashboard ID.
10. **Testing** – pytest for each agent, integration test with sample sales data.
11. **CI/CD** – GitHub Actions run tests and build Docker image.
12. **Documentation** – README, CONTRIBUTING, architecture diagram.

## 6. PRACTICAL CODE EXAMPLES
```yaml
ollama:
  base_url: http://ollama.linux-box
  models:
    code: codellama:13b
    narrative: llama3:8b
```
```python
# kpi_agent.py
class KPIExtractionAgent:
    def run(self, df):
        # Prompt LLM to list top 5 KPIs
        prompt = f"Given this dataframe columns: {list(df.columns)}, suggest 5 business‑relevant KPIs."
        resp = ollama.Client(host='http://ollama.linux-box').chat(model='codellama:13b', messages=[{'role':'user','content':prompt}])
        return resp['message']['content']
```
```bash
curl -X POST http://localhost:8000/kpi -H "Content-Type: application/json" -d '{"file_url":"data/sales.csv"}'
```

## 7. REFERENCES
1. FastAPI – https://fastapi.tiangolo.com/
2. LangChain RAG – https://python.langchain.com/docs/use_cases/retrieval_qa
3. Plotly – https://plotly.com/python/
4. Business KPI Design – https://www.tableau.com/learn/articles/kpi
5. Ollama SDK – https://github.com/ollama/ollama-python

## 8. CHALLENGES
- Defining universally useful KPIs across domains.
- Model hallucination on metric definitions – validate against schema.
- Large CSV handling – stream processing.
- Visualization performance for many charts.
- Maintaining open‑source contribution flow.

## 9. IMPACT 2026
Demonstrates ability to blend AI, FastAPI, and business analytics – a high‑value skill for data‑driven enterprises.

## 10. OPEN SOURCE POSITIONING
Target: Business analysts, data engineers.
Repo layout:
```
metricmind/
├─ backend/
├─ frontend/
├─ cli/
├─ docs/
├─ tests/
├─ Dockerfile
└─ README.md
```
Encourage contributions of new KPI templates.

## 11. LOCAL OLLAMA SETUP GUIDE
```bash
ollama pull codellama:13b
ollama pull llama3:8b
```
Use `config.yaml` to switch to Claude if needed.
