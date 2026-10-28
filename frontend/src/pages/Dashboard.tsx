import { useEffect, useState } from "react";
import {
  api,
  type ByRoleResponse,
  type EmploymentSnapshot,
  type EmploymentSummary,
} from "../api/client";
import { CountUp } from "../components/CountUp";
import { EmploymentTimeseries } from "../components/EmploymentTimeseries";
import { Marquee } from "../components/Marquee";
import { Reveal } from "../components/Reveal";
import { RoleDistributionChart } from "../components/RoleDistributionChart";

export function Dashboard() {
  const [summary, setSummary] = useState<EmploymentSummary | null>(null);
  const [timeseries, setTimeseries] = useState<EmploymentSnapshot[]>([]);
  const [byRole, setByRole] = useState<ByRoleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.employmentSummary(), api.employmentTimeseries(), api.employmentByRole()])
      .then(([s, t, r]) => {
        setSummary(s);
        setTimeseries(t);
        setByRole(r);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="error-box">No se pudieron cargar los datos ({error}).</div>;
  }

  if (!summary || !byRole) {
    return <p className="loading">Cargando datos...</p>;
  }

  return (
    <div className="page">
      <section className="hero">
        <span className="hero-kicker">01 · Observatorio</span>
        <h1>Observatorio de Empleo IT Argentina</h1>
        <p>
          Empleo IT segmentado por rol, con datos oficiales (OEDE) y encuestas comunitarias
          explícitamente marcadas. Un observatorio que no confunde "programador" con toda la
          industria.
        </p>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-value">
            <CountUp value={summary.empleos_registrados_ultimo_anio} />
          </span>
          <span className="kpi-label">Empleos IT registrados ({summary.ultimo_anio})</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">
            {summary.variacion_interanual_pct != null ? (
              <>
                +<CountUp value={summary.variacion_interanual_pct} decimals={1} suffix="%" />
              </>
            ) : (
              "—"
            )}
          </span>
          <span className="kpi-label">Variación interanual</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">
            <CountUp value={summary.cantidad_familias_rol} />
          </span>
          <span className="kpi-label">Familias de rol relevadas</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{summary.periodo_datos}</span>
          <span className="kpi-label">Período de la serie</span>
        </div>
      </section>

      <Marquee items={byRole.distribucion.map((r) => `${r.nombre} ${r.porcentaje_estimado}%`)} />

      <span className="section-kicker">
        <span className="n">02</span> Evolución y distribución
      </span>
      <section className="grid-2">
        <Reveal className="panel">
          <h2>Evolución del empleo IT registrado</h2>
          <p className="panel-sub">Fuente oficial: OEDE, Ministerio de Trabajo.</p>
          <EmploymentTimeseries data={timeseries} />
        </Reveal>
        <Reveal className="panel" delay={120}>
          <h2>Distribución estimada por familia de rol</h2>
          <p className="panel-sub warning">{byRole.aviso}</p>
          <RoleDistributionChart data={byRole.distribucion} />
        </Reveal>
      </section>

      <span className="section-kicker">
        <span className="n">03</span> Indicadores del sector
      </span>
      <section className="kpi-grid">
        {summary.kpis.map((kpi) => (
          <div className="kpi-card" key={kpi.id}>
            <span className="kpi-value">
              {kpi.unidad === "ARS" ? (
                <>
                  $<CountUp value={kpi.valor} />
                </>
              ) : kpi.unidad === "pct" ? (
                <CountUp value={kpi.valor} decimals={kpi.valor % 1 !== 0 ? 1 : 0} suffix="%" />
              ) : (
                <CountUp value={kpi.valor} />
              )}
            </span>
            <span className="kpi-label">{kpi.nombre}</span>
            {kpi.nota && <span className="kpi-nota">{kpi.nota}</span>}
          </div>
        ))}
      </section>
    </div>
  );
}
