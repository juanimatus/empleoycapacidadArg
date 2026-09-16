import { useEffect, useState } from "react";
import {
  api,
  type ByRoleResponse,
  type EmploymentSnapshot,
  type EmploymentSummary,
} from "../api/client";
import { EmploymentTimeseries } from "../components/EmploymentTimeseries";
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
    return (
      <div className="error-box">
        No se pudo conectar con la API del backend ({error}). Verificá que esté corriendo en
        http://127.0.0.1:8000.
      </div>
    );
  }

  if (!summary || !byRole) {
    return <p className="loading">Cargando datos...</p>;
  }

  return (
    <div className="page">
      <section className="hero">
        <h1>Observatorio de Empleo IT Argentina</h1>
        <p>
          Empleo IT segmentado por rol, con datos oficiales (OEDE) y estimaciones editoriales
          explícitamente marcadas. Un observatorio que no confunde "programador" con toda la
          industria.
        </p>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-value">{summary.empleos_registrados_ultimo_anio.toLocaleString("es-AR")}</span>
          <span className="kpi-label">Empleos IT registrados ({summary.ultimo_anio})</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">
            {summary.variacion_interanual_pct != null ? `+${summary.variacion_interanual_pct}%` : "—"}
          </span>
          <span className="kpi-label">Variación interanual</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{summary.cantidad_familias_rol}</span>
          <span className="kpi-label">Familias de rol relevadas</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{summary.periodo_datos}</span>
          <span className="kpi-label">Período de la serie</span>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <h2>Evolución del empleo IT registrado</h2>
          <p className="panel-sub">Fuente oficial: OEDE, Ministerio de Trabajo.</p>
          <EmploymentTimeseries data={timeseries} />
        </div>
        <div className="panel">
          <h2>Distribución estimada por familia de rol</h2>
          <p className="panel-sub warning">{byRole.aviso}</p>
          <RoleDistributionChart data={byRole.distribucion} />
        </div>
      </section>

      <section className="kpi-grid">
        {summary.kpis.map((kpi) => (
          <div className="kpi-card" key={kpi.id}>
            <span className="kpi-value">
              {kpi.unidad === "ARS"
                ? `$${kpi.valor.toLocaleString("es-AR")}`
                : kpi.unidad === "pct"
                ? `${kpi.valor}%`
                : kpi.valor.toLocaleString("es-AR")}
            </span>
            <span className="kpi-label">{kpi.nombre}</span>
            {kpi.nota && <span className="kpi-nota">{kpi.nota}</span>}
          </div>
        ))}
      </section>
    </div>
  );
}
