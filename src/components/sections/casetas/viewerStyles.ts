/**
 * Hero de /casetas. En línea con <style precedence> (ver three/styles.ts).
 */
export const viewerCss = /* css */ `
.viewer {
  position: relative;
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
  max-width: 15ch;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(2.5rem, 1.4rem + 4.6vw, 5.25rem);
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

.viewer .ic__features {
  margin-top: 6px;
}

.viewer .ic__card {
  width: min(100%, 640px);
  margin: 0 auto;
  min-height: 4.5em;
}

@media (min-width: 1024px) {
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
