import * as THREE from 'three';
import { BASE_FOV, lerp, type CameraShot, type FitMode } from '../state';

const DEG = Math.PI / 180;

/**
 * Coloca la cámara según un plano. La perspectiva solo depende de az, el y
 * dist; la escala (zoom) y el desplazamiento (setViewOffset) son
 * transformaciones 2D puras, así el poster recortado coincide con el lienzo
 * en cualquier tamaño de pantalla.
 */
export function applyShot(cam: THREE.PerspectiveCamera, s: CameraShot, w: number, h: number, fit: FitMode): void {
  const az = s.az * DEG;
  const el = s.el * DEG;
  cam.position.set(
    s.tx + s.dist * Math.sin(az) * Math.cos(el),
    s.ty + s.dist * Math.sin(el),
    s.dist * Math.cos(az) * Math.cos(el),
  );
  cam.up.set(0, 1, 0);
  cam.lookAt(s.tx, s.ty, 0);
  cam.fov = BASE_FOV;
  const visible = 2 * s.dist * Math.tan((BASE_FOV * DEG) / 2);
  const spanH = fit === 'h' ? s.span : (s.span * h) / Math.max(w, 1);
  cam.zoom = visible / spanH;
  cam.aspect = w / Math.max(h, 1);
  cam.setViewOffset(w, h, w * (0.5 - s.ax), h * (0.5 - s.ay), w, h);
  cam.updateProjectionMatrix();
}

/** Interpola dos planos (en el sitio, sobre `out`). */
export function mixShots(out: CameraShot, a: CameraShot, b: CameraShot, t: number): CameraShot {
  out.az = lerp(a.az, b.az, t);
  out.el = lerp(a.el, b.el, t);
  out.dist = lerp(a.dist, b.dist, t);
  out.ty = lerp(a.ty, b.ty, t);
  out.tx = lerp(a.tx, b.tx, t);
  out.ax = lerp(a.ax, b.ax, t);
  out.ay = lerp(a.ay, b.ay, t);
  out.span = lerp(a.span, b.span, t);
  return out;
}
