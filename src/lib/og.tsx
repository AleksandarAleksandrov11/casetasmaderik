import { ImageResponse } from 'next/og';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Imagen Open Graph de 1200 × 630 por página. Usa el render del 3D
 * (public/images/posters/og-base.png) y, si aún no existe, una foto real.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const root = process.cwd();
const fontRegular = readFile(join(root, 'src/assets/fonts/outfit-400.woff'));
const fontMedium = readFile(join(root, 'src/assets/fonts/outfit-500.woff'));

const ISO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5.5 0.5 89 78.5"><g fill="none" stroke="#98603E" stroke-width="5" stroke-miterlimit="10"><path d="M10 79V30L50 5.5L90 30V79"/><path d="M10 50L50 14L90 50"/><path d="M25.5 79V39.5H74.5V79"/></g></svg>`;

async function sideImage(): Promise<{ src: string; poster: boolean }> {
  const poster = join(root, 'public/images/posters/og-base.png');
  if (existsSync(poster)) {
    const data = await readFile(poster);
    return { src: `data:image/png;base64,${data.toString('base64')}`, poster: true };
  }
  const photo = await readFile(join(root, 'public/images/real/caseta-madera-alquiler-feria-abierta.jpg'));
  return { src: `data:image/jpeg;base64,${photo.toString('base64')}`, poster: false };
}

export async function renderOg({ title, eyebrow = 'Casetas Maderik' }: { title: string; eyebrow?: string }) {
  const [regular, medium, img] = await Promise.all([fontRegular, fontMedium, sideImage()]);
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#FBF8F3', fontFamily: 'Outfit' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: img.poster ? 640 : 700,
          padding: '64px 0 56px 72px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(ISO_SVG)}`} width={78} height={69} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: '#98603E',
              fontSize: 20,
              letterSpacing: 4,
              fontWeight: 500,
            }}
          >
            <div style={{ width: 28, height: 1, background: '#98603E' }} />
            {eyebrow.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 24,
              fontSize: 62,
              lineHeight: 1.04,
              color: '#0E1615',
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: '#5E6461' }}>casetasmaderik.es</div>
      </div>
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Outfit', data: regular, style: 'normal', weight: 400 },
        { name: 'Outfit', data: medium, style: 'normal', weight: 500 },
      ],
    },
  );
}
