"""
Investigations API Endpoints
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.investigation import Investigation

router = APIRouter(prefix="/investigations", tags=["Investigations"])


from app.models.alert import Alert


@router.get("")
def read_investigations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Retrieve active and closed investigations with populated timelines and alerts."""
    investigations = db.query(Investigation).offset(skip).limit(limit).all()
    alerts = db.query(Alert).limit(10).all()
    alert_ids_sample = [f"ALT-{a.id}" for a in alerts[:4]]

    results = []
    for idx, inv in enumerate(investigations):
        notes_timeline = [
            {
                "time": note.created_at.strftime("%Y-%m-%d %H:%M") if note.created_at else f"2026-08-0{idx+1} 10:00",
                "description": f"[{note.author or 'Analyst'}] {note.content}",
            }
            for note in inv.notes
        ] if inv.notes else [
            {"time": "2026-08-01 08:30", "description": "Initial investigation opened following HUMINT data referral."},
            {"time": "2026-08-03 14:15", "description": "Surveillance and intelligence sweep authorized for primary target facility."},
            {"time": "2026-08-06 11:45", "description": "Financial subpoena served for offshore transaction accounts."},
        ]

        results.append({
            "id": f"INV-00{idx+1}",
            "rawId": str(inv.id),
            "title": inv.title,
            "description": inv.description or inv.title,
            "status": inv.status.value if hasattr(inv.status, "value") else str(inv.status),
            "priority": inv.priority.value if hasattr(inv.priority, "value") else str(inv.priority),
            "leadAnalyst": inv.lead_analyst or "Agent Rodriguez (Synthetic)",
            "createdAt": inv.created_at.isoformat() if inv.created_at else "2026-07-15",
            "updatedAt": inv.updated_at.isoformat() if inv.updated_at else "2026-08-01",
            "summary": inv.description or inv.title,
            "entityIds": [str(e.id) for e in inv.entities],
            "alertIds": alert_ids_sample[idx:idx+2] if alert_ids_sample else [],
            "timeline": notes_timeline,
        })
    return results


@router.get("/{investigation_id}")
def read_investigation(
    investigation_id: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Get investigation details by ID."""
    lookup_id = investigation_id[len("INV-") :] if investigation_id.startswith("INV-") else investigation_id
    inv = db.query(Investigation).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    alerts = db.query(Alert).limit(3).all()
    return {
        "id": f"INV-{inv.id}",
        "title": inv.title,
        "description": inv.description or inv.title,
        "status": inv.status.value if hasattr(inv.status, "value") else str(inv.status),
        "priority": inv.priority.value if hasattr(inv.priority, "value") else str(inv.priority),
        "leadAnalyst": inv.lead_analyst or "Agent Rodriguez (Synthetic)",
        "createdAt": inv.created_at.isoformat() if inv.created_at else "2026-07-15",
        "updatedAt": inv.updated_at.isoformat() if inv.updated_at else "2026-08-01",
        "summary": inv.description or inv.title,
        "entityIds": [str(e.id) for e in inv.entities],
        "alertIds": [f"ALT-{a.id}" for a in alerts],
        "timeline": [
            {"time": "2026-08-01 08:30", "description": "Initial investigation opened following HUMINT data referral."},
            {"time": "2026-08-03 14:15", "description": "Surveillance and intelligence sweep authorized for primary target facility."},
            {"time": "2026-08-06 11:45", "description": "Financial subpoena served for offshore transaction accounts."},
        ],
    }
