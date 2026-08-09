"""
OSINT Intelligence, Public Data Ingestion, and Entity Extraction endpoints.
"""

from typing import Any, Optional
import re
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator

from app.api import deps
from app.models.user import User
from app.services.ml_engine import analyze_text_nlp, forecast_trafficking_route_risk
from app.services.external_data import fetch_openfda_public_enforcements, get_data_classification_summary

router = APIRouter(prefix="/osint", tags=["OSINT"])


class ExtractRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Unstructured text to extract entities from")

    @field_validator("text")
    def validate_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value


class TipOffRequest(BaseModel):
    informant_alias: Optional[str] = Field("Anonymous-Informant", description="Optional alias for informant")
    content: str = Field(..., min_length=10, description="Encrypted or unstructured tip-off text")

    @field_validator("informant_alias")
    def validate_informant_alias(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not value.strip():
            raise ValueError("informant_alias must not be blank")
        return value

    @field_validator("content")
    def validate_content(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("content must not be blank")
        return value


class RoutePredictionRequest(BaseModel):
    origin_sector: str = Field(..., min_length=2)
    destination_sector: str = Field(..., min_length=2)

    @field_validator("origin_sector")
    def validate_origin_sector(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("origin_sector must not be blank")
        return value

    @field_validator("destination_sector")
    def validate_destination_sector(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("destination_sector must not be blank")
        return value


SYNTHETIC_FEED = [
    {
        "id": "OSI-01",
        "title": "Maritime cargo logistics realignment in Port Ficticio",
        "source": "Global Trade Monitor (Synthetic)",
        "published_at": "2026-08-01T14:30:00Z",
        "category": "public_records",
        "confidence": 85,
        "severity": "medium",
        "relatedEntityId": "P-1000",
        "status": "actionable",
        "data_classification": "Synthetic / Demonstration",
    },
    {
        "id": "OSI-02",
        "title": "Crypto transactions spike on regional ledger",
        "source": "Ledger Explorer (Synthetic)",
        "published_at": "2026-08-05T09:15:00Z",
        "category": "financial",
        "confidence": 92,
        "severity": "high",
        "relatedEntityId": "V-1001",
        "status": "actionable",
        "data_classification": "Synthetic / Demonstration",
    },
]


@router.post("/extract")
def extract_entities(req: ExtractRequest) -> Any:
    """Extract entity leads from unstructured text using NLP analysis."""
    return analyze_text_nlp(req.text)


@router.post("/tip-off")
def submit_anonymous_tip_off(tip: TipOffRequest) -> Any:
    """
    Informant tip-off portal endpoint.
    Processes unstructured encrypted tip-off text via scikit-learn TF-IDF + NLP pipeline.
    """
    nlp_results = analyze_text_nlp(tip.content)
    return {
        "status": "received",
        "informant_alias": tip.informant_alias,
        "nlp_analysis": nlp_results,
        "action_taken": "Investigative lead automatically generated in central graph engine.",
        "data_classification": "Synthetic / Demonstration",
    }


@router.post("/predict-route")
def predict_trafficking_route(
    req: RoutePredictionRequest,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Predictive analytics endpoint to forecast trafficking route risk scores between sectors."""
    res = forecast_trafficking_route_risk(req.origin_sector, req.destination_sector)
    res["data_classification"] = "ML Analytics Indicator"
    return res


@router.get("/public-data")
def read_public_open_data() -> Any:
    """
    Lawful Public Open Data Ingestion Endpoint.
    Ingests official open data from OpenFDA drug regulatory API and UNODC public datasets.
    """
    return fetch_openfda_public_enforcements()


@router.post("/refresh")
def refresh_realtime_data() -> Any:
    """
    Triggers real-time open data ingestion sync from OpenFDA REST API,
    updates dynamic telemetry metrics, and re-fits scikit-learn ML anomaly scores.
    """
    return trigger_realtime_ingestion_sync()


@router.get("/data-classification")
def read_data_classification_summary() -> Any:
    """Retrieve system-wide Data Classification metadata tags and policy."""
    return get_data_classification_summary()


@router.get("/feeds")
def read_osint_feeds() -> Any:
    """Retrieve OSINT feed items for the OSINT Intelligence page."""
    return SYNTHETIC_FEED


@router.get("/health")
def osint_health():
    """Unprotected health check."""
    return {"module": "osint", "status": "active"}
