"""Arma las fichas por familia de rol a partir de la encuesta Sysarmy 2025.1.

Entrada: el CSV de la encuesta (Archivo > Descargar > CSV en la planilla de
Sysarmy), guardado en `data/raw/sources/sysarmy_2025_1.csv` con la fila de
encabezados técnicos (`trabajo_de`, `seniority`, `_sal`, ...) como primera fila.
El CSV no se versiona; las salidas sí:

- `data/curated/role_profiles_sysarmy.json`: una ficha por familia de rol.
- `data/curated/role_distribution_sysarmy.json`: reparto por familia, con el
  bloque "Developer" separado en Backend/Frontend/Full Stack/Mobile según las
  tecnologías que declara cada persona (regla de abajo).

Uso: python -m app.ingestion.sysarmy_profiles
"""

import csv
import json
import statistics
from collections import Counter
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent.parent / "data"
RAW = BASE / "raw" / "sources" / "sysarmy_2025_1.csv"
CURATED = BASE / "curated"

# Categorías de `trabajo_de` en Sysarmy -> familia de rol del observatorio.
# "Developer" se reparte aparte con `developer_family`.
ROLE_MAP = {
    "SysAdmin / DevOps / SRE": "devops",
    "Manager / Director": "product-project",
    "Scrum Master": "product-project",
    "BI Analyst / Data Analyst": "data",
    "Data Engineer": "data",
    "DBA (Database Administrator)": "data",
    "QA / Tester": "qa",
    "UX Designer": "ux-ui",
    "Designer": "ux-ui",
    "UX Writer": "ux-ui",
    "UX Researcher": "ux-ui",
    "HelpDesk": "support-sysadmin",
    "Technical Support": "support-sysadmin",
    "Infosec": "security",
    "Data Scientist": "data-science-ml",
    "AI Engineer": "data-science-ml",
}
DEVELOPER_FAMILIES = ("backend", "frontend", "fullstack", "mobile")

MOBILE_FRAMEWORKS = {"flutter", "react native", "swiftui", "ionic", "cordova"}
MOBILE_LANGS = {"swift", "dart", "objective-c"}
FRONT_FRAMEWORKS = {"react.js", "angular", "vue.js", "next.js", "svelte"}
BACK_FRAMEWORKS = {
    "node.js", "spring", ".net core", ".net framework", "laravel", "django", "flask",
    "fastapi", "rails", "symfony", "codeigniter", "hibernate", "nest.js", "nestjs", "nest",
}
BACK_LANGS = {"java", "c#", ".net", "go", "php", "python", "ruby", "scala", "elixir", "cobol", "rust"}

NO_ANSWER = {"", "ninguno de los anteriores", "ninguna de las anteriores"}

COL_LANGS = "lenguajes_de_programacion_o_tecnologias_que_utilices_en_tu_puesto_actual"
COL_FRAMEWORKS = "frameworksherramientas_y_librerias_que_utilices_en_tu_puesto_actual"
COL_PLATFORMS = "plataformas_que_utilizas_en_tu_puesto_actual"
COL_AI = "que_tanto_estas_usando_copilotchatgpt_u_otras_herramientas_de_ia_para_tu_trabajo"

SENIORITIES = ("Junior", "Semi-Senior", "Senior")
MIN_N = 10  # debajo de esto no se publica una mediana


def items(value: str) -> list[str]:
    return [t.strip() for t in value.split(",") if t.strip().lower() not in NO_ANSWER]


def developer_family(row: dict, back_frameworks: set[str] = BACK_FRAMEWORKS) -> str | None:
    """Regla publicada para separar el bloque Developer por stack declarado."""
    langs = {t.lower() for t in items(row[COL_LANGS])}
    frameworks = {t.lower() for t in items(row[COL_FRAMEWORKS])}
    if frameworks & MOBILE_FRAMEWORKS or langs & MOBILE_LANGS:
        return "mobile"
    front = bool(frameworks & FRONT_FRAMEWORKS)
    back = bool(frameworks & back_frameworks or langs & BACK_LANGS)
    if front and back:
        return "fullstack"
    if front:
        return "frontend"
    if back:
        return "backend"
    return None


