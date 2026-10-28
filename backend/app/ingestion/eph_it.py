"""Empleo IT total (formal e informal) a partir de la EPH del INDEC.

La EPH es una encuesta a hogares: a diferencia del SIPA, que sólo ve a las
personas registradas y las clasifica por el rubro de la empresa, la EPH capta
informales, cuentapropistas y a quien trabaja para un empleador del exterior,
y clasifica a cada persona por lo que hace (ocupación, CNO-2001).

Se juntan los últimos cuatro trimestres para que la muestra alcance y se
promedian (factor de expansión PONDERA / cantidad de trimestres).

Dos universos:
- `software`: ocupación CNO-2001 de carácter 81, "producción de software",
  en cualquier rubro (incluye a quien programa en un banco o en el Estado).
- `sector_it`: cualquier ocupación en empresas de la rama CAES 6200 / 6300
  (programación, consultoría y servicios de información), comparable con el SIPA.

Entrada: bases de microdatos "usu_individual" en formato txt, que se bajan de
INDEC a `data/raw/sources/eph/` (no se versionan). Salida versionada:
`data/curated/eph_empleo_it.json`.

Uso: python -m app.ingestion.eph_it
"""

import csv
import io
import json
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent.parent / "data"
RAW = BASE / "raw" / "sources" / "eph"
OUT = BASE / "curated" / "eph_empleo_it.json"

TRIMESTRES = [(2025, 2), (2025, 3), (2025, 4), (2026, 1)]
URL = "https://www.indec.gob.ar/ftp/cuadros/menusuperior/eph/EPH_usu_{t}_Trim_{a}_txt.zip"

CATEGORIA = {"1": "Patrón", "2": "Cuenta propia", "3": "Asalariado/a", "4": "Trabajador/a familiar"}
EMPLEO = {"1": "Formal", "2": "Informal"}  # clasificación de informalidad que publica INDEC
CALIFICACION = {"1": "Profesional", "2": "Técnica", "3": "Operativa", "4": "No calificada"}
SEXO = {"1": "Varones", "2": "Mujeres"}
REGION = {
    "1": "Gran Buenos Aires",
    "40": "Noroeste",
    "41": "Noreste",
    "42": "Cuyo",
    "43": "Pampeana",
    "44": "Patagonia",
}
# Ramas CAES-Mercosur 1.0 que aparecen entre las principales, con nombre corto.
RAMA = {
    "6200": "Software y consultoría IT",  # Programación y consultoría informática
    "6300": "Servicios de información",
    "8401": "Estado",  # Administración pública
    "6100": "Telecomunicaciones",
    "6400": "Bancos y finanzas",  # Servicios financieros
    "6500": "Seguros",
}


def _bajar(anio: int, trim: int) -> Path:
    destino = RAW / f"EPH_usu_{trim}_Trim_{anio}_txt.zip"
    if not destino.exists():
        RAW.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(URL.format(t=trim, a=anio), destino)
    return destino


def _ocupados(anio: int, trim: int):
    with zipfile.ZipFile(_bajar(anio, trim)) as z:
        nombre = next(n for n in z.namelist() if "individual" in n.lower())
        with z.open(nombre) as f:
            for row in csv.DictReader(io.TextIOWrapper(f, encoding="latin-1"), delimiter=";"):
                if row["ESTADO"] == "1":
                    yield row


def _int(valor: str) -> str:
    return str(int(float(valor))) if valor.strip() else ""


def _reparto(filas, clave, etiquetas=None) -> list[dict]:
    """Porcentaje sobre el total del universo; sólo se listan los valores con etiqueta."""
    pesos = defaultdict(float)
    for r in filas:
        pesos[clave(r)] += r["w"]
    total = sum(pesos.values())
    items = sorted(
        ((k, p) for k, p in pesos.items() if etiquetas is None or k in etiquetas),
        key=lambda kv: -kv[1],
    )
    return [
        {"nombre": (etiquetas or {}).get(k, k), "porcentaje": round(100 * p / total, 1)}
        for k, p in items
    ]


def _mediana(pares) -> int | None:
    pares = sorted(pares)
    total = sum(p for _, p in pares)
    acumulado = 0.0
    for valor, peso in pares:
        acumulado += peso
        if acumulado >= total / 2:
            return int(valor)
    return None


