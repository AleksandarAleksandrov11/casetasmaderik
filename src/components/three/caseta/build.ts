import * as THREE from 'three';
import {
  BAND_H,
  BASE_H,
  BOARD,
  COUNTER_D,
  COUNTER_T,
  DECK_T,
  DOOR_H,
  DOOR_W,
  EAVE_Y,
  FRAME_W,
  FRONT_WIN_W,
  HALF_L,
  HALF_W,
  OVERHANG,
  PITCH,
  RIDGE_UNDER_Y,
  ROOF_T,
  SHINGLE_T,
  SHUTTER_BOTTOM,
  SHUTTER_FRAME_T,
  SHUTTER_PANEL_T,
  SHUTTER_SIDE,
  SHUTTER_TOP,
  SIDE_WIN_W,
  TOTAL_H,
  TRIM_T,
  TRIM_W,
  WALL_H,
  WALL_T,
  WIN_Y0,
  WIN_Y1,
} from './spec';
import { box, mapUV, merge, paint, panel, rectHole, rectPath, rng, shadeWall, trim, type RGB } from './geom';

/**
 * Construye todas las geometrías de la caseta (una vez por lienzo). Cada
 * grupo que se anima por separado es una malla fusionada.
 */

export type WallId = 'front' | 'right' | 'back' | 'left';
export type WindowId = 'front' | 'right' | 'back';

export interface WindowBuild {
  id: WindowId;
  width: number;
  /** Contraventana en coordenadas de su bisagra (borde superior). */
  shutter: THREE.BufferGeometry;
  /** Bisagra de la contraventana en coordenadas de la pared. */
  shutterPivot: [number, number, number];
  shutterHeight: number;
  shutterWidth: number;
  /** Mostrador en coordenadas de su bisagra (canto inferior junto a la pared). */
  counter: THREE.BufferGeometry;
  counterPivot: [number, number, number];
  counterLength: number;
}

export interface WallBuild {
  id: WallId;
  /** Bisagra de plegado (canto inferior exterior) en el mundo. */
  pivot: [number, number, number];
  rotY: number;
  wood: THREE.BufferGeometry;
  window: WindowBuild | null;
}

export interface RoofHalfBuild {
  shingles: THREE.BufferGeometry;
  wood: THREE.BufferGeometry;
}

export interface CasetaBuild {
  baseMetal: THREE.BufferGeometry;
  baseWood: THREE.BufferGeometry;
  walls: WallBuild[];
  roofFront: RoofHalfBuild;
  roofBack: RoofHalfBuild;
  /** Matriz de la mitad delantera de la cubierta (bisagra en la cumbrera). */
  roofFrontMatrix: THREE.Matrix4;
  /** Guirnalda en coordenadas de la mitad delantera. */
  cable: THREE.BufferGeometry;
  stringBulbs: THREE.Vector3[];
  /** Bombillas interiores y sus cables, en coordenadas de la mitad delantera. */
  interiorBulbs: THREE.Vector3[];
  cords: THREE.BufferGeometry;
  dispose: () => void;
}

const WHITE: RGB = [1, 1, 1];
const DARK_METAL: RGB = [0.075, 0.075, 0.072];

/* ------------------------------------------------------------------ */
/* Ventanas                                                            */
/* ------------------------------------------------------------------ */

