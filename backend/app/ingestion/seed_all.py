"""Carga (idempotente) de todos los datos curados a la base SQLite del MVP.

Uso: python -m app.ingestion.seed_all
"""

import json
from pathlib import Path

from app.db import Base, SessionLocal, engine
from app.models import (
    DataSource,
    EmploymentSnapshot,
    ProvinceEmployment,
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

SOURCE_OEDE_PROVINCIA = DataSource(
    id="oede-provincia-2023",
    nombre="OEDE / datos.produccion.gob.ar - Puestos de trabajo por provincia y CLAE2",
    tipo="oficial",
    descripcion=(
        "Serie oficial de empleo asalariado registrado por provincia, sector "
        "privado, CLAE2 62+63 (Software y Servicios Informáticos). Descarga "
        "directa del portal de datos abiertos del Ministerio de Producción."
    ),
    url="https://datos.produccion.gob.ar/dataset/puestos-de-trabajo-registrados-por-provincia-y-sector-de-actividad",
    fecha="2023-11",
)

SOURCE_SYSARMY = DataSource(
    id="sysarmy-2025-1",
    nombre="Sysarmy - Encuesta de Sueldos IT Argentina 2025.1",
    tipo="comunitario",
    descripcion=(
        "Encuesta comunitaria abierta (no gubernamental) con 5.196 respuestas "
        "de trabajadores IT en Argentina. Dataset publicado bajo licencia "
        "CC BY-NC-SA 4.0. Es la fuente primaria más completa disponible hoy "
        "para estimar la distribución de roles, a falta de una encuesta oficial."
    ),
    url="https://sysarmy.com/blog/posts/resultados-de-la-encuesta-de-sueldos-2025-1/",
    fecha="2025",
)


def load_json(filename: str):
    with open(DATA_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(DataSource).count() == 0:
            db.add_all([SOURCE_OEDE, SOURCE_OPSSI_KPI, SOURCE_OEDE_PROVINCIA, SOURCE_SYSARMY])
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

        if db.query(ProvinceEmployment).count() == 0:
            provincias = load_json("oede_employment_by_province.json")
            for row in provincias["provincias"]:
                db.add(
                    ProvinceEmployment(
                        provincia=row["provincia"],
                        empleos_registrados=row["empleos_registrados"],
                        porcentaje=row["porcentaje"],
                        periodo=provincias["periodo"],
                        fuente_id=SOURCE_OEDE_PROVINCIA.id,
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
            dist = load_json("role_distribution_sysarmy.json")
            for row in dist["distribucion"]:
                db.add(
                    RoleDistribution(
                        role_family_id=row["role_family_id"],
                        porcentaje_estimado=row["porcentaje_estimado"],
                        tipo=row.get("tipo_dato", dist["tipo"]),
                        nota=row.get("nota"),
                        fuente_id=SOURCE_SYSARMY.id,
                    )
                )
            db.commit()

        print("Seed completo.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
