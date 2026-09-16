from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class RoleFamily(Base):
    __tablename__ = "role_families"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    descripcion: Mapped[str] = mapped_column(String, nullable=False)

    aliases: Mapped[list["RoleAlias"]] = relationship(
        back_populates="role_family", cascade="all, delete-orphan"
    )


class RoleAlias(Base):
    __tablename__ = "role_aliases"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    alias: Mapped[str] = mapped_column(String, nullable=False)
    role_family_id: Mapped[str] = mapped_column(ForeignKey("role_families.id"))

    role_family: Mapped[RoleFamily] = relationship(back_populates="aliases")