function buildShutter(width: number, r: () => number): THREE.BufferGeometry {
  const sw = width + SHUTTER_SIDE * 2;
  const sh = SHUTTER_TOP - SHUTTER_BOTTOM;
  const fw = 0.065;
  const zf = SHUTTER_PANEL_T + SHUTTER_FRAME_T / 2;
  const parts: THREE.BufferGeometry[] = [];
  // Tablero de tablones (la cara interior queda debajo al abrir: un poco más oscura)
  parts.push(
    box([sw, sh, SHUTTER_PANEL_T], [0, -sh / 2, SHUTTER_PANEL_T / 2], {
      uv: { kind: 'boards', offsetU: r() * 2 },
      color: (n) => (n.z < -0.5 ? [0.82, 0.8, 0.78] : WHITE),
    }),
  );
  // Marco perimetral en la cara exterior
  parts.push(trim([sw, fw, SHUTTER_FRAME_T], [0, -fw / 2, zf], r));
  parts.push(trim([sw, fw, SHUTTER_FRAME_T], [0, -sh + fw / 2, zf], r));
  parts.push(trim([fw, sh - fw * 2, SHUTTER_FRAME_T], [-sw / 2 + fw / 2, -sh / 2, zf], r));
  parts.push(trim([fw, sh - fw * 2, SHUTTER_FRAME_T], [sw / 2 - fw / 2, -sh / 2, zf], r));
  // Bisagra de piano: una línea fina de metal oscuro a lo largo del canto superior
  parts.push(box([sw - 0.12, 0.012, 0.012], [0, -0.004, -0.004], { color: DARK_METAL }));
  return merge(parts);
}

function buildCounter(length: number, r: () => number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  parts.push(
    trim([length, COUNTER_T, COUNTER_D], [0, COUNTER_T / 2, COUNTER_D / 2], r, (n) =>
      n.y < -0.5 ? [0.78, 0.76, 0.74] : WHITE,
    ),
  );
  // Canto frontal un poco más grueso
  parts.push(trim([length, 0.05, 0.02], [0, COUNTER_T - 0.025, COUNTER_D - 0.01], r));
  return merge(parts);
}

function windowFrame(width: number, r: () => number, parts: THREE.BufferGeometry[]) {
  const y0 = WIN_Y0 - BASE_H;
  const y1 = WIN_Y1 - BASE_H;
  const hw = width / 2;
  const z = TRIM_T / 2;
  parts.push(trim([width + FRAME_W * 2, FRAME_W, TRIM_T], [0, y1 + FRAME_W / 2, z], r));
  parts.push(trim([FRAME_W, y1 - y0, TRIM_T], [-hw - FRAME_W / 2, (y0 + y1) / 2, z], r));
  parts.push(trim([FRAME_W, y1 - y0, TRIM_T], [hw + FRAME_W / 2, (y0 + y1) / 2, z], r));
  // Alféizar interior
  parts.push(trim([width, 0.02, WALL_T + 0.02], [0, y0 - 0.01, -WALL_T / 2 - 0.01], r, [0.8, 0.8, 0.8]));
}

function buildWindow(id: WindowId, width: number, r: () => number): WindowBuild {
  const counterLength = width + 0.1;
  return {
    id,
    width,
    shutter: buildShutter(width, r),
    shutterPivot: [0, SHUTTER_TOP - BASE_H, TRIM_T + 0.002],
    shutterHeight: SHUTTER_TOP - SHUTTER_BOTTOM,
    shutterWidth: width + SHUTTER_SIDE * 2,
    counter: buildCounter(counterLength, r),
    counterPivot: [0, WIN_Y0 - BASE_H - COUNTER_T, 0.002],
    counterLength,
  };
}

/* ------------------------------------------------------------------ */
/* Paredes                                                             */
/* ------------------------------------------------------------------ */

const shadeIn = shadeWall(WALL_H + 0.4, 0.5);

