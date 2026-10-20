/**
 * Manifiesto de posters. Lo genera `scripts/posters/capture-posters.mjs`:
 * no editar a mano. Coordenadas del recorte relativas al ancla del plano, en
 * fracciones de la dimensión de ajuste (alto con fit 'h', ancho con fit 'w').
 */
export interface PosterEntry {
  src: string;
  srcSm: string;
  webp: string;
  webpSm: string;
  width: number;
  height: number;
  smWidth: number;
  fit: 'h' | 'w';
  ax: number;
  ay: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const posters: Record<
  'heroDesktop' | 'heroMobile' | 'viewer' | 'viewerMobile' | 'assembly',
  PosterEntry | null
> = {
  heroDesktop: null,
  heroMobile: null,
  viewer: null,
  viewerMobile: null,
  assembly: null,
};
