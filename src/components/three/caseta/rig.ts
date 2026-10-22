import { HALF_W, PITCH, RIDGE_UNDER_Y, SHUTTER_OPEN } from './spec';
import { ROOF_SLOPE_LEN } from './build';
import { clamp01, easeInOut, easeOut, lerp, segment } from '../state';

/**
 * Cinemática de la caseta: a partir de los valores 0..1 del estado calcula
 * ángulos y desplazamientos de cada pieza. Sin three ni React, para poder
 * reutilizarla (anclas de los puntos de interés, pruebas).
 */

export const WINDOW_ORDER = ['front', 'right', 'back'] as const;

/** Apertura de cada ventana, escalonada: frente, testero y trasera. */
export function windowOpen(shutters: number, index: number): number {
  const start = index * 0.25;
  return clamp01((shutters - start) / 0.5);
}

/** La contraventana sube primero; el mostrador baja después. */
export function shutterAngle(open: number): number {
  return -easeInOut(segment(open, 0, 0.75)) * SHUTTER_OPEN;
}

export function counterAngle(open: number): number {
  return (1 - easeInOut(segment(open, 0.3, 1))) * (Math.PI / 2);
}

export function bracketAngle(open: number): number {
  return (1 - easeInOut(segment(open, 0.45, 1))) * (Math.PI / 2);
}

/** Orden de apilado (de abajo arriba) y tramo de despliegue de cada pared. */
export const WALL_STACK: Record<string, { layer: number; from: number; to: number }> = {
  right: { layer: 0, from: 0.42, to: 0.62 },
  left: { layer: 1, from: 0.36, to: 0.56 },
  back: { layer: 2, from: 0.24, to: 0.44 },
  front: { layer: 3, from: 0.16, to: 0.36 },
};

const LAYER = 0.11;
const FIRST = 0.045;
export const STACK_TOP = FIRST + LAYER * 4;

/** Pared plegada: ángulo de giro sobre su bisagra y elevación en la pila. */
export function wallFold(id: string, assembled: number): { angle: number; lift: number } {
  const s = WALL_STACK[id];
  const t = segment(assembled, s.from, s.to);
  const angle = -(Math.PI / 2) * (1 - easeInOut(t));
  const lift = (FIRST + s.layer * LAYER) * (1 - easeOut(segment(t, 0, 0.4)));
  return { angle, lift };
}

const HOVER = 3.45;

/** Faldón de cubierta: posición de la bisagra (cumbrera) y giro. */
export function roofPose(front: boolean, assembled: number): { y: number; z: number; angle: number } {
  const half = ROOF_SLOPE_LEN / 2;
  const stackY = 0.12 + STACK_TOP + 0.085 + (front ? 0.07 : 0);
  const lift = easeInOut(segment(assembled, front ? 0 : 0.035, front ? 0.14 : 0.175));
  const land = easeInOut(segment(assembled, 0.62, 0.86));
  const z0 = front ? -half : half;
  let y = lerp(stackY, HOVER + (front ? 0.12 : 0), lift);
  let z = lerp(z0, 0, easeInOut(segment(assembled, front ? 0.05 : 0.08, front ? 0.16 : 0.19)));
  y = lerp(y, RIDGE_UNDER_Y, land);
  z = lerp(z, 0, land);
  return { y, z, angle: PITCH * land };
}

/** Las contraventanas solo pueden abrirse con la caseta montada. */
export function uprightFactor(assembled: number): number {
  return segment(assembled, 0.86, 0.92);
}

export { HALF_W };
