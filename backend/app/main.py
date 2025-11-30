from fastapi import FastAPI
from app.api.routes_kpi import router as kpi_router

app = FastAPI(title="MetricMind API")
app.include_router(kpi_router, prefix="/kpi", tags=["kpi"])
