import { useEffect, useState } from "react";
import { api, type ProvinceEmployment } from "../api/client";
import { ProvinceDistributionChart } from "../components/ProvinceDistributionChart";

export function Provinces() {
  const [data, setData] = useState<ProvinceEmployment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.employmentByProvince().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="error-box">No se pudo conectar con la API del backend ({error}).</div>;
  }

  if (data.length === 0) {
    return <p className="loading">Cargando datos...</p>;
  }

  const total = data.reduce((acc, d) => acc + d.empleos_registrados, 0);
  const caba = data.find((d) => d.provincia.includes("Ciudad Autónoma"));
  const interior = total - (caba?.empleos_registrados ?? 0);

  return (
    <div className="page">
      <section className="hero">
        <h1>Empleo IT por Provincia</h1>
        <p>
          Empleo registrado del sector Software y Servicios Informáticos (dato oficial OEDE,
          sector privado, período {data[0]?.periodo}). Casi 7 de cada 10 empleos IT registrados
          están en CABA — el resto del país sigue muy concentrado en pocos polos.
        </p>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-value">{total.toLocaleString("es-AR")}</span>
          <span className="kpi-label">Empleos IT registrados (sector privado)</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{caba ? `${caba.porcentaje}%` : "—"}</span>
          <span className="kpi-label">Concentrado en CABA</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{interior.toLocaleString("es-AR")}</span>
          <span className="kpi-label">Empleos IT en el resto del país</span>
        </div>
      </section>

      <div className="panel">
        <h2>Top 12 provincias por empleo IT registrado</h2>
        <p className="panel-sub">Fuente oficial: OEDE / datos.produccion.gob.ar.</p>
        <ProvinceDistributionChart data={data} />
      </div>

      <div className="panel">
        <h2>Detalle completo (24 jurisdicciones)</h2>
        <table className="province-table">
          <thead>
            <tr>
              <th>Provincia</th>
              <th>Empleos registrados</th>
              <th>% del total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.provincia}>
                <td>{p.provincia}</td>
                <td>{p.empleos_registrados.toLocaleString("es-AR")}</td>
                <td>{p.porcentaje}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
