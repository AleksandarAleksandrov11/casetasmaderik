export type Dispositivo = 'móvil' | 'tablet' | 'escritorio';

/** Clasifica el dispositivo por ancho de pantalla y tipo de puntero. */
export function detectDevice(win: Pick<Window, 'matchMedia' | 'innerWidth'> = window): Dispositivo {
  const coarse = win.matchMedia('(pointer: coarse)').matches;
  const width = win.innerWidth;
  if (width < 768) return 'móvil';
  if (width < 1100 && coarse) return 'tablet';
  return 'escritorio';
}

/** Escritorio con puntero fino: Lenis, botones magnéticos y efectos de hover. */
export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Ahorro de datos activado en el navegador. */
export function prefersSaveData(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

let webglSupport: boolean | null = null;

export function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    webglSupport = Boolean(gl);
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** El 3D solo se carga si hay WebGL, no hay movimiento reducido ni ahorro de datos. */
export function canUse3D(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion() || prefersSaveData()) return false;
  if (new URLSearchParams(window.location.search).has('no3d')) return false;
  return supportsWebGL();
}
