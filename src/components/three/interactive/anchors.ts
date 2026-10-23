/**
 * Puntos de interés del visor: posición en la caseta (metros), normal de la
 * superficie (para ocultarlos cuando quedan detrás) y ángulo de cámara desde
 * el que se ven bien (al enfocarlos con el teclado, la caseta gira hasta él).
 * Sin three: lo usa también el HTML del servidor.
 */

type V3 = [number, number, number];

export interface Anchor {
  /** Posición con la caseta cerrada y abierta (la contraventana se mueve). */
  closed: V3;
  open: V3;
  normal: V3;
  /** Azimut preferido en grados (0 = de frente, positivo hacia el testero derecho). */
  az: number;
}

export const ANCHORS: Record<string, Anchor> = {
  ventanas: { closed: [0.62, 0.9, 1.06], open: [0.62, 1.05, 1.3], normal: [0, 0.35, 1], az: 18 },
  contraventana: { closed: [-0.55, 1.5, 1.07], open: [-0.55, 1.79, 1.72], normal: [0, 0.55, 1], az: 10 },
  puerta: { closed: [-1.48, 1.12, 0.02], open: [-1.48, 1.12, 0.02], normal: [-1, 0, 0], az: -62 },
  cubierta: { closed: [0.55, 2.24, 0.48], open: [0.55, 2.24, 0.48], normal: [0, 0.94, 0.35], az: 25 },
  madera: { closed: [1.48, 0.55, -0.48], open: [1.48, 0.55, -0.48], normal: [1, 0, 0], az: 62 },
  plegado: { closed: [1.12, 0.07, 1.02], open: [1.12, 0.07, 1.02], normal: [0.2, 0, 1], az: 35 },
};
