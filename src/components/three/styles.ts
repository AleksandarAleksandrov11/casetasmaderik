/**
 * Estilos del 3D compartidos: lienzo y etiquetas de cotas.
 * Se sirven en línea con <style precedence> (React 19) desde los componentes
 * de servidor: así no hay hojas CSS por ruta que el prefetch de los enlaces
 * precargue en otras páginas (aviso de consola "preloaded but not used").
 */
export const threeCss = /* css */ `
/* ------------------------------------------------------------------ */
/* 3D de la caseta: lienzo y etiquetas de cotas                        */
/* ------------------------------------------------------------------ */

.caseta-visual {
  position: absolute;
  inset: 0;
  container-type: size;
  pointer-events: none;
}

.caseta-canvas {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.7s var(--ease-brand);
}

[data-live] .caseta-canvas {
  opacity: 1;
}

/* Etiquetas de cotas: texto real con la fuente de la web, colocado por proyección */
.caseta-dims {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.caseta-dim-label {
  position: absolute;
  left: 0;
  top: 0;
  padding: 2px 6px;
  font-family: var(--font-display);
  font-size: clamp(0.8125rem, 0.72rem + 0.35vw, 1.0625rem);
  font-weight: 400;
  letter-spacing: 0.01em;
  white-space: nowrap;
  color: var(--color-cream);
  opacity: 0;
  will-change: transform, opacity;
}
`;