def _resumen(filas, ocupados_total: float, ultimo: tuple[int, int]) -> dict:
    personas = sum(r["w"] for r in filas)
    fuera_sipa = sum(
        r["w"]
        for r in filas
        if not (r["CAT_OCUP"] == "3" and r["EMPLEO"] == "1" and r["PP04A"] == "2")
    )
    ingresos = {}
    recientes = [r for r in filas if (r["anio"], r["trim"]) == ultimo and float(r["P21"] or 0) > 0]
    for codigo, nombre in [(None, "Total"), ("1", "Formal"), ("2", "Informal")]:
        sub = [r for r in recientes if codigo is None or r["EMPLEO"] == codigo]
        if len(sub) >= 30:
            ingresos[nombre] = {
                "mediana": _mediana((float(r["P21"]), float(r["PONDIIO"])) for r in sub),
                "n": len(sub),
            }
    informales_por_categoria = {}
    for codigo in ("2", "3"):
        sub = [r for r in filas if r["CAT_OCUP"] == codigo]
        peso = sum(r["w"] for r in sub)
        if len(sub) >= 30:
            informales_por_categoria[CATEGORIA[codigo]] = round(
                100 * sum(r["w"] for r in sub if r["EMPLEO"] == "2") / peso, 1
            )
    return {
        "muestra": len(filas),
        "personas": round(personas, -2),
        "porcentaje_de_ocupados": round(100 * personas / ocupados_total, 2),
        "informalidad": _reparto(filas, lambda r: r["EMPLEO"], EMPLEO),
        "informalidad_por_categoria": informales_por_categoria,
        "fuera_del_sipa_privado": round(100 * fuera_sipa / personas, 1),
        "categoria": _reparto(filas, lambda r: r["CAT_OCUP"], CATEGORIA),
        "estatal": round(100 * sum(r["w"] for r in filas if r["PP04A"] == "1") / personas, 1),
        "calificacion": _reparto(filas, lambda r: r["cno"][4], CALIFICACION),
        "sexo": _reparto(filas, lambda r: r["CH04"], SEXO),
        "region": _reparto(filas, lambda r: r["REGION"], REGION),
        "rama": _reparto(filas, lambda r: r["caes"], RAMA)[:6],
        "rama_it": round(
            100 * sum(r["w"] for r in filas if r["caes"] in ("6200", "6300")) / personas, 1
        ),
        "ingreso_mensual_ocupacion_principal": ingresos,
    }


def build() -> dict:
    filas = []
    for anio, trim in TRIMESTRES:
        for r in _ocupados(anio, trim):
            r["w"] = float(r["PONDERA"]) / len(TRIMESTRES)
            r["anio"], r["trim"] = anio, trim
            r["cno"] = _int(r["PP04D_COD"]).zfill(5)
            r["caes"] = _int(r["PP04B_COD"])
            r["EMPLEO"] = _int(r.get("EMPLEO", ""))
            filas.append(r)
    ocupados = sum(r["w"] for r in filas)
    ultimo = TRIMESTRES[-1]
    periodo = f"{TRIMESTRES[0][1]}T{TRIMESTRES[0][0]} a {ultimo[1]}T{ultimo[0]}"
    return {
        "fuente": {
            "nombre": "Encuesta Permanente de Hogares (EPH), INDEC",
            "url": "https://www.indec.gob.ar/indec/web/Institucional-Indec-BasesDeDatos",
            "tipo": "oficial",
        },
        "periodo": periodo,
        "cobertura": "31 aglomerados urbanos (no incluye zonas rurales ni ciudades chicas)",
        "metodo": (
            f"Promedio de {len(TRIMESTRES)} trimestres de microdatos. Personas ocupadas, "
            "expandidas con el factor PONDERA. Formal/informal según la clasificación de INDEC "
            "(variable EMPLEO). Ingreso: mediana de la ocupación principal del último trimestre, "
            "en pesos corrientes."
        ),
        "ocupados_aglomerados": round(ocupados, -3),
        "ingreso_periodo": f"{ultimo[1]}T{ultimo[0]}",
        "universos": {
            "software": {
                "nombre": "Ocupaciones de la producción de software",
                "definicion": "Ocupación CNO-2001 de carácter 81, en cualquier rama de actividad.",
                **_resumen([r for r in filas if r["cno"][:2] == "81"], ocupados, ultimo),
            },
            "sector_it": {
                "nombre": "Empresas de software y servicios informáticos",
                "definicion": "Cualquier ocupación en la rama CAES 6200 o 6300.",
                **_resumen([r for r in filas if r["caes"] in ("6200", "6300")], ocupados, ultimo),
            },
        },
        "limites": [
            "La EPH no pregunta si el empleador o el cliente está en el exterior: quien trabaja para "
            "afuera aparece como cuenta propia o como asalariado/a, formal o informal, según cómo "
            "lo declare.",
            "El CNO-2001 no separa roles dentro de IT (backend, data, QA): el carácter 81 los "
            "agrupa a todos. Diseño UX, análisis de datos y soporte pueden quedar codificados en "
            "otros caracteres.",
            "Con unas 700 personas encuestadas por universo, los repartos tienen un margen de "
            "error de varios puntos. Los datos por región son orientativos.",
        ],
    }


def main() -> None:
    data = build()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sw = data["universos"]["software"]
    print(f"{OUT.name}: software {sw['personas']:.0f} personas (n={sw['muestra']})")


if __name__ == "__main__":
    main()
