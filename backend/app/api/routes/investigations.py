from fastapi import APIRouter

router = APIRouter(prefix="/investigations", tags=["Investigations"])


@router.get("/health")
def investigations_health():
    return {"module": "investigations", "status": "active"}
