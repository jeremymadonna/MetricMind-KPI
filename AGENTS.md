# Repository Guidelines

## Project Structure & Module Organization
- `backend/` FastAPI app (`app/main.py`, `api/routes_kpi.py`, `core/config.py`, `core/db.py`, `services/` agents, `graphs/kpi_graph.py`, `models/` for Pydantic/ORM). Root `Dockerfile`/`requirements.txt` or `pyproject.toml`.
- `frontend/` React + Plotly (`src/api/client.ts`, `components/`, `pages/UploadPage.tsx` & `DashboardPage.tsx`, `store/dashboardSlice.ts`), `vite.config.ts` or Next config, Dockerfile.
- `cli/` Python CLI (e.g., Typer) for `metric-cli generate --file ... --context ...`.
- `docs/` specs like `MetricMind-KPI-Dashboard.md`, architecture diagrams, `.env.example`.
- `tests/` backend unit/integration (`tests/data/` fixtures), frontend tests under `frontend/src/__tests__/`.
- Supporting infra: root `docker-compose.yml` (Postgres + Chroma + backend + frontend), GitHub Actions workflow.

## Build, Test, and Development Commands
- Backend setup: `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
- Run API: `uvicorn app.main:app --reload` (exposes `/kpi`).
- Frontend: `cd frontend && npm install && npm run dev` (`npm run build` for prod).
- Tests: `pytest tests` for agents/API; `cd frontend && npm test` for UI logic.
- Lint/format: `black backend && ruff backend`; `npm run lint && npm run format` for frontend.
- Containers: `docker compose up --build` to start Postgres, Chroma, backend, frontend.

## Coding Style & Naming Conventions
- Python 3.11+, 4-space indent, type hints required; snake_case for functions/modules, PascalCase for classes. Keep side effects under `if __name__ == "__main__":`.
- React/TS: functional components, camelCase for vars/functions, PascalCase for components, kebab-case file names in `src/`; Redux slices per feature.
- Prompts/agents: keep model names explicit (`codellama:13b` for KPI extraction, `llama3:8b` for narrative); design LLM client abstraction for swapping providers (Claude 3.5 Sonnet fallback).

## Agent Workflow & Architecture
- Multi-agent LangGraph: ingestion → KPI extraction → visualization → narrative → persistence (Postgres + Chroma). Validate columns before KPI formulas to avoid hallucinations.
- RAG via Chroma to reuse past dashboard specs; cache session-level schema/decisions.
- Data models: Dataset, KPI, Dashboard, VisualizationSpec, Narrative; ensure Plotly-friendly specs.

## Testing Guidelines
- Backend: place `test_*.py` under `tests/`; mock LLM calls; cover KPI extraction validation, visualization mapping, `/kpi` endpoint flow with sample CSVs.
- Frontend: component tests near components or in `frontend/src/__tests__/`; prefer asserting rendered KPI values over snapshots except for stable UI.
- Add regression tests with fixtures in `tests/data/`; avoid large proprietary datasets.

## Commit & Pull Request Guidelines
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`); <72 char subjects.
- PRs: concise summary, linked issue, test evidence (`pytest`, `npm test`, screenshots for UI), note any data/model config changes. Avoid mixing refactor with feature work.

## Security & Configuration Tips
- Never commit secrets; keep `.env` local and provide `.env.example` for new vars (Ollama host, DB creds, API keys). Validate uploaded CSVs for size/schema, log without leaking data.
- Pin model names in `config.yaml`; design config to swap Ollama/Claude without code changes. Keep Docker/CI minimal and reproducible.
