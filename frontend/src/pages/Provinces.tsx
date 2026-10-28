import { useEffect, useState } from "react";
import { api, type ProvinceEmployment } from "../api/client";
import { ProvinceDistributionChart } from "../components/ProvinceDistributionChart";

export function Provinces() {
  const [data, setData] = useState<ProvinceEmployment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .employmentByProvince()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="error-box">No se pudieron cargar los datos ({error}).</div>;
  }

  if (data.length === 0) {
    return <p className="loading">Cargando datos...</p>;
  }

  const total = data.reduce((acc, d) => acc + d.empleos_registrados, 0);
  const caba = data.find((d) => d.provincia.includes("Ciudad Autónoma"));
  const interior = total - (caba?.empleos_registrados ?? 0);

  return (
    <div className="page">
      <section className="page-header">
        <h1>Empleo IT por provincia</h1>
        <p className="lead">
          Empleo registrado del sector Software y Servicios Informáticos, sector privado, período{" "}
          {data[0]?.periodo}. El trabajo IT formal sigue muy concentrado en pocos polos.
        </p>
      </section>

      <section className="stat-row" aria-label="Datos principales">
        <div className="stat">
          <span className="stat-value">{total.toLocaleString("es-AR")}</span>
          <span className="stat-label">Empleos IT registrados (sector privado)</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {caba ? `${caba.porcentaje.toLocaleString("es-AR")}%` : "—"}
          </span>
          <span className="stat-label">Concentrado en CABA</span>
        </div>
        <div className="stat">
          <span className="stat-value">{interior.toLocaleString("es-AR")}</span>
          <span className="stat-label">Empleos IT en el resto del país</span>
        </div>
      </section>

      <section className="panel">
        <h2>Las 12 provincias con más empleo IT</h2>
        <p className="panel-sub">Fuente oficial: OEDE / datos.produccion.gob.ar.</p>
        <ProvinceDistributionChart data={data} />
      </section>

      <section className="panel">
        <h2>Las 24 jurisdicciones</h2>
        <div className="table-scroll">
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
      </section>
    </div>
  );
}
