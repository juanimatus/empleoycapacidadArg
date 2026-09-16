import { useEffect, useState } from "react";
import { api, type RoleFamily } from "../api/client";
import { SourceCitation } from "../components/SourceCitation";

export function RoleExplorer() {
  const [roles, setRoles] = useState<RoleFamily[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .roles()
      .then((r) => {
        setRoles(r);
        if (r.length > 0) setSelected(r[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="error-box">No se pudo conectar con la API del backend ({error}).</div>;
  }

  const active = roles.find((r) => r.id === selected);

  return (
    <div className="page">
      <section className="hero">
        <h1>Explorador de Roles IT</h1>
        <p>
          Cada familia agrupa decenas de nombres de puesto reales (nomenclaturas) usados en
          avisos de empleo argentinos, para poder segmentar el mercado más allá de "programador".
        </p>
      </section>

      <div className="explorer-layout">
        <ul className="role-list">
          {roles.map((r) => (
            <li key={r.id}>
              <button
                className={r.id === selected ? "role-list-item active" : "role-list-item"}
                onClick={() => setSelected(r.id)}
              >
                <span>{r.nombre}</span>
                {r.distribucion && <span className="role-pct">{r.distribucion.porcentaje_estimado}%</span>}
              </button>
            </li>
          ))}
        </ul>

        {active && (
          <div className="panel role-detail">
            <h2>{active.nombre}</h2>
            <p>{active.descripcion}</p>
            {active.distribucion && (
              <>
                <p className="panel-sub">
                  Participación estimada: <strong>{active.distribucion.porcentaje_estimado}%</strong>
                </p>
                <SourceCitation fuente={active.distribucion.fuente} />
                {active.distribucion.nota && (
                  <p className="panel-sub">{active.distribucion.nota}</p>
                )}
              </>
            )}
            <h3>Nomenclaturas / alias mapeados a esta familia</h3>
            <div className="alias-chips">
              {active.aliases.map((a) => (
                <span className="chip" key={a}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