function longWall(id: 'front' | 'back', r: () => number): WallBuild {
  const winW = id === 'front' ? FRONT_WIN_W : SIDE_WIN_W;
  const y0 = WIN_Y0 - BASE_H;
  const y1 = WIN_Y1 - BASE_H;
  const parts: THREE.BufferGeometry[] = [];
  parts.push(
    panel(rectPath(-HALF_L, 0, HALF_L, WALL_H), [rectHole(-winW / 2, y0, winW / 2, y1)], WALL_T, shadeIn, r() * 2),
  );
  windowFrame(winW, r, parts);
  // Friso bajo el alero
  parts.push(trim([HALF_L * 2, 0.08, TRIM_T], [0, WALL_H - 0.04, TRIM_T / 2], r));
  // Remates esquineros (tapan el canto de los testeros)
  for (const s of [-1, 1]) {
    const w = TRIM_W + TRIM_T;
    parts.push(trim([w, WALL_H, TRIM_T], [s * (HALF_L - TRIM_W + w / 2), WALL_H / 2, TRIM_T / 2], r));
  }
  if (id === 'back') {
    // Baldas interiores a los lados de la ventana trasera
    for (const s of [-1, 1]) {
      for (const y of [1.14, 1.48]) {
        parts.push(trim([0.6, 0.024, 0.24], [s * 1.09, y, -WALL_T - 0.12], r, [0.62, 0.6, 0.58]));
      }
    }
  }
  const z = id === 'front' ? HALF_W : -HALF_W;
  return {
    id,
    pivot: [0, BASE_H, z],
    rotY: id === 'front' ? 0 : Math.PI,
    wood: merge(parts),
    window: buildWindow(id, winW, r),
  };
}

function gableOutline(): [number, number][] {
  const hw = HALF_W - WALL_T;
  const yEdge = EAVE_Y - BASE_H + WALL_T * Math.tan(PITCH);
  const yApex = RIDGE_UNDER_Y - BASE_H;
  return [
    [-hw, 0],
    [hw, 0],
    [hw, yEdge],
    [0, yApex],
    [-hw, yEdge],
  ];
}

function endWall(id: 'left' | 'right', r: () => number): WallBuild {
  const parts: THREE.BufferGeometry[] = [];
  const holes: [number, number][][] = [];
  if (id === 'right') holes.push(rectHole(-SIDE_WIN_W / 2, WIN_Y0 - BASE_H, SIDE_WIN_W / 2, WIN_Y1 - BASE_H));
  parts.push(panel(gableOutline(), holes, WALL_T, shadeIn, r() * 2));
  for (const s of [-1, 1]) {
    parts.push(trim([TRIM_W, WALL_H, TRIM_T], [s * (HALF_W - TRIM_W / 2), WALL_H / 2, TRIM_T / 2], r));
  }
  let win: WindowBuild | null = null;
  if (id === 'right') {
    windowFrame(SIDE_WIN_W, r, parts);
    win = buildWindow('right', SIDE_WIN_W, r);
  } else {
    // Puerta: hoja de tablones algo saliente, junta oscura, marco y tirador
    const hw = DOOR_W / 2;
    parts.push(
      box([DOOR_W - 0.012, DOOR_H - 0.012, 0.012], [0, DOOR_H / 2, 0.006], {
        uv: { kind: 'boards', offsetU: 0.7 },
        color: WHITE,
      }),
    );
    const gap: RGB = [0.16, 0.12, 0.1];
    parts.push(box([0.008, DOOR_H, 0.014], [-hw + 0.002, DOOR_H / 2, 0.007], { color: gap }));
    parts.push(box([0.008, DOOR_H, 0.014], [hw - 0.002, DOOR_H / 2, 0.007], { color: gap }));
    parts.push(box([DOOR_W, 0.008, 0.014], [0, DOOR_H - 0.002, 0.007], { color: gap }));
    const fw = 0.06;
    parts.push(trim([fw, DOOR_H + fw, TRIM_T], [-hw - fw / 2, (DOOR_H + fw) / 2, TRIM_T / 2], r));
    parts.push(trim([fw, DOOR_H + fw, TRIM_T], [hw + fw / 2, (DOOR_H + fw) / 2, TRIM_T / 2], r));
    parts.push(trim([DOOR_W + fw * 2, fw, TRIM_T], [0, DOOR_H + fw / 2, TRIM_T / 2], r));
    // Tirador
    const hx = hw - 0.09;
    parts.push(box([0.038, 0.17, 0.008], [hx, 0.98, 0.016], { color: DARK_METAL }));
    parts.push(box([0.02, 0.02, 0.045], [hx, 1.02, 0.04], { color: DARK_METAL }));
    parts.push(box([0.13, 0.02, 0.02], [hx - 0.055, 1.02, 0.062], { color: DARK_METAL }));
    parts.push(box([0.03, 0.05, 0.01], [hx, 0.93, 0.024], { color: DARK_METAL }));
  }
  const x = id === 'right' ? HALF_L : -HALF_L;
  return {
    id,
    pivot: [x, BASE_H, 0],
    rotY: id === 'right' ? Math.PI / 2 : -Math.PI / 2,
    wood: merge(parts),
    window: win,
  };
}

