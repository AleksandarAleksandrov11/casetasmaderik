import type { CameraShot } from '@/components/three/state';
import { lerp, smooth } from '@/components/three/state';

/**
 * Montaje interactivo (sin three): de la progresión 0..1 del control
 * (0 = plegada y apilada, 1 = montada y abierta) salen el despiece, las
 * contraventanas y el plano de cámara. El escenario es 4:3 y se encuadra por
 * alto, igual que los fotogramas de la versión sin 3D.
 */
export const ASSEMBLY_RATIO = 4 / 3;

const FOLDED: CameraShot = { az: 40, el: 20, dist: 14, tx: 0.1, ty: 0.9, ax: 0.5, ay: 0.6, span: 4.9 };
const MID: CameraShot = { az: 33, el: 17, dist: 14, tx: 0.1, ty: 1.55, ax: 0.5, ay: 0.55, span: 5.6 };
const BUILT: CameraShot = { az: 27, el: 13, dist: 14, tx: 0.12, ty: 1.2, ax: 0.5, ay: 0.55, span: 4.6 };

function mix(a: CameraShot, b: CameraShot, t: number): CameraShot {
  return {
    az: lerp(a.az, b.az, t),
    el: lerp(a.el, b.el, t),
    dist: lerp(a.dist, b.dist, t),
    tx: lerp(a.tx, b.tx, t),
    ty: lerp(a.ty, b.ty, t),
    ax: lerp(a.ax, b.ax, t),
    ay: lerp(a.ay, b.ay, t),
    span: lerp(a.span, b.span, t),
  };
}

export function assemblyPose(p: number): { exploded: number; shutters: number; shot: CameraShot } {
  const build = Math.min(1, Math.max(0, p / 0.84));
  const open = Math.min(1, Math.max(0, (p - 0.86) / 0.14));
  const shot = build < 0.5 ? mix(FOLDED, MID, smooth(build * 2)) : mix(MID, BUILT, smooth((build - 0.5) * 2));
  return { exploded: 1 - build, shutters: open, shot };
}

/** Valores del control para cada paso: Transporte, Montaje y Recogida. */
export const STEP_TARGET = [0, 1, 0] as const;

/** Posiciones de los fotogramas de la versión sin 3D. */
export const ASSEMBLY_FRAMES = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1] as const;
