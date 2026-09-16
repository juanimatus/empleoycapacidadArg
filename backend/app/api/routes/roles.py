from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import DataSource, RoleDistribution, RoleFamily
from app.schemas import RoleDistributionOut, RoleFamilyOut

router = APIRouter(prefix="/api/roles", tags=["roles"])


def _build_role_out(db: Session, rf: RoleFamily) -> RoleFamilyOut:
    dist = (
        db.query(RoleDistribution)
        .filter(RoleDistribution.role_family_id == rf.id)
        .first()
    )
    dist_out = None
    if dist:
        fuente = db.query(DataSource).filter(DataSource.id == dist.fuente_id).first()
        dist_out = RoleDistributionOut(
            porcentaje_estimado=dist.porcentaje_estimado,
            tipo=dist.tipo,
            nota=dist.nota,
            fuente=fuente,
        )
    return RoleFamilyOut(
        id=rf.id,
        nombre=rf.nombre,
        descripcion=rf.descripcion,
        aliases=[a.alias for a in rf.aliases],
        distribucion=dist_out,
    )


@router.get("", response_model=list[RoleFamilyOut])
def list_roles(db: Session = Depends(get_db)):
    families = db.query(RoleFamily).all()
    result = [_build_role_out(db, rf) for rf in families]
    result.sort(key=lambda r: (r.distribucion.porcentaje_estimado if r.distribucion else 0), reverse=True)
    return result


@router.get("/{role_id}", response_model=RoleFamilyOut)
def get_role(role_id: str, db: Session = Depends(get_db)):
    rf = db.query(RoleFamily).filter(RoleFamily.id == role_id).first()
    if not rf:
        raise HTTPException(status_code=404, detail="Familia de rol no encontrada")
    return _build_role_out(db, rf)
