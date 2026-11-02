import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: 'Maderik',
    description: 'Alquiler de casetas de madera para ferias, mercados navideños y eventos.',
    lang: 'es-ES',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    categories: ['business'],
    background_color: '#FBF8F3',
    theme_color: '#98603E',
    icons: [
      { src: '/icons/icon-48.png', sizes: '48x48', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