/** Coloca una geometría construida en el marco de una pared (x a lo largo, z hacia fuera). */
function place(geo: THREE.BufferGeometry, rotY: number, pos: [number, number, number]): THREE.BufferGeometry {
  geo.applyMatrix4(new THREE.Matrix4().makeRotationY(rotY));
  geo.translate(pos[0], pos[1], pos[2]);
  return geo;
}

/* ------------------------------------------------------------------ */
/* Base metálica y suelo                                               */
/* ------------------------------------------------------------------ */

function buildBase(r: () => number): { metal: THREE.BufferGeometry; wood: THREE.BufferGeometry } {
  const bx = HALF_L + 0.008;
  const bz = HALF_W + 0.008;
  const t = 0.028;
  const metal: THREE.BufferGeometry[] = [];
  const slot = (c: number, w: number) => rectHole(c - w / 2, 0.026, c + w / 2, 0.092);
  const plain: RGB = [1, 1, 1];
  // Laterales largos con 2 huecos para horquillas
  for (const s of [-1, 1]) {
    const g = panel(rectPath(-bx, 0, bx, BASE_H), [slot(-0.74, 0.25), slot(0.74, 0.25)], t, () => plain);
    metal.push(place(g, s > 0 ? 0 : Math.PI, [0, 0, s * bz]));
  }
  // Testeros con 2 huecos
  for (const s of [-1, 1]) {
    const g = panel(rectPath(-bz + t, 0, bz - t, BASE_H), [slot(-0.48, 0.22), slot(0.48, 0.22)], t, () => plain);
    metal.push(place(g, s > 0 ? Math.PI / 2 : -Math.PI / 2, [s * bx, 0, 0]));
  }
  // Interior oscuro que se ve por los huecos
  metal.push(box([bx * 2 - 0.08, BASE_H - 0.012, bz * 2 - 0.08], [0, BASE_H / 2, 0], { color: [0.05, 0.05, 0.05] }));
  // Banda gris oscura sobre la base
  const band: RGB = [0.2, 0.21, 0.21];
  const bandT = 0.008;
  metal.push(box([bx * 2, BAND_H, bandT], [0, BASE_H + BAND_H / 2, HALF_W + bandT / 2 - 0.002], { color: band }));
  metal.push(box([bx * 2, BAND_H, bandT], [0, BASE_H + BAND_H / 2, -HALF_W - bandT / 2 + 0.002], { color: band }));
  metal.push(box([bandT, BAND_H, bz * 2], [HALF_L + bandT / 2 - 0.002, BASE_H + BAND_H / 2, 0], { color: band }));
  metal.push(box([bandT, BAND_H, bz * 2], [-HALF_L - bandT / 2 + 0.002, BASE_H + BAND_H / 2, 0], { color: band }));
  // Suelo interior de tablones
  const floor = box([HALF_L * 2 - 0.06, 0.024, HALF_W * 2 - 0.06], [0, BASE_H - 0.012, 0], {
    uv: { kind: 'floor', axis: 'x' },
    color: (n) => (n.y > 0.5 ? [0.52, 0.48, 0.45] : [0.4, 0.4, 0.4]),
  });
  void r;
  return { metal: merge(metal), wood: merge([floor]) };
}

/* ------------------------------------------------------------------ */
/* Cubierta                                                            */
/* ------------------------------------------------------------------ */

