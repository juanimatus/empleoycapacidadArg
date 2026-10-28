import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  api,
  type ByRoleResponse,
  type EmploymentSnapshot,
  type EmploymentSummary,
  type EmploymentTotal,
} from "../api/client";
import { ShareList } from "../components/Bars";
import { DataTable } from "../components/DataTable";
import { EmploymentTimeseries } from "../components/EmploymentTimeseries";
import { RoleDistributionChart } from "../components/RoleDistributionChart";
import { millones, porcentaje } from "../format";

function miles(valor: number): string {
  return `${Math.round(valor / 1000).toLocaleString("es-AR")} mil`;
}

/** Con HashRouter un enlace "#total" cambiaría de página: se desplaza a mano. */
function irA(id: string) {
  return (e: MouseEvent) => {
    e.preventDefault();
    const destino = document.getElementById(id);
    destino?.scrollIntoView({ behavior: "smooth", block: "start" });
    destino?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };
}

export function Market() {
  const [summary, setSummary] = useState<EmploymentSummary | null>(null);
  const [timeseries, setTimeseries] = useState<EmploymentSnapshot[]>([]);
  const [byRole, setByRole] = useState<ByRoleResponse | null>(null);
  const [total, setTotal] = useState<EmploymentTotal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.employmentSummary(),
      api.employmentTimeseries(),
      api.employmentByRole(),
      api.employmentTotal(),
    ])
      .then(([s, t, r, e]) => {
        setSummary(s);
        setTimeseries(t);
        setByRole(r);
        setTotal(e);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="error-box">No se pudieron cargar los datos ({error}).</div>;
  }

  if (!summary || !byRole || !total) {
    return <p className="loading">Cargando datos...</p>;
  }

  const sw = total.universos.software;
  const sector = total.universos.sector_it;
  const informal = sw.informalidad.find((i) => i.nombre === "Informal")?.porcentaje ?? 0;
  const ingresos = sw.ingreso_mensual_ocupacion_principal;

  return (
    <div className="page">
      <section className="page-header">
        <h1>Panorama del sector</h1>
        <p className="lead">
          Hay tres formas de contar el trabajo IT. Cada una ve una parte distinta.
        </p>
      </section>

      <ul className="layer-grid" aria-label="Las tres capas de datos">
        <li>
          <a href="#total" className="layer-card" onClick={irA("total")}>
            <span className="layer-badge layer-oficial">Oficial · total</span>
            <strong>{miles(sw.personas)}</strong>
            <span>personas trabajan haciendo software, con o sin registro</span>
          </a>
        </li>
        <li>
          <a href="#registrado" className="layer-card" onClick={irA("registrado")}>
            <span className="layer-badge layer-oficial">Oficial · registrado</span>
            <strong>{miles(summary.empleos_registrados_ultimo_anio)}</strong>
            <span>empleos registrados en empresas de software ({summary.ultimo_anio})</span>
          </a>
        </li>
        <li>
          <a href="#complementario" className="layer-card" onClick={irA("complementario")}>
            <span className="layer-badge layer-comunitario">Complementario</span>
            <strong>5.196</strong>
            <span>respuestas de la encuesta Sysarmy, para sueldos y roles</span>
          </a>
        </li>
      </ul>

      <section id="total" className="layer-section" aria-labelledby="total-titulo">
        <h2 id="total-titulo" className="section-title" tabIndex={-1}>
          Empleo total, con informales
        </h2>
        <p className="lead">
          Según la encuesta de hogares del INDEC, {porcentaje(informal)} de quienes hacen software
          trabaja en la informalidad, y {porcentaje(100 - sw.rama_it)} lo hace fuera de empresas de
          software: en el Estado, bancos o telecomunicaciones.
        </p>
        <section className="stat-row" aria-label="Datos principales">
          <div className="stat">
            <span className="stat-value">{porcentaje(informal)}</span>
            <span className="stat-label">Trabaja en la informalidad</span>
          </div>
          <div className="stat">
            <span className="stat-value">{porcentaje(sw.fuera_del_sipa_privado)}</span>
            <span className="stat-label">No aparece en el registro de empleo privado (SIPA)</span>
          </div>
        </section>

        <details className="disclosure">
          <summary>Cómo trabaja: relación laboral, rubro y calificación</summary>
          <div className="disclosure-body">
            <div className="tech-columns">
              <div>
                <h3>Relación laboral</h3>
                <ShareList items={sw.categoria} />
                <p className="note">
                  Informalidad: {porcentaje(sw.informalidad_por_categoria["Asalariado/a"] ?? 0)} en
                  asalariados/as y {porcentaje(sw.informalidad_por_categoria["Cuenta propia"] ?? 0)}{" "}
                  en cuenta propia.
                </p>
              </div>
              <div>
                <h3>Rubro donde trabaja</h3>
                <ShareList items={sw.rama} />
              </div>
              <div>
                <h3>Calificación de la tarea</h3>
                <ShareList items={sw.calificacion} />
              </div>
            </div>
          </div>
        </details>

        <details className="disclosure">
          <summary>Quiénes y dónde: género y región</summary>
          <div className="disclosure-body">
            <div className="tech-columns">
              <div>
                <h3>Género</h3>
                <ShareList items={sw.sexo} />
              </div>
              <div>
                <h3>Región</h3>
                <ShareList items={sw.region} />
              </div>
            </div>
          </div>
        </details>

        {ingresos.Total && (
          <details className="disclosure">
            <summary>Ingresos</summary>
            <div className="disclosure-body">
              <dl className="facts">
                {Object.entries(ingresos).map(([k, v]) => (
                  <div key={k}>
                    <dt>
                      {k === "Total" ? "Todas las personas" : k} (n={v.n})
                    </dt>
                    <dd>{millones(v.mediana)}</dd>
                  </div>
                ))}
              </dl>
              <p className="note">
                Mediana del ingreso mensual de la ocupación principal, {total.ingreso_periodo}, en
                pesos corrientes. Incluye todas las jornadas y seniorities, por eso es menor que el
                sueldo Senior de las fichas.
              </p>
            </div>
          </details>
        )}

        <details className="disclosure">
          <summary>Qué mide y qué no</summary>
          <div className="disclosure-body">
            <p>
              <strong>{sw.nombre}</strong>: {sw.definicion} Es lo más parecido a "trabajo IT" que
              tiene el clasificador oficial de ocupaciones.
            </p>
            <ul className="methodology-list">
              {total.limites.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="note">
              {total.metodo} Período {total.periodo}, {total.cobertura}. Muestra: {sw.muestra}{" "}
              personas. Si se cuenta por rubro (empresas de software, cualquier puesto) son{" "}
              {miles(sector.personas)} personas, con{" "}
              {porcentaje(
                sector.informalidad.find((i) => i.nombre === "Informal")?.porcentaje ?? 0,
              )}{" "}
              de informalidad. Fuente:{" "}
              <a href={total.fuente.url} target="_blank" rel="noreferrer">
                {total.fuente.nombre}
              </a>
              .
            </p>
          </div>
        </details>
      </section>

      <section id="registrado" className="layer-section" aria-labelledby="registrado-titulo">
        <h2 id="registrado-titulo" className="section-title" tabIndex={-1}>
          Empleo registrado en empresas de software
        </h2>
        <p className="lead">
          Asalariados/as con aportes en empresas del rubro. Creció{" "}
          {summary.variacion_interanual_pct != null
            ? `${porcentaje(summary.variacion_interanual_pct)} en ${summary.ultimo_anio}`
            : "desde 2015"}
          .
        </p>
        <section className="panel">
          <h3>2015 a {summary.ultimo_anio}</h3>
          <EmploymentTimeseries data={timeseries} />
          <DataTable
            summary="Ver los datos en tabla"
            caption="Empleo IT registrado por año"
            headers={["Año", "Empleos registrados"]}
            rows={timeseries.map((t) => [
              String(t.anio),
              t.empleos_registrados.toLocaleString("es-AR"),
            ])}
          />
          <p className="note">
            OEDE (Ministerio de Trabajo), tomado del reporte CESSI/OPSSI que lo cita. Por provincia:{" "}
            <Link to="/provincias">ver provincias</Link>.
          </p>
        </section>
      </section>

      <section
        id="complementario"
        className="layer-section"
        aria-labelledby="complementario-titulo"
      >
        <h2 id="complementario-titulo" className="section-title" tabIndex={-1}>
          Datos complementarios: roles y sueldos
        </h2>
        <p className="lead">
          Las fuentes oficiales no separan roles. Para eso usamos encuestas abiertas, que no son
          representativas del país.
        </p>
        <details className="disclosure">
          <summary>Cómo se reparte el trabajo entre roles (Sysarmy)</summary>
          <div className="disclosure-body">
            <p className="panel-sub">{byRole.aviso}</p>
            <RoleDistributionChart data={byRole.distribucion} />
            <DataTable
              summary="Ver los datos en tabla"
              caption="Participación estimada de cada rol"
              headers={["Rol", "% estimado"]}
              rows={[...byRole.distribucion]
                .sort((a, b) => b.porcentaje_estimado - a.porcentaje_estimado)
                .map((r) => [r.nombre, porcentaje(r.porcentaje_estimado)])}
            />
          </div>
        </details>
        {summary.kpis.length > 0 && (
          <details className="disclosure">
            <summary>Indicadores de la cámara del software (CESSI/OPSSI)</summary>
            <div className="disclosure-body">
              <dl className="facts">
                {summary.kpis.map((kpi) => (
                  <div key={kpi.id}>
                    <dt>
                      {kpi.nombre}
                      {kpi.nota && <small> · {kpi.nota}</small>}
                    </dt>
                    <dd>
                      {kpi.unidad === "ARS"
                        ? `$${kpi.valor.toLocaleString("es-AR")}`
                        : kpi.unidad === "pct"
                          ? porcentaje(kpi.valor)
                          : kpi.valor.toLocaleString("es-AR")}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        )}
        <p className="note">
          Sueldos por rol en las <Link to="/roles">fichas de cada rol</Link>.
        </p>
      </section>
    </div>
  );
}