def pct(part: int, total: int) -> float:
    return round(100 * part / total, 1) if total else 0.0


def top(counter: Counter, total: int, n: int = 8) -> list[dict]:
    return [{"nombre": k, "porcentaje": pct(v, total)} for k, v in counter.most_common(n)]


def salary_stats(values: list[float]) -> dict | None:
    if len(values) < MIN_N:
        return None
    q = statistics.quantiles(values, n=4)
    return {"n": len(values), "p25": round(q[0], -3), "mediana": round(q[1], -3), "p75": round(q[2], -3)}


def profile(rows: list[dict]) -> dict:
    n = len(rows)
    full_time = [r for r in rows if r["dedicacion"] == "Full-Time" and r["_sal"]]
    salarios = {
        s: salary_stats([float(r["_sal"]) for r in full_time if r["seniority"] == s])
        for s in SENIORITIES
    }
    modalidad = Counter(r["modalidad_de_trabajo"] for r in rows)
    genero = Counter(r["genero"] for r in rows)
    provincias = Counter(r["donde_estas_trabajando"] for r in rows)
    seniority = Counter(r["seniority"] for r in rows)
    tecnologias = Counter(t for r in rows for t in items(r[COL_LANGS]))
    frameworks = Counter(t for r in rows for t in items(r[COL_FRAMEWORKS]))
    plataformas = Counter(t for r in rows for t in items(r[COL_PLATFORMS]))
    uso_ia = [int(r[COL_AI]) for r in rows if r[COL_AI].isdigit()]
    experiencia = [float(r["anos_de_experiencia"]) for r in rows if r["anos_de_experiencia"]]
    return {
        "respuestas": n,
        "salario_bruto_mensual_ars": salarios,
        "seniority": {s: pct(seniority[s], n) for s in SENIORITIES},
        "modalidad": {
            "remoto": pct(modalidad["100% remoto"], n),
            "hibrido": pct(modalidad["Híbrido (presencial y remoto)"], n),
            "presencial": pct(modalidad["100% presencial"], n),
        },
        "genero": {
            "hombres_cis": pct(genero["Hombre Cis"], n),
            "mujeres_cis": pct(genero["Mujer Cis"], n),
            "otras_identidades_o_sin_respuesta": pct(
                n - genero["Hombre Cis"] - genero["Mujer Cis"], n
            ),
        },
        "sueldo_dolarizado": pct(sum(r["sueldo_dolarizado"] == "TRUE" for r in rows), n),
        "anios_experiencia_mediana": statistics.median(experiencia) if experiencia else None,
        "uso_ia_promedio_0a5": round(statistics.mean(uso_ia), 1) if uso_ia else None,
        "provincias": top(provincias, n, 6),
        "tecnologias": top(tecnologias, n),
        "frameworks": top(frameworks, n),
        "plataformas": top(plataformas, n),
    }


