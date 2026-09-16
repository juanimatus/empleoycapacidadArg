from pydantic import BaseModel


class DataSourceOut(BaseModel):
    id: str
    nombre: str
    tipo: str
    descripcion: str
    url: str | None = None
    fecha: str | None = None

    class Config:
        from_attributes = True


class RoleAliasOut(BaseModel):
    alias: str

    class Config:
        from_attributes = True


class RoleDistributionOut(BaseModel):
    porcentaje_estimado: float
    tipo: str
    fuente: DataSourceOut

    class Config:
        from_attributes = True


class RoleFamilyOut(BaseModel):
    id: str
    nombre: str
    descripcion: str
    aliases: list[str]
    distribucion: RoleDistributionOut | None = None

    class Config:
        from_attributes = True


class EmploymentSnapshotOut(BaseModel):
    anio: int
    empleos_registrados: int
    variacion_interanual_pct: float | None
    cobertura: str

    class Config:
        from_attributes = True


class SectorKPIOut(BaseModel):
    id: str
    nombre: str
    valor: float
    unidad: str
    periodo: str
    nota: str | None
    fuente: DataSourceOut

    class Config:
        from_attributes = True


class EmploymentSummaryOut(BaseModel):
    ultimo_anio: int
    empleos_registrados_ultimo_anio: int
    variacion_interanual_pct: float | None
    cantidad_familias_rol: int
    periodo_datos: str
    kpis: list[SectorKPIOut]
