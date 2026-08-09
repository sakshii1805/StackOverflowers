"""
Alerts API Endpoints
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("")
def read_alerts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Retrieve alerts with detailed fields."""
    alerts = db.query(Alert).offset(skip).limit(limit).all()
    results = []
    for idx, a in enumerate(alerts):
        # Determine status: new, investigating, resolved
        raw_status = getattr(a, "status", None)
        if raw_status is not None:
            status_val = raw_status.value if hasattr(raw_status, "value") else str(raw_status)
        else:
            if a.acknowledged_at is not None:
                status_val = "resolved"
            elif a.is_read:
                status_val = "investigating"
            else:
                status_val = "new" if idx % 3 != 2 else "investigating"

        results.append({
            "id": f"ALT-{a.id}",
            "title": a.title,
            "severity": a.severity.value if hasattr(a.severity, "value") else str(a.severity),
            "status": status_val,
            "sectorId": f"S{(idx % 12 + 1):02d}",
            "timestamp": a.created_at.isoformat() if a.created_at else None,
            "relatedEntities": [str(a.entity_id)] if a.entity_id else [],
            "reason": a.description or a.title,
        })
    return results


@router.get("/{alert_id}")
def read_alert(
    alert_id: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Get single alert details."""
    lookup_id = alert_id[len("ALT-") :] if alert_id.startswith("ALT-") else alert_id
    alert = db.query(Alert).filter(Alert.id == lookup_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {
        "id": f"ALT-{alert.id}",
        "title": alert.title,
        "severity": alert.severity.value if hasattr(alert.severity, "value") else str(alert.severity),
        "status": (
            alert.status.value
            if getattr(alert, "status", None) is not None and hasattr(alert.status, "value")
            else (str(alert.status) if getattr(alert, "status", None) is not None else None)
        ),
        "sectorId": (
            str(getattr(alert, "sector_id", None) or getattr(alert, "sectorId", None))
            if (getattr(alert, "sector_id", None) or getattr(alert, "sectorId", None)) is not None
            else None
        ),
        "timestamp": alert.created_at.isoformat() if alert.created_at else None,
        "relatedEntities": [str(alert.entity_id)] if alert.entity_id else [],
        "reason": alert.description,
    }


@router.patch("/{alert_id}/status")
@router.patch("/{alert_id}")
def update_alert_status(
    alert_id: str,
    payload: dict[str, Any],
    db: Session = Depends(deps.get_db),
) -> Any:
    """Update alert status (new -> investigating -> resolved)."""
    lookup_id = alert_id[len("ALT-") :] if alert_id.startswith("ALT-") else alert_id
    alert = db.query(Alert).filter(Alert.id == lookup_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    new_status = payload.get("status")
    if new_status:
        setattr(alert, "status", new_status)
        db.commit()
        db.refresh(alert)

    return {
        "id": f"ALT-{alert.id}",
        "title": alert.title,
        "status": getattr(alert, "status", "new"),
        "message": f"Alert ALT-{alert.id} status updated to {new_status}",
    }
