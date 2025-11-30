import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/metricmind")
    chroma_path: str = os.getenv("CHROMA_PATH", "/tmp/chroma")

settings = Settings()
