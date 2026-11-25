/**
 * Fotogramas del kit para girarlo y plegarlo sin 3D. Lo genera
 * `scripts/posters/capture-kit.mjs`: no editar a mano.
 * Clave del estado: "0" desplegado, "1" plegado.
 */
export interface KitFrames {
  /** Azimut de cada fotograma (grados, el primero es KIT_START.az). */
  angles: number[];
  el: number;
  width: number;
  height: number;
  smWidth: number;
  /** Carpeta pública; cada archivo es `${base}/${clave}-${índice con 2 cifras}[-sm].webp`. */
  base: string;
  keys: string[];
}

export const KIT_FRAMES: KitFrames | null = {
  angles: [-32, -2, 28, 58, 88, 118, 148, 178, 208, 238, 268, 298],
  el: 16,
  width: 1500,
  height: 1000,
  smWidth: 750,
  base: '/images/kit-360',
  keys: ['0', '1'],
};
