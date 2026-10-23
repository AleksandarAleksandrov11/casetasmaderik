import { CANARIAS_FRAME, SPAIN_PROVINCES, SPAIN_VIEWBOX } from '@/components/sections/nosotros/spain-provinces';
import { provinceSlug } from '@/components/sections/nosotros/province-link';

// SVG estático generado en el build. Hace de sprite del mapa interactivo de
// Nosotros: cada provincia es un <path id="p-<slug>"> sin relleno propio, que el
// mapa dibuja con <use href="/mapa-espana.svg#p-<slug>"> y colorea con CSS. Así
// la geometría (unos 54 KB) se descarga una vez y no infla el HTML. El relleno
// del <g> solo sirve para ver el archivo suelto: el <use> no lo hereda.
export const dynamic = 'force-static';

const SOFT = '#E6DCCF';
const LINE = '#FBF8F3';

export function GET() {
  const paths = SPAIN_PROVINCES.map((p) => `<path id="p-${provinceSlug(p.name)}" d="${p.d}"/>`).join('');
  const f = CANARIAS_FRAME;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SPAIN_VIEWBOX}"><g fill="${SOFT}" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round">${paths}</g><rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="${SOFT}" stroke-width="1"/></svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
