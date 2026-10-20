/**
 * Estilos del montaje despiezado de /casetas.
 * Se sirven en línea con <style precedence> (React 19) desde los componentes
 * de servidor: así no hay hojas CSS por ruta que el prefetch de los enlaces
 * precargue en otras páginas (aviso de consola "preloaded but not used").
 */
export const assemblyCss = /* css */ `
/* ------------------------------------------------------------------ */
/* Montaje despiezado de /casetas                                      */
/* ------------------------------------------------------------------ */

.assembly {
  --assembly-p: 0;
  position: relative;
  background-color: var(--color-ink);
  color: var(--color-cream);
}

.assembly[data-mode='3d'] {
  height: calc(100svh + 200svh);
}

.assembly__stage {
  position: relative;
}

.assembly[data-mode='3d'] .assembly__stage {
  position: sticky;
  top: 0;
  height: 100svh;
  min-height: 540px;
  overflow: clip;
}

.assembly__content {
  position: relative;
  z-index: 2;
}

.assembly[data-mode='3d'] .assembly__content {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding-top: calc(var(--header-h-compact) + var(--safe-top) + 12px);
  /* Deja sitio al botón flotante de WhatsApp en móvil */
  padding-bottom: calc(84px + var(--safe-bottom));
  pointer-events: none;
}

.assembly[data-mode='3d'] .assembly__col {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: auto;
}

.assembly[data-mode='static'] .assembly__content {
  display: grid;
  gap: 48px;
  padding-block: var(--section-y);
}

.assembly__title {
  max-width: 13ch;
}

.assembly__text {
  max-width: 34ch;
}

/* Pasos */
.assembly__steps {
  display: grid;
  gap: 18px;
  margin-top: 28px;
}

.assembly__step {
  position: relative;
  padding-top: 16px;
}

.assembly__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgb(163 167 164 / 0.28);
}

.assembly__bar span {
  position: absolute;
  inset: 0;
  background-color: var(--color-wood-light);
  transform: scaleX(0);
  transform-origin: left center;
}

.assembly__step-title {
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 1.05rem + 0.7vw, 1.75rem);
  line-height: 1.15;
}

.assembly__step-n {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--color-wood-light);
}

.assembly__step-text {
  margin-top: 8px;
  max-width: 36ch;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-mist);
}

/* Paso activo en modo 3D: los demás se atenúan con color (no con opacidad,
   para mantener el contraste AA) */
.assembly[data-mode='3d'] .assembly__step-title {
  color: var(--color-mist);
  transition: color 0.6s var(--ease-brand);
}

.assembly[data-step='0'] .assembly__step[data-index='0'] .assembly__step-title,
.assembly[data-step='1'] .assembly__step[data-index='1'] .assembly__step-title,
.assembly[data-step='2'] .assembly__step[data-index='2'] .assembly__step-title {
  color: var(--color-cream);
}

.assembly[data-mode='3d'] .assembly__step[data-index='0'] .assembly__bar span {
  transform: scaleX(clamp(0, calc(var(--assembly-p) / 0.2), 1));
}

.assembly[data-mode='3d'] .assembly__step[data-index='1'] .assembly__bar span {
  transform: scaleX(clamp(0, calc((var(--assembly-p) - 0.2) / 0.64), 1));
}

.assembly[data-mode='3d'] .assembly__step[data-index='2'] .assembly__bar span {
  transform: scaleX(clamp(0, calc((var(--assembly-p) - 0.84) / 0.16), 1));
}

.assembly[data-mode='static'] .assembly__bar span {
  transform: none;
}

/* Vertical (por defecto): solo se despliega el texto del paso activo */
.assembly[data-mode='3d'] .assembly__steps {
  gap: 10px;
}

.assembly[data-mode='3d'] .assembly__step {
  padding-top: 10px;
}

.assembly[data-mode='3d'] .assembly__step-text {
  display: none;
}

.assembly[data-step='0'] .assembly__step[data-index='0'] .assembly__step-text,
.assembly[data-step='1'] .assembly__step[data-index='1'] .assembly__step-text,
.assembly[data-step='2'] .assembly__step[data-index='2'] .assembly__step-text {
  display: block;
}

.assembly[data-mode='3d'] .assembly__text {
  display: none;
}

/* Escritorio y apaisado */
@media (min-width: 1024px) and (min-aspect-ratio: 1/1), (min-width: 600px) and (min-aspect-ratio: 5/4) {
  .assembly[data-mode='3d'] {
    height: calc(100svh + 280vh);
  }

  .assembly[data-mode='3d'] .assembly__content {
    justify-content: center;
    padding-top: calc(var(--header-h-compact) + var(--safe-top));
    padding-bottom: 4svh;
  }

  .assembly[data-mode='3d'] .assembly__col {
    height: auto;
    max-width: min(38%, 32rem);
    justify-content: center;
  }

  .assembly__steps,
  .assembly[data-mode='3d'] .assembly__steps {
    gap: 22px;
    margin-top: clamp(28px, 5svh, 56px);
  }

  .assembly[data-mode='3d'] .assembly__step {
    padding-top: 16px;
  }

  .assembly[data-mode='3d'] .assembly__step-text,
  .assembly[data-mode='3d'] .assembly__text {
    display: block;
  }

  .assembly[data-mode='static'] .assembly__content {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    align-items: center;
  }
}

/* Poster (sin 3D) */
.assembly__poster {
  position: relative;
  aspect-ratio: 4 / 3;
}

.assembly__poster img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.assembly__visual {
  z-index: 0;
}
`;
