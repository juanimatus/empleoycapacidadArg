import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type RoleFamily } from "../api/client";
import { RoleCardsByGroup } from "../components/RoleGroups";
import { RoleSearch } from "../components/RoleSearch";

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
        <p className="lead">12 roles ordenados en 5 áreas. Elegí uno para ver su ficha.</p>
        <RoleSearch roles={roles} />
      </section>
      {roles.length === 0 ? (
        <p className="loading">Cargando datos...</p>
      ) : (
        <RoleCardsByGroup roles={roles} />
      )}
      <p className="note">
        El número de cada rol es su código en el{" "}
        <Link to="/clasificador">clasificador COIT-AR</Link>. El sueldo es la mediana bruta mensual
        de personas Full-Time Senior (Sysarmy, primer semestre 2025).
      </p>
    </div>
  );
}
