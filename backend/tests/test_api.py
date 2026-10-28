from fastapi.testclient import TestClient

from app.main import app


def test_api_smoke():
    with TestClient(app) as client:
        assert client.get("/api/health").json() == {"status": "ok"}

        roles = client.get("/api/roles").json()
        assert len(roles) == 12
        # Cada porcentaje está redondeado a un decimal: la suma puede correrse una décima.
        assert abs(sum(r["distribucion"]["porcentaje_estimado"] for r in roles) - 100) <= 0.2
        assert all(r["perfil"]["respuestas"] > 0 for r in roles)

        estimadas = {r["id"] for r in roles if r["distribucion"]["tipo"] == "ESTIMACION_EDITORIAL"}
        assert estimadas == {"backend", "frontend", "fullstack", "mobile"}

        # Todos los roles tienen código COIT-AR único y la lista sale ordenada por código.
        codigos = [r["codigo"] for r in roles]
        assert None not in codigos and codigos == sorted(set(codigos))
        assert all(o["codigo"].startswith(r["codigo"]) for r in roles for o in r["ocupaciones"])

        total = client.get("/api/employment/total").json()
        software = total["universos"]["software"]
        assert software["muestra"] > 300 and 0 < software["fuera_del_sipa_privado"] < 100
        assert abs(sum(i["porcentaje"] for i in software["informalidad"]) - 100) <= 0.5

        coit = client.get("/api/clasificador").json()
        assert len(coit["grupos"]) == 5

        summary = client.get("/api/employment/summary").json()
        assert summary["ultimo_anio"] == 2024
        assert summary["empleos_registrados_ultimo_anio"] == 158179

        provinces = client.get("/api/employment/by-province").json()
        assert len(provinces) == 24

        sources = {s["tipo"] for s in client.get("/api/sources").json()}
        assert sources == {"oficial", "comunitario"}
