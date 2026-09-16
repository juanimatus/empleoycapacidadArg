"""Carga (idempotente) de todos los datos curados a la base SQLite del MVP.

Uso: python -m app.ingestion.seed_all
"""

import json
from pathlib import Path

from app.db import Base, SessionLocal, engine
from app.models import (
    DataSource,
    EmploymentSnapshot,
    RoleAlias,
    RoleDistribution,
    RoleFamily,
    SectorKPI,
)

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "curated"

SOURCE_OEDE = DataSource(
    id="oede-opssi-2025",
    nombre="OEDE (Ministerio de Trabajo), vía CESSI/OPSSI - Foco Talento jul-2025",
    tipo="oficial",
    descripcion=(
        "Serie de empleo registrado del sector Software, elaborada por el "
        "Observatorio de Empleo y Dinámica Empresarial (OEDE) y republicada "
        "con esa cita en el reporte de OPSSI."
    ),
    url=(
        "https://cessi.org.ar/wp-content/uploads/2025/08/"
        "CESSI-OPSSI-Reporte-de-los-principales-indicadores-de-la-industria-"
        "del-Software-con-Foco-en-Talento_Julio-2025.pdf"
    ),
    fecha="2025-07",
)

SOURCE_OPSSI_KPI = DataSource(
    id="opssi-kpis-2025",
    nombre="CESSI/OPSSI - Foco Talento jul-2025",
    tipo="oficial",
    descripcion="Indicadores sectoriales (salario, rotación, género) relevados por encuesta de OPSSI.",
    url=(
        "https://cessi.org.ar/wp-content/uploads/2025/08/"
        "CESSI-OPSSI-Reporte-de-los-principales-indicadores-de-la-industria-"
        "del-Software-con-Foco-en-Talento_Julio-2025.pdf"
    ),
    fecha="2025-07",
)

SOURCE_ESTIMACION = DataSource(
    id="estimacion-editorial-roles",
    nombre="Estimación editorial preliminar (Observatorio)",
    tipo="estimacion",
    descripcion=(
        "No existe fuente pública oficial con distribución de empleo IT por "
        "rol específico. Estimación inicial a reemplazar por una fuente primaria."
    ),
    url=None,
    fecha="2026-09",
)


def load_json(filename: str):
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(DataSource).count() == 0:
            db.add_all([SOURCE_OEDE, SOURCE_OPSSI_KPI, SOURCE_ESTIMACION])
            db.commit()

        if db.query(RoleFamily).count() == 0:
            families = load_json("role_families.json")
            for fam in families:
                rf = RoleFamily(id=fam["id"], nombre=fam["nombre"], descripcion=fam["descripcion"])
                db.add(rf)
                for alias in fam["aliases"]:
                    db.add(RoleAlias(alias=alias, role_family_id=fam["id"]))
            db.commit()

        if db.query(EmploymentSnapshot).count() == 0:
            employment = load_json("oede_software_employment_national.json")
            for row in employment["serie_anual"]:
                db.add(
                    EmploymentSnapshot(
                        anio=row["anio"],
                        empleos_registrados=row["empleos_registrados"],
                        variacion_interanual_pct=row["variacion_interanual_pct"],
                        cobertura=employment["cobertura"],
                        fuente_id=SOURCE_OEDE.id,
                    )
                )
            db.commit()

        if db.query(SectorKPI).count() == 0:
            kpis = load_json("sector_kpis.json")
            for kpi in kpis:
                db.add(
                    SectorKPI(
                        id=kpi["id"],
                        nombre=kpi["nombre"],
                        valor=kpi["valor"],
                        unidad=kpi["unidad"],
                        periodo=kpi["periodo"],
                        nota=kpi.get("nota"),
                        fuente_id=SOURCE_OPSSI_KPI.id,
                    )
                )
            db.commit()

        if db.query(RoleDistribution).count() == 0:
            dist = load_json("role_distribution_estimate.json")
            for row in dist["distribucion"]:
                db.add(
                    RoleDistribution(
                        role_family_id=row["role_family_id"],
                        porcentaje_estimado=row["porcentaje_estimado"],
                        tipo=dist["tipo"],
                        fuente_id=SOURCE_ESTIMACION.id,
                    )
                )
            db.commit()

        print("Seed completo.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
