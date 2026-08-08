"""Pydantic schemas for Investigation API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.investigation import InvestigationStatus, Priority


# ── Investigation ───────────────────────────────────────────────────────────
class InvestigationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: InvestigationStatus = InvestigationStatus.open
    priority: Priority = Priority.medium
    lead_analyst: Optional[str] = None


class InvestigationCreate(InvestigationBase):
    entity_ids: list[str] = Field(default_factory=list)


class InvestigationResponse(InvestigationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Investigation Note ──────────────────────────────────────────────────────
class InvestigationNoteCreate(BaseModel):
    content: str = Field(..., min_length=1)
    author: Optional[str] = "Analyst"


class InvestigationNoteResponse(BaseModel):
    id: str
    investigation_id: str
    content: str
    author: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
