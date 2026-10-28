import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type RoleFamily } from "../api/client";
import { LandscapeBackdrop } from "../components/LandscapeBackdrop";
import { RoleGroupList } from "../components/RoleGroups";
import { RoleSearch } from "../components/RoleSearch";

const TAREAS = [
  {
    titulo: "¿Cuánto se gana en mi rol?",
    texto: "Sueldo por seniority en cada rol.",
    to: "/roles",
  },
  {
    titulo: "¿Dónde está el trabajo IT?",
    texto: "Empleo registrado por provincia.",
    to: "/provincias",
  },
  {
    titulo: "¿Cuánta gente trabaja en IT?",
    texto: "Formal, informal y registrado.",
    to: "/mercado",
  },
];

export function Home() {
  const [roles, setRoles] = useState<RoleFamily[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .roles()
      .then(setRoles)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <LandscapeBackdrop>
        <h1>El trabajo IT en Argentina, rol por rol</h1>
        <p className="lead">Cuánto se gana, cómo se trabaja y dónde está el empleo.</p>
        <RoleSearch roles={roles} />
      </LandscapeBackdrop>

      {error && <div className="error-box">No se pudieron cargar los datos ({error}).</div>}

      <section aria-labelledby="tareas-titulo">
        <h2 id="tareas-titulo" className="section-title">
          ¿Qué querés saber?
        </h2>
        <ul className="task-grid">
          {TAREAS.map((t) => (
            <li key={t.to}>
              <Link to={t.to} className="task-card">
                <h3>{t.titulo}</h3>
                <p>{t.texto}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {roles.length > 0 && (
        <section aria-labelledby="roles-titulo">
          <h2 id="roles-titulo" className="section-title">
            Roles por área
          </h2>
          <RoleGroupList roles={roles} />
        </section>
      )}

      <p className="note">
        Cada dato dice si es oficial, de encuesta o estimado.{" "}
        <Link to="/metodologia">De dónde salen los números</Link>.
      </p>
    </div>
  );
}
