# Fuentes y Metodología

Este documento es el espejo en Markdown de la página "Fuentes y Metodología" del sitio (`frontend/src/pages/Methodology.tsx`), para quien prefiera leerlo sin levantar la app.

## Tres niveles de dato

- **Dato oficial**: la serie de empleo total registrado (nacional y por provincia, OEDE/Ministerio de Trabajo-Producción) y los indicadores de salario, rotación y género (encuesta CESSI/OPSSI). Publicados directamente por esas instituciones.
- **Encuesta comunitaria**: la distribución del empleo por familia de rol, calculada sobre la Encuesta de Sueldos IT 2025.1 de Sysarmy (`backend/data/curated/role_distribution_sysarmy.json`), 5.196 respuestas reales, licencia CC BY-NC-SA 4.0. No es un censo oficial, pero es el relevamiento abierto más grande disponible hoy sobre roles IT en Argentina — mejor que una estimación editorial, peor que un dato oficial.
- **Estimación por tecnologías**: dentro del bloque "Developer" de Sysarmy (no desagrega Backend/Frontend/Full Stack/Mobile), el reparto entre esas cuatro sub-familias se infiere por las tecnologías que declara cada persona. Mobile si usa Flutter, React Native, SwiftUI, Ionic, Cordova, Swift, Dart u Objective-C; Full Stack si usa un framework de frontend (React, Angular, Vue, Next.js, Svelte) y además uno de backend o un lenguaje de servidor; Frontend o Backend si sólo aparece un lado. Las 100 personas sin tecnologías reconocibles se reparten en la misma proporción. Sensibilidad: si Node.js no contara como backend, Frontend pasaría de 124 a 288 personas y Full Stack de 713 a 549. Código: `backend/app/ingestion/sysarmy_profiles.py`.

## Fuentes citadas

1. **OEDE (Observatorio de Empleo y Dinámica Empresarial), Ministerio de Trabajo** — serie de empleo registrado del sector Software 2015-2024, republicada y citada en el reporte de CESSI/OPSSI "Sector de Software y Servicios Informáticos de Argentina - Foco Talento" (julio 2025).
   - [PDF del reporte](https://cessi.org.ar/wp-content/uploads/2025/08/CESSI-OPSSI-Reporte-de-los-principales-indicadores-de-la-industria-del-Software-con-Foco-en-Talento_Julio-2025.pdf)
2. **CESSI/OPSSI (Observatorio Permanente de la Industria del Software y Servicios Informáticos)** — indicadores de salario promedio, rotación de personal y participación femenina, del mismo reporte.
3. **OEDE / datos.produccion.gob.ar** — empleo asalariado registrado por provincia, sector privado, CLAE2 62+63, hasta nov-2023.
   - [Dataset](https://datos.produccion.gob.ar/dataset/puestos-de-trabajo-registrados-por-provincia-y-sector-de-actividad) · [CSV directo](https://cdn.produccion.gob.ar/cdn-cep/datos-por-provincia/por-provincia-clae2/puestos/puestos_priv.csv)
4. **Sysarmy — Encuesta de Sueldos IT Argentina 2025.1** — distribución de empleo por rol, 5.196 respuestas, CC BY-NC-SA 4.0.
   - [Resultados](https://sysarmy.com/blog/posts/resultados-de-la-encuesta-de-sueldos-2025-1/) · [Dataset](https://docs.google.com/spreadsheets/d/1hlLwv9SLJvrnsTq_UsEAHkHGNiziH7IdT1lJd4fq6kU/edit)

## Limitaciones conocidas

- La serie nacional (2015-2024, "total empresas") y la provincial (hasta nov-2023, "sector privado") tienen coberturas ligeramente distintas; se muestran por separado en vez de mezclarlas.
- Sysarmy solo pudo mapearse para el 80,1% de las respuestas (4.161 de 5.196); el resto (Technical Leader, Architect, Business Analyst, Networking, Recruiter, etc.) no tiene equivalente claro en nuestra taxonomía y se excluyó en vez de forzar un mapeo dudoso. Ver `categorias_no_mapeadas` en el JSON curado.
- La taxonomía de 12 familias es intencionalmente simple para arrancar y se va a refinar con el uso real.
- El listado de nomenclaturas/alias por rol es una curación manual inicial, no exhaustiva.
- Los datos de Sysarmy son CC BY-NC-SA 4.0 (no comercial); si el proyecto pasara a tener fines de lucro, habría que reemplazar o renegociar el uso de esta fuente.

## Próximos pasos sugeridos

1. Evaluar contacto directo con CESSI/OPSSI o Sysarmy para acceso a microdatos más recientes o un desglose ya fino de "Developer".
2. Actualizar la serie provincial cuando el Ministerio publique datos más recientes que nov-2023.
3. Cruzar con microdatos de la EPH (INDEC) para variables demográficas (género, edad, informalidad) del sector IT en general.
4. Usar la tabla de alias/nomenclaturas (`backend/data/curated/role_families.json`) como base para clasificar automáticamente títulos de avisos de empleo reales.
