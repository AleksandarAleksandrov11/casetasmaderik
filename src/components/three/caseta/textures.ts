import * as THREE from 'three';
import { rng } from './geom';
import type { Quality } from '../state';

/**
 * Texturas de la caseta.
 *
 * Madera: la veta real de pino (CC0, ambientCG Wood 052, en
 * public/textures) se compone tabla a tabla en un canvas con desplazamientos
 * aleatorios, se tiñe con el tono miel de las fotos y se le añaden las juntas
 * entre tablones (también en el mapa de normales). Si las imágenes no están,
 * se dibuja una veta procedural. Cubierta: tejas asfálticas CC0 (Roofing
 * Tiles 003) tal cual, o tejas procedurales como respaldo.
 *
 * Todo es determinista (semilla fija), así los posters coinciden con el 3D.
 */

type Canvas2D = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D };

function makeCanvas(size: number): Canvas2D {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('canvas 2d no disponible');
  return { canvas, ctx };
}

function hsl(h: number, s: number, l: number, a = 1): string {
  return `hsla(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%, ${a.toFixed(3)})`;
}

/* ------------------------------------------------------------------ */
/* Carga de las texturas CC0                                           */
/* ------------------------------------------------------------------ */

export interface TextureSources {
  pino: HTMLImageElement;
  pinoNormal: HTMLImageElement | null;
  roof: HTMLImageElement;
  roofNormal: HTMLImageElement | null;
  roofRough: HTMLImageElement | null;
}

const BASE = '/textures/';
const sourceCache = new Map<Quality, Promise<TextureSources | null>>();

function loadImage(name: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(name));
    img.src = BASE + name;
  });
}

/**
 * Carga (una vez por calidad) las texturas CC0. En calidad baja solo los
 * mapas de color. Si falla, resuelve a null y se usan las procedurales.
 */
export function loadTextureSources(quality: Quality): Promise<TextureSources | null> {
  let p = sourceCache.get(quality);
  if (!p) {
    const high = quality === 'high';
    p = Promise.all([
      loadImage('pino-color.webp'),
      high ? loadImage('pino-normal.webp') : Promise.resolve(null),
      loadImage('cubierta-color.webp'),
      high ? loadImage('cubierta-normal.webp') : Promise.resolve(null),
      high ? loadImage('cubierta-roughness.webp') : Promise.resolve(null),
    ])
      .then(([pino, pinoNormal, roof, roofNormal, roofRough]) => ({ pino, pinoNormal, roof, roofNormal, roofRough }))
      .catch(() => null);
    sourceCache.set(quality, p);
  }
  return p;
}

/* ------------------------------------------------------------------ */
/* Madera                                                              */
/* ------------------------------------------------------------------ */

const BOARDS = 10;
/** Metros que cubre el canvas de madera (u, v) y la textura CC0. */
const WOOD_U = 2.0;
const WOOD_V = 1.2;
/** Escala de la veta CC0 (estirada en horizontal para que sea más lineal). */
const PINO_U = 1.1;
const PINO_V = 0.42;

/** Tono del pino teñido de las fotos (sRGB): veta oscura y fondo miel. */
const STAIN_DARK = [110, 60, 28];
const STAIN_LIGHT = [210, 140, 78];

interface BoardPlan {
  ox: number;
  oy: number;
  tint: number;
  warm: number;
}

function planBoards(seed: number): BoardPlan[] {
  const r = rng(seed);
  return Array.from({ length: BOARDS }, () => ({ ox: r(), oy: r(), tint: 0.9 + r() * 0.17, warm: (r() - 0.5) * 0.08 }));
}

/** Rellena cada tablón con la textura de origen desplazada. */
function fillBoards(ctx: CanvasRenderingContext2D, size: number, src: HTMLImageElement, plan: BoardPlan[]) {
  const bh = size / BOARDS;
  const pattern = ctx.createPattern(src, 'repeat');
  if (!pattern) return;
  const sx = ((size / WOOD_U) * PINO_U) / src.width;
  const sy = ((size / WOOD_V) * PINO_V) / src.height;
  plan.forEach((b, i) => {
    const y0 = i * bh;
    pattern.setTransform(new DOMMatrix().translateSelf(-b.ox * size, y0 - b.oy * src.height * sy).scaleSelf(sx, sy));
    ctx.fillStyle = pattern;
    ctx.fillRect(0, y0, size, bh);
  });
}

