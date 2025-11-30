from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime

class Dashboard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    context: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Store the full JSON response (KPIs, Viz, Narrative)
    data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
