from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class DataSource(Base):
    """Catálogo de fuentes citadas en el sitio, para la sección de Metodología."""

    __tablename__ = "data_sources"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    tipo: Mapped[str] = mapped_column(String, nullable=False)  # "oficial" | "estimacion"
    descripcion: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str | None] = mapped_column(String, nullable=True)
    fecha: Mapped[str | None] = mapped_column(String, nullable=True)
