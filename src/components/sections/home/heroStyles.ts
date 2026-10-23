/**
 * Hero de Inicio. En línea con <style precedence> (ver three/styles.ts).
 * Móvil y tableta: titular, caseta, texto y botones apilados. Escritorio y
 * móvil en horizontal: titular a la izquierda y caseta a la derecha.
 * Al encender las luces de la caseta, la sección pasa a noche
 * (data-header="dark", lo pone InteractiveCaseta).
 */
export const heroCss = /* css */ `
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: calc(var(--header-h) + var(--safe-top));
  background-color: var(--color-cream);
  color: var(--color-ink);
  overflow: hidden;
  transition: background-color 0.8s var(--ease-brand), color 0.8s var(--ease-brand);
}

.hero__inner {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'title' 'media' 'sub' 'ctas';
  align-content: start;
  container-type: inline-size;
  padding-top: clamp(12px, 3vw, 32px);
  padding-bottom: clamp(28px, 5vw, 48px);
}

.hero__title {
  grid-area: title;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.5rem, 15.4cqi, 6.5rem);
  line-height: 0.9;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-wrap: balance;
}

.hero__line {
  display: block;
}

/* "Alquiler de" como antetítulo dentro del H1; "casetas de madera" en grande */
.hero__line {
  white-space: nowrap;
}

.hero__line--kicker {
  margin-bottom: 0.35em;
  font-size: 0.3em;
  font-weight: 600;
  letter-spacing: 0.2em;
  line-height: 1;
  color: var(--color-wood);
  transition: color 0.8s var(--ease-brand);
}

.hero__media {
  grid-area: media;
  margin-top: clamp(8px, 3vw, 24px);
  min-width: 0;
}

.hero__media .ic__visual {
  transform: scale(1.18);
  transform-origin: 50% 55%;
}

.hero__sub {
  grid-area: sub;
  margin-top: clamp(20px, 4vw, 28px);
  max-width: 36ch;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--color-stone);
  transition: color 0.8s var(--ease-brand);
}

.hero__ctas {
  grid-area: ctas;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 28px;
  margin-top: 24px;
}

.hero__secondary {
  font-weight: 600;
  white-space: nowrap;
}

/* Cinta de tipos de evento */
.hero__ticker {
  position: relative;
  overflow: hidden;
  border-top: 1px solid color-mix(in oklab, currentColor 14%, transparent);
  padding: 16px 0 calc(16px + var(--safe-bottom));
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.hero__track {
  display: flex;
  width: max-content;
  animation: hero-ticker 90s linear infinite;
}

.hero__group {
  display: flex;
  flex: none;
}

.hero__tick {
  display: inline-flex;
  align-items: center;
  gap: 28px;
  padding-right: 28px;
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--color-stone);
  transition: color 0.8s var(--ease-brand);
}

.hero__tick::before {
  content: attr(data-t);
}

.hero__tick::after {
  content: '';
  width: 6px;
  height: 6px;
  background: var(--color-wood);
  transform: rotate(45deg);
}

@keyframes hero-ticker {
  to {
    transform: translate3d(-50%, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__track {
    animation: none;
  }
}

/* Noche */
.hero[data-header='dark'] {
  background-color: var(--color-ink);
  color: var(--color-cream);
}

.hero__line--tail {
  margin-top: 0.4em;
  font-size: 0.3em;
  font-weight: 600;
  letter-spacing: 0.2em;
  line-height: 1;
  color: var(--color-stone);
  transition: color 0.8s var(--ease-brand);
}

.hero[data-header='dark'] .hero__line--tail {
  color: color-mix(in oklab, var(--color-cream) 78%, transparent);
}

.hero[data-header='dark'] .hero__line--kicker {
  color: var(--color-wood-light);
}

.hero[data-header='dark'] .hero__sub,
.hero[data-header='dark'] .hero__tick {
  color: color-mix(in oklab, var(--color-cream) 78%, transparent);
}

.hero[data-header='dark'] .hero__primary {
  background-color: var(--color-cream);
  color: var(--color-ink);
}

/* Tableta: algo de aire y la caseta más contenida */
@media (min-width: 640px) and (max-width: 1023.98px) {
  .hero__media {
    margin-left: auto;
    margin-right: auto;
    width: min(100%, 680px);
  }
}

/* Escritorio y móvil en horizontal: dos columnas */
@media (min-width: 1024px), (orientation: landscape) and (max-height: 520px) and (min-width: 600px) {
  .hero {
    min-height: 100svh;
  }

  .hero__inner {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    grid-template-rows: 1fr auto auto auto 1fr;
    grid-template-areas: '. media' 'title media' 'sub media' 'ctas media' '. media';
    column-gap: clamp(24px, 3vw, 56px);
    align-content: stretch;
  }

  .hero__title {
    font-size: clamp(3rem, min(6.8cqi, 14svh), 8.75rem);
  }

  .hero__media {
    align-self: center;
    margin-top: 0;
    margin-right: calc(-0.5 * var(--gutter));
  }

  .hero__sub {
    margin-top: clamp(20px, 3.2svh, 32px);
  }

  .hero__ctas {
    margin-top: clamp(20px, 3.6svh, 36px);
  }
}

/* Móvil en horizontal: todo más compacto */
@media (orientation: landscape) and (max-height: 520px) and (min-width: 600px) {
  .hero__title {
    font-size: min(6.6cqi, 15svh);
  }

  .hero__sub {
    display: none;
  }

  .hero__media .ic {
    gap: 8px;
  }

  .hero__media .ic__stage {
    width: min(100%, 62svh * 1.5);
    margin: 0 auto;
  }

  .hero__ticker {
    display: none;
  }
}

/* Escritorio con poca altura (1280 × 720, 1366 × 768) */
@media (min-width: 1024px) and (max-height: 800px) {
  .hero__media .ic__stage {
    width: min(100%, (100svh - var(--header-h) - 170px) * 1.5);
    margin: 0 auto;
  }
}
`;
