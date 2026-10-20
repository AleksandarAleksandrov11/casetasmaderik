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

/** WebGL por software (sin GPU): el 3D iría a pocos fps. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null;
    let ok = Boolean(gl);
    if (gl && !force3D()) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
      if (SOFTWARE_RENDERER.test(renderer)) ok = false;
    }
    webglSupport = ok;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/**
 * Con sessionStorage "cm:3d-forzar" = "1" el 3D se usa aunque el WebGL sea por
 * software o vaya lento. Lo usan las pruebas, que no tienen GPU.
 */
function force3D(): boolean {
  try {
    return window.sessionStorage.getItem('cm:3d-forzar') === '1';
  } catch {
    return false;
  }
}

const SLOW_KEY = 'cm:3d-lento';
export const EVT_3D_SLOW = 'cm:3d-slow';

/** El dispositivo no mueve el 3D con fluidez ni en calidad baja (ver PerfProbe). */
export function isTooSlowFor3D(): boolean {
  try {
    return window.sessionStorage.getItem(SLOW_KEY) === '1';
  } catch {
    return false;
  }
}

/** Deja el poster en lugar del 3D durante el resto de la sesión. */
export function markTooSlowFor3D(): void {
  if (force3D()) return;
  try {
    window.sessionStorage.setItem(SLOW_KEY, '1');
  } catch {
    // Sin sessionStorage solo afecta a la página actual
    tooSlowThisPage = true;
  }
  window.dispatchEvent(new Event(EVT_3D_SLOW));
}

let tooSlowThisPage = false;

/** El 3D solo se carga si hay WebGL, no hay movimiento reducido ni ahorro de datos. */
export function canUse3D(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion() || prefersSaveData()) return false;
  if (new URLSearchParams(window.location.search).has('no3d')) return false;
  if (tooSlowThisPage || isTooSlowFor3D()) return false;
  return supportsWebGL();
}
