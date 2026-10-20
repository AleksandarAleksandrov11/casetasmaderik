/**
 * Geometría isométrica de la caseta para CasetaLineup. Unidades en decímetros
 * con las medidas reales: 2,90 × 2,00 × 2,47 m, alero a 2,05 m, tres ventanas
 * de 0,78 × 0,85 m con el borde inferior a 0,95 m, mostrador corrido de 0,30 m
 * y contraventanas abiertas como visera.
 */
const L = 29; // largo (frente)
const D = 20; // ancho (fondo)
const ZE = 20.5; // alero
const ZR = 24.7; // cumbrera
const OVER = 1.6; // vuelo del tejado
const SLOPE = (ZR - ZE) / (D / 2);
const WIN = { w: 7.8, h: 8.5, z: 9.5, gap: (L - 3 * 7.8) / 4 };
const COUNTER = { depth: 3, thick: 0.6 };
const VISOR = 4.6; // vuelo de la contraventana abierta (simplificado)
const VISOR_ANGLE = (78 * Math.PI) / 180;
const DOOR = { y0: 4.5, y1: 12, h: 18.5 };

const C = Math.cos(Math.PI / 6);
const S = 0.5;

type P3 = readonly [number, number, number];

function iso([x, y, z]: P3): string {
  const sx = (x - y) * C;
  const sy = (x + y) * S - z;
  return `${round(sx)},${round(sy)}`;
}

const round = (n: number) => Math.round(n * 100) / 100;

const poly = (...pts: P3[]) => pts.map(iso).join(' ');

export type StallShapes = {
  shadow: string;
  side: string;
  sidePlanks: string[];
  door: string;
  front: string;
  frontPlanks: string[];
  windows: string[];
  counterTop: string;
  counterEdge: string;
  visors: string[];
  roofBack: string;
  roofFront: string;
  roofEnd: string;
  ridge: string;
};

function buildStall(): StallShapes {
  const eaveZ = ZE - OVER * SLOPE;
  const xs = Array.from({ length: 3 }, (_, i) => WIN.gap + i * (WIN.w + WIN.gap));
  const vy = D + VISOR * Math.sin(VISOR_ANGLE);
  const vz = WIN.z + WIN.h - VISOR * Math.cos(VISOR_ANGLE);
  const top = WIN.z + WIN.h;

  // Tablones verticales: pocas líneas, solo para sugerir la madera
  const sidePlanks = [4, 8, 12, 16].map(
    (y) => `M${iso([L, y, 0.6])}L${iso([L, y, ZE + (y <= D / 2 ? y : D - y) * SLOPE - 0.6])}`,
  );
  const frontPlanks = Array.from({ length: 6 }, (_, i) => {
    const x = (L / 7) * (i + 1);
    return `M${iso([x, D, 0.6])}L${iso([x, D, WIN.z - COUNTER.thick - 0.4])}`;
  });

  return {
    shadow: poly([-2, -2, 0], [L + 3, -2, 0], [L + 3, D + 5, 0], [-2, D + 5, 0]),
    side: poly([L, 0, 0], [L, D, 0], [L, D, ZE], [L, D / 2, ZR], [L, 0, ZE]),
    sidePlanks,
    door: poly([L, DOOR.y0, 0], [L, DOOR.y1, 0], [L, DOOR.y1, DOOR.h], [L, DOOR.y0, DOOR.h]),
    front: poly([0, D, 0], [L, D, 0], [L, D, ZE], [0, D, ZE]),
    frontPlanks,
    windows: xs.map((x) => poly([x, D, WIN.z], [x + WIN.w, D, WIN.z], [x + WIN.w, D, top], [x, D, top])),
    counterTop: poly([0, D, WIN.z], [L, D, WIN.z], [L, D + COUNTER.depth, WIN.z], [0, D + COUNTER.depth, WIN.z]),
    counterEdge: poly(
      [0, D + COUNTER.depth, WIN.z],
      [L, D + COUNTER.depth, WIN.z],
      [L, D + COUNTER.depth, WIN.z - COUNTER.thick],
      [0, D + COUNTER.depth, WIN.z - COUNTER.thick],
    ),
    visors: xs.map((x) => poly([x, D, top], [x + WIN.w, D, top], [x + WIN.w, vy, vz], [x, vy, vz])),
    roofBack: poly([-OVER, D / 2, ZR], [L + OVER, D / 2, ZR], [L + OVER, -OVER, eaveZ], [-OVER, -OVER, eaveZ]),
    roofFront: poly([-OVER, D + OVER, eaveZ], [L + OVER, D + OVER, eaveZ], [L + OVER, D / 2, ZR], [-OVER, D / 2, ZR]),
    roofEnd: poly(
      [L + OVER, D + OVER, eaveZ],
      [L + OVER, D / 2, ZR],
      [L + OVER, -OVER, eaveZ],
      [L + OVER, -OVER, eaveZ - 0.9],
      [L + OVER, D / 2, ZR - 0.9],
      [L + OVER, D + OVER, eaveZ - 0.9],
    ),
    ridge: `M${iso([-OVER, D / 2, ZR])}L${iso([L + OVER, D / 2, ZR])}`,
  };
}

