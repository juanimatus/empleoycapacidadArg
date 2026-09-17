# Observatorio de Empleo IT Argentina (MVP)

Sitio que segmenta el empleo IT en Argentina por familias de rol reales (Backend, Frontend, Data, DevOps, QA, Seguridad, UX/UI, etc.), en lugar de tratar a todo el sector como "programador". Inspirado en [jobsandskills.gov.au](https://www.jobsandskills.gov.au/), acotado a Argentina y con foco inicial en IT.

## Por qué existe

El observatorio de empleo oficial argentino actualiza pocas métricas y no distingue roles dentro de IT. Este proyecto combina datos oficiales (OEDE, Ministerio de Trabajo, vía CESSI/OPSSI) con una taxonomía de roles y sus nomenclaturas/alias reales, para poder segmentar el empleo IT de forma más útil — y ser honesto sobre qué es dato oficial y qué es estimación editorial (ver [Fuentes y Metodología](frontend/src/pages/Methodology.tsx) en el sitio).

## Estructura

- `backend/` — API FastAPI + SQLite. Modelos, datos curados (`data/curated/`) y script de seed.
- `frontend/` — Dashboard en React + TypeScript (Vite): Dashboard, Explorador de Roles, Por Provincia, Fuentes y Metodología.
- `docs/` — documentación adicional.

## Diseño

Estética "Brutalist Grid" adaptada a un observatorio de datos: grillas con líneas finas, tipografía mono (JetBrains Mono) para números y kickers, Space Grotesk para títulos, sin sombras ni bordes redondeados. Elegida a propósito por la afinidad temática con el proyecto — honestidad sobre los números, cero maquillaje — y no por moda visual. Componentes reutilizables en `frontend/src/components/`: `Reveal` (scroll-reveal), `CountUp` (contadores animados), `Marquee` (ticker de roles), `ScrollProgress`.

## Cómo correrlo

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate  # o source .venv/bin/activate en Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload
```

La API queda en `http://127.0.0.1:8000` (Swagger en `/docs`). Al arrancar siembra automáticamente la base SQLite con los datos curados.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El dashboard queda en `http://localhost:5173`.

## Estado del MVP

- ✅ Taxonomía de 12 familias de rol IT con nomenclaturas/alias curadas.
- ✅ Serie de empleo IT registrado 2015-2024, nacional (dato oficial, OEDE vía CESSI/OPSSI).
- ✅ Empleo IT por provincia (dato oficial, OEDE / datos.produccion.gob.ar, sector privado, nov-2023).
- ✅ Indicadores sectoriales (salario, rotación, participación femenina).
- ✅ Distribución de empleo por familia de rol: calculada sobre la **encuesta comunitaria Sysarmy 2025.1** (5.196 respuestas reales, licencia CC BY-NC-SA 4.0) — un nivel de confianza intermedio entre dato oficial y estimación editorial, explícitamente marcado como tal en toda la app. Dentro del bloque "Developer" el reparto Backend/Frontend/Full Stack/Mobile sigue siendo estimación editorial (Sysarmy no lo desagrega).
- ⏳ Pendiente: cruce con INDEC EPH, clasificador automático de avisos de empleo usando la tabla de alias como base, evaluar acceso a datos primarios de CESSI/OPSSI para reemplazar Sysarmy como fuente de distribución de roles.
