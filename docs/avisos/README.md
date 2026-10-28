# Índice de avisos IT: recolección diaria con n8n

Este flujo junta todos los días los avisos publicados en [Get on Board](https://www.getonbrd.com) que están abiertos a Argentina, los clasifica en las 12 familias de rol del observatorio y los guarda en una planilla de Google Sheets. Todavía no se muestra en el sitio: la idea es acumular historia (3 a 6 meses) antes de publicar una serie.

Archivo para importar: [`n8n-avisos-getonbrd.json`](n8n-avisos-getonbrd.json)

## Qué hace cada nodo

| Nodo | Qué hace |
| --- | --- |
| Todos los días 7:00 | Dispara el flujo una vez por día (hora de Mendoza). |
| Bajar taxonomía | Trae `role_families.json` desde la rama `main` del repo. Si agregás alias en el repo, el flujo los usa al día siguiente. |
| Taxonomía | Junta las 12 familias en un solo ítem. |
| Categorías Get on Board | Lista las categorías públicas (programación, data, diseño, etc.). |
| Una fila por categoría | Separa la lista en un ítem por categoría. |
| Avisos por categoría | Pide los avisos de cada categoría, 100 por página, hasta 10 páginas, con 1 segundo entre pedidos. |
| Un ítem por aviso | Separa la respuesta en un ítem por aviso. |
| Filtrar Argentina y clasificar | Descarta los avisos que no incluyen Argentina y asigna la familia de rol por el título (primero alias exactos, después palabras clave). |
| Guardar en Google Sheets | Agrega o actualiza la fila usando la columna `id`, así un aviso que sigue publicado no se duplica. |

## Cómo instalarlo (una sola vez)

1. **Crear la planilla.** En Google Sheets, planilla nueva, renombrar la pestaña a `avisos` y pegar en la fila 1 estos encabezados, uno por columna:
   `id, fecha_relevamiento, publicado, titulo, familia_rol, metodo_clasificacion, categoria_getonbrd, paises, remoto, modalidad_remota, seniority_id, salario_min_usd, salario_max_usd, url`
2. **Copiar el ID de la planilla.** Es la parte de la URL entre `/d/` y `/edit`.
3. **Importar el flujo.** En n8n: menú de arriba a la derecha (los tres puntos) → **Import from File** → elegir `n8n-avisos-getonbrd.json`.
4. **Configurar Google Sheets.** Abrir el nodo **Guardar en Google Sheets**:
   - **Credential to connect with**: elegir tu credencial de Google Sheets (o crear una con OAuth2).
   - **Document** → **By ID**: pegar el ID del paso 2 en lugar de `PEGAR_ID_DE_LA_PLANILLA`.
   - **Sheet**: `avisos`.
   - **Mapping Column Mode**: *Map Automatically*; **Column to match on**: `id`.
5. **Probar.** Botón **Test workflow**. Revisá que el nodo **Avisos por categoría** traiga datos y que la planilla se llene.
6. **Activar.** Interruptor **Active** arriba a la derecha.

## Qué revisar en la primera corrida

El flujo no se pudo probar contra la API real desde donde se armó, así que en la primera ejecución fijate en esto:

- **Paginación.** El nodo **Avisos por categoría** pide `page=1, 2, 3…` hasta que una página venga vacía. Si ves avisos repetidos o se corta en la primera página, avisame y lo ajusto.
- **Países.** El filtro busca la palabra "Argentina" en el campo `countries` del aviso. Si la planilla queda vacía, abrí la salida de **Un ítem por aviso** y mirá cómo viene ese campo; capaz que haya que leer `location_countries` en su lugar.
- **Fechas.** `publicado` asume que `published_at` viene en segundos desde 1970 (formato Unix). Si ves fechas de 1970 o del año 50000, avisame.
- **Salarios.** Get on Board publica rangos mensuales en dólares cuando la empresa los informa; muchos avisos vienen vacíos.

## Costos y límites

- **Ejecuciones:** una por día, unas 30 por mes. Entra en cualquier plan de n8n Cloud y no cuesta nada si usás n8n en tu propio servidor.
- **Pedidos a la API:** depende de cuántas categorías y páginas haya; con el tope de 10 páginas por categoría y 1 segundo entre pedidos, la corrida dura unos minutos. Get on Board no publica un límite de pedidos para la API pública: no bajes el intervalo de 1 segundo.
- **Google Sheets:** aguanta bien unas decenas de miles de filas. Si en un año pasa de 50.000, conviene mover los datos a Supabase.

## Cómo se usa después

- La columna `metodo_clasificacion` dice cómo se clasificó cada aviso: `alias` (coincidencia exacta con la tabla del repo), `palabra_clave` (regla de respaldo) o `sin_clasificar`. Revisá los `sin_clasificar` cada tanto: si son roles IT, sumá ese título como alias en `backend/data/curated/role_families.json`.
- El sitio sólo va a mostrar **conteos agregados** por familia, mes y provincia, con link a Get on Board como fuente. No se republican los avisos.
- Próximo paso (todavía no hecho): un segundo flujo semanal que cuente los avisos por familia y mes y suba ese resumen al repo, para que el sitio lo muestre solo.
