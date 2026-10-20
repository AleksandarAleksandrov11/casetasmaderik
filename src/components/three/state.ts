/**
 * Estado animable de la caseta y de la cámara. Este módulo no importa three:
 * lo usan tanto las islas de cliente (GSAP escribe aquí) como el chunk 3D
 * diferido (lo lee en cada frame), sin arrastrar three al JS inicial.
 */

export type Quality = 'high' | 'low';

/** Valores 0..1 que el modelo lee en cada frame. */
export interface CasetaState {
  /** Contraventanas y mostradores (escalonado: frente, testero, trasera). */
  shutters: number;
  /** Día (0) a noche (1): luces interiores, guirnalda y entorno. */
  night: number;
  /** Montaje: 1 = piezas plegadas y apiladas, 0 = montada. */
  exploded: number;
  /** Cotas 2,90 / 2,00 / 2,47 m. */
  dims: number;
}

/**
 * Plano de cámara. La cámara orbita alrededor de `target`; el punto `target`
 * se proyecta en (ax, ay) del lienzo (fracciones de ancho y alto) mediante
 * setViewOffset, sin cambiar la perspectiva. El tamaño en pantalla depende
 * solo del alto del lienzo (fit 'h') o solo del ancho (fit 'w'), así el
 * poster recortado se puede colocar con unidades de contenedor (cqh / cqw).
 */
export interface CameraShot {
  /** Ángulo horizontal en grados. 0 = de frente (+Z), positivo hacia el testero derecho (+X). */
  az: number;
  /** Elevación en grados sobre el horizonte. */
  el: number;
  /** Distancia en metros al objetivo. */
  dist: number;
  /** Altura del objetivo (m). */
  ty: number;
  /** Desplazamiento lateral del objetivo en X (m). */
  tx: number;
  /** Posición del objetivo en pantalla (0..1). */
  ax: number;
  ay: number;
  /** Escala: metros que ocupan la unidad de encuadre (alto, ancho o u del contenedor). */
  span: number;
}

/**
 * Encuadre respecto al contenedor de la web (máx. 1440 px más márgenes):
 * la unidad de escala es u = min(alto * hk, anchoÚtil * wk) y el ancla
 * horizontal se mide dentro del ancho útil del contenedor. Así la caseta
 * guarda proporción con el texto en 4:3, 16:9 y pantallas de 2560 px.
 */
export interface FrameFit {
  hk: number;
  wk: number;
}

/** 'h': escala por alto; 'w': por ancho; FrameFit: por el contenedor. */
export type FitMode = 'h' | 'w' | FrameFit;

/** Mismas medidas que .container-site (globals.css). */
export const CONTAINER_MAX = 1440;

export function gutterPx(w: number): number {
  return Math.min(56, Math.max(20, w * 0.04));
}

/** Unidad de escala (px) y ancla horizontal (px) para un lienzo de w × h px CSS. */
export function frameMetrics(fit: FitMode, ax: number, w: number, h: number): { u: number; x: number } {
  if (fit === 'h') return { u: h, x: ax * w };
  if (fit === 'w') return { u: w, x: ax * w };
  const g = gutterPx(w);
  const container = Math.min(w, CONTAINER_MAX + 2 * g);
  const content = container - 2 * g;
  const offset = (w - container) / 2 + g;
  return { u: Math.min(h * fit.hk, content * fit.wk), x: offset + ax * content };
}

/** Rangos de DPR (constantes para no recrear la configuración del lienzo en cada render). */
export const DPR_DESKTOP: [number, number] = [1, 1.75];
export const DPR_MOBILE: [number, number] = [1, 1.5];

/** Campo de visión vertical de referencia (grados). */
export const BASE_FOV = 30;

export interface SceneHandle {
  /** Pide un frame al lienzo (frameloop demand). Lo registra la escena 3D. */
  invalidate: (() => void) | null;
}

export function createCasetaState(partial: Partial<CasetaState> = {}): CasetaState {
  return { shutters: 0, night: 0, exploded: 0, dims: 0, ...partial };
}

export function copyShot(s: CameraShot): CameraShot {
  return { ...s };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Progreso local de un tramo [a, b] dentro de un valor 0..1. */
export function segment(v: number, a: number, b: number): number {
  return clamp01((v - a) / (b - a));
}

/** Curva suave (smoothstep) para tramos encadenados. */
export function smooth(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** easeInOutCubic */
export function easeInOut(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/** easeOutCubic */
export function easeOut(t: number): number {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
}
