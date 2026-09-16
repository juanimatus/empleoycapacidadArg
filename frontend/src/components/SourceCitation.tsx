import type { DataSource } from "../api/client";

export function SourceCitation({ fuente }: { fuente: DataSource }) {
  const isOficial = fuente.tipo === "oficial";
  return (
    <div className={`source-citation ${isOficial ? "source-oficial" : "source-estimacion"}`}>
      <span className="source-badge">{isOficial ? "Dato oficial" : "Estimación preliminar"}</span>
      {fuente.url ? (
        <a href={fuente.url} target="_blank" rel="noreferrer">
          {fuente.nombre}
        </a>
      ) : (
        <span>{fuente.nombre}</span>
      )}
      {fuente.fecha && <span className="source-fecha"> · {fuente.fecha}</span>}
    </div>
  );
}
