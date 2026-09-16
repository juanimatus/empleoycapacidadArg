from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class EmploymentSnapshot(Base):
    """Serie anual nacional de empleo registrado en el sector Software/IT (fuente: OEDE)."""

    __tablename__ = "employment_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    empleos_registrados: Mapped[int] = mapped_column(Integer, nullable=False)
    variacion_interanual_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    cobertura: Mapped[str] = mapped_column(String, default="nacional")
    fuente_id: Mapped[str] = mapped_column(ForeignKey("data_sources.id"))


class RoleDistribution(Base):
    """Distribución porcentual estimada de empleo IT por familia de rol."""

    __tablename__ = "role_distributions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    role_family_id: Mapped[str] = mapped_column(ForeignKey("role_families.id"))
    porcentaje_estimado: Mapped[float] = mapped_column(Float, nullable=False)
    tipo: Mapped[str] = mapped_column(String, default="ESTIMACION_PRELIMINAR_NO_OFICIAL")
    fuente_id: Mapped[str] = mapped_column(ForeignKey("data_sources.id"))


class SectorKPI(Base):
    """Indicadores sueltos del sector (salario promedio, rotación, participación femenina, etc.)."""

    __tablename__ = "sector_kpis"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    valor: Mapped[float] = mapped_column(Float, nullable=False)
    unidad: Mapped[str] = mapped_column(String, nullable=False)
    periodo: Mapped[str] = mapped_column(String, nullable=False)
    nota: Mapped[str | None] = mapped_column(String, nullable=True)
    fuente_id: Mapped[str] = mapped_column(ForeignKey("data_sources.id"))