/** Longitud de cada faldón medida sobre la pendiente. */
export const ROOF_SLOPE_LEN = (HALF_W + OVERHANG) / Math.cos(PITCH);
const ROOF_LEN = HALF_L * 2 + OVERHANG * 2;

function buildRoofHalf(front: boolean, r: () => number): RoofHalfBuild {
  const S = ROOF_SLOPE_LEN;
  const inside = HALF_W / Math.cos(PITCH);
  const wood: THREE.BufferGeometry[] = [];
  // Tablero: por debajo se ven tablas (más oscuras dentro de la caseta)
  wood.push(
    box([ROOF_LEN, DECK_T, S], [0, DECK_T / 2, S / 2], {
      uv: { kind: 'floor', axis: 'x' },
      color: (n, p) => {
        if (n.y < -0.5) return p.z < inside - 0.02 ? [0.42, 0.4, 0.38] : [0.72, 0.7, 0.68];
        return [0.75, 0.75, 0.75];
      },
    }),
  );
  // Tabla de alero (aplomada) y tablas de borde en los hastiales
  const c = Math.cos(PITCH);
  const s = Math.sin(PITCH);
  const fh = 0.075;
  const down = new THREE.Vector3(0, -c, s);
  const out = new THREE.Vector3(0, s, c);
  const fc = new THREE.Vector3(0, ROOF_T + 0.004, S).addScaledVector(down, fh / 2).addScaledVector(out, TRIM_T / 2);
  wood.push(trim([ROOF_LEN + TRIM_T * 2, fh, TRIM_T], [fc.x, fc.y, fc.z], r, WHITE, [-PITCH, 0, 0]));
  for (const sx of [-1, 1]) {
    wood.push(
      trim([TRIM_T, 0.115, S + 0.03], [sx * (ROOF_LEN / 2 + TRIM_T / 2), ROOF_T + 0.012 - 0.0575, S / 2 + 0.005], r),
    );
  }
  // Tela asfáltica
  const sh = box([ROOF_LEN, SHINGLE_T, S], [0, DECK_T + SHINGLE_T / 2, S / 2], {
    uv: { kind: 'floor', axis: 'x' },
    color: (n) => (n.y > 0.5 ? WHITE : [0.5, 0.5, 0.5]),
  });
  // v crece hacia la cumbrera para que el canto de cada fila mire al alero
  const uv = sh.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setY(i, S / 2 - uv.getY(i) + (front ? 0 : 1.4));
  const shingles = [sh];
  if (front) {
    // Albardilla de cumbrera, construida en el mundo y llevada al marco del faldón
    const top = TOTAL_H;
    const cap = box([ROOF_LEN + 0.02, 0.034, 0.17], [0, top - 0.017, 0], { uv: { kind: 'floor', axis: 'x' } });
    cap.applyMatrix4(roofMatrix(true).invert());
    shingles.push(cap);
  }
  return { shingles: merge(shingles), wood: merge(wood) };
}

/** Matriz del faldón: bisagra en la cumbrera, girado según la pendiente. */
export function roofMatrix(front: boolean): THREE.Matrix4 {
  const m = new THREE.Matrix4().makeTranslation(0, RIDGE_UNDER_Y, 0);
  if (!front) m.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
  m.multiply(new THREE.Matrix4().makeRotationX(PITCH));
  return m;
}

/* ------------------------------------------------------------------ */
/* Luces                                                               */
/* ------------------------------------------------------------------ */

