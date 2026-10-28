import { useEffect, useState } from "react";
import {
  api,
  type ByRoleResponse,
  type EmploymentSnapshot,
  type EmploymentSummary,
} from "../api/client";
import { EmploymentTimeseries } from "../components/EmploymentTimeseries";
import { RoleDistributionChart } from "../components/RoleDistributionChart";
import { porcentaje } from "../format";

export function Market() {
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
      <section className="page-header">
        <h1>Panorama del sector</h1>
        <p className="lead">
          Cuánta gente trabaja en IT con empleo registrado, cómo creció desde 2015 y cómo se reparte
          entre roles.
        </p>
      </section>

      <section className="stat-row" aria-label="Datos principales">
        <div className="stat">
          <span className="stat-value">
            {summary.empleos_registrados_ultimo_anio.toLocaleString("es-AR")}
          </span>
          <span className="stat-label">Empleos IT registrados ({summary.ultimo_anio})</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {summary.variacion_interanual_pct != null
              ? `+${porcentaje(summary.variacion_interanual_pct)}`
              : "—"}
          </span>
          <span className="stat-label">Contra el año anterior</span>
        </div>
        {summary.kpis.map((kpi) => (
          <div className="stat" key={kpi.id}>
            <span className="stat-value">
              {kpi.unidad === "ARS"
                ? `$${kpi.valor.toLocaleString("es-AR")}`
                : kpi.unidad === "pct"
                  ? porcentaje(kpi.valor)
                  : kpi.valor.toLocaleString("es-AR")}
            </span>
            <span className="stat-label">{kpi.nombre}</span>
            {kpi.nota && <span className="stat-note">{kpi.nota}</span>}
          </div>
        ))}
      </section>

      <div className="profile-grid">
        <section className="panel span-2">
          <h2>Empleo IT registrado, 2015 a {summary.ultimo_anio}</h2>
          <p className="panel-sub">Dato oficial: OEDE, Ministerio de Trabajo.</p>
          <EmploymentTimeseries data={timeseries} />
        </section>
        <section className="panel span-2">
          <h2>Cómo se reparte entre roles</h2>
          <p className="panel-sub">{byRole.aviso}</p>
          <RoleDistributionChart data={byRole.distribucion} />
        </section>
      </div>
    </div>
  );
}
