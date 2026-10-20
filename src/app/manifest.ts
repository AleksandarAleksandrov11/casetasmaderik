import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: 'Maderik',
    description: 'Alquiler de casetas de madera para ferias, mercados navideños y eventos.',
    lang: 'es-ES',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF8F3',
    theme_color: '#FBF8F3',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
