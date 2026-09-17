import { useEffect, useState } from "react";
import { api, type DataSource } from "../api/client";
import { Reveal } from "../components/Reveal";
import { SourceCitation } from "../components/SourceCitation";

export function Methodology() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.sources().then(setSources).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <section className="hero">
        <span className="hero-kicker">04 · Transparencia</span>
        <h1>Fuentes y Metodología</h1>
        <p>
          Este observatorio nace porque el observatorio de empleo oficial argentino actualiza
          pocas métricas y reduce todo el sector IT a "programador". Nuestro compromiso es ser
          igual de rigurosos que una fuente oficial: todo dato está citado, y distinguimos
          explícitamente tres niveles de confianza en los datos.
        </p>
      </section>

      <Reveal className="panel">
        <h2>Tres niveles de dato</h2>
        <ul className="methodology-list">
          <li>
            <strong>Dato oficial:</strong> la serie de empleo total registrado (OEDE, Ministerio
            de Trabajo/Producción), tanto nacional como por provincia, y los indicadores de
            salario, rotación y género (encuesta CESSI/OPSSI). Publicados directamente por esas
            instituciones o descargados de sus portales de datos abiertos.
          </li>
          <li>
            <strong>Encuesta comunitaria:</strong> la distribución del empleo por familia de rol
            se calcula a partir de la Encuesta de Sueldos IT 2025.1 de Sysarmy (5.196 respuestas
            reales, no una muestra oficial pero sí el relevamiento abierto más grande que existe
            hoy sobre roles IT en Argentina). No es un censo ni tiene el rigor muestral de una
            encuesta del INDEC, así que la tratamos como un nivel de confianza intermedio: mejor
            que una estimación editorial, peor que un dato oficial.
          </li>
          <li>
            <strong>Estimación editorial:</strong> cuando ni el dato oficial ni la encuesta
            comunitaria alcanzan la granularidad necesaria (por ejemplo, Sysarmy agrupa Backend,
            Frontend, Full Stack y Mobile bajo una única categoría "Developer"), repartimos ese
            bloque entre nuestras sub-familias con un criterio editorial explícito, marcado como
            tal en cada dato.
          </li>
        </ul>
      </Reveal>

      <Reveal className="panel" delay={100}>
        <h2>Fuentes citadas</h2>
        {error && <p className="error-box">No se pudo conectar con la API ({error}).</p>}
        <div className="source-list">
          {sources.map((s) => (
            <div key={s.id} className="source-card">
              <SourceCitation fuente={s} />
              <p>{s.descripcion}</p>
            </div>
          ))}
        </div>
        <p className="panel-sub" style={{ marginTop: 16 }}>
          Los datos de Sysarmy se usan bajo licencia Creative Commons
          Atribución-NoComercial-CompartirIgual 4.0 (CC BY-NC-SA 4.0): este proyecto, mientras sea
          sin fines de lucro, puede reutilizarlos citando la fuente.
        </p>
      </Reveal>

      <Reveal className="panel" delay={200}>
        <h2>Limitaciones conocidas</h2>
        <ul className="methodology-list">
          <li>
            La serie nacional de empleo (2015-2024) y la serie provincial (hasta nov-2023, sector
            privado) tienen coberturas ligeramente distintas — se muestran por separado en vez de
            mezclarlas para no aparentar más precisión de la que hay.
          </li>
          <li>
            La distribución de roles por Sysarmy solo pudo mapearse para el 80,1% de las
            respuestas (4.161 de 5.196); el resto correspondía a categorías sin equivalente claro
            en nuestra taxonomía (Technical Leader, Architect, Business Analyst, Networking, etc.)
            y se excluyó en vez de forzar un mapeo dudoso.
          </li>
          <li>
            La taxonomía de 12 familias es intencionalmente simple para arrancar y se va a refinar
            con el uso real.
          </li>
          <li>
            El listado de nomenclaturas/alias por rol es una curación manual inicial, no exhaustiva.
          </li>
        </ul>
      </Reveal>
    </div>
  );
}
