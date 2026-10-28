import type { SalaryStats, ShareItem } from "../api/client";
import { millones, porcentaje } from "../format";

/** Rango intercuartil (p25 a p75) con la mediana marcada, en una escala común. */
export function SalaryRange({
  label,
  stats,
  max,
}: {
  label: string;
  stats: SalaryStats | null;
  max: number;
}) {
  if (!stats) {
    return (
      <div className="salary-row">
        <span className="salary-label">{label}</span>
        <span className="salary-empty">Menos de 10 respuestas: no se publica</span>
      </div>
    );
  }
  const x = (v: number) => `${(100 * v) / max}%`;
  return (
    <div className="salary-row">
      <span className="salary-label">{label}</span>
      <div className="salary-track" aria-hidden="true">
        <span
          className="salary-band"
          style={{ left: x(stats.p25), width: `calc(${x(stats.p75)} - ${x(stats.p25)})` }}
        />
        <span className="salary-median" style={{ left: x(stats.mediana) }} />
      </div>
      <span className="salary-value">
        <strong>{millones(stats.mediana)}</strong>
        <small>
          {millones(stats.p25)} a {millones(stats.p75)} · n={stats.n}
        </small>
      </span>
    </div>
  );
}

export interface StackPart {
  label: string;
  value: number;
  tone: "a" | "b" | "c";
}

/** Barra apilada de partes que suman 100%, con leyenda debajo. */
export function StackedBar({ parts, title }: { parts: StackPart[]; title: string }) {
  return (
    <figure className="stacked">
      <figcaption>{title}</figcaption>
      <div
        className="stacked-track"
        role="img"
        aria-label={parts.map((p) => `${p.label} ${porcentaje(p.value)}`).join(", ")}
      >
        {parts.map((p) => (
          <span
            key={p.label}
            className={`stacked-part tone-${p.tone}`}
            style={{ width: `${p.value}%` }}
          />
        ))}
      </div>
      <ul className="stacked-legend">
        {parts.map((p) => (
          <li key={p.label}>
            <i className={`tone-${p.tone}`} /> {p.label} <strong>{porcentaje(p.value)}</strong>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Lista con barra proporcional: "% de personas del rol que usan X". */
export function ShareList({ items, limit = 8 }: { items: ShareItem[]; limit?: number }) {
  const top = items.slice(0, limit);
  const max = Math.max(...top.map((i) => i.porcentaje), 1);
  return (
    <ul className="share-list">
      {top.map((i) => (
        <li key={i.nombre}>
          <span className="share-name">{i.nombre}</span>
          <span className="share-bar" style={{ width: `${(100 * i.porcentaje) / max}%` }} />
          <span className="share-value">{porcentaje(i.porcentaje)}</span>
        </li>
      ))}
    </ul>
  );
}
