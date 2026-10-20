import type { NextConfig } from 'next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Las redirecciones y cabeceras de seguridad viven solo en vercel.json para no
 * duplicarlas. Para el QA local (VERCEL_JSON_LOCAL=1) se leen de ese mismo
 * archivo y se aplican en `next start`, así se prueban CSP y redirecciones.
 */
type VercelRule = { source: string; destination: string; statusCode?: number; has?: { type: 'host'; value: string }[] };
type VercelHeaders = { source: string; headers: { key: string; value: string }[] };

const localVercel = process.env.VERCEL_JSON_LOCAL === '1';
const vercel = localVercel
  ? (JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8')) as {
      redirects: VercelRule[];
      headers: VercelHeaders[];
    })
  : null;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 70, 75, 80, 85],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 320, 384, 480, 560, 680],
    minimumCacheTTL: 2678400,
  },
  experimental: {
    optimizePackageImports: ['three', '@react-three/drei', '@react-three/fiber', 'lucide-react'],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  ...(vercel
    ? {
        // Vercel aplica las redirecciones de vercel.json antes que la
        // normalización de la barra final de Next: se reproduce ese orden
        skipTrailingSlashRedirect: true,
        async redirects() {
          return [
            ...vercel.redirects.map((r) => ({
              source: r.source,
              destination: r.destination,
              statusCode: (r.statusCode ?? 308) as 301 | 308,
              ...(r.has ? { has: r.has } : {}),
            })),
            { source: '/:path+/', destination: '/:path+', statusCode: 308 as const },
          ];
        },
        async headers() {
          // En local no hay HTTPS: se omiten HSTS y upgrade-insecure-requests
          return vercel.headers.map((h) => ({
            source: h.source,
            headers: h.headers
              .filter((x) => x.key !== 'Strict-Transport-Security')
              .map((x) =>
                x.key === 'Content-Security-Policy'
                  ? { ...x, value: x.value.replace(/;\s*upgrade-insecure-requests/, '') }
                  : x,
              ),
          }));
        },
      }
    : {}),
};

export default nextConfig;
