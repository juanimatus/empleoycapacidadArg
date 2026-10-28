"""Exporta las respuestas de la API a JSON estáticos para el frontend.

El sitio publicado no necesita el servidor Python: lee estos archivos desde
`frontend/public/api/`. Correr después de cambiar cualquier JSON curado:

    python -m app.export_static
"""

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.db import DB_PATH, engine
from app.main import app

OUT_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "api"

ENDPOINTS = [
    "/api/roles",
    "/api/employment/summary",
    "/api/employment/timeseries",
    "/api/employment/by-role",
    "/api/employment/by-province",
    "/api/employment/total",
    "/api/sources",
    "/api/clasificador",
    "/api/coa",
]


def write(path: str, data) -> None:
    target = OUT_DIR / f"{path.removeprefix('/api/')}.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def export() -> None:
    # El seed sólo carga una base vacía: se borra para exportar siempre lo último de data/curated.
    engine.dispose()
    Path(DB_PATH).unlink(missing_ok=True)
    with TestClient(app) as client:
        for path in ENDPOINTS:
            res = client.get(path)
            res.raise_for_status()
            write(path, res.json())
        for role in client.get("/api/roles").json():
            write(f"/api/roles/{role['id']}", client.get(f"/api/roles/{role['id']}").json())
    print(f"JSON estáticos escritos en {OUT_DIR}")


if __name__ == "__main__":
    export()