/** Juntas entre tablones: ranura oscura, sombra debajo y canto claro encima. */
function drawJoints(ctx: CanvasRenderingContext2D, size: number) {
  const bh = size / BOARDS;
  const k = size / 1024;
  for (let b = 0; b < BOARDS; b++) {
    const jy = b * bh;
    ctx.fillStyle = 'rgba(34,17,7,0.92)';
    ctx.fillRect(0, jy - 1.4 * k, size, 2.8 * k);
    const g = ctx.createLinearGradient(0, jy + 1.4 * k, 0, jy + 9 * k);
    g.addColorStop(0, 'rgba(40,18,6,0.42)');
    g.addColorStop(1, 'rgba(40,18,6,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, jy + 1.4 * k, size, 7.6 * k);
    ctx.fillStyle = 'rgba(255,225,185,0.14)';
    ctx.fillRect(0, jy - 3 * k, size, 1.4 * k);
  }
}

function drawWoodFromSource(size: number, src: HTMLImageElement): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const plan = planBoards(7);
  fillBoards(ctx, size, src, plan);
  // Teñido: la luminancia de la veta real se lleva a la paleta de las fotos
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  const bh = size / BOARDS;
  const lo = 119;
  const hi = 159;
  for (let y = 0; y < size; y++) {
    const b = plan[Math.min(BOARDS - 1, Math.floor(y / bh))];
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      let t = (l - lo) / (hi - lo);
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      t = Math.pow(t, 0.8);
      d[i] = Math.min(255, (STAIN_DARK[0] + (STAIN_LIGHT[0] - STAIN_DARK[0]) * t) * b.tint * (1 + b.warm));
      d[i + 1] = Math.min(255, (STAIN_DARK[1] + (STAIN_LIGHT[1] - STAIN_DARK[1]) * t) * b.tint);
      d[i + 2] = Math.min(255, (STAIN_DARK[2] + (STAIN_LIGHT[2] - STAIN_DARK[2]) * t) * b.tint * (1 - b.warm));
    }
  }
  ctx.putImageData(img, 0, 0);
  drawJoints(ctx, size);
  return canvas;
}

function drawWoodNormal(size: number, src: HTMLImageElement): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  fillBoards(ctx, size, src, planBoards(7));
  // Ranura: el canto inferior de la tabla de arriba mira hacia abajo y el
  // superior de la de abajo hacia arriba (convención OpenGL, verde = +v)
  const bh = size / BOARDS;
  const k = size / 1024;
  for (let b = 0; b < BOARDS; b++) {
    const jy = b * bh;
    ctx.fillStyle = 'rgb(128,40,190)';
    ctx.fillRect(0, jy - 3.2 * k, size, 2 * k);
    ctx.fillStyle = 'rgb(128,128,255)';
    ctx.fillRect(0, jy - 1.2 * k, size, 2.4 * k);
    ctx.fillStyle = 'rgb(128,215,190)';
    ctx.fillRect(0, jy + 1.2 * k, size, 2.4 * k);
  }
  return canvas;
}

