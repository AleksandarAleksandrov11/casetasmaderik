import type { CameraShot } from '@/components/three/state';

/** Planos del montaje despiezado (sin three). */
export const ASSEMBLY_WIDE = '(min-width: 1024px) and (min-aspect-ratio: 1/1), (min-width: 600px) and (min-aspect-ratio: 5/4)';

export interface AssemblyShots {
  fit: 'h' | 'w';
  start: CameraShot;
  mid: CameraShot;
  end: CameraShot;
}

export const ASSEMBLY_DESKTOP: AssemblyShots = {
  fit: 'h',
  start: { az: 44, el: 21, dist: 14, tx: 0.1, ty: 1.0, ax: 0.7, ay: 0.6, span: 5.7 },
  mid: { az: 33, el: 17, dist: 14, tx: 0.1, ty: 1.45, ax: 0.7, ay: 0.56, span: 6.3 },
  end: { az: 25, el: 13, dist: 14, tx: 0.1, ty: 1.25, ax: 0.7, ay: 0.57, span: 5.9 },
};

export const ASSEMBLY_MOBILE: AssemblyShots = {
  fit: 'w',
  start: { az: 42, el: 21, dist: 14, tx: 0.1, ty: 1.0, ax: 0.5, ay: 0.58, span: 5.6 },
  mid: { az: 33, el: 17, dist: 14, tx: 0.1, ty: 1.45, ax: 0.5, ay: 0.56, span: 6.0 },
  end: { az: 26, el: 13, dist: 14, tx: 0.1, ty: 1.25, ax: 0.5, ay: 0.57, span: 5.8 },
};

/** Plano del poster de movimiento reducido (caseta montada y abierta). */
export const ASSEMBLY_POSTER: CameraShot = {
  az: 34,
  el: 12,
  dist: 14,
  tx: 0.2,
  ty: 1.15,
  ax: 0.5,
  ay: 0.54,
  span: 3.9,
};

/** Hitos del scroll (0..1) que marcan el paso activo: Transporte, Montaje, Recogida. */
export const STEP_AT = [0, 0.2, 0.84] as const;
