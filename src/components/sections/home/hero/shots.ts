import type { CameraShot, FitMode, FrameFit } from '@/components/three/state';

/**
 * Planos de cámara del hero de Inicio. El primero de cada serie es el
 * encuadre del poster: si cambia, hay que regenerar los posters.
 *
 * Escritorio: la caseta a la derecha, el texto a la izquierda; el lienzo
 * ocupa todo el escenario.
 * Vertical: texto arriba y caseta abajo; el lienzo es solo la caja que deja
 * libre el texto (ver hero/styles.ts) y la caseta se centra en ella.
 */

/** Disposición ancha: escritorio y pantallas apaisadas. Igual que en hero.css. */
export const HERO_WIDE =
  '(min-width: 1024px) and (min-aspect-ratio: 1/1), (min-width: 600px) and (min-aspect-ratio: 5/4)';

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

/** Escritorio: u = min(alto, 0,65 × ancho útil del contenedor); ancla dentro del contenedor. */
export const DESKTOP_FIT: FrameFit = { hk: 1, wk: 0.65 };
/**
 * Vertical: u = min(1,15 × alto de la caja bajo el texto, ancho útil).
 * La caja tiene un tope de alto en hero/styles.ts (ancho útil o 600 px, entre
 * 1,15): si cambia hk, ese tope también.
 */
export const MOBILE_FIT: FrameFit = { hk: 1.15, wk: 1 };

export const DESKTOP: HeroShots = {
  fit: DESKTOP_FIT,
  start: { az: 38, el: 6, dist: 12, tx: 0.05, ty: 1.2, ax: 0.75, ay: 0.585, span: 5.2 },
  front: { az: 9, el: 4.5, dist: 12, tx: 0.4, ty: 1.15, ax: 0.75, ay: 0.575, span: 6.0 },
  night: { az: -6, el: 6, dist: 12, tx: 0.3, ty: 1.15, ax: 0.75, ay: 0.575, span: 6.0 },
  dims: { az: -34, el: 14, dist: 12, tx: -0.25, ty: 1.05, ax: 0.75, ay: 0.58, span: 6.8 },
  end: { az: -28, el: 12, dist: 12, tx: -0.25, ty: 1.05, ax: 0.79, ay: 0.59, span: 7.8 },
};

export const MOBILE: HeroShots = {
  fit: MOBILE_FIT,
  start: { az: 34, el: 7, dist: 12, tx: 0.08, ty: 1.15, ax: 0.5, ay: 0.48, span: 4.3 },
  front: { az: 13, el: 6, dist: 12, tx: 0.45, ty: 1.1, ax: 0.5, ay: 0.48, span: 4.95 },
  night: { az: -4, el: 7, dist: 12, tx: 0.3, ty: 1.1, ax: 0.5, ay: 0.48, span: 4.95 },
  dims: { az: -32, el: 15, dist: 12, tx: -0.3, ty: 1.0, ax: 0.5, ay: 0.48, span: 5.6 },
  end: { az: -29, el: 14, dist: 12, tx: -0.3, ty: 1.0, ax: 0.5, ay: 0.48, span: 5.75 },
};

/** Encuadre de la imagen base de Open Graph (1200 × 630, caseta a la derecha; ajuste por alto). */
export const OG_SHOT: CameraShot = { az: 36, el: 7, dist: 12, tx: 0.05, ty: 1.2, ax: 0.7, ay: 0.52, span: 4.3 };