/** Veta procedural (respaldo sin imágenes). */
function drawWoodProcedural(size: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const r = rng(7);
  const bh = size / BOARDS;
  const k = size / 1024;
  for (let b = 0; b < BOARDS; b++) {
    const y0 = b * bh;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y0, size, bh);
    ctx.clip();
    ctx.fillStyle = hsl(25 + r() * 4, 42 + r() * 8, 44 + r() * 7);
    ctx.fillRect(0, y0, size, bh);
    for (let i = 0; i < 46; i++) {
      const y = y0 + r() * bh;
      const amp = (0.6 + r() * 2.6) * k;
      const lambda = (260 + r() * 700) * k;
      const ph = r() * Math.PI * 2;
      ctx.strokeStyle = `rgba(70,30,10,${0.08 + r() * 0.34})`;
      ctx.lineWidth = (0.5 + r() * 1.9) * k;
      ctx.beginPath();
      for (let x = -8; x <= size + 8; x += 8 * k) {
        const yy = y + amp * Math.sin((x / lambda) * Math.PI * 2 + ph);
        if (x < 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  drawJoints(ctx, size);
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Tela asfáltica procedural (respaldo)                                */
/* ------------------------------------------------------------------ */

function drawShingles(size: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const r = rng(11);
  const rows = 10;
  const tabs = 6;
  const rh = size / rows;
  const tw = size / tabs;
  const k = size / 1024;
  for (let row = 0; row < rows; row++) {
    const y0 = row * rh;
    const shift = row % 2 === 0 ? 0 : tw / 2;
    for (let t = -1; t <= tabs; t++) {
      const x0 = t * tw + shift;
      ctx.fillStyle = hsl(150 + r() * 40, 4 + r() * 3, 15.5 + (r() - 0.5) * 3.6);
      ctx.fillRect(x0, y0, tw, rh);
      ctx.fillStyle = 'rgba(8,10,10,0.9)';
      ctx.fillRect(x0 - 1.6 * k, y0 + rh * 0.42, 3.2 * k, rh * 0.58);
    }
    const by = y0 + rh;
    const g = ctx.createLinearGradient(0, by, 0, by + 12 * k);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, by, size, 12 * k);
  }
  return canvas;
}

/* ------------------------------------------------------------------ */
/* Sprites de luz                                                      */
/* ------------------------------------------------------------------ */

function drawGlow(size: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, 'rgba(255,236,205,1)');
  g.addColorStop(0.12, 'rgba(255,196,128,0.65)');
  g.addColorStop(0.35, 'rgba(255,158,80,0.18)');
  g.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

function drawPool(size: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  const c = size / 2;
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0, 'rgba(255,190,120,0.9)');
  g.addColorStop(0.4, 'rgba(255,160,90,0.35)');
  g.addColorStop(1, 'rgba(255,140,70,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/** Sombra suave rectangular bajo la base (para escenas donde la caseta se mueve). */
function drawBlob(size: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size);
  // Desenfoque con shadowBlur (compatible con todos los navegadores): el
  // rectángulo se pinta fuera del canvas y solo entra su sombra
  const m = size * 0.2;
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = size * 0.09;
  ctx.shadowOffsetX = size * 2;
  ctx.fillStyle = '#000';
  ctx.fillRect(m - size * 2, m, size - m * 2, size - m * 2);
  return canvas;
}

const cache = new Map<string, HTMLCanvasElement>();

function cached(key: string, draw: () => HTMLCanvasElement): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) {
    c = draw();
    cache.set(key, c);
  }
  return c;
}

export interface CasetaTextures {
  wood: THREE.Texture;
  woodNormal: THREE.Texture | null;
  roof: THREE.Texture;
  roofNormal: THREE.Texture | null;
  roofRough: THREE.Texture | null;
  glow: THREE.Texture;
  pool: THREE.Texture;
  blob: THREE.Texture;
  dispose: () => void;
}

function tex(
  image: HTMLCanvasElement | HTMLImageElement,
  color: boolean,
  repeat: [number, number] | null,
  aniso: number,
): THREE.Texture {
  const t = image instanceof HTMLCanvasElement ? new THREE.CanvasTexture(image) : new THREE.Texture(image);
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.anisotropy = aniso;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
  return t;
}

/** Metros que cubre una repetición de la cubierta CC0 (filas de unos 14 cm). */
const ROOF_M = 1.6;

/** Crea las texturas de un lienzo. `size` 1024 en alta calidad, 512 en baja. */
export function createCasetaTextures(size: number, aniso: number, src: TextureSources | null): CasetaTextures {
  const woodC = src
    ? cached(`wood${size}`, () => drawWoodFromSource(size, src.pino))
    : cached(`woodp${size}`, () => drawWoodProcedural(size));
  const woodN = src?.pinoNormal
    ? cached(`woodn${size}`, () => drawWoodNormal(size, src.pinoNormal as HTMLImageElement))
    : null;
  const woodRepeat: [number, number] = [1 / WOOD_U, 1 / WOOD_V];
  const wood = tex(woodC, true, woodRepeat, aniso);
  const woodNormal = woodN ? tex(woodN, false, woodRepeat, aniso) : null;
  const roofRepeat: [number, number] = src ? [1 / ROOF_M, 1 / ROOF_M] : [1 / 2.0, 1 / 1.4];
  const roof = src
    ? tex(src.roof, true, roofRepeat, aniso)
    : tex(
        cached(`roofp${size}`, () => drawShingles(size)),
        true,
        roofRepeat,
        aniso,
      );
  const roofNormal = src?.roofNormal ? tex(src.roofNormal, false, roofRepeat, aniso) : null;
  const roofRough = src?.roofRough ? tex(src.roofRough, false, roofRepeat, aniso) : null;
  const glow = tex(
    cached('glow', () => drawGlow(128)),
    true,
    null,
    1,
  );
  const pool = tex(
    cached('pool', () => drawPool(256)),
    true,
    null,
    1,
  );
  const blob = tex(
    cached('blob', () => drawBlob(128)),
    true,
    null,
    1,
  );
  const all = [wood, woodNormal, roof, roofNormal, roofRough, glow, pool, blob].filter(Boolean) as THREE.Texture[];
  return {
    wood,
    woodNormal,
    roof,
    roofNormal,
    roofRough,
    glow,
    pool,
    blob,
    dispose: () => all.forEach((t) => t.dispose()),
  };
}
