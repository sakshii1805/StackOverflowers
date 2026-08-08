"""Pydantic schemas for Report API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.report import ReportType


class ReportBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    report_type: ReportType
    content: Optional[str] = None
    summary: Optional[str] = None
    investigation_id: Optional[str] = None
    generated_by: Optional[str] = "NARCOSCOPE AI"


class ReportCreate(ReportBase):
    pass


class ReportResponse(ReportBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}
