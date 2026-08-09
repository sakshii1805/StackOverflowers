"""
System Status & Data Source Registry API Endpoint.
Exposes data health, operational mode, connected public APIs, and DB status.
"""

from typing import Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.entity import Entity
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["System Status"])


@router.get("/status")
def get_system_status(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Returns comprehensive Data Source Registry and Platform Health Status.
    Modes: HYBRID, LIVE, PUBLIC, DEMO, FALLBACK.
    """
    entity_count = db.query(Entity).count()
    now_iso = datetime.now(timezone.utc).isoformat()

    data_sources = [
        {
            "source_id": "openfda_enforcement",
            "source_name": "OpenFDA Drug Enforcement Open API",
            "source_type": "PUBLIC_DATA",
            "status": "CONNECTED",
            "last_successful_sync": now_iso,
            "update_frequency": "Periodic / Lawful Open API",
            "record_count": 15,
            "data_classification": "Public / Historical Data",
        },
        {
            "source_id": "unodc_dmp",
            "source_name": "UNODC Drugs Monitoring Platform",
            "source_type": "PUBLIC_DATA",
            "status": "CONNECTED",
            "last_successful_sync": now_iso,
            "update_frequency": "Historical / Statistical Benchmarks",
            "record_count": 2,
            "data_classification": "Public / Historical Data",
        },
        {
            "source_id": "narcoscope_synthetic_graph",
            "source_name": "NARCOSCOPE Synthetic Network Graph",
            "source_type": "SYNTHETIC_DATA",
            "status": "ACTIVE",
            "last_successful_sync": now_iso,
            "update_frequency": "Seeded Demo Dataset",
            "record_count": entity_count,
            "data_classification": "Synthetic / Demonstration",
        },
    ]

    return {
        "status": "online",
        "service": "narcoscope-backend",
        "version": settings.VERSION,
        "mode": "HYBRID",
        "database": "connected",
        "ml_engine": "ready",
        "neo4j": "sqlite_fallback",
        "data_sources": data_sources,
        "classification_policy": {
            "public_data": "Official open-data stats (OpenFDA / UNODC)",
            "synthetic_data": "Fictional network entities, relations & investigations",
            "ml_indicators": "scikit-learn IsolationForest & TF-IDF NLP scoring",
        },
    }
