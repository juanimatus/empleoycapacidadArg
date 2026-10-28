import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Coa, type CoaOcupacion } from "../api/client";
import { normalizar } from "../format";

function CoaChip({ codigo }: { codigo: string }) {
  return (
    <span className="code-chip">
      <span className="visually-hidden">Código COA </span>
      {codigo}
    </span>
  );
}

function todas(coa: Coa): CoaOcupacion[] {
  return coa.grandes_grupos.flatMap((g) =>
    g.subgrupos.flatMap((s) => s.familias.flatMap((f) => f.ocupaciones)),
  );
}

function Ocupacion({ o, rubros }: { o: CoaOcupacion; rubros: Map<string, string> }) {
  return (
    <li>
      <CoaChip codigo={o.codigo} />{" "}
      {o.role_family_id ? <Link to={`/roles/${o.role_family_id}`}>{o.nombre}</Link> : o.nombre}
      <span className="occupation-meta"> · {o.rubros.map((r) => rubros.get(r)).join(", ")}</span>
    </li>
  );
}

/** Clasificador COA: todas las ocupaciones, con buscador y filtro por rubro. */
export function Occupations() {
  const [coa, setCoa] = useState<Coa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [rubro, setRubro] = useState("");

  useEffect(() => {
    api
      .coa()
      .then(setCoa)
      .catch((e) => setError(e.message));
  }, []);

  const ocupaciones = useMemo(() => (coa ? todas(coa) : []), [coa]);
  const filtradas = useMemo(() => {
    const q = normalizar(query);
    return ocupaciones.filter(
      (o) =>
        (!rubro || o.rubros.includes(rubro)) &&
        (q.length < 2 || normalizar(o.nombre).includes(q) || o.codigo.startsWith(q)),
    );
  }, [ocupaciones, query, rubro]);

  if (error) {
    return <div className="error-box">No se pudieron cargar los datos ({error}).</div>;
  }
  if (!coa) {
    return <p className="loading">Cargando datos...</p>;
  }

  const rubros = new Map(coa.rubros.map((r) => [r.id, r.nombre]));
  const filtrando = rubro !== "" || normalizar(query).length >= 2;
  const cno = coa.cno2001;

  return (
    <div className="page">
      <section className="page-header">
        <p className="eyebrow">Versión {coa.version} · piloto, clasificador propio, no oficial</p>
        <h1>Clasificador de ocupaciones</h1>
        <p className="lead">
          Un código para cada trabajo del país. Los primeros cuatro dígitos son los de la
          clasificación internacional (CIUO-08); los dos últimos, la ocupación como se la conoce en
          Argentina.
        </p>
      </section>

      <form className="role-search occupation-filter" role="search" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="coa-buscar">Buscá una ocupación</label>
          <input
            id="coa-buscar"
            type="search"
            autoComplete="off"
            placeholder="Ej.: tractorista, enólogo, maquinista, backend"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="coa-rubro">Rubro</label>
          <select id="coa-rubro" value={rubro} onChange={(e) => setRubro(e.target.value)}>
            <option value="">Todos</option>
            {coa.rubros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
      </form>

      {filtrando ? (
        <section aria-live="polite">
          <h2 className="section-title">
            {filtradas.length === 1 ? "1 ocupación" : `${filtradas.length} ocupaciones`}
          </h2>
          {filtradas.length === 0 ? (
            <p>
              Todavía no cargamos esa ocupación. Esta versión piloto cubre IT, Agro, Vitivinicultura
              y Transporte ferroviario.
            </p>
          ) : (
            <ul className="occupation-list">
              {filtradas.map((o) => (
                <Ocupacion key={o.codigo} o={o} rubros={rubros} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <ol className="coit-tree">
          {coa.grandes_grupos.map((g) => {
            const n = g.subgrupos.reduce(
              (acc, s) => acc + s.familias.reduce((a, f) => a + f.ocupaciones.length, 0),
              0,
            );
            return (
              <li key={g.codigo}>
                <details className="disclosure">
                  <summary>
                    <span>
                      <CoaChip codigo={g.codigo} /> {g.nombre}
                      <span className="occupation-meta">
                        {" "}
                        · {n === 0 ? "sin ocupaciones cargadas" : n === 1 ? "1 ocupación" : `${n} ocupaciones`}
                      </span>
                    </span>
                  </summary>
                  <div className="disclosure-body">
                    <ol className="coit-families">
                      {g.subgrupos.map((s) => (
                        <li key={s.codigo}>
                          <h3>
                            <CoaChip codigo={s.codigo} /> {s.nombre}
                          </h3>
                          {s.familias.length > 0 && (
                            <ul className="coit-occupations">
                              {s.familias.flatMap((f) =>
                                f.ocupaciones.map((o) => (
                                  <Ocupacion key={o.codigo} o={o} rubros={rubros} />
                                )),
                              )}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      )}

      <h2 className="section-title">Más detalle</h2>

      <details className="disclosure">
        <summary>Equivalencias con CIUO-08 y CNO-2001 (INDEC)</summary>
        <div className="disclosure-body table-scroll">
          <p>
            El CNO-2001 es el clasificador que usa la Encuesta Permanente de Hogares. Su carácter
            ocupacional junta muchas ocupaciones: por eso varias filas comparten el mismo código.
          </p>
          <table className="province-table">
            <caption className="visually-hidden">
              Ocupaciones COA con su equivalencia CIUO-08 y CNO-2001
            </caption>
            <thead>
              <tr>
                <th scope="col">COA</th>
                <th scope="col">Ocupación</th>
                <th scope="col">CIUO-08</th>
                <th scope="col">CNO-2001: carácter</th>
                <th scope="col">Calificación habitual</th>
              </tr>
            </thead>
            <tbody>
              {(filtrando ? filtradas : ocupaciones).map((o) => (
                <tr key={o.codigo}>
                  <td>{o.codigo}</td>
                  <td>
                    {o.nombre}
                    {o.nota && <span className="occupation-meta"> · {o.nota}</span>}
                  </td>
                  <td>
                    {o.ciuo08}
                    {o.ciuo08_aproximado && " (aproximado)"}
                  </td>
                  <td>{o.cno2001.caracter.map((c) => `${c} ${cno.caracter[c]}`).join(" / ")}</td>
                  <td>{o.cno2001.calificacion.map((c) => cno.calificacion[c]).join(" o ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <details className="disclosure">
        <summary>Rubros y ramas de actividad</summary>
        <div className="disclosure-body table-scroll">
          <p>
            Los datos de empleo registrado (SIPA, CEP XXI) se publican por rama de actividad, no por
            ocupación. Cada rubro junta las ramas donde trabajan sus ocupaciones.
          </p>
          <table className="province-table">
            <caption className="visually-hidden">Ramas de actividad CIIU Rev. 4 de cada rubro</caption>
            <thead>
              <tr>
                <th scope="col">Rubro</th>
                <th scope="col">Rama (CIIU Rev. 4)</th>
                <th scope="col">Actividad</th>
              </tr>
            </thead>
            <tbody>
              {coa.rubros.flatMap((r) =>
                r.ramas.map((rama) => (
                  <tr key={`${r.id}-${rama.ciiu4}`}>
                    <td>{r.nombre}</td>
                    <td>{rama.ciiu4}</td>
                    <td>{rama.nombre}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>

      <details className="disclosure">
        <summary>Cómo está armado</summary>
        <div className="disclosure-body">
          <p>{coa.descripcion}</p>
          <ul>
            {coa.estructura.map((e) => (
              <li key={e.nivel}>
                {e.nivel}: {e.digitos} {e.digitos === 1 ? "dígito" : "dígitos"} (ej. {e.ejemplo}),{" "}
                {e.origen === "propio" ? "propio del observatorio" : `igual a ${e.origen}`}.
              </li>
            ))}
          </ul>
          <ul>
            {coa.notas.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p>Fuentes:</p>
          <ul>
            {coa.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.nombre}
                </a>
              </li>
            ))}
          </ul>
          <p>
            El clasificador IT anterior sigue disponible en <Link to="/clasificador">COIT-AR</Link>.
          </p>
        </div>
      </details>
    </div>
  );
}
