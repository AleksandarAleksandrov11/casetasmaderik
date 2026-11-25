import * as THREE from 'three';
import { box, merge, type RGB } from '../caseta/geom';
import { BATTEN_T, BENCH_LEG, BENCH_W, HALF_KL, KIT_L, PLANK, TABLE_LEG, TABLE_W, TOP_T, TUBE } from './spec';

/**
 * Geometría del kit. Cada pieza que se mueve por separado es una sola malla:
 * tablero con sus listones, y cada bastidor de patas (tubos, travesaño de pie
 * y cruces). Las patas cuelgan de su bisagra en (0, 0, 0) hacia -Y.
 */

const WHITE: RGB = [1, 1, 1];
/** UV de tablones: la textura trae tablones de 0,12 m; aquí se dibujan más estrechos. */
const V_SCALE = 0.12 / PLANK;

function roundedRect(len: number, width: number, r: number): THREE.Shape {
  const x = len / 2;
  const y = width / 2;
  const s = new THREE.Shape();
  s.moveTo(-x + r, -y);
  s.lineTo(x - r, -y);
  s.quadraticCurveTo(x, -y, x, -y + r);
  s.lineTo(x, y - r);
  s.quadraticCurveTo(x, y, x - r, y);
  s.lineTo(-x + r, y);
  s.quadraticCurveTo(-x, y, -x, y - r);
  s.lineTo(-x, -y + r);
  s.quadraticCurveTo(-x, -y, -x + r, -y);
  return s;
}

const _p = new THREE.Vector3();
const _n = new THREE.Vector3();

/**
 * Tablero de tablones a lo largo con las esquinas y el canto redondeados. La
 * cara de arriba queda en y = 0. `hole`: agujero de la sombrilla en el centro.
 */
function plankTop(width: number, seed: number, hole = false): THREE.BufferGeometry {
  const shape = roundedRect(KIT_L, width, 0.035);
  if (hole) {
    const h = new THREE.Path();
    h.absarc(0, 0, 0.022, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }
  const bevel = 0.005;
  let g: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: TOP_T - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 6,
  });
  if (g.index) g = g.toNonIndexed();
  // Forma en el plano XY: Y pasa a Z y la extrusión baja desde y = 0
  g.rotateX(Math.PI / 2);
  g.translate(0, -bevel, 0);
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const uv = new Float32Array(pos.count * 2);
  const off = (seed % 7) * 0.31;
  for (let i = 0; i < pos.count; i++) {
    _p.fromBufferAttribute(pos, i);
    _n.fromBufferAttribute(nor, i);
    if (Math.abs(_n.y) > 0.6) {
      // Caras de arriba y abajo: tablones a lo largo
      uv[i * 2] = _p.x + off;
      uv[i * 2 + 1] = (_p.z + width / 2) * V_SCALE + seed * 0.24;
    } else {
      // Cantos: veta dentro de un solo tablón
      uv[i * 2] = _p.x + _p.z + off;
      uv[i * 2 + 1] = 0.06 + _p.y * 0.4 + (seed % 5) * 0.12;
    }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const color = new Float32Array(pos.count * 3).fill(1);
  // Cara de abajo un poco más oscura (oclusión falsa)
  for (let i = 0; i < pos.count; i++) {
    _n.fromBufferAttribute(nor, i);
    if (_n.y < -0.6) color.fill(0.62, i * 3, i * 3 + 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(color, 3));
  return g;
}

/** Listones bajo el tablero donde van las bisagras, y largueros a lo largo. */
function battens(width: number, pivotX: number): THREE.BufferGeometry[] {
  const y = -TOP_T - BATTEN_T / 2;
  const grain = { kind: 'grain' as const, axis: 'z' as const, row: 3, offset: 0.4 };
  const dark: RGB = [0.72, 0.7, 0.68];
  return [
    box([0.06, BATTEN_T, width - 0.04], [-pivotX, y, 0], { uv: grain, color: dark }),
    box([0.06, BATTEN_T, width - 0.04], [pivotX, y, 0], { uv: grain, color: dark }),
    box([KIT_L - 0.12, BATTEN_T * 0.6, 0.03], [0, -TOP_T - BATTEN_T * 0.3, width / 2 - 0.05], {
      uv: { kind: 'grain', axis: 'x', row: 5, offset: 0.1 },
      color: dark,
    }),
    box([KIT_L - 0.12, BATTEN_T * 0.6, 0.03], [0, -TOP_T - BATTEN_T * 0.3, -width / 2 + 0.05], {
      uv: { kind: 'grain', axis: 'x', row: 7, offset: 0.7 },
      color: dark,
    }),
  ];
}

/** Barra entre dos puntos (tubo cuadrado). */
function bar(a: [number, number, number], b: [number, number, number], t = TUBE): THREE.BufferGeometry {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = new THREE.Vector3().subVectors(vb, va);
  const len = dir.length();
  const g = box([t, len, t], [0, 0, 0], { color: WHITE });
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  g.applyQuaternion(q);
  const mid = va.add(vb).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

/**
 * Bastidor de patas: dos tubos, travesaño de arriba (bisagra), pie y cruz de
 * refuerzo. `half`: media separación de los tubos a lo ancho.
 */
function legFrame(len: number, half: number, cross: boolean): THREE.BufferGeometry {
  const parts = [
    bar([0, 0, -half], [0, -len, -half]),
    bar([0, 0, half], [0, -len, half]),
    // Bisagra y pie
    box([TUBE, TUBE, half * 2 + TUBE], [0, -TUBE / 2, 0], { color: WHITE }),
    box([TUBE * 1.3, TUBE, half * 2 + TUBE * 2], [0, -len + TUBE / 2, 0], { color: WHITE }),
  ];
  if (cross) {
    // Cruz en el plano del bastidor
    const y0 = -TUBE * 1.5;
    const y1 = -len * 0.62;
    parts.push(bar([0, y0, -half], [0, y1, half], TUBE * 0.55), bar([0, y0, half], [0, y1, -half], TUBE * 0.55));
  } else {
    // Travesaño intermedio
    parts.push(box([TUBE * 0.7, TUBE * 0.7, half * 2], [0, -len * 0.55, 0], { color: WHITE }));
  }
  return merge(parts);
}

export interface KitBuild {
  tableTop: THREE.BufferGeometry;
  tableLeg: THREE.BufferGeometry;
  benchTop: THREE.BufferGeometry[];
  benchLeg: THREE.BufferGeometry;
  /** Tornapuntas de la mesa: un tubo de 1 m que se escala y orienta en cada frame. */
  strut: THREE.BufferGeometry;
  dispose: () => void;
}

export function buildKit(): KitBuild {
  const tableTop = merge([plankTop(TABLE_W, 1, true), ...battens(TABLE_W, 0.8)]);
  const benchTop = [0, 1].map((i) => merge([plankTop(BENCH_W, 2 + i * 3), ...battens(BENCH_W, 0.82)]));
  const tableLeg = legFrame(TABLE_LEG, TABLE_W / 2 - 0.07, false);
  const benchLeg = legFrame(BENCH_LEG, BENCH_W / 2 - 0.04, true);
  const strut = box([TUBE * 0.6, 1, TUBE * 0.6], [0, 0.5, 0], { color: WHITE });
  const all = [tableTop, tableLeg, ...benchTop, benchLeg, strut];
  return { tableTop, tableLeg, benchTop, benchLeg, strut, dispose: () => all.forEach((g) => g.dispose()) };
}

export { HALF_KL };
