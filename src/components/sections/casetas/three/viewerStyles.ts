/**
 * Estilos del visor 3D de /casetas.
 * Se sirven en línea con <style precedence> (React 19) desde los componentes
 * de servidor: así no hay hojas CSS por ruta que el prefetch de los enlaces
 * precargue en otras páginas (aviso de consola "preloaded but not used").
 */
export const viewerCss = /* css */ `
/* ------------------------------------------------------------------ */
/* Visor 3D de /casetas                                                */
/* ------------------------------------------------------------------ */

.viewer {
  padding-top: calc(var(--header-h) + var(--safe-top) + 8px);
  padding-bottom: clamp(48px, 7vw, 112px);
}

.viewer__grid {
  display: grid;
  gap: 36px;
}

/*
 * El H1 usa la escala H1 de la web, siempre por encima de los H2, y no baja
 * de 2,6 rem (titular de hero). Va por frases que no se parten
 * (CasetasViewerHero): 14ch lo deja en dos líneas en tableta ("Caseta de
 * madera / para ferias y eventos"), en tres o cuatro en móvil y en cuatro en
 * la columna de escritorio ("Caseta / de madera / para ferias / y eventos").
 */
.viewer__title {
  font-size: max(2.6rem, var(--fs-h1));
  max-width: 14ch;
}

/*
 * La frase más larga ("de madera") mide unas 4,6 em: si la columna no diera
 * para ella, el titular se reduce en lugar de desbordar. Con la rejilla de
 * escritorio no ocurre (la escala H1 cabe desde 1024 px): es una red.
 */
@supports (width: 1cqi) {
  .viewer__copy {
    container-type: inline-size;
  }

  .viewer__title {
    font-size: min(max(2.6rem, var(--fs-h1)), calc(100cqi / 4.75));
  }
}

@media (min-width: 1024px) {
  .viewer__grid {
    grid-template-columns: minmax(0, 4.3fr) minmax(0, 7.7fr);
    align-items: center;
    gap: clamp(32px, 4vw, 72px);
    min-height: calc(100svh - var(--header-h) - clamp(48px, 7vw, 112px));
  }
}

/*
 * Sin 3D, la lista de puntos de interés va bajo la caja, en una segunda fila
 * (subgrid): el texto se centra con la caja y no con la caja más la lista,
 * y el botón queda a la vista en portátiles bajos. Con 3D no hay lista y la
 * segunda fila mide cero.
 */
@supports (grid-template-rows: subgrid) {
  @media (min-width: 1024px) {
    .viewer__grid {
      grid-template-rows: auto auto;
      align-content: center;
      row-gap: 0;
    }

    .viewer__media {
      display: grid;
      grid-row: span 2;
      grid-template-rows: subgrid;
      align-items: center;
    }
  }
}

/* Controles Abrir / Cerrar y Día / Noche */
.viewer__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.viewer__seg {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--color-sand);
  border-radius: 4px;
  background-color: var(--color-cream);
}

.viewer__seg button {
  min-width: 76px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 2px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-stone);
  transition:
    background-color 0.45s var(--ease-brand),
    color 0.45s var(--ease-brand);
}

@media (hover: hover) {
  .viewer__seg button:hover {
    color: var(--color-ink);
  }
}

.viewer__seg button[aria-pressed='true'] {
  background-color: var(--color-ink);
  color: var(--color-cream);
}

/* Caja del visor (contenedor: la pista se coloca según su alto) */
.viewer__box {
  container: visor / size;
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border-radius: 4px;
  background-color: var(--color-paper);
  transition: background-color 0.9s var(--ease-brand);
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.viewer__grid[data-mode='3d'] .viewer__box {
  cursor: grab;
}

.viewer__grid[data-mode='3d'] .viewer__box:active {
  cursor: grabbing;
}

.viewer__grid[data-night] .viewer__box {
  background-color: var(--color-ink);
}

.viewer__media {
  container-type: inline-size;
}

/*
 * El poster corta la sombra en su borde derecho y, en la caja apaisada del
 * móvil en horizontal, ese borde queda dentro de la caja. La máscara deja
 * entera la parte alta (caseta, viseras y mostradores) y, por debajo, funde
 * la sombra hacia la derecha desde el 80 %, ya fuera de la pared lateral:
 * la sombra se desvanece en lugar de terminar en un corte.
 */
.viewer__visual .caseta-poster img {
  --fade:
    linear-gradient(#000 63%, transparent 63%),
    linear-gradient(to right, #000 80%, rgb(0 0 0 / 0.45) 90%, transparent 99%);
  -webkit-mask-image: var(--fade);
  mask-image: var(--fade);
}

/*
 * Proporción de la caja según el encuadre (WIDE de media.ts en ViewerStage
 * y el poster con media="wide"): cuadrada en móvil vertical, 5:4 en tableta
 * vertical (encuadre por ancho en los dos casos) y apaisada en móvil
 * horizontal y escritorio (encuadre por alto), siempre dentro de la pantalla.
 */
@media (min-width: 600px) {
  .viewer__box {
    aspect-ratio: 5 / 4;
  }
}

@media (min-width: 600px) and (min-aspect-ratio: 5/4) {
  .viewer__box {
    aspect-ratio: auto;
    height: min(80svh, 75cqw);
  }
}

@media (min-width: 1024px) {
  /* Siempre apaisada: el encuadre por alto o por ancho cabe igual */
  .viewer__box {
    aspect-ratio: auto;
    height: min(clamp(440px, 74svh, 780px), 86cqw);
  }
}

/* Puntos de interés */
.viewer__hotspots {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.hotspot-wrap {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: auto;
  transition: opacity 0.35s var(--ease-brand);
  will-change: transform;
}

.hotspot-wrap[data-hidden='1'] {
  opacity: 0;
  pointer-events: none;
}

.hotspot-wrap[data-hidden='1']:focus-within {
  opacity: 1;
}

.hotspot {
  position: absolute;
  left: -22px;
  top: -22px;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 50%;
  cursor: pointer;
}

.hotspot__dot {
  position: relative;
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--color-cream);
  box-shadow:
    0 0 0 1px rgb(14 22 21 / 0.16),
    0 2px 10px rgb(14 22 21 / 0.22);
  transition: transform 0.4s var(--ease-brand);
}

.hotspot__dot::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background-color: var(--color-wood);
  transition: background-color 0.3s var(--ease-brand);
}

html.js-motion .hotspot__dot::before {
  content: '';
  position: absolute;
  inset: -7px;
  border: 1px solid rgb(251 248 243 / 0.85);
  border-radius: 50%;
  animation: hotspot-pulse 2.6s var(--ease-brand) infinite;
}

@keyframes hotspot-pulse {
  0% {
    opacity: 0.9;
    transform: scale(0.7);
  }
  70%,
  100% {
    opacity: 0;
    transform: scale(1.35);
  }
}

@media (hover: hover) {
  .hotspot:hover .hotspot__dot {
    transform: scale(1.15);
  }
}

.hotspot[aria-expanded='true'] .hotspot__dot::after {
  background-color: var(--color-ink);
}

.hotspot:focus-visible {
  outline: 2px solid var(--color-wood);
  outline-offset: 0;
}

.viewer__grid[data-night] .hotspot:focus-visible {
  outline-color: var(--color-wood-light);
}

/* Panel del punto de interés: tarjeta fija abajo a la izquierda de la caja */
.viewer__panels {
  position: absolute;
  z-index: 3;
  left: 12px;
  right: 12px;
  bottom: 12px;
  pointer-events: none;
}

.hotspot__panel {
  position: relative;
  max-width: 360px;
  padding: 16px 48px 18px 18px;
  border: 1px solid var(--color-sand);
  border-radius: 4px;
  background-color: var(--color-cream);
  color: var(--color-ink);
  pointer-events: auto;
}

html.js-motion .hotspot__panel:not([hidden]) {
  animation: hotspot-panel 0.45s var(--ease-brand) both;
}

@keyframes hotspot-panel {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.hotspot__title {
  font-family: var(--font-display);
  font-size: 1.1875rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.hotspot__text {
  margin-top: 6px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-stone);
}

.hotspot__close {
  position: absolute;
  top: 2px;
  right: 2px;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  color: var(--color-stone);
}

@media (min-width: 1024px) {
  .viewer__panels {
    left: 20px;
    bottom: 20px;
    right: auto;
    width: 360px;
  }
}

/* Pista "Arrastra para girar" */
.viewer__hint {
  position: absolute;
  z-index: 2;
  left: 50%;
  bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 4px;
  background-color: rgb(251 248 243 / 0.82);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-stone);
  transform: translateX(-50%);
  transition:
    opacity 0.5s var(--ease-brand),
    background-color 0.9s var(--ease-brand),
    color 0.9s var(--ease-brand);
  pointer-events: none;
}

.viewer__hint[data-hidden] {
  opacity: 0;
}

/*
 * Si la base de la caseta llega cerca del borde inferior, la pista taparía
 * su punto de interés: pasa arriba a la izquierda, donde siempre hay aire.
 * Ocurre con el encuadre por ancho (móvil y tableta en vertical) y en cajas
 * bajas (móvil en horizontal). En escritorio sigue abajo, centrada.
 */
.viewer__box[data-fit='w'] .viewer__hint {
  top: 12px;
  bottom: auto;
  left: 12px;
  transform: none;
}

@container visor (max-height: 440px) {
  .viewer__hint {
    top: 12px;
    bottom: auto;
    left: 12px;
    transform: none;
  }
}

.viewer__grid[data-night] .viewer__hint {
  background-color: rgb(31 37 35 / 0.82);
  color: var(--color-mist);
}

/* Lista de puntos de interés sin 3D */
.viewer__list {
  display: grid;
  gap: 22px 32px;
  margin-top: 28px;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
}

.viewer__list li {
  border-top: 1px solid var(--color-sand);
  padding-top: 14px;
}

.viewer__list-n {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--color-wood-dark);
}

.viewer__list-title {
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 1.1875rem;
  line-height: 1.2;
}

.viewer__list-text {
  margin-top: 6px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-stone);
}
`;
