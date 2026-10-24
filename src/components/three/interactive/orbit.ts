/**
 * Estado de la caseta interactiva fuera de React. El DOM (arrastre, teclado,
 * botones) escribe los objetivos y la escena 3D, o la versión con
 * fotogramas, los sigue. Sin three.
 */
export interface Orbit {
  az: number;
  el: number;
  zoom: number;
  azT: number;
  elT: number;
  zoomT: number;
  /** Autorrotación lenta hasta que la persona interactúa. */
  auto: boolean;
}

/** Objetivos de la caseta (0..1): la escena los suaviza. */
export interface InteractiveTargets {
  shutters: number;
  door: number;
  night: number;
  dims: number;
}

/** Giro libre en horizontal; en vertical, desde casi a ras de suelo hasta verla desde arriba. */
export const ORBIT_LIMITS = { elMin: 1, elMax: 82, zoomMin: 0.9, zoomMax: 1.6 } as const;

/** Vista inicial: frente y testero de la puerta. Es también el primer fotograma. */
export const START_VIEW = { az: -34, el: 10, zoom: 1 } as const;

/**
 * Encuadre: un rectángulo de 3:2 de SPAN_W × SPAN_H metros (a zoom 1) centrado
 * en la caseta se ajusta al lienzo sin recortarse (como object-fit: contain).
 * Los fotogramas se capturan con la misma proporción y se muestran igual.
 */
export const FRAME_RATIO = 3 / 2;
export const SPAN_H = 4.6;
export const SPAN_W = SPAN_H * FRAME_RATIO;
export const TARGET = { tx: 0, ty: 1.12, ax: 0.5, ay: 0.53, dist: 12 } as const;

export function createOrbit(start: { az: number; el: number; zoom?: number } = START_VIEW, auto = true): Orbit {
  const zoom = start.zoom ?? 1;
  return { az: start.az, el: start.el, zoom, azT: start.az, elT: start.el, zoomT: zoom, auto };
}

export function clampOrbit(o: Orbit): void {
  o.elT = Math.min(ORBIT_LIMITS.elMax, Math.max(ORBIT_LIMITS.elMin, o.elT));
  o.zoomT = Math.min(ORBIT_LIMITS.zoomMax, Math.max(ORBIT_LIMITS.zoomMin, o.zoomT));
}

/** Lleva un ángulo objetivo al giro más corto desde el actual. */
export function nearestAngle(current: number, target: number): number {
  let d = (target - current) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return current + d;
}

/** Ángulo en [0, 360). */
export function wrap360(a: number): number {
  return ((a % 360) + 360) % 360;
}
