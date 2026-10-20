import type { NextConfig } from 'next';

/**
 * Las redirecciones y cabeceras de seguridad viven solo en vercel.json para no
 * duplicarlas.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 70, 75, 80, 85],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 480, 560, 680],
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
};

export default nextConfig;
