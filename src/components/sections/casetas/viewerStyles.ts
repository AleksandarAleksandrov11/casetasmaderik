/**
 * Hero de /casetas. En línea con <style precedence> (ver three/styles.ts).
 */
export const viewerCss = /* css */ `
.viewer {
  position: relative;
  /* El visual de la caseta se amplía un poco por encima del escenario */
  overflow-x: clip;
  padding-top: calc(var(--header-h) + var(--safe-top) + clamp(16px, 3vw, 40px));
  padding-bottom: clamp(48px, 7vw, 104px);
  background:
    radial-gradient(120% 70% at 50% 100%, color-mix(in oklab, var(--color-sand) 70%, transparent), transparent 70%),
    var(--color-cream);
}

.viewer {
  transition: background-color 0.8s var(--ease-brand), color 0.8s var(--ease-brand);
}

/* Luces encendidas: la sección pasa a noche (data-header lo pone InteractiveCaseta) */
.viewer[data-header='dark'] {
  background: var(--color-ink);
  color: var(--color-cream);
}

.viewer[data-header='dark'] .viewer__text {
  color: color-mix(in oklab, var(--color-cream) 78%, transparent);
}

.viewer[data-header='dark'] .viewer__aside a {
  background-color: var(--color-cream);
  color: var(--color-ink);
}

.viewer__head {
  display: grid;
  gap: 20px 48px;
  align-items: end;
}

.viewer__title {
  margin: 0;
  max-width: 17ch;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.25rem, 1.2rem + 3.6vw, 4.5rem);
  line-height: 0.96;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.viewer__aside {
  display: grid;
  justify-items: start;
  gap: 20px;
}

.viewer__text {
  max-width: 40ch;
  font-size: var(--fs-lead);
  line-height: 1.5;
  color: var(--color-stone);
}

.viewer__body {
  margin-top: clamp(16px, 3vw, 32px);
}

.viewer .ic__stage {
  width: min(100%, 66svh * 1.5);
  margin: 0 auto;
}

.viewer .ic__visual {
  transform: scale(1.12);
  transform-origin: 50% 55%;
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

.viewer .ic__features {
  margin-top: 6px;
}

.viewer .ic__card {
  width: min(100%, 640px);
  margin: 0 auto;
  min-height: 4.5em;
}

@media (min-width: 1024px) {
  /* Caseta y botonera dentro del primer pantallazo */
  .viewer .ic__stage {
    width: min(100%, max(440px, 100svh - var(--header-h) - 330px) * 1.5);
  }

  .viewer__head {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  }

  .viewer__aside {
    justify-self: end;
    padding-bottom: 6px;
  }
}

@media (orientation: landscape) and (max-height: 520px) {
  .viewer .ic__stage {
    width: min(100%, 78svh * 1.5);
  }
}
`;
