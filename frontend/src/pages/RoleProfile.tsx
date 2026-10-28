import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ESTIMACION_EDITORIAL, type RoleFamily, type Seniority } from "../api/client";
import { SalaryRange, ShareList, StackedBar } from "../components/Bars";
import { SourceCitation } from "../components/SourceCitation";
import { millones, porcentaje } from "../format";

const SENIORITIES: Seniority[] = ["Junior", "Semi-Senior", "Senior"];
const DEVELOPER = new Set(["backend", "frontend", "fullstack", "mobile"]);

export function RoleProfile() {
  const { id } = useParams();
  const [roles, setRoles] = useState<RoleFamily[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .roles()
      .then(setRoles)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="error-box">No se pudieron cargar los datos ({error}).</div>;
  }
  if (roles.length === 0) {
    return <p className="loading">Cargando datos...</p>;
  }

  const role = roles.find((r) => r.id === id);
  if (!role) {
    return (
      <div className="page">
        <p>
          No encontramos ese rol. <Link to="/roles">Ver los 12 roles</Link>
        </p>
      </div>
    );
  }

  const p = role.perfil;
  // Misma escala para todos los roles, así las barras se pueden comparar entre fichas.
  const maxSalario = Math.max(
    ...roles.flatMap((r) =>
      SENIORITIES.map((s) => r.perfil?.salario_bruto_mensual_ars[s]?.p75 ?? 0),
    ),
  );
  const senior = p?.salario_bruto_mensual_ars.Senior;
  const esEstimado = role.distribucion?.tipo === ESTIMACION_EDITORIAL;

  return (
    <div className="page">
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/roles">Roles</Link> <span aria-hidden="true">/</span> {role.nombre}
      </nav>

      <section className="page-header">
        <h1>{role.nombre}</h1>
        <p className="lead">{role.descripcion}</p>
      </section>

      {p && (
        <section className="stat-row" aria-label="Datos principales">
          <div className="stat">
            <span className="stat-value">{senior ? millones(senior.mediana) : "—"}</span>
            <span className="stat-label">Sueldo bruto mensual mediano, Senior</span>
          </div>
          <div className="stat">
            <span className="stat-value">{porcentaje(p.modalidad.remoto)}</span>
            <span className="stat-label">Trabaja 100% remoto</span>
          </div>
          <div className="stat">
            <span className="stat-value">{porcentaje(p.genero.mujeres_cis)}</span>
            <span className="stat-label">Mujeres cis</span>
          </div>
          {role.distribucion && (
            <div className="stat">
              <span className="stat-value">
                {porcentaje(role.distribucion.porcentaje_estimado)}
              </span>
              <span className="stat-label">
                Del empleo IT relevado{esEstimado && " (estimado por tecnologías)"}
              </span>
            </div>
          )}
        </section>
      )}

      {p && (
        <div className="profile-grid">
          <section className="panel span-2">
            <h2>Cuánto se gana</h2>
            <p className="panel-sub">
              Último sueldo bruto mensual, personas Full-Time. La barra va del 25% al 75% de las
              respuestas y la marca es la mediana.
            </p>
            <div className="salary-list">
              {SENIORITIES.map((s) => (
                <SalaryRange
                  key={s}
                  label={s}
                  stats={p.salario_bruto_mensual_ars[s]}
                  max={maxSalario}
                />
              ))}
            </div>
            <p className="note">
              Pesos nominales del primer semestre de 2025. {porcentaje(p.sueldo_dolarizado)} de las
              personas de este rol tiene el sueldo total o parcialmente en dólares.
            </p>
          </section>

          <section className="panel">
            <h2>Cómo trabaja</h2>
            <StackedBar
              title="Modalidad"
              parts={[
                { label: "Remoto", value: p.modalidad.remoto, tone: "a" },
                { label: "Híbrido", value: p.modalidad.hibrido, tone: "b" },
                { label: "Presencial", value: p.modalidad.presencial, tone: "c" },
              ]}
            />
            <StackedBar
              title="Seniority"
              parts={[
                { label: "Junior", value: p.seniority.Junior, tone: "c" },
                { label: "Semi-Senior", value: p.seniority["Semi-Senior"], tone: "b" },
                { label: "Senior", value: p.seniority.Senior, tone: "a" },
              ]}
            />
            <StackedBar
              title="Género"
              parts={[
                { label: "Hombres cis", value: p.genero.hombres_cis, tone: "c" },
                { label: "Mujeres cis", value: p.genero.mujeres_cis, tone: "a" },
                {
                  label: "Otras identidades o sin respuesta",
                  value: p.genero.otras_identidades_o_sin_respuesta,
                  tone: "b",
                },
              ]}
            />
            <dl className="facts">
              {p.anios_experiencia_mediana != null && (
                <div>
                  <dt>Años de experiencia (mediana)</dt>
                  <dd>{p.anios_experiencia_mediana}</dd>
                </div>
              )}
              {p.uso_ia_promedio_0a5 != null && (
                <div>
                  <dt>Uso de herramientas de IA (0 a 5)</dt>
                  <dd>{p.uso_ia_promedio_0a5.toLocaleString("es-AR")}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="panel">
            <h2>Dónde trabaja</h2>
            <p className="panel-sub">Provincia donde trabaja cada persona que respondió.</p>
            <ShareList items={p.provincias} limit={6} />
          </section>

          <section className="panel span-2">
            <h2>Con qué trabaja</h2>
            <p className="panel-sub">Porcentaje de personas del rol que usa cada tecnología.</p>
            <div className="tech-columns">
              {p.tecnologias.length > 0 && (
                <div>
                  <h3>Lenguajes y tecnologías</h3>
                  <ShareList items={p.tecnologias} />
                </div>
              )}
              {p.frameworks.length > 0 && (
                <div>
                  <h3>Frameworks y herramientas</h3>
                  <ShareList items={p.frameworks} />
                </div>
              )}
              {p.plataformas.length > 0 && (
                <div>
                  <h3>Plataformas</h3>
                  <ShareList items={p.plataformas} />
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <section className="panel">
        <h2>Cómo se llama este puesto en los avisos</h2>
        <div className="alias-chips">
          {role.aliases.map((a) => (
            <span className="chip" key={a}>
              {a}
            </span>
          ))}
        </div>
      </section>

      <section className="sources-box">
        <h2>Fuente</h2>
        {role.distribucion && <SourceCitation fuente={role.distribucion.fuente} />}
        <p>
          {p
            ? `${p.respuestas.toLocaleString("es-AR")} respuestas de este rol`
            : "Sin datos de encuesta"}{" "}
          sobre 5.196 de la encuesta. Es una encuesta abierta, no una muestra oficial: sirve para
          comparar roles, no para medir el total del país.
        </p>
        {DEVELOPER.has(role.id) && (
          <p>
            Sysarmy agrupa Backend, Frontend, Full Stack y Mobile como "Developer". Acá se separan
            según las tecnologías que declara cada persona.{" "}
            <Link to="/metodologia">Ver la regla</Link>.
          </p>
        )}
      </section>
    </div>
  );
}