def main() -> None:
    with open(RAW, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    by_family: dict[str, list[dict]] = {}
    dev_sin_stack = 0
    for r in rows:
        if r["trabajo_de"] == "Developer":
            fam = developer_family(r)
            if fam is None:
                dev_sin_stack += 1
                continue
        else:
            fam = ROLE_MAP.get(r["trabajo_de"])
            if fam is None:
                continue
        by_family.setdefault(fam, []).append(r)

    # Node.js es la señal más ambigua (mucha gente de frontend lo usa como herramienta):
    # se publica cuánto cambia el reparto si no se lo contara como backend.
    sin_node = Counter(
        developer_family(r, BACK_FRAMEWORKS - {"node.js"})
        for r in rows
        if r["trabajo_de"] == "Developer"
    )
    sensibilidad = (
        "Sensibilidad: si Node.js no contara como señal de backend, Frontend pasaría de "
        f"{len(by_family.get('frontend', []))} a {sin_node['frontend']} personas y Full Stack de "
        f"{len(by_family.get('fullstack', []))} a {sin_node['fullstack']}."
    )

    families = json.loads((CURATED / "role_families.json").read_text(encoding="utf-8"))
    profiles = {f["id"]: profile(by_family.get(f["id"], [])) for f in families}

    fuente = {
        "nombre": "Sysarmy - Encuesta de Sueldos IT Argentina 2025.1",
        "url": "https://sysarmy.com/blog/posts/resultados-de-la-encuesta-de-sueldos-2025-1/",
        "licencia": "CC BY-NC-SA 4.0",
        "muestra_total": len(rows),
    }
    regla_developer = (
        "Sysarmy no separa Backend/Frontend/Full Stack/Mobile. Se infiere por las tecnologías "
        "declaradas: Mobile si usa Flutter, React Native, SwiftUI, Ionic, Cordova, Swift, Dart u "
        "Objective-C; Full Stack si usa un framework de frontend (React, Angular, Vue, Next, Svelte) "
        "y además uno de backend o un lenguaje de servidor; Frontend o Backend si sólo aparece uno "
        "de los dos lados."
    )
    (CURATED / "role_profiles_sysarmy.json").write_text(
        json.dumps(
            {
                "descripcion": "Ficha por familia de rol calculada sobre las respuestas de Sysarmy 2025.1.",
                "fuente": fuente,
                "notas": [
                    "Salario: último salario mensual bruto en pesos, sólo personas Full-Time, "
                    "campo `_sal` ya depurado por Sysarmy. Valores nominales del relevamiento "
                    "(primer semestre 2025).",
                    f"No se publica una mediana con menos de {MIN_N} respuestas.",
                    "Tecnologías, frameworks y plataformas: % de personas de la familia que las usan.",
                    regla_developer,
                    sensibilidad,
                ],
                "perfiles": profiles,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    # Reparto por familia: se reescribe sólo `distribucion` y el bloque Developer.
    dist_path = CURATED / "role_distribution_sysarmy.json"
    dist = json.loads(dist_path.read_text(encoding="utf-8"))
    dev_total = sum(r["trabajo_de"] == "Developer" for r in rows)
    dev_con_stack = sum(len(by_family.get(f, [])) for f in DEVELOPER_FAMILIES)
    mapped_no_dev = sum(len(v) for k, v in by_family.items() if k not in DEVELOPER_FAMILIES)
    mapped_total = mapped_no_dev + dev_total
    distribucion = []
    for f in families:
        n = len(by_family.get(f["id"], []))
        if f["id"] in DEVELOPER_FAMILIES:
            # El bloque Developer completo es dato real; dentro se reparte según el stack.
            estimado = dev_total * n / dev_con_stack
            distribucion.append(
                {
                    "role_family_id": f["id"],
                    "respuestas_con_stack": n,
                    "porcentaje_estimado": pct(estimado, mapped_total),
                    "tipo_dato": "ESTIMACION_EDITORIAL",
                    "nota": "Reparto inferido por tecnologías dentro del bloque real 'Developer'. "
                    + regla_developer,
                }
            )
        else:
            distribucion.append(
                {
                    "role_family_id": f["id"],
                    "respuestas": n,
                    "porcentaje_estimado": pct(n, mapped_total),
                    "nota": "Dato directo de la encuesta.",
                }
            )
    distribucion.sort(key=lambda r: r["porcentaje_estimado"], reverse=True)
    dist["distribucion"] = distribucion
    dist["respuestas_mapeadas"] = mapped_total
    dist["bloque_developer"] = {
        "respuestas": dev_total,
        "porcentaje": pct(dev_total, mapped_total),
        "con_stack_identificable": dev_con_stack,
        "sin_stack_identificable": dev_sin_stack,
        "familias": list(DEVELOPER_FAMILIES),
        "tipo_dato": "COMUNITARIO_VERIFICABLE",
        "nota": "Total real del bloque 'Developer' de Sysarmy. El reparto entre las cuatro "
        "familias se infiere por stack; quienes no declaran tecnologías reconocibles se "
        "reparten en la misma proporción.",
    }
    dist_path.write_text(json.dumps(dist, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Fichas de {len(profiles)} familias. Developer: {dev_con_stack} con stack, {dev_sin_stack} sin.")


if __name__ == "__main__":
    main()
