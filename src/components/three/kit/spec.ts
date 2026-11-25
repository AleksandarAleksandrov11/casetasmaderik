/**
 * Medidas del kit de mesa y dos bancos en 3D (metros). El largo de 2,20 m es
 * el dato publicado; el resto son proporciones habituales de este mobiliario
 * plegable y solo sirven para el dibujo. Sin three: lo usa también el HTML.
 */
export const KIT_L = 2.2;
export const HALF_KL = KIT_L / 2;

export const TABLE_W = 0.5;
export const TABLE_H = 0.77;
export const BENCH_W = 0.25;
export const BENCH_H = 0.47;
/** Centro de cada banco respecto al eje de la mesa. */
export const BENCH_Z = 0.52;

/** Grosor del tablero y de los listones de debajo. */
export const TOP_T = 0.028;
export const BATTEN_T = 0.04;
/** Tubo cuadrado de las patas. */
export const TUBE = 0.028;

/** Distancia de cada bisagra de patas al centro (a lo largo). */
export const TABLE_PIVOT_X = 0.8;
export const BENCH_PIVOT_X = 0.82;

/** Largo de pata desde la bisagra (bajo los listones) hasta el suelo. */
export const TABLE_LEG = TABLE_H - TOP_T - BATTEN_T;
export const BENCH_LEG = BENCH_H - TOP_T - BATTEN_T;

/** Ancho de tablón dibujado: la textura de madera trae tablones de 0,12 m. */
export const PLANK = 0.083;

/** Encuadre 3:2 del visor: rectángulo de SPAN_W × SPAN_H m a zoom 1. */
export const KIT_FRAME = { ratio: 3 / 2, spanH: 2.15, tx: 0, ty: 0.36, ax: 0.5, ay: 0.48, dist: 9 } as const;
export const KIT_SPAN_W = KIT_FRAME.spanH * KIT_FRAME.ratio;

/** Vista inicial y primer fotograma. */
export const KIT_START = { az: -32, el: 16, zoom: 1 } as const;
/** Vista al plegar y al mostrar las medidas. */
export const KIT_VIEWS = { fold: { az: -24, el: 22 }, dims: { az: -14, el: 30 } } as const;

/** Cota del largo, delante del banco delantero. */
export const KIT_DIM_LABEL = '2,20 m';
