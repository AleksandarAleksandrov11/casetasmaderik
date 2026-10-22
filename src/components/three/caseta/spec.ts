/**
 * Medidas reales de la caseta en metros. Origen en el suelo, en el centro de
 * la planta. X es el largo (2,90), Z el fondo (2,00) e Y la altura.
 * Frente = +Z (lado largo con la ventana grande), testero derecho = +X,
 * trasera = -Z, testero izquierdo (puerta) = -X.
 */

export const L = 2.9;
export const W = 2.0;
export const HALF_L = L / 2;
export const HALF_W = W / 2;

/** Base metálica galvanizada. */
export const BASE_H = 0.12;
/** Banda gris oscura sobre la base. */
export const BAND_H = 0.045;
/** Grosor de los paneles de tablones. */
export const WALL_T = 0.04;
/** Altura de la parte alta de los lados largos (alero). */
export const EAVE_Y = 2.05;
/** Altura total a cumbrera. */
export const TOTAL_H = 2.47;
/** Vuelo del alero. */
export const OVERHANG = 0.15;
/** Grosor de la cubierta: tablero más tela asfáltica. */
export const DECK_T = 0.024;
export const SHINGLE_T = 0.014;
export const ROOF_T = DECK_T + SHINGLE_T;
/** Altura de la albardilla de cumbrera sobre la cubierta. */
export const RIDGE_CAP = 0.012;

/** Pendiente de la cubierta: resuelta para que la cumbrera quede a 2,47 m. */
function solvePitch(): number {
  let lo = 0.1;
  let hi = 0.8;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const top = EAVE_Y + HALF_W * Math.tan(mid) + ROOF_T / Math.cos(mid) + RIDGE_CAP;
    if (top > TOTAL_H) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export const PITCH = solvePitch();
/** Altura de la cara inferior de la cubierta en la cumbrera. */
export const RIDGE_UNDER_Y = EAVE_Y + HALF_W * Math.tan(PITCH);

/** Tablones horizontales. */
export const BOARD = 0.12;
/** Metros de madera que cubre la textura (u, v). */
export const WOOD_TEX_U = 2.0;
export const WOOD_TEX_V = BOARD * 10;

/** Remates esquineros y marcos. */
export const TRIM_W = 0.09;
export const TRIM_T = 0.022;

/** Ventanas: borde inferior a la altura del mostrador. */
export const WIN_Y0 = 1.0;
export const WIN_Y1 = 1.87;
export const FRONT_WIN_W = 2.3;
export const SIDE_WIN_W = 1.4;

/** Contraventana: algo mayor que el hueco, con bisagra arriba. */
export const SHUTTER_TOP = 1.92;
export const SHUTTER_BOTTOM = 0.97;
export const SHUTTER_SIDE = 0.05;
export const SHUTTER_PANEL_T = 0.022;
export const SHUTTER_FRAME_T = 0.018;
export const SHUTTER_OPEN = (78 * Math.PI) / 180;
/** Los marcos de ventana sobresalen de la pared; la contraventana cierra sobre ellos. */
export const FRAME_W = 0.05;

/** Mostrador abatible. */
export const COUNTER_D = 0.3;
export const COUNTER_T = 0.035;

/** Puerta en el testero izquierdo. */
export const DOOR_W = 0.75;
export const DOOR_H = 1.85;

/** Altura interior de las paredes (desde la base). */
export const WALL_H = EAVE_Y - BASE_H;
