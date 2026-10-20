import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BOARD, WOOD_TEX_V } from './spec';

/**
 * Utilidades de geometría. Todas las piezas se generan sin índices y con los
 * mismos atributos (position, normal, uv, color) para poder fusionarlas: un
 * grupo que se mueve junto es una sola malla y una sola llamada de dibujo.
 *
 * Las UV están en metros. La textura de madera cubre 2,00 × 1,20 m con diez
 * tablones horizontales de 0,12 m, así que las juntas coinciden en todas las
 * paredes. Los remates (postes, marcos, cantos) se mapean dentro de un único
 * tablón para que muestren veta sin juntas.
 */

export type Axis = 'x' | 'y' | 'z';
export type RGB = [number, number, number];

const AXES: Axis[] = ['x', 'y', 'z'];
const IDX: Record<Axis, number> = { x: 0, y: 1, z: 2 };

/** Generador pseudoaleatorio determinista (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type UVMode =
  /** Veta a lo largo de un eje, dentro de un solo tablón (remates). */
  | { kind: 'grain'; axis: Axis; row: number; offset: number }
  /** Tablones horizontales en el plano de la cara (paneles). */
  | { kind: 'boards'; offsetU?: number }
  /** Tablones en planta (suelo): u a lo largo de `axis`. */
  | { kind: 'floor'; axis: Axis }
  | { kind: 'none' };

type ColorFn = (n: THREE.Vector3, p: THREE.Vector3) => RGB;

export interface PartOptions {
  uv?: UVMode;
  color?: RGB | ColorFn;
}

const _n = new THREE.Vector3();
const _p = new THREE.Vector3();

/** Rellena el atributo color según la normal y la posición. */
export function paint(geo: THREE.BufferGeometry, color: RGB | ColorFn = [1, 1, 1]): THREE.BufferGeometry {
  const pos = geo.getAttribute('position');
  const nor = geo.getAttribute('normal');
  const arr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    let c: RGB;
    if (typeof color === 'function') {
      _n.fromBufferAttribute(nor, i);
      _p.fromBufferAttribute(pos, i);
      c = color(_n, _p);
    } else c = color;
    arr[i * 3] = c[0];
    arr[i * 3 + 1] = c[1];
    arr[i * 3 + 2] = c[2];
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return geo;
}

/** Asigna UV en metros según el modo, mirando la normal de cada cara. */
export function mapUV(geo: THREE.BufferGeometry, mode: UVMode): THREE.BufferGeometry {
  const pos = geo.getAttribute('position');
  const nor = geo.getAttribute('normal');
  const uv = new Float32Array(pos.count * 2);
  if (mode.kind === 'none') {
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return geo;
  }
  geo.computeBoundingBox();
  const bb = geo.boundingBox as THREE.Box3;
  const min = [bb.min.x, bb.min.y, bb.min.z];
  const max = [bb.max.x, bb.max.y, bb.max.z];
  for (let i = 0; i < pos.count; i++) {
    _p.fromBufferAttribute(pos, i);
    _n.fromBufferAttribute(nor, i);
    const p = [_p.x, _p.y, _p.z];
    const n = [Math.abs(_n.x), Math.abs(_n.y), Math.abs(_n.z)];
    const nAxis = n[0] >= n[1] && n[0] >= n[2] ? 0 : n[1] >= n[2] ? 1 : 2;
    let u = 0;
    let v = 0;
    if (mode.kind === 'grain') {
      const g = IDX[mode.axis];
      // El otro eje de la cara (no la normal ni la veta)
      const other = [0, 1, 2].find((a) => a !== g && a !== nAxis) ?? (g === 0 ? 1 : 0);
      const span = Math.max(max[other] - min[other], 1e-4);
      const frac = (p[other] - min[other]) / span;
      const row = mode.row % 10;
      u = (nAxis === g ? p[other] * 0.3 : p[g]) + mode.offset;
      v = row * BOARD + BOARD * (0.16 + frac * 0.66);
    } else if (mode.kind === 'boards') {
      // u horizontal en el plano de la cara, v = altura
      const horiz = nAxis === 0 ? 2 : 0;
      u = p[horiz] + (mode.offsetU ?? 0);
      v = p[1];
    } else if (mode.kind === 'floor') {
      const a = IDX[mode.axis];
      const b = a === 0 ? 2 : 0;
      u = p[a];
      v = p[b];
    }
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function prepare(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (g !== geo) geo.dispose();
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  return g;
}

/** Caja centrada en `pos`, con rotación opcional (euler XYZ). */
export function box(
  size: [number, number, number],
  pos: [number, number, number],
  opts: PartOptions & { rot?: [number, number, number] } = {},
): THREE.BufferGeometry {
  let g = prepare(new THREE.BoxGeometry(size[0], size[1], size[2]));
  g = mapUV(g, opts.uv ?? { kind: 'none' });
  if (opts.rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...opts.rot)));
  g.translate(pos[0], pos[1], pos[2]);
  return paint(g, opts.color ?? [1, 1, 1]);
}

/** Remate de madera con veta a lo largo del eje más largo. */
export function trim(
  size: [number, number, number],
  pos: [number, number, number],
  r: () => number,
  color: RGB | ColorFn = [1, 1, 1],
  rot?: [number, number, number],
): THREE.BufferGeometry {
  const axis = AXES[size.indexOf(Math.max(...size))];
  return box(size, pos, {
    uv: { kind: 'grain', axis, row: Math.floor(r() * 10), offset: r() * 2 },
    color,
    rot,
  });
}

/**
 * Panel de tablones a partir de un contorno 2D (x a lo largo, y hacia arriba)
 * con huecos, extruido hacia el interior: la cara exterior queda en z = 0 y la
 * interior en z = -depth.
 */
export function panel(
  outline: [number, number][],
  holes: [number, number][][],
  depth: number,
  color: ColorFn,
  offsetU = 0,
): THREE.BufferGeometry {
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of holes) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  let g: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 1,
  });
  g = prepare(g);
  g.translate(0, 0, -depth);
  g = mapUV(g, { kind: 'boards', offsetU });
  return paint(g, color);
}

export function rectPath(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

/** Agujero en sentido horario (requisito de THREE.Shape para huecos). */
export function rectHole(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  return [
    [x0, y0],
    [x0, y1],
    [x1, y1],
    [x1, y0],
  ];
}

/** Fusiona piezas; libera las geometrías de origen. */
export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const list = parts.map((p) => {
    // Garantiza los mismos atributos en todas
    if (!p.getAttribute('uv')) mapUV(p, { kind: 'none' });
    if (!p.getAttribute('color')) paint(p);
    for (const name of Object.keys(p.attributes)) {
      if (!['position', 'normal', 'uv', 'color'].includes(name)) p.deleteAttribute(name);
    }
    return p;
  });
  const merged = mergeGeometries(list, false);
  list.forEach((p) => p.dispose());
  merged.computeBoundingSphere();
  merged.computeBoundingBox();
  return merged;
}

/** Sombreado por cara: exterior claro, interior en penumbra (oclusión falsa). */
export function shadeWall(height: number, interior = 0.5): ColorFn {
  return (n, p) => {
    if (n.z > 0.5) return [1, 1, 1];
    if (n.z < -0.5) {
      const t = Math.min(Math.max(p.y / height, 0), 1);
      const k = interior * (0.82 + 0.3 * t);
      return [k, k * 0.97, k * 0.94];
    }
    return [0.78, 0.78, 0.78];
  };
}

export { WOOD_TEX_V };
