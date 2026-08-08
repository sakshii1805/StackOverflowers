from fastapi import APIRouter

router = APIRouter(prefix="/network", tags=["Network"])


@router.get("/health")
def network_health():
    return {"module": "network", "status": "active"}
