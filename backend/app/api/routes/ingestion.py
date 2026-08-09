"""
Unified Ingestion Pipeline API Route.
Exposes POST /api/ingestion/run triggered by "Ingest Live Data" button.
"""

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.services.external_data import run_unified_ingestion_pipeline

router = APIRouter(prefix="/ingestion", tags=["Ingestion Pipeline"])


@router.post("/run")
def run_ingestion_pipeline(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Executes the Unified Ingestion Pipeline:
    1. Fetch public records from OpenFDA REST API.
    2. Validate and normalize records.
    3. Perform source_id + source_record_id deduplication.
    4. Store new events and generate alerts.
    5. Re-run scikit-learn anomaly scoring.
    6. Return ingestion summary report.
    """
    return run_unified_ingestion_pipeline(db)
