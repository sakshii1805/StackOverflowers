from fastapi import APIRouter

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


@router.get("/health")
def anomalies_health():
    return {"module": "anomalies", "status": "active"}
