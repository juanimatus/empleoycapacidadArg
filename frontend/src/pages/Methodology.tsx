import { useEffect, useState } from "react";
import { api, type DataSource } from "../api/client";
import { SourceCitation } from "../components/SourceCitation";

export function Methodology() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .sources()
      .then(setSources)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <section className="page-header">
        <h1>Fuentes y metodología</h1>
        <p className="lead">
          Este observatorio nace porque el observatorio de empleo oficial argentino actualiza pocas
          métricas y reduce todo el sector IT a "programador". Nuestro compromiso es ser igual de
          rigurosos que una fuente oficial: todo dato está citado, y distinguimos explícitamente
          tres niveles de confianza en los datos.
        </p>
      </section>

      <section className="panel">
        <h2>Tres niveles de dato</h2>
        <ul className="methodology-list">
          <li>
            <strong>Dato oficial:</strong> la serie de empleo total registrado (OEDE, Ministerio de
            Trabajo/Producción), tanto nacional como por provincia, y los indicadores de salario,
            rotación y género (encuesta CESSI/OPSSI). Publicados directamente por esas instituciones
            o descargados de sus portales de datos abiertos.
          </li>
          <li>
            <strong>Encuesta comunitaria:</strong> la distribución del empleo por familia de rol se
            calcula a partir de la Encuesta de Sueldos IT 2025.1 de Sysarmy (5.196 respuestas
            reales, no una muestra oficial pero sí el relevamiento abierto más grande que existe hoy
            sobre roles IT en Argentina). No es un censo ni tiene el rigor muestral de una encuesta
            del INDEC, así que la tratamos como un nivel de confianza intermedio: mejor que una
            estimación editorial, peor que un dato oficial.
          </li>
          <li>
            <strong>Estimación por tecnologías:</strong> Sysarmy agrupa Backend, Frontend, Full
            Stack y Mobile en una sola categoría, "Developer". El total de ese bloque es dato real
            de la encuesta; el reparto interno se infiere con una regla pública sobre las
            tecnologías que declara cada persona (abajo), y se marca en naranja en todo el sitio.
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Cómo se separa el bloque Developer</h2>
        <ol className="methodology-list">
          <li>
            <strong>Mobile</strong> si usa Flutter, React Native, SwiftUI, Ionic o Cordova, o los
            lenguajes Swift, Dart u Objective-C.
          </li>
          <li>
            <strong>Full Stack</strong> si usa un framework de frontend (React, Angular, Vue,
            Next.js o Svelte) y además un framework de backend (Node.js, Spring, .NET, Laravel,
            Django, Flask, FastAPI, Rails, etc.) o un lenguaje de servidor (Java, C#, Go, PHP,
            Python, Ruby, etc.).
          </li>
          <li>
            <strong>Frontend</strong> o <strong>Backend</strong> si sólo aparece uno de los dos
            lados.
          </li>
          <li>
            Quien no declara ninguna tecnología reconocible (100 de 1.776 personas) se reparte en la
            misma proporción que el resto.
          </li>
        </ol>
        <p className="note">
          El punto más discutible es Node.js: mucha gente de frontend lo usa como herramienta. Si no
          se lo contara como señal de backend, Frontend pasaría de 124 a 288 personas y Full Stack
          de 713 a 549. El cálculo completo está en{" "}
          <code>backend/app/ingestion/sysarmy_profiles.py</code>.
        </p>
      </section>

      <section className="panel">
        <h2>Fuentes citadas</h2>
        {error && <p className="error-box">No se pudieron cargar los datos ({error}).</p>}
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
      </section>

      <section className="panel">
        <h2>Limitaciones conocidas</h2>
        <ul className="methodology-list">
          <li>
            La serie nacional de empleo (2015-2024) y la serie provincial (hasta nov-2023, sector
            privado) tienen coberturas ligeramente distintas — se muestran por separado en vez de
            mezclarlas para no aparentar más precisión de la que hay.
          </li>
          <li>
            Las fichas por rol (salario, modalidad, género, tecnologías) salen de la misma encuesta:
            sirven para comparar roles entre sí, no para medir el total del país. No se publica una
            mediana de salario con menos de 10 respuestas.
          </li>
          <li>
            La distribución de roles por Sysarmy solo pudo mapearse para el 80,1% de las respuestas
            (4.161 de 5.196); el resto correspondía a categorías sin equivalente claro en nuestra
            taxonomía (Technical Leader, Architect, Business Analyst, Networking, etc.) y se excluyó
            en vez de forzar un mapeo dudoso.
          </li>
          <li>
            La taxonomía de 12 familias es intencionalmente simple para arrancar y se va a refinar
            con el uso real.
          </li>
          <li>
            El listado de nomenclaturas/alias por rol es una curación manual inicial, no exhaustiva.
          </li>
        </ul>
      </section>
    </div>
  );
}
