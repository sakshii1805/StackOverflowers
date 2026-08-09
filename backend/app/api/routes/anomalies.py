"""
Anomaly Detection API Endpoints powered by scikit-learn IsolationForest ML model.
"""

from typing import Any
from fastapi import APIRouter
from app.services.ml_engine import detect_anomalies_isolation_forest

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

SAMPLE_SECTORS = [
    {
        "id": "ANO-001",
        "sectorId": "S04",
        "sectorName": "Sector 04 — Depot Row",
        "baseline": 10,
        "observed": 26,
        "deviationPct": 160,
        "severity": "critical",
        "confidence": 94,
        "timestamp": "2026-08-08T12:00:00Z",
        "sparkline": [10, 11, 12, 14, 26],
    },
    {
        "id": "ANO-002",
        "sectorId": "S08",
        "sectorName": "Sector 08 — Freeport",
        "baseline": 12,
        "observed": 20,
        "deviationPct": 67,
        "severity": "high",
        "confidence": 82,
        "timestamp": "2026-08-08T11:30:00Z",
        "sparkline": [12, 12, 13, 15, 20],
    },
    {
        "id": "ANO-003",
        "sectorId": "S02",
        "sectorName": "Sector 02 — Harborview",
        "baseline": 15,
        "observed": 21,
        "deviationPct": 40,
        "severity": "medium",
        "confidence": 68,
        "timestamp": "2026-08-08T09:45:00Z",
        "sparkline": [15, 15, 16, 17, 21],
    },
]


@router.get("")
def read_anomalies() -> Any:
    """Retrieve anomalies detected by scikit-learn IsolationForest ML model."""
    return detect_anomalies_isolation_forest(SAMPLE_SECTORS)
