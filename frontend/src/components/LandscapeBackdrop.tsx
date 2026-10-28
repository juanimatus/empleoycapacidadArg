import { useEffect, useState, type ReactNode } from "react";
import { PAISAJES } from "../paisajes";

const INTERVALO_MS = 8000;

function prefiereSinMovimiento(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Fondo de la portada: fotos de paisajes argentinos que se funden lentamente.
 * Decorativo (aria-hidden), con capa oscura para que el texto se lea, botón de
 * pausa (WCAG 2.2.2) y quieto si la persona pidió menos movimiento.
 */
export function LandscapeBackdrop({ children }: { children: ReactNode }) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(prefiereSinMovimiento);

  useEffect(() => {
    if (pausado || PAISAJES.length < 2) return;
    const id = window.setInterval(() => setActual((i) => (i + 1) % PAISAJES.length), INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [pausado]);

  if (PAISAJES.length === 0) {
    return <section className="home-hero">{children}</section>;
  }

  const foto = PAISAJES[actual];

  return (
    <section className="home-hero home-hero-photo">
      <div className="backdrop" aria-hidden="true">
        {PAISAJES.map((p, i) => (
          <img
            key={p.src}
            src={p.src}
            alt=""
            className={i === actual ? "backdrop-img is-active" : "backdrop-img"}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
      <div className="hero-content">{children}</div>
      <div className="backdrop-bar">
        <p className="backdrop-credit">
          {foto.lugar} ·{" "}
          <a href={foto.url} target="_blank" rel="noreferrer">
            {foto.autor}, {foto.licencia}
          </a>
        </p>
        {PAISAJES.length > 1 && (
          <button
            type="button"
            className="backdrop-toggle"
            aria-pressed={pausado}
            onClick={() => setPausado((v) => !v)}
          >
            {pausado ? "Reanudar fotos" : "Pausar fotos"}
          </button>
        )}
      </div>
    </section>
  );
}
