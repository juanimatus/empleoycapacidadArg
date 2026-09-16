from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import DataSource
from app.schemas import DataSourceOut

router = APIRouter(prefix="/api/sources", tags=["sources"])


@router.get("", response_model=list[DataSourceOut])
def list_sources(db: Session = Depends(get_db)):
    return db.query(DataSource).all()
