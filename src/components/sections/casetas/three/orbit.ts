/**
 * Estado de la órbita del visor. El DOM (arrastre, teclado, foco en los
 * puntos de interés) escribe los objetivos y la escena 3D los suaviza en cada
 * frame. Sin three.
 */
export interface ViewerOrbit {
  az: number;
  el: number;
  zoom: number;
  azT: number;
  elT: number;
  zoomT: number;
  /** Autorrotación lenta hasta que la persona interactúa. */
  auto: boolean;
}

export const ORBIT_LIMITS = { elMin: 3, elMax: 36, zoomMin: 0.85, zoomMax: 1.7 } as const;

/** Vista inicial (también es el encuadre del poster). */
export const VIEWER_START = { az: 32, el: 9, zoom: 1 } as const;

/**
 * Caja apaisada con encuadre por alto (escritorio y móvil en horizontal).
 * Igual que la consulta WIDE de Poster.tsx y las reglas de viewerStyles.ts.
 */
export const VIEWER_WIDE =
  '(min-width: 1024px) and (min-aspect-ratio: 1/1), (min-width: 600px) and (min-aspect-ratio: 5/4)';

export function createOrbit(): ViewerOrbit {
  const { az, el, zoom } = VIEWER_START;
  return { az, el, zoom, azT: az, elT: el, zoomT: zoom, auto: true };
}

export function clampOrbit(o: ViewerOrbit): void {
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
