from fastapi.testclient import TestClient

from app.main import app


def test_api_smoke():
    with TestClient(app) as client:
        assert client.get("/api/health").json() == {"status": "ok"}

        roles = client.get("/api/roles").json()
        assert len(roles) == 12
        assert round(sum(r["distribucion"]["porcentaje_estimado"] for r in roles), 1) == 100.0

        estimadas = {r["id"] for r in roles if r["distribucion"]["tipo"] == "ESTIMACION_EDITORIAL"}
        assert estimadas == {"backend", "frontend", "fullstack", "mobile"}

        summary = client.get("/api/employment/summary").json()
        assert summary["ultimo_anio"] == 2024
        assert summary["empleos_registrados_ultimo_anio"] == 158179

        provinces = client.get("/api/employment/by-province").json()
        assert len(provinces) == 24

        sources = {s["tipo"] for s in client.get("/api/sources").json()}
        assert sources == {"oficial", "comunitario"}
