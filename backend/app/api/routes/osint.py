from fastapi import APIRouter

router = APIRouter(prefix="/osint", tags=["OSINT"])


@router.get("/health")
def osint_health():
    return {"module": "osint", "status": "active"}
