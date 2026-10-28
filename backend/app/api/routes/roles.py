import json
from functools import cache
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import DataSource, RoleDistribution, RoleFamily
from app.schemas import RoleDistributionOut, RoleFamilyOut

router = APIRouter(prefix="/api/roles", tags=["roles"])

CURATED = Path(__file__).resolve().parents[3] / "data" / "curated"
PROFILES_PATH = CURATED / "role_profiles_sysarmy.json"
COIT_PATH = CURATED / "coit_ar.json"


@cache
def _profiles() -> dict:
    """Fichas por rol calculadas por `app.ingestion.sysarmy_profiles` (no pasan por la base)."""
    return json.loads(PROFILES_PATH.read_text(encoding="utf-8"))["perfiles"]


@cache
def clasificador() -> dict:
    """COIT-AR: clasificador propio de ocupaciones IT (ver data/curated/coit_ar.json)."""
    return json.loads(COIT_PATH.read_text(encoding="utf-8"))


@cache
def _codigos() -> dict:
    """role_family_id -> código de familia, gran grupo y ocupaciones COIT-AR."""
    out = {}
    for grupo in clasificador()["grupos"]:
        for fam in grupo["familias"]:
            out[fam["role_family_id"]] = {
                "codigo": fam["codigo"],
                "grupo": {"codigo": grupo["codigo"], "nombre": grupo["nombre"]},
                "ocupaciones": fam["ocupaciones"],
            }
    return out


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
        perfil=_profiles().get(rf.id),
        **_codigos().get(rf.id, {}),
    )


@router.get("", response_model=list[RoleFamilyOut])
def list_roles(db: Session = Depends(get_db)):
    families = db.query(RoleFamily).all()
    result = [_build_role_out(db, rf) for rf in families]
    result.sort(key=lambda r: r.codigo or "99")
    return result


@router.get("/{role_id}", response_model=RoleFamilyOut)
def get_role(role_id: str, db: Session = Depends(get_db)):
    rf = db.query(RoleFamily).filter(RoleFamily.id == role_id).first()
    if not rf:
        raise HTTPException(status_code=404, detail="Familia de rol no encontrada")
    return _build_role_out(db, rf)
