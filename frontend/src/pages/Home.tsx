import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type EmploymentSummary, type RoleFamily } from "../api/client";
import { RoleSearch } from "../components/RoleSearch";
import { millones, porcentaje } from "../format";

const TAREAS = [
  {
    titulo: "¿Cuánto se gana en mi rol?",
    texto:
      "Salario por seniority, modalidad de trabajo y tecnologías más usadas en cada uno de los 12 roles.",
    cta: "Ver los roles",
    to: "/roles",
  },
  {
    titulo: "¿Dónde está el trabajo IT?",
    texto: "Empleo IT registrado en cada provincia, con dato oficial del Ministerio de Trabajo.",
    cta: "Ver provincias",
    to: "/provincias",
  },
  {
    titulo: "¿Cómo viene el sector?",
    texto: "Evolución del empleo IT registrado desde 2015 y cómo se reparte entre roles.",
    cta: "Ver el panorama",
    to: "/mercado",
  },
  {
    titulo: "¿De dónde salen estos números?",
    texto: "Cada dato dice si es oficial, de encuesta o estimación. Acá está cómo se calcula todo.",
    cta: "Ver la metodología",
    to: "/metodologia",
  },
];

export function Home() {
  const [roles, setRoles] = useState<RoleFamily[]>([]);
  const [summary, setSummary] = useState<EmploymentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.roles(), api.employmentSummary()])
      .then(([r, s]) => {
        setRoles(r);
        setSummary(s);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <section className="home-hero">
        <p className="eyebrow">Observatorio independiente de empleo IT · Argentina</p>
        <h1>El trabajo IT en Argentina, rol por rol</h1>
        <p className="lead">
          No todo el sector es "programador". Mirá cuánto se gana, cómo se trabaja y dónde está el
          empleo en Backend, Data, DevOps, QA, Seguridad, UX y otros 6 roles.
        </p>
        <RoleSearch roles={roles} />
        {summary && (
          <ul className="hero-facts">
            <li>
              <strong>{summary.empleos_registrados_ultimo_anio.toLocaleString("es-AR")}</strong>{" "}
              empleos IT registrados en {summary.ultimo_anio}
            </li>
            {summary.variacion_interanual_pct != null && (
              <li>
                <strong>+{porcentaje(summary.variacion_interanual_pct)}</strong> contra el año
                anterior
              </li>
            )}
            <li>
              <strong>{summary.cantidad_familias_rol}</strong> familias de rol
            </li>
          </ul>
        )}
      </section>

      {error && <div className="error-box">No se pudieron cargar los datos ({error}).</div>}

      <section aria-labelledby="tareas-titulo">
        <h2 id="tareas-titulo" className="section-title">
          ¿Qué querés saber?
        </h2>
        <div className="task-grid">
          {TAREAS.map((t) => (
            <Link key={t.to} to={t.to} className="task-card">
              <h3>{t.titulo}</h3>
              <p>{t.texto}</p>
              <span className="task-cta">{t.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      {roles.length > 0 && (
        <section aria-labelledby="roles-titulo">
          <h2 id="roles-titulo" className="section-title">
            Los 12 roles
          </h2>
          <RoleCards roles={roles} />
        </section>
      )}
    </div>
  );
}

export function RoleCards({ roles }: { roles: RoleFamily[] }) {
  return (
    <div className="role-grid">
      {roles.map((r) => {
        const senior = r.perfil?.salario_bruto_mensual_ars.Senior;
        return (
          <Link key={r.id} to={`/roles/${r.id}`} className="role-card">
            <h3>{r.nombre}</h3>
            <dl>
              {r.distribucion && (
                <div>
                  <dt>Empleo IT</dt>
                  <dd>{porcentaje(r.distribucion.porcentaje_estimado)}</dd>
                </div>
              )}
              {senior && (
                <div>
                  <dt>Senior</dt>
                  <dd>{millones(senior.mediana)}</dd>
                </div>
              )}
              {r.perfil && (
                <div>
                  <dt>Remoto</dt>
                  <dd>{porcentaje(r.perfil.modalidad.remoto)}</dd>
                </div>
              )}
            </dl>
          </Link>
        );
      })}
    </div>
  );
}
