import { Link } from "react-router-dom";
import type { CoitGrupo, RoleFamily } from "../api/client";
import { millones } from "../format";

/** Agrupa los roles por gran grupo COIT-AR, respetando el orden por código. */
function groupRoles(roles: RoleFamily[]): { grupo: CoitGrupo; roles: RoleFamily[] }[] {
  const grupos = new Map<string, { grupo: CoitGrupo; roles: RoleFamily[] }>();
  for (const r of [...roles].sort((a, b) => (a.codigo ?? "99").localeCompare(b.codigo ?? "99"))) {
    const grupo = r.grupo ?? { codigo: "9", nombre: "Otros" };
    if (!grupos.has(grupo.codigo)) grupos.set(grupo.codigo, { grupo, roles: [] });
    grupos.get(grupo.codigo)!.roles.push(r);
  }
  return [...grupos.values()];
}

export function CodeChip({ codigo }: { codigo: string | null }) {
  if (!codigo) return null;
  return (
    <span className="code-chip">
      <span className="visually-hidden">Código COIT-AR </span>
      {codigo}
    </span>
  );
}

/** Versión corta para la home: cada gran grupo con sus roles como enlaces. */
export function RoleGroupList({ roles }: { roles: RoleFamily[] }) {
  return (
    <ul className="group-list">
      {groupRoles(roles).map(({ grupo, roles }) => (
        <li key={grupo.codigo}>
          <h3>
            <CodeChip codigo={grupo.codigo} /> {grupo.nombre}
          </h3>
          <ul className="group-roles">
            {roles.map((r) => (
              <li key={r.id}>
                <Link to={`/roles/${r.id}`}>{r.nombre}</Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Tarjetas por gran grupo: nombre, código y un único dato (sueldo Senior). */
export function RoleCardsByGroup({ roles }: { roles: RoleFamily[] }) {
  return (
    <>
      {groupRoles(roles).map(({ grupo, roles }) => (
        <section
          key={grupo.codigo}
          className="role-group"
          aria-labelledby={`grupo-${grupo.codigo}`}
        >
          <h2 id={`grupo-${grupo.codigo}`} className="section-title">
            <CodeChip codigo={grupo.codigo} /> {grupo.nombre}
          </h2>
          <ul className="role-grid">
            {roles.map((r) => {
              const senior = r.perfil?.salario_bruto_mensual_ars.Senior;
              return (
                <li key={r.id}>
                  <Link to={`/roles/${r.id}`} className="role-card">
                    <CodeChip codigo={r.codigo} />
                    <h3>{r.nombre}</h3>
                    {senior && (
                      <p className="role-card-fact">
                        Senior: <strong>{millones(senior.mediana)}</strong> por mes
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
