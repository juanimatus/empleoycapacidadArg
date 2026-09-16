import type { DataSource } from "../api/client";

const LABELS: Record<DataSource["tipo"], string> = {
  oficial: "Dato oficial",
  comunitario: "Encuesta comunitaria",
  estimacion: "Estimación editorial",
};

export function SourceCitation({ fuente }: { fuente: DataSource }) {
  return (
    <div className={`source-citation source-${fuente.tipo}`}>
      <span className="source-badge">{LABELS[fuente.tipo] ?? fuente.tipo}</span>
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
