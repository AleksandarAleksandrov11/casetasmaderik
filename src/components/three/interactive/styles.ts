/**
 * Estilos de la caseta interactiva (hero de Inicio y visor de /casetas).
 * En línea con <style precedence> como el resto del 3D (ver three/styles.ts).
 */
export const interactiveCss = /* css */ `
.ic {
  position: relative;
  display: grid;
  gap: 14px;
  --ic-ink: var(--color-ink);
  --ic-line: color-mix(in oklab, var(--color-ink) 16%, transparent);
  --ic-soft: color-mix(in oklab, var(--color-cream) 82%, transparent);
}

.ic[data-night] {
  --ic-ink: var(--color-cream);
  --ic-line: color-mix(in oklab, var(--color-cream) 26%, transparent);
  --ic-soft: color-mix(in oklab, var(--color-ink) 70%, transparent);
}

/* Escenario: siempre 3:2, igual que el encuadre del 3D y los fotogramas */
.ic__stage {
  position: relative;
  aspect-ratio: 3 / 2;
  width: 100%;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: var(--radius-sm);
  outline: none;
}

.ic[data-mode='3d'] .ic__stage {
  /* En 3D el dedo gira la caseta en las dos direcciones */
  touch-action: none;
}

.ic__stage:active {
  cursor: grabbing;
}

.ic__stage:focus-visible {
  box-shadow: 0 0 0 2px var(--color-wood);
}

/* Halo cálido bajo la caseta; de noche, luz ámbar */
.ic__glow {
  position: absolute;
  inset: 8% 6% 4%;
  border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in oklab, var(--color-sand) 75%, transparent), transparent);
  opacity: 0.9;
  transition: background 0.8s var(--ease-brand), opacity 0.8s var(--ease-brand);
  pointer-events: none;
}

.ic[data-night] .ic__glow {
  background: radial-gradient(closest-side, rgba(255, 178, 102, 0.2), transparent);
}

.ic__visual {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* El lienzo de R3F activa sus eventos: aquí los recibe el escenario (y la
   parte ampliada del visual nunca tapa la botonera) */
.ic__visual * {
  pointer-events: none !important;
}

.ic__dock,
.ic__features {
  position: relative;
  z-index: 1;
}

.ic__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: contain;
  opacity: 0;
}

.ic__frame[data-on] {
  opacity: 1;
}

.ic[data-live] .ic__frame {
  opacity: 0;
  transition: opacity 0.5s var(--ease-brand) 0.5s;
}

/* Cotas del 3D: tinta de día, crema de noche */
.ic .caseta-dim-label {
  color: #4a3f36;
  font-weight: 500;
}

.ic[data-night] .caseta-dim-label {
  color: var(--color-cream);
}

/* Marcador del punto de interés activo */
.ic__marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  transition: opacity 0.3s var(--ease-brand);
}

.ic__marker::before,
.ic__marker::after {
  content: '';
  position: absolute;
  left: -9px;
  top: -9px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-wood);
  box-shadow: 0 0 0 3px var(--color-cream);
}

.ic__marker::after {
  background: transparent;
  box-shadow: 0 0 0 2px var(--color-wood);
  animation: ic-pulse 1.8s var(--ease-brand) infinite;
}

.ic__marker[data-hidden='1'] {
  opacity: 0;
}

@keyframes ic-pulse {
  from {
    transform: scale(1);
    opacity: 0.9;
  }
  to {
    transform: scale(2.6);
    opacity: 0;
  }
}

/* Pista de giro */
.ic__hint {
  position: absolute;
  left: 50%;
  bottom: 4%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--ic-soft);
  color: var(--ic-ink);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transform: translateX(-50%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: none;
  transition: opacity 0.4s var(--ease-brand), transform 0.4s var(--ease-brand);
}

.ic__hint svg {
  width: 16px;
  height: 16px;
}

.ic__hint[data-hidden] {
  opacity: 0;
  transform: translate(-50%, 6px);
}

.ic__dims {
  position: absolute;
  left: 50%;
  top: 4%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--ic-soft);
  color: var(--ic-ink);
  font-family: var(--font-display);
  font-size: 1rem;
  white-space: nowrap;
  transform: translateX(-50%);
  pointer-events: none;
}

.ic__dims svg {
  width: 18px;
  height: 18px;
}

/* Botonera: ventanas, puerta, luces y medidas */
.ic__dock {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.ic__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--ic-line);
  border-radius: 999px;
  background: transparent;
  color: var(--ic-ink);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition:
    background-color 0.25s var(--ease-brand),
    color 0.25s var(--ease-brand),
    border-color 0.25s var(--ease-brand);
}

.ic__toggle svg {
  width: 18px;
  height: 18px;
  flex: none;
}

@media (hover: hover) {
  .ic__toggle:hover {
    border-color: var(--ic-ink);
  }
}

.ic__toggle:focus-visible {
  outline: 2px solid var(--color-wood);
  outline-offset: 2px;
}

.ic__toggle[aria-pressed='true'] {
  border-color: var(--ic-ink);
  background: var(--ic-ink);
  color: var(--color-ink);
}

.ic:not([data-night]) .ic__toggle[aria-pressed='true'] {
  color: var(--color-cream);
}

/* Móvil: los cuatro botones en una fila, icono sobre el texto */
@media (max-width: 559.98px) {
  .ic__dock {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }

  .ic__toggle {
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    min-height: 58px;
    padding: 6px 4px;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
  }
}

/* Puntos de interés del visor */
.ic__features {
  display: grid;
  gap: 14px;
}

.ic__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ic__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--ic-line);
  border-radius: var(--radius-sm);
  background: color-mix(in oklab, var(--color-cream) 60%, transparent);
  color: var(--ic-ink);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.25s var(--ease-brand),
    color 0.25s var(--ease-brand),
    border-color 0.25s var(--ease-brand);
}

.ic[data-night] .ic__chip {
  background: transparent;
}

.ic__chip-n {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-wood);
  font-variant-numeric: tabular-nums;
}

@media (hover: hover) {
  .ic__chip:hover {
    border-color: var(--color-wood);
  }
}

.ic__chip:focus-visible {
  outline: 2px solid var(--color-wood);
  outline-offset: 2px;
}

.ic__chip[aria-pressed='true'] {
  border-color: var(--color-wood-dark);
  background: var(--color-wood-dark);
  color: var(--color-cream);
}

.ic__chip[aria-pressed='true'] .ic__chip-n {
  color: var(--color-wood-light);
}

.ic__card {
  position: relative;
  display: grid;
  gap: 4px;
  min-height: 0;
  padding: 0 44px 0 18px;
  border-left: 2px solid var(--color-wood);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.35s var(--ease-brand), transform 0.35s var(--ease-brand);
}

.ic__card[data-open] {
  opacity: 1;
  transform: none;
}

.ic__card:not([data-open]) {
  visibility: hidden;
}

.ic__card-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ic-ink);
}

.ic__card-text {
  max-width: 52ch;
  color: color-mix(in oklab, var(--ic-ink) 78%, transparent);
}

.ic__card-close {
  position: absolute;
  right: 0;
  top: -4px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--ic-ink);
  cursor: pointer;
}

.ic__card-close svg {
  width: 18px;
  height: 18px;
}

.ic__card-close:focus-visible {
  outline: 2px solid var(--color-wood);
}

@media (prefers-reduced-motion: reduce) {
  .ic__marker::after {
    animation: none;
  }
  .ic__card,
  .ic__hint,
  .ic__toggle,
  .ic__chip,
  .ic__glow {
    transition: none;
  }
}

/* Captura de fotogramas (solo en desarrollo): el escenario ocupa la ventana */
.ic[data-capture] .ic__stage {
  position: fixed;
  inset: 0;
  z-index: 10000;
  aspect-ratio: auto;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.ic[data-capture] .ic__glow,
.ic[data-capture] .ic__hint,
.ic[data-capture] .ic__frame {
  display: none;
}
`;
