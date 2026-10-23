/**
 * Identificador ASCII de una provincia para el sprite del mapa
 * (/mapa-espana.svg#p-a-coruna) y enlace al formulario con la provincia ya
 * elegida. El nombre es exactamente el de PROVINCIAS (src/lib/quote-data.ts).
 */
export function provinceSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function provinceHref(name: string): string {
  return `/contacto?provincia=${encodeURIComponent(name)}`;
}

/** Ruta del sprite con la geometría de las provincias (src/app/mapa-espana.svg/route.ts). */
export const MAP_SPRITE = '/mapa-espana.svg';
