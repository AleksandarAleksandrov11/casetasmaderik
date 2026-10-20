/**
 * Estilos del hero de Inicio.
 * Se sirven en línea con <style precedence> (React 19) desde los componentes
 * de servidor: así no hay hojas CSS por ruta que el prefetch de los enlaces
 * precargue en otras páginas (aviso de consola "preloaded but not used").
 */
export const heroCss = /* css */ `
/* ------------------------------------------------------------------ */
/* Hero de Inicio                                                      */
/* Disposición "ancha" (texto a la izquierda, caseta a la derecha) en  */
/* escritorio y en móviles o tabletas en horizontal; apilada en        */
/* vertical. Debe coincidir con HERO_WIDE en shots.ts.                 */
/* ------------------------------------------------------------------ */

.hero {
  --hero-bg: #fbf8f3;
  --hero-fg: #0e1615;
  --hero-muted: #5e6461;
  --hero-accent: #98603e;
  --hero-link: #98603e;
  --hero-btn-bg: #98603e;
  --hero-btn-fg: #fbf8f3;
  --hero-btn-sweep: #0e1615;
  --hero-pin: 160svh;
  position: relative;
  background-color: var(--hero-bg);
  color: var(--hero-fg);
}

.hero[data-mode='3d'] {
  height: calc(100svh + var(--hero-pin));
}

.hero__stage {
  position: relative;
  height: 100svh;
  min-height: 560px;
  overflow: clip;
}

.hero[data-mode='3d'] .hero__stage {
  position: sticky;
  top: 0;
}

.hero__visual {
  z-index: 0;
}

.hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: calc(var(--header-h) + var(--safe-top) + clamp(8px, 2.4svh, 28px));
}

.hero .hero__label {
  color: var(--hero-accent);
}

.hero__title {
  margin-top: clamp(14px, 2.2svh, 24px);
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 9.3vw, 4.6rem);
  line-height: 0.94;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.hero__line {
  display: block;
}

.hero__line--light {
  font-size: 0.5em;
  font-weight: 300;
  line-height: 1.3;
  letter-spacing: -0.012em;
}

.hero__line--strong {
  padding-block: 0.02em 0.06em;
  font-weight: 500;
  white-space: nowrap;
}

.hero__copy {
  display: grid;
  margin-top: clamp(14px, 2.4svh, 26px);
}

.hero__copy > * {
  grid-area: 1 / 1;
}

.hero__sub {
  max-width: 36ch;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--hero-muted);
}

.hero__night {
  display: none;
  align-self: start;
  max-width: 18ch;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem);
  font-weight: 300;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--hero-fg);
}

.hero[data-mode='3d'] .hero__night {
  display: block;
  visibility: hidden;
  opacity: 0;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.75rem;
  margin-top: clamp(18px, 3.2svh, 36px);
}

.hero .hero__primary {
  background-color: var(--hero-btn-bg);
  color: var(--hero-btn-fg);
}

.hero .hero__primary::before {
  background-color: var(--hero-btn-sweep);
}

.hero .hero__secondary {
  color: var(--hero-link);
}

.hero__scroll {
  position: absolute;
  z-index: 2;
  left: max(var(--gutter), var(--safe-left));
  bottom: calc(clamp(16px, 3svh, 32px) + var(--safe-bottom));
  display: none;
  align-items: center;
  gap: 14px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--hero-muted);
}

.hero__scroll-line {
  position: relative;
  display: block;
  width: 1px;
  height: 44px;
  overflow: hidden;
  background-color: color-mix(in srgb, currentColor 30%, transparent);
}

.hero__scroll-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--hero-fg);
}

html.js-motion .hero__scroll-line::after {
  animation: scroll-line 2.2s var(--ease-brand) infinite;
}

/* Disposición ancha */
@media (min-width: 1024px) and (min-aspect-ratio: 1/1), (min-width: 600px) and (min-aspect-ratio: 5/4) {
  .hero {
    --hero-pin: 250vh;
  }

  .hero__content {
    justify-content: center;
    padding-top: calc(var(--header-h) + var(--safe-top));
    padding-bottom: 7svh;
  }

  .hero__col {
    max-width: min(54%, 50rem);
  }

  .hero__title {
    font-size: clamp(2.4rem, min(5.35vw, 10.6svh), 7.5rem);
  }

  .hero__scroll {
    display: flex;
  }
}

/* Pantallas bajas en horizontal: todo más compacto */
@media (max-height: 520px) and (min-aspect-ratio: 5/4) {
  .hero__stage {
    min-height: 0;
  }

  .hero__content {
    padding-bottom: 2svh;
  }

  .hero__sub {
    font-size: 0.9375rem;
  }

  .hero__scroll {
    display: none;
  }
}

/* Entrada: la caseta sube un poco y la cámara se acerca; el H1 se desplaza */
/* sin ocultarse nunca (es el LCP). Tras la intro global, más tarde.       */
@keyframes hero-rise {
  from {
    transform: translate3d(0, 4%, 0) scale(0.95);
  }
  to {
    transform: none;
  }
}

@keyframes hero-line {
  from {
    transform: translate3d(0, 0.32em, 0);
  }
  to {
    transform: none;
  }
}

html.js-motion .hero__visual {
  transform-origin: 70% 75%;
  animation: hero-rise 1.6s var(--ease-expo) 0.1s both;
}

html.js-motion .hero__title .hero__line {
  animation: hero-line 1.1s var(--ease-expo) both;
}

html.js-motion .hero__title .hero__line:nth-child(2) {
  animation-delay: 0.06s;
}

html.js-motion .hero__title .hero__line:nth-child(3) {
  animation-delay: 0.12s;
}

html.js-intro .hero__visual {
  animation-delay: 1.5s;
}

html.js-intro .hero__title .hero__line {
  animation-delay: 1.4s;
}

html.js-intro .hero__title .hero__line:nth-child(2) {
  animation-delay: 1.46s;
}

html.js-intro .hero__title .hero__line:nth-child(3) {
  animation-delay: 1.52s;
}
`;
