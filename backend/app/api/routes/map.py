"""
Map & Sector Intelligence API Endpoints
"""

from typing import Any
from fastapi import APIRouter

router = APIRouter(prefix="/map", tags=["Activity Map"])

SECTOR_NAMES = [
    "Riverside",
    "Harborview",
    "Midtown",
    "Depot Row",
    "Eastgate",
    "Old Mill",
    "Southline",
    "Freeport",
    "Northfield",
    "Union Yards",
    "Lakeside",
    "Ashcroft",
]


@router.get("/sectors")
def read_sectors() -> Any:
    """Retrieve 12 sector baselines, trends, and activity heatmap scores."""
    sectors = []
    for i, name in enumerate(SECTOR_NAMES):
        baseline = 8 + (i % 5)
        spike = 2.6 if i == 3 else (1.7 if i == 7 else 1.1)
        activity_count = int(baseline * spike)
        anomaly_score = round(min(1.0, max(0.0, (activity_count / baseline - 1) / 1.6)), 2)
        sectors.append({
            "id": f"S{i+1:02d}",
            "name": f"Sector {i+1:02d} — {name}",
            "baseline": baseline,
            "activityCount": activity_count,
            "anomalyScore": anomaly_score,
            "trend": [baseline, baseline + 1, baseline + 2, activity_count - 1, activity_count],
        })
    return sectors
