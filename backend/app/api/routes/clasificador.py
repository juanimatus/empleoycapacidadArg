from fastapi import APIRouter

from app.api.routes.roles import clasificador

router = APIRouter(prefix="/api/clasificador", tags=["clasificador"])


@router.get("")
def get_clasificador():
    return clasificador()
