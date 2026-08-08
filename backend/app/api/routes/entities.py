from fastapi import APIRouter

router = APIRouter(prefix="/entities", tags=["Entities"])


@router.get("/health")
def entities_health():
    return {"module": "entities", "status": "active"}
