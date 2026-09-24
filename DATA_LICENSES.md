# Licencias y atribución de datos

El código (LICENSE) es MIT. Los datos en `backend/data/curated/` derivan de fuentes de terceros con sus propios términos:

| Archivo | Fuente | Términos |
|---|---|---|
| `oede_software_employment_national.json`, `sector_kpis.json` | OEDE (Ministerio de Trabajo) y CESSI/OPSSI, reporte "Foco Talento" jul-2025 | Datos públicos citados con su fuente. Verificar términos de reutilización de CESSI/OPSSI antes de uso comercial. |
| `oede_employment_by_province.json` | OEDE / [datos.produccion.gob.ar](https://datos.produccion.gob.ar) | Datos abiertos del Estado argentino. |
| `role_distribution_sysarmy.json` | [Sysarmy — Encuesta de Sueldos IT 2025.1](https://sysarmy.com/blog/posts/resultados-de-la-encuesta-de-sueldos-2025-1/) | **CC BY-NC-SA 4.0**: atribución, uso no comercial, y derivados bajo la misma licencia. |
| `role_families.json` | Curación propia (taxonomía y alias) | Igual que el código (MIT). |

## Implicancia importante

Como `role_distribution_sysarmy.json` es un derivado de una obra CC BY-NC-SA 4.0, **ese archivo y sus derivados heredan NC-SA**: no pueden usarse comercialmente y deben compartirse bajo la misma licencia. Si el proyecto pasara a tener fines de lucro, habría que reemplazar esa fuente.

Los CSV/PDF originales no se versionan (ver `.gitignore`); las URLs de descarga están en cada JSON curado y en `docs/METODOLOGIA.md`.