/** Formas de una caseta en el origen. Se calculan una sola vez. */
export const STALL = buildStall();

/*
 * Disposición: cada caseta se desplaza en el mundo según (s, -s), que en
 * isométrico es un paso horizontal en pantalla. La segunda fila va delante y
 * desplazada medio paso. Se dibuja de atrás adelante y de derecha a izquierda.
 */
const STEP_WORLD = 31;
export const STEP_X = round(2 * STEP_WORLD * C); // paso horizontal en pantalla
const ROW_DY = 30; // la fila delantera baja 30 unidades en pantalla

/** Caja de una caseta en pantalla respecto a su origen. */
export const STALL_BOX = { minX: -24, maxX: 30, minY: -22, maxY: 29 };
export const PLUS_W = 44;

export type Slot = { index: number; x: number; y: number; row: 0 | 1 };

export type Layout = {
  slots: Slot[];
  extra: number;
  plus: { x: number; y: number } | null;
  width: number;
  height: number;
};

/** Huecos para `count` casetas (como mucho `max`) centrados en un lienzo fijo. */
export function computeLayout(count: number, max: number): Layout {
  const safeMax = Math.max(1, Math.floor(max));
  const n = Math.max(0, Math.min(Math.floor(count), safeMax));
  const extra = Math.max(0, Math.floor(count) - safeMax);
  const perRowMax = safeMax > 6 ? Math.ceil(safeMax / 2) : safeMax;
  const twoRowsCanvas = safeMax > perRowMax;

  // Lienzo fijo: el tamaño de cada caseta no cambia al añadir más
  const canvasRowW = (perRowMax - 1) * STEP_X + (twoRowsCanvas ? STEP_X / 2 : 0);
  const width = round(canvasRowW + (STALL_BOX.maxX - STALL_BOX.minX) + PLUS_W + 8);
  const height = round(STALL_BOX.maxY - STALL_BOX.minY + (twoRowsCanvas ? ROW_DY : 0) + 6);

  const twoRows = n > perRowMax;
  const back = twoRows ? Math.ceil(n / 2) : n;
  const front = n - back;

  const local: Omit<Slot, 'index'>[] = [];
  for (let i = 0; i < back; i++) local.push({ x: i * STEP_X, y: 0, row: 0 });
  for (let i = 0; i < front; i++) local.push({ x: i * STEP_X + STEP_X / 2, y: ROW_DY, row: 1 });

  const lastX = local.reduce((m, s) => Math.max(m, s.x), 0);
  const plusW = extra > 0 ? PLUS_W : 0;
  const contentW = lastX + (STALL_BOX.maxX - STALL_BOX.minX) + plusW;
  const contentH = STALL_BOX.maxY - STALL_BOX.minY + (twoRows ? ROW_DY : 0);
  const offX = (width - contentW) / 2 - STALL_BOX.minX;
  const offY = (height - contentH) / 2 - STALL_BOX.minY;

  const slots = local.map((s, index) => ({ index, row: s.row, x: round(s.x + offX), y: round(s.y + offY) }));
  const frontRow = slots.filter((s) => s.row === (twoRows ? 1 : 0));
  const anchor = frontRow[frontRow.length - 1];
  const plus = extra > 0 && anchor ? { x: round(anchor.x + STALL_BOX.maxX + 10), y: round(anchor.y + 8) } : null;
  return { slots, extra, plus, width, height };
}
