import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RoleFamily } from "../api/client";
import { normalizar } from "../format";

interface Match {
  roleId: string;
  roleName: string;
  label: string;
}

/** Busca por nombre de puesto ("Dev Backend", "SRE") usando los alias de cada familia. */
export function RoleSearch({ roles }: { roles: RoleFamily[] }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const matches = useMemo<Match[]>(() => {
    const q = normalizar(query);
    if (q.length < 2) return [];
    const found: Match[] = [];
    for (const r of roles) {
      const labels = [r.nombre, ...r.aliases];
      const hit = labels.find((l) => normalizar(l).includes(q));
      if (hit) found.push({ roleId: r.id, roleName: r.nombre, label: hit });
    }
    return found.slice(0, 6);
  }, [query, roles]);

  return (
    <form
      className="role-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (matches[0]) navigate(`/roles/${matches[0].roleId}`);
      }}
    >
      <label htmlFor="role-search-input">Buscá tu puesto</label>
      <div className="role-search-box">
        <input
          id="role-search-input"
          type="search"
          autoComplete="off"
          placeholder="Ej.: Dev Backend, SRE, QA Automation, Diseñador UX"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </div>
      {query.length >= 2 && (
        <ul className="role-search-results">
          {matches.length === 0 && (
            <li className="empty">
              Todavía no tenemos ese nombre de puesto. <Link to="/roles">Ver los 12 roles</Link>
            </li>
          )}
          {matches.map((m) => (
            <li key={m.roleId}>
              <Link to={`/roles/${m.roleId}`}>
                <strong>{m.roleName}</strong>
                {m.label !== m.roleName && <span> · coincide con "{m.label}"</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
