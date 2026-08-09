"""
Dashboard summary endpoint.
Aggregates key metrics from all tables into a single API response
for the frontend Dashboard page.
"""

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.entity import Entity, EntityType
from app.models.relationship import Relationship
from app.models.event import Event
from app.models.alert import Alert
from app.models.investigation import Investigation, InvestigationStatus
from app.models.report import Report
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def read_dashboard_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Returns a comprehensive dashboard summary with stats, distributions,
    recent activity, and top-risk entities in a single API call.
    """

    # ── Core Counts ─────────────────────────────────────────────────────
    total_entities = db.query(Entity).count()
    total_relationships = db.query(Relationship).count()
    total_events = db.query(Event).count()
    total_alerts = db.query(Alert).count()
    unread_alerts = db.query(Alert).filter(Alert.is_read == False).count()
    active_investigations = db.query(Investigation).filter(
        Investigation.status.in_([InvestigationStatus.open, InvestigationStatus.in_progress])
    ).count()
    total_reports = db.query(Report).count()
    high_risk_entities = db.query(Entity).filter(Entity.risk_score >= 70).count()

    # ── Risk Distribution ───────────────────────────────────────────────
    critical = db.query(Entity).filter(Entity.risk_score >= 85).count()
    high = db.query(Entity).filter(Entity.risk_score >= 60, Entity.risk_score < 85).count()
    medium = db.query(Entity).filter(Entity.risk_score >= 30, Entity.risk_score < 60).count()
    low = db.query(Entity).filter(Entity.risk_score < 30).count()

    # ── Entity Type Breakdown ───────────────────────────────────────────
    type_rows = (
        db.query(Entity.entity_type, func.count(Entity.id))
        .group_by(Entity.entity_type)
        .all()
    )
    entity_type_breakdown = {row[0].value: row[1] for row in type_rows}

    # ── Recent Events (top 5) ───────────────────────────────────────────
    recent_events_q = (
        db.query(Event)
        .order_by(Event.occurred_at.desc())
        .limit(5)
        .all()
    )
    recent_events = [
        {
            "id": e.id,
            "title": e.title,
            "event_type": e.event_type.value,
            "severity": e.severity.value,
            "location_name": e.location_name,
            "occurred_at": e.occurred_at.isoformat() if e.occurred_at else None,
        }
        for e in recent_events_q
    ]

    # ── Recent Alerts (top 5) ───────────────────────────────────────────
    recent_alerts_q = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .limit(5)
        .all()
    )
    recent_alerts = [
        {
            "id": a.id,
            "title": a.title,
            "alert_type": a.alert_type.value,
            "severity": a.severity.value,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in recent_alerts_q
    ]

    # ── Top Entities by Risk Score (top 5) ──────────────────────────────
    top_entities_q = (
        db.query(Entity)
        .order_by(Entity.risk_score.desc())
        .limit(5)
        .all()
    )
    top_entities = [
        {
            "id": e.id,
            "name": e.name,
            "entity_type": e.entity_type.value,
            "risk_score": e.risk_score,
            "status": e.status.value,
        }
        for e in top_entities_q
    ]

    return {
        "stats": {
            "total_entities": total_entities,
            "total_relationships": total_relationships,
            "total_events": total_events,
            "total_alerts": total_alerts,
            "unread_alerts": unread_alerts,
            "active_investigations": active_investigations,
            "total_reports": total_reports,
            "high_risk_entities": high_risk_entities,
        },
        "risk_distribution": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
        },
        "entity_type_breakdown": entity_type_breakdown,
        "recent_events": recent_events,
        "recent_alerts": recent_alerts,
        "top_entities": top_entities,
    }
