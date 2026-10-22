/**
 * Fotogramas del montaje sin 3D (uno por valor de ASSEMBLY_FRAMES). Lo genera
 * `scripts/posters/capture-turntable.mjs --assembly`: no editar a mano.
 */
export interface AssemblyFramesManifest {
  width: number;
  height: number;
  smWidth: number;
  /** Carpeta pública; cada archivo es `${base}/montaje-${índice con 2 cifras}[-sm].webp`. */
  base: string;
}

export const ASSEMBLY_FRAMES_MANIFEST: AssemblyFramesManifest | null = {
  width: 1200,
  height: 900,
  smWidth: 600,
  base: '/images/caseta-360',
};
