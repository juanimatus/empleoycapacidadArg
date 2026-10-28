import { useEffect, useState } from "react";
import { api, type RoleFamily } from "../api/client";
import { RoleSearch } from "../components/RoleSearch";
import { RoleCards } from "./Home";

export function RoleList() {
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

  return (
    <div className="page">
      <section className="page-header">
        <h1>Roles IT</h1>
        <p className="lead">
          Cada familia agrupa los nombres de puesto que se usan en Argentina para un mismo trabajo.
          Elegí una para ver salario, modalidad, tecnologías y dónde se concentra.
        </p>
        <RoleSearch roles={roles} />
      </section>
      {roles.length === 0 ? (
        <p className="loading">Cargando datos...</p>
      ) : (
        <RoleCards roles={roles} />
      )}
      <p className="note">
        Salarios: mediana del último sueldo bruto mensual de personas Full-Time Senior, encuesta
        Sysarmy 2025.1 (primer semestre 2025, pesos nominales).
      </p>
    </div>
  );
}
