import { useEffect, useState } from "react";
import { api, type DataSource } from "../api/client";
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
        <h1>Fuentes y Metodología</h1>
        <p>
          Este observatorio nace porque el observatorio de empleo oficial argentino actualiza
          pocas métricas y reduce todo el sector IT a "programador". Nuestro compromiso es ser
          igual de rigurosos que una fuente oficial: todo dato está citado, y todo lo que es
          estimación se marca explícitamente como tal.
        </p>
      </section>

      <div className="panel">
        <h2>¿Qué es dato oficial y qué es estimación?</h2>
        <ul className="methodology-list">
          <li>
            <strong>Dato oficial:</strong> la serie de empleo total registrado en el sector
            Software (OEDE, Ministerio de Trabajo) y los indicadores de salario, rotación y
            género (encuesta CESSI/OPSSI). Son números publicados por esas instituciones.
          </li>
          <li>
            <strong>Estimación preliminar:</strong> la distribución del empleo IT por familia de
            rol (Backend, Frontend, QA, etc.). No existe hoy una fuente pública que publique este
            desglose para Argentina — es precisamente el vacío que este proyecto busca llenar. Los
            porcentajes actuales son un punto de partida editorial, a reemplazar por una encuesta
            propia o un acuerdo de acceso a datos primarios.
          </li>
        </ul>
      </div>

      <div className="panel">
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
      </div>

      <div className="panel">
        <h2>Limitaciones conocidas</h2>
        <ul className="methodology-list">
          <li>La serie de empleo es nacional; todavía no hay desagregación por provincia en el MVP.</li>
          <li>
            La taxonomía de 12 familias es intencionalmente simple para arrancar y se va a refinar
            con el uso real (por ejemplo, separar Data Engineering de BI, o Frontend de Mobile Web).
          </li>
          <li>
            El listado de nomenclaturas/alias por rol es una curación manual inicial, no exhaustiva.
          </li>
        </ul>
      </div>
    </div>
  );
}
