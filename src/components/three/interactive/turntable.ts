/**
 * Fotogramas de la caseta para girarla y abrirla sin 3D. Lo genera
 * `scripts/posters/capture-turntable.mjs`: no editar a mano.
 * Clave del estado: ventanas, puerta y luz (1/0), p. ej. "100" = ventanas abiertas.
 */
export interface Turntable {
  /** Azimut de cada fotograma (grados, el primero es START_VIEW.az). */
  angles: number[];
  el: number;
  width: number;
  height: number;
  smWidth: number;
  /** Carpeta pública; cada archivo es `${base}/${clave}-${índice con 2 cifras}[-sm].webp`. */
  base: string;
  keys: string[];
}

export const TURNTABLE: Turntable | null = {
  angles: [-34, -4, 26, 56, 86, 116, 146, 176, 206, 236, 266, 296],
  el: 10,
  width: 1500,
  height: 1000,
  smWidth: 750,
  base: '/images/caseta-360',
  keys: ['000', '100', '010', '110', '001', '101', '011', '111'],
};
