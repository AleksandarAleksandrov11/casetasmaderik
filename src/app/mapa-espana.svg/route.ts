import { site } from '@/content/site';
import { CANARIAS_FRAME, SPAIN_PROVINCES, SPAIN_VIEWBOX } from '@/components/sections/nosotros/spain-provinces';

// SVG estático generado en el build a partir de la zona de servicio de site.ts
export const dynamic = 'force-static';

const SOFT = '#EBE2D5';
const ON = '#98603E';
const LINE = '#FBF8F3';

export function GET() {
  const regions = site.serviceArea.regions as readonly string[];
  const all = regions.length === 0;
  const paths = SPAIN_PROVINCES.map((p) => {
    const fill = all || !regions.includes(p.name) ? SOFT : ON;
    return `<path d="${p.d}" fill="${fill}"><title>${p.name}</title></path>`;
  }).join('');
  const f = CANARIAS_FRAME;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SPAIN_VIEWBOX}"><g stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round">${paths}</g><rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="#E6DCCF" stroke-width="1"/></svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
