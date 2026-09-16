from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import DataSource, EmploymentSnapshot, RoleFamily, SectorKPI
from app.schemas import EmploymentSnapshotOut, EmploymentSummaryOut, SectorKPIOut

router = APIRouter(prefix="/api/employment", tags=["employment"])


@router.get("/timeseries", response_model=list[EmploymentSnapshotOut])
def timeseries(db: Session = Depends(get_db)):
    rows = db.query(EmploymentSnapshot).order_by(EmploymentSnapshot.anio).all()
    return rows


@router.get("/summary", response_model=EmploymentSummaryOut)
def summary(db: Session = Depends(get_db)):
    rows = db.query(EmploymentSnapshot).order_by(EmploymentSnapshot.anio).all()
    ultimo = rows[-1]
    primero = rows[0]
    n_familias = db.query(RoleFamily).count()

    kpi_rows = db.query(SectorKPI).all()
    kpis_out = []
    for k in kpi_rows:
        fuente = db.query(DataSource).filter(DataSource.id == k.fuente_id).first()
        kpis_out.append(
            SectorKPIOut(
                id=k.id,
                nombre=k.nombre,
                valor=k.valor,
                unidad=k.unidad,
                periodo=k.periodo,
                nota=k.nota,
                fuente=fuente,
            )
        )

    return EmploymentSummaryOut(
        ultimo_anio=ultimo.anio,
        empleos_registrados_ultimo_anio=ultimo.empleos_registrados,
        variacion_interanual_pct=ultimo.variacion_interanual_pct,
        cantidad_familias_rol=n_familias,
        periodo_datos=f"{primero.anio}-{ultimo.anio}",
        kpis=kpis_out,
    )


@router.get("/by-role")
def by_role(db: Session = Depends(get_db)):
    """Cruce simple: total de empleo del último año x distribución estimada por familia."""
    from app.models import RoleDistribution

    ultimo = db.query(EmploymentSnapshot).order_by(EmploymentSnapshot.anio.desc()).first()
    distribuciones = db.query(RoleDistribution).all()
    familias = {f.id: f for f in db.query(RoleFamily).all()}

    result = []
    for d in distribuciones:
        fam = familias.get(d.role_family_id)
        if not fam:
            continue
        result.append(
            {
                "role_family_id": fam.id,
                "nombre": fam.nombre,
                "porcentaje_estimado": d.porcentaje_estimado,
                "empleos_estimados": round(ultimo.empleos_registrados * d.porcentaje_estimado / 100),
                "tipo_dato": d.tipo,
            }
        )
    result.sort(key=lambda r: r["porcentaje_estimado"], reverse=True)
    return {
        "anio_base": ultimo.anio,
        "empleos_registrados_totales": ultimo.empleos_registrados,
        "aviso": "El total es dato oficial (OEDE). La segmentación por rol es una estimación preliminar no oficial.",
        "distribucion": result,
    }