function buildStringLights(inv: THREE.Matrix4): { cable: THREE.BufferGeometry; bulbs: THREE.Vector3[] } {
  const z = HALF_W + OVERHANG + 0.045;
  const yTop = RIDGE_UNDER_Y - (HALF_W + OVERHANG) * Math.tan(PITCH) - 0.028;
  const anchors = [-1.56, -0.78, 0, 0.78, 1.56];
  const sag = 0.05;
  const pts: THREE.Vector3[] = [];
  const bulbs: THREE.Vector3[] = [];
  const per = 4;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const n = 10;
    for (let k = 0; k <= n; k++) {
      if (i > 0 && k === 0) continue;
      const t = k / n;
      // Catenaria aproximada por parábola
      pts.push(new THREE.Vector3(a + (b - a) * t, yTop - sag * 4 * t * (1 - t), z));
    }
    for (let k = 0; k < per; k++) {
      const t = (k + 0.5) / per;
      bulbs.push(new THREE.Vector3(a + (b - a) * t, yTop - sag * 4 * t * (1 - t) - 0.026, z).applyMatrix4(inv));
    }
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  let cable: THREE.BufferGeometry = new THREE.TubeGeometry(curve, 120, 0.0035, 4, false);
  cable = cable.toNonIndexed();
  cable.applyMatrix4(inv);
  mapUV(cable, { kind: 'none' });
  paint(cable, [0.05, 0.05, 0.05]);
  // Portalámparas
  const sockets = bulbs.map((p) => {
    const g = box([0.016, 0.026, 0.016], [0, 0, 0], { color: [0.05, 0.05, 0.05] });
    g.applyMatrix4(new THREE.Matrix4().makeRotationX(-PITCH));
    const q = p.clone();
    // El portalámparas va justo encima de la bombilla (vertical del mundo en el marco del faldón)
    q.add(new THREE.Vector3(0, Math.cos(PITCH), -Math.sin(PITCH)).multiplyScalar(0.024));
    g.translate(q.x, q.y, q.z);
    return g;
  });
  return { cable: merge([cable, ...sockets]), bulbs };
}

function buildInteriorBulbs(inv: THREE.Matrix4): { cords: THREE.BufferGeometry; bulbs: THREE.Vector3[] } {
  const bulbs: THREE.Vector3[] = [];
  const cords: THREE.BufferGeometry[] = [];
  for (const x of [-0.95, -0.32, 0.32, 0.95]) {
    const z = 0.32;
    const yRoof = RIDGE_UNDER_Y - z * Math.tan(PITCH);
    const yBulb = 1.83 + (Math.abs(x) > 0.5 ? 0.03 : 0);
    const len = yRoof - yBulb - 0.03;
    const cord = box([0.006, len, 0.006], [x, yBulb + 0.03 + len / 2, z], { color: [0.04, 0.04, 0.04] });
    const socket = box([0.026, 0.04, 0.026], [x, yBulb + 0.035, z], { color: [0.06, 0.06, 0.06] });
    cord.applyMatrix4(inv);
    socket.applyMatrix4(inv);
    cords.push(cord, socket);
    bulbs.push(new THREE.Vector3(x, yBulb, z).applyMatrix4(inv));
  }
  return { cords: merge(cords), bulbs };
}

/* ------------------------------------------------------------------ */

export function buildCaseta(): CasetaBuild {
  const r = rng(2024);
  const base = buildBase(r);
  const walls = [longWall('front', r), endWall('right', r), longWall('back', r), endWall('left', r)];
  const roofFront = buildRoofHalf(true, r);
  const roofBack = buildRoofHalf(false, r);
  const roofFrontMatrix = roofMatrix(true);
  const inv = roofFrontMatrix.clone().invert();
  const lights = buildStringLights(inv);
  const interior = buildInteriorBulbs(inv);
  const all: THREE.BufferGeometry[] = [
    base.metal,
    base.wood,
    roofFront.shingles,
    roofFront.wood,
    roofBack.shingles,
    roofBack.wood,
    lights.cable,
    interior.cords,
  ];
  for (const w of walls) {
    all.push(w.wood);
    if (w.window) all.push(w.window.shutter, w.window.counter);
  }
  return {
    baseMetal: base.metal,
    baseWood: base.wood,
    walls,
    roofFront,
    roofBack,
    roofFrontMatrix,
    cable: lights.cable,
    stringBulbs: lights.bulbs,
    interiorBulbs: interior.bulbs,
    cords: interior.cords,
    dispose: () => all.forEach((g) => g.dispose()),
  };
}

export { BOARD };
