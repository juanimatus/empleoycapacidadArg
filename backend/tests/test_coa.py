from fastapi.testclient import TestClient

from app.main import app


def _ocupaciones(coa):
    return [
        o
        for g in coa["grandes_grupos"]
        for s in g["subgrupos"]
        for f in s["familias"]
        for o in f["ocupaciones"]
    ]


def test_coa_consistente():
    with TestClient(app) as client:
        coa = client.get("/api/coa").json()
        coit = client.get("/api/clasificador").json()

    # Estructura completa de la CIUO-08: 10 grandes grupos y 43 subgrupos.
    assert len(coa["grandes_grupos"]) == 10
    assert sum(len(g["subgrupos"]) for g in coa["grandes_grupos"]) == 43

    ocupaciones = _ocupaciones(coa)
    codigos = [o["codigo"] for o in ocupaciones]
    assert len(codigos) == len(set(codigos))

    rubros = {r["id"] for r in coa["rubros"]}
    for g in coa["grandes_grupos"]:
        for s in g["subgrupos"]:
            assert s["codigo"].startswith(g["codigo"])
            for f in s["familias"]:
                assert f["codigo"].startswith(s["codigo"])
                for o in f["ocupaciones"]:
                    assert o["codigo"].startswith(f["codigo"] + ".")
                    assert o["ciuo08"] == f["codigo"]
                    assert set(o["rubros"]) <= rubros
                    assert set(o["cno2001"]["caracter"]) <= set(coa["cno2001"]["caracter"])
                    assert set(o["cno2001"]["calificacion"]) <= set(coa["cno2001"]["calificacion"])

    # Cada rubro piloto tiene ocupaciones y las 16 ocupaciones COIT-AR quedan recodificadas.
    assert all(any(r in o["rubros"] for o in ocupaciones) for r in rubros)
    coit_codigos = {
        o["codigo"] for g in coit["grupos"] for f in g["familias"] for o in f["ocupaciones"]
    }
    assert {o["coit_ar"] for o in ocupaciones if "coit_ar" in o} == coit_codigos
