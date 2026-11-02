import manifest from '../manifest';

export const dynamic = 'force-static';

/** Mismo manifiesto que /manifest.webmanifest, en la ruta clásica /site.webmanifest. */
export function GET() {
  return new Response(JSON.stringify(manifest()), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
