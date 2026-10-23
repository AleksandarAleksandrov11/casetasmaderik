/**
 * Hero de /casetas. En línea con <style precedence> (ver three/styles.ts).
 * Escritorio: titular | caseta | medidas, a la misma altura, y la botonera y
 * las partes de la caseta debajo. Móvil y tableta: en columna.
 */
export const viewerCss = /* css */ `
.viewer {
  position: relative;
  /* El visual de la caseta se amplía un poco por encima del escenario */
  overflow-x: clip;
  padding-top: calc(var(--header-h) + var(--safe-top) + clamp(12px, 3vw, 32px));
  padding-bottom: clamp(48px, 7vw, 96px);
  background-color: var(--color-cream);
  transition: background-color 0.8s var(--ease-brand), color 0.8s var(--ease-brand);
}

/* Luces encendidas: la sección pasa a noche (data-header lo pone InteractiveCaseta) */
.viewer[data-header='dark'] {
  background-color: var(--color-ink);
  color: var(--color-cream);
}

.viewer[data-header='dark'] .viewer__text,
.viewer[data-header='dark'] .viewer__measure dt {
  color: color-mix(in oklab, var(--color-cream) 78%, transparent);
}

.viewer[data-header='dark'] .viewer__measure {
  border-color: color-mix(in oklab, var(--color-cream) 18%, transparent);
}

.viewer[data-header='dark'] .viewer__cta {
  background-color: var(--color-cream);
  color: var(--color-ink);
}

.viewer .ic__left {
  container-type: inline-size;
}

.viewer__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.25rem, 1.2rem + 4.4vw, 4rem);
  line-height: 0.98;
  letter-spacing: -0.02em;
}

.viewer__text {
  margin-top: 16px;
  max-width: 34ch;
  font-size: var(--fs-body);
  line-height: 1.55;
  color: var(--color-stone);
  transition: color 0.8s var(--ease-brand);
}

/* Medidas: tres cifras con su nombre */
.viewer__measures {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 16px;
  margin: 0;
}

.viewer__measure {
  display: grid;
  gap: 2px;
  padding: 12px 0;
  border-top: 1px solid color-mix(in oklab, var(--color-ink) 14%, transparent);
  transition: border-color 0.8s var(--ease-brand);
}

.viewer__measure dt {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-stone);
}

.viewer__measure dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem);
  font-weight: 500;
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.viewer__measure dd span {
  font-size: 0.5em;
  color: var(--color-wood);
}

.viewer__cta {
  margin-top: 20px;
}

.viewer .ic__visual {
  transform: scale(1.1);
  transform-origin: 50% 55%;
}

.viewer .ic__card {
  width: min(100%, 640px);
  margin: 0 auto;
  min-height: 4.5em;
}

/* Móvil y tableta: titular, caseta, botonera, medidas y partes */
.viewer .ic__left {
  order: 0;
}

.viewer .ic__stage {
  order: 1;
}

.viewer .ic__dock {
  order: 2;
}

.viewer .ic__right {
  order: 3;
  margin-top: 8px;
}

.viewer .ic__features {
  order: 4;
  margin-top: 8px;
}

@media (min-width: 640px) and (max-width: 1023.98px) {
  .viewer .ic__stage {
    width: min(100%, 680px);
    margin: 0 auto;
  }
}

/* Móvil: las seis partes en dos columnas ordenadas */
@media (max-width: 559.98px) {
  .viewer .ic__chips {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .viewer .ic__chip {
    width: 100%;
    height: 100%;
    text-align: left;
  }
}

@media (min-width: 1024px) {
  .viewer .ic {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 2.1fr) minmax(0, 0.8fr);
    grid-template-areas:
      'left stage right'
      'left dock right'
      'features features features';
    column-gap: clamp(20px, 2.4vw, 48px);
    row-gap: 12px;
    align-items: center;
  }

  .viewer .ic__left {
    grid-area: left;
    align-self: center;
  }

  .viewer .ic__right {
    grid-area: right;
    align-self: center;
    margin-top: 0;
  }

  .viewer .ic__stage {
    grid-area: stage;
    width: min(100%, max(420px, 100svh - var(--header-h) - 250px) * 1.5);
    margin: 0 auto;
  }

  .viewer .ic__dock {
    grid-area: dock;
  }

  .viewer .ic__features {
    grid-area: features;
    margin-top: 20px;
  }

  .viewer__title {
    font-size: min(4.25rem, 100cqi / 5.3);
  }

  .viewer__measures {
    grid-template-columns: minmax(0, 1fr);
  }

  .viewer__measure:last-child {
    border-bottom: 1px solid color-mix(in oklab, var(--color-ink) 14%, transparent);
  }

  .viewer__cta {
    margin-top: 24px;
  }
}

@media (orientation: landscape) and (max-height: 520px) {
  .viewer .ic__stage {
    width: min(100%, 78svh * 1.5);
  }
}
`;
