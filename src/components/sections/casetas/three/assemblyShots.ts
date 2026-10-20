import type { CameraShot, FrameFit } from '@/components/three/state';

/** Planos del montaje despiezado (sin three). */
export const ASSEMBLY_WIDE =
  '(min-width: 1024px) and (min-aspect-ratio: 1/1), (min-width: 600px) and (min-aspect-ratio: 5/4)';

export interface AssemblyShots {
  fit: FrameFit;
  start: CameraShot;
  mid: CameraShot;
  end: CameraShot;
}

export const ASSEMBLY_DESKTOP: AssemblyShots = {
  fit: { hk: 1, wk: 0.62 },
  start: { az: 44, el: 21, dist: 14, tx: 0.1, ty: 0.55, ax: 0.72, ay: 0.58, span: 5.2 },
  mid: { az: 33, el: 17, dist: 14, tx: 0.1, ty: 1.45, ax: 0.72, ay: 0.56, span: 5.75 },
  end: { az: 25, el: 13, dist: 14, tx: 0.15, ty: 1.25, ax: 0.72, ay: 0.57, span: 5.75 },
};

export const ASSEMBLY_MOBILE: AssemblyShots = {
  fit: { hk: 0.6, wk: 1 },
  start: { az: 42, el: 21, dist: 14, tx: 0.1, ty: 0.6, ax: 0.5, ay: 0.58, span: 5.0 },
  mid: { az: 33, el: 17, dist: 14, tx: 0.1, ty: 1.45, ax: 0.5, ay: 0.56, span: 5.4 },
  end: { az: 26, el: 13, dist: 14, tx: 0.1, ty: 1.25, ax: 0.5, ay: 0.57, span: 5.2 },
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
