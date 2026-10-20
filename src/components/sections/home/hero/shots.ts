import type { CameraShot, FitMode } from '@/components/three/state';

/**
 * Planos de cámara del hero de Inicio. El primero de cada serie es el
 * encuadre del poster: si cambia, hay que regenerar los posters.
 *
 * Escritorio (fit 'h'): la caseta a la derecha, el texto a la izquierda.
 * Móvil (fit 'w'): texto arriba, caseta abajo.
 */

/** Disposición ancha: escritorio y pantallas apaisadas. Igual que en hero.css. */
export const HERO_WIDE = '(min-width: 1024px), (min-width: 600px) and (min-aspect-ratio: 5/4)';

export interface HeroShots {
  fit: FitMode;
  /** Inicio: tres cuartos frontal, cerrada, de día. */
  start: CameraShot;
  /** Frente: contraventanas abiertas. */
  front: CameraShot;
  /** Noche. */
  night: CameraShot;
  /** Tres cuartos para leer las cotas. */
  dims: CameraShot;
  /** Final: la cámara se aleja y la caseta queda a un lado. */
  end: CameraShot;
}

export const DESKTOP: HeroShots = {
  fit: 'h',
  start: { az: 38, el: 6, dist: 12, tx: 0.05, ty: 1.2, ax: 0.725, ay: 0.585, span: 5.2 },
  front: { az: 9, el: 4.5, dist: 12, tx: 0.35, ty: 1.15, ax: 0.73, ay: 0.575, span: 5.7 },
  night: { az: -6, el: 6, dist: 12, tx: 0.2, ty: 1.15, ax: 0.73, ay: 0.575, span: 5.7 },
  dims: { az: -34, el: 14, dist: 12, tx: -0.25, ty: 1.05, ax: 0.73, ay: 0.58, span: 6.9 },
  end: { az: -28, el: 12, dist: 12, tx: -0.25, ty: 1.05, ax: 0.765, ay: 0.59, span: 7.9 },
};

export const MOBILE: HeroShots = {
  fit: 'w',
  start: { az: 34, el: 7, dist: 12, tx: 0.08, ty: 1.15, ax: 0.5, ay: 0.75, span: 4.75 },
  front: { az: 13, el: 6, dist: 12, tx: 0.45, ty: 1.1, ax: 0.5, ay: 0.75, span: 5.5 },
  night: { az: -4, el: 7, dist: 12, tx: 0.3, ty: 1.1, ax: 0.5, ay: 0.75, span: 5.5 },
  dims: { az: -32, el: 15, dist: 12, tx: -0.3, ty: 1.0, ax: 0.5, ay: 0.75, span: 6.2 },
  end: { az: -29, el: 14, dist: 12, tx: -0.3, ty: 1.0, ax: 0.5, ay: 0.75, span: 6.4 },
};

/** Encuadre de la imagen base de Open Graph (1200 × 630, caseta a la derecha). */
export const OG_SHOT: CameraShot = { az: 36, el: 7, dist: 12, tx: 0.05, ty: 1.2, ax: 0.7, ay: 0.56, span: 3.9 };
