# Fuentes y Metodología

Este documento es el espejo en Markdown de la página "Fuentes y Metodología" del sitio (`frontend/src/pages/Methodology.tsx`), para quien prefiera leerlo sin levantar la app.

## Qué es dato oficial y qué es estimación

- **Dato oficial**: la serie de empleo total registrado en el sector Software (OEDE, Ministerio de Trabajo) y los indicadores de salario, rotación y género (encuesta CESSI/OPSSI). Son números publicados por esas instituciones.
- **Estimación preliminar**: la distribución del empleo IT por familia de rol (Backend, Frontend, QA, etc.). No existe hoy una fuente pública que publique este desglose para Argentina — es el vacío que este proyecto busca llenar. Los porcentajes actuales (`backend/data/curated/role_distribution_estimate.json`) son un punto de partida editorial.

## Fuentes citadas

1. **OEDE (Observatorio de Empleo y Dinámica Empresarial), Ministerio de Trabajo** — serie de empleo registrado del sector Software 2015-2024, republicada y citada en el reporte de CESSI/OPSSI "Sector de Software y Servicios Informáticos de Argentina - Foco Talento" (julio 2025).
   - [PDF del reporte](https://cessi.org.ar/wp-content/uploads/2025/08/CESSI-OPSSI-Reporte-de-los-principales-indicadores-de-la-industria-del-Software-con-Foco-en-Talento_Julio-2025.pdf)
2. **CESSI/OPSSI (Observatorio Permanente de la Industria del Software y Servicios Informáticos)** — indicadores de salario promedio, rotación de personal y participación femenina, del mismo reporte.
3. **Estimación editorial propia** — distribución del empleo por familia de rol IT. No oficial.

## Limitaciones conocidas

- La serie de empleo es nacional; falta desagregación provincial.
- La taxonomía de 12 familias es intencionalmente simple para arrancar y se va a refinar con el uso real.
- El listado de nomenclaturas/alias por rol es una curación manual inicial, no exhaustiva.
- No se intentó todavía la descarga directa de la serie cruda de OEDE desde datos.gob.ar/datos.produccion.gob.ar (se usó el valor republicado y citado por OPSSI); queda como mejora futura para tener la fuente primaria sin intermediarios.

## Próximos pasos sugeridos

1. Reemplazar la estimación de distribución por rol con una fuente primaria (encuesta propia, acceso a datos de CESSI/OPSSI, o análisis de avisos de empleo).
2. Sumar desagregación provincial usando la serie completa de OEDE.
3. Cruzar con microdatos de la EPH (INDEC) para variables demográficas (género, edad, informalidad) del sector IT en general.
4. Usar la tabla de alias/nomenclaturas (`backend/data/curated/role_families.json`) como base para clasificar automáticamente títulos de avisos de empleo reales.
