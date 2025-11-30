from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_kpi import router as kpi_router

from app.core.db import init_db
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="MetricMind API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(kpi_router, prefix="/kpi", tags=["kpi"])
