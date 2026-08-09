"""
Reports API Endpoints
"""

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.report import Report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("")
def read_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Retrieve intelligence summary reports."""
    reports = db.query(Report).offset(skip).limit(limit).all()
    return [
        {
            "id": f"REP-{r.id}",
            "title": r.title,
            "type": r.report_type.value if hasattr(r.report_type, "value") else str(r.report_type),
            "status": "completed",
            "createdAt": r.created_at.isoformat() if r.created_at else "2026-08-01",
            "summary": r.content or "Generated intelligence summary report.",
            "entityCount": 12,
            "alertCount": 4,
        }
        for r in reports
    ]
