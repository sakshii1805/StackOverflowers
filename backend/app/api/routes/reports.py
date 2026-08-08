from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/health")
def reports_health():
    return {"module": "reports", "status": "active"}
