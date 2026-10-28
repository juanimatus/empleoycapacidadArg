import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Clasificador, type RoleFamily } from "../api/client";
import { CodeChip } from "../components/RoleGroups";

export function Classifier() {
  const [coit, setCoit] = useState<Clasificador | null>(null);
  const [roles, setRoles] = useState<RoleFamily[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.clasificador(), api.roles()])
      .then(([c, r]) => {
        setCoit(c);
        setRoles(r);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="error-box">No se pudieron cargar los datos ({error}).</div>;
  }
  if (!coit) {
    return <p className="loading">Cargando datos...</p>;
  }

  const nombre = (id: string) => roles.find((r) => r.id === id)?.nombre ?? id;

  return (
    <div className="page">
      <section className="page-header">
        <p className="eyebrow">Versión {coit.version} · clasificador propio, no oficial</p>
        <h1>Clasificador COIT-AR</h1>
        <p className="lead">
          Un código para cada trabajo IT: el primer dígito es el área, dos dígitos la familia de rol
          y cuatro la ocupación.
        </p>
        <p>
          Este clasificador se está ampliando a todos los rubros: las ocupaciones IT ya tienen su
          código en el <Link to="/ocupaciones">clasificador de ocupaciones (COA)</Link>.
        </p>
      </section>

      <ol className="coit-tree">
        {coit.grupos.map((g) => (
          <li key={g.codigo} className="coit-group">
            <h2>
              <CodeChip codigo={g.codigo} /> {g.nombre}
            </h2>
            <p className="panel-sub">{g.descripcion}</p>
            <ol className="coit-families">
              {g.familias.map((f) => (
                <li key={f.codigo}>
                  <h3>
                    <CodeChip codigo={f.codigo} />{" "}
                    <Link to={`/roles/${f.role_family_id}`}>{nombre(f.role_family_id)}</Link>
                  </h3>
                  {f.ocupaciones.length > 1 && (
                    <ol className="coit-occupations">
                      {f.ocupaciones.map((o) => (
                        <li key={o.codigo}>
                          <CodeChip codigo={o.codigo} /> {o.nombre}
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <details className="disclosure">
        <summary>Por qué un clasificador propio</summary>
        <div className="disclosure-body">
          <p>{coit.descripcion}</p>
          <ul>
            {coit.notas.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </details>

      <details className="disclosure">
        <summary>Tabla completa con equivalencia CIUO-08</summary>
        <div className="disclosure-body table-scroll">
          <table className="province-table">
            <caption className="visually-hidden">
              Ocupaciones COIT-AR con su código CIUO-08 aproximado
            </caption>
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Ocupación</th>
                <th scope="col">CIUO-08</th>
              </tr>
            </thead>
            <tbody>
              {coit.grupos.flatMap((g) =>
                g.familias.flatMap((f) =>
                  f.ocupaciones.map((o) => (
                    <tr key={o.codigo}>
                      <td>{o.codigo}</td>
                      <td>{o.nombre}</td>
                      <td>{o.ciuo08}</td>
                    </tr>
                  )),
                ),
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
