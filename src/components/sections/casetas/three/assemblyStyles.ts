/**
 * Montaje interactivo de /casetas. En línea con <style precedence> (ver three/styles.ts).
 * Sin secciones fijadas con scroll: nada que pueda quedarse a medias al pasar
 * de la sección clara a la oscura.
 */
export const assemblyCss = /* css */ `
.assembly {
  position: relative;
  padding: var(--section-y) 0;
  background-color: var(--color-ink);
  background-image:
    radial-gradient(80% 60% at 75% 55%, rgba(152, 96, 62, 0.22), transparent 70%),
    radial-gradient(60% 50% at 10% 0%, rgba(243, 237, 228, 0.05), transparent 70%);
  color: var(--color-cream);
}

.assembly__grid {
  display: grid;
  gap: clamp(32px, 5vw, 56px);
  align-items: center;
}

.assembly__steps {
  display: grid;
  gap: 8px;
  margin: clamp(28px, 4vw, 44px) 0 0;
  padding: 0;
  list-style: none;
}

.assembly__step {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid rgba(243, 237, 228, 0.12);
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.3s var(--ease-brand),
    border-color 0.3s var(--ease-brand);
}

@media (hover: hover) {
  .assembly__step:hover {
    border-color: rgba(243, 237, 228, 0.32);
  }
}

.assembly__step:focus-visible {
  outline: 2px solid var(--color-wood-light);
  outline-offset: 2px;
}

.assembly__step[aria-pressed='true'] {
  border-color: var(--color-wood-light);
  background: rgba(196, 154, 118, 0.1);
}

.assembly__step-n {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-wood-light);
  font-variant-numeric: tabular-nums;
  padding-top: 2px;
}

.assembly__step-body {
  display: grid;
  gap: 2px;
}

.assembly__step-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
}

.assembly__step-text {
  color: rgba(243, 237, 228, 0.72);
  font-size: 0.9375rem;
  line-height: 1.5;
}

.assembly__media {
  display: grid;
  gap: 18px;
  min-width: 0;
}

.assembly__stage {
  position: relative;
  aspect-ratio: 4 / 3;
  width: 100%;
  border-radius: var(--radius-sm);
  background:
    radial-gradient(70% 55% at 50% 62%, rgba(243, 237, 228, 0.1), transparent 72%),
    linear-gradient(180deg, rgba(243, 237, 228, 0.03), rgba(243, 237, 228, 0));
  border: 1px solid rgba(243, 237, 228, 0.08);
  overflow: hidden;
}

.assembly__visual {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.assembly__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: contain;
  opacity: 0;
}

.assembly__frame[data-on] {
  opacity: 1;
}

.assembly[data-live] .assembly__frame {
  opacity: 0;
  transition: opacity 0.5s var(--ease-brand) 0.4s;
}

.assembly[data-live] .caseta-canvas,
.assembly .caseta-canvas {
  position: absolute;
  inset: 0;
}

.assembly__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
}

.assembly__play {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 18px 0 14px;
  border-radius: 999px;
  background: var(--color-cream);
  color: var(--color-ink);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s var(--ease-brand);
}

.assembly__play svg {
  width: 18px;
  height: 18px;
}

@media (hover: hover) {
  .assembly__play:hover {
    background: var(--color-wood-light);
  }
}

.assembly__play:focus-visible {
  outline: 2px solid var(--color-wood-light);
  outline-offset: 3px;
}

.assembly__range {
  flex: 1 1 260px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.assembly__range-end {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(243, 237, 228, 0.72);
  white-space: nowrap;
}

.assembly__range input {
  --range-p: 100%;
  flex: 1;
  min-width: 0;
  height: 44px;
  margin: 0;
  background: transparent;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.assembly__range input::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    90deg,
    var(--color-wood-light) var(--range-p),
    rgba(243, 237, 228, 0.18) var(--range-p)
  );
}

.assembly__range input::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: rgba(243, 237, 228, 0.18);
}

.assembly__range input::-moz-range-progress {
  height: 4px;
  border-radius: 2px;
  background: var(--color-wood-light);
}

.assembly__range input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  margin-top: -9px;
  border-radius: 50%;
  background: var(--color-cream);
  box-shadow: 0 0 0 4px rgba(196, 154, 118, 0.35);
}

.assembly__range input::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  background: var(--color-cream);
  box-shadow: 0 0 0 4px rgba(196, 154, 118, 0.35);
}

.assembly__range input:focus-visible {
  outline: 2px solid var(--color-wood-light);
  outline-offset: 2px;
}

@media (min-width: 1024px) {
  .assembly__grid {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  }
}

/* Captura de fotogramas (solo en desarrollo) */
.assembly[data-capture] .assembly__stage {
  position: fixed;
  inset: 0;
  z-index: 10000;
  width: 100vw;
  height: 100vh;
  aspect-ratio: auto;
  border: 0;
  border-radius: 0;
  background: none;
}
`;
