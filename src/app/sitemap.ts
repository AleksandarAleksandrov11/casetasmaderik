import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

// Fecha fija para que el sitemap sea estático. Actualízala al cambiar contenidos.
const UPDATED = '2026-11-02';

/** Todas las páginas de la web: las cuatro principales y las tres legales. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: '', priority: 1 },
    { path: '/casetas', priority: 0.9 },
    { path: '/contacto', priority: 0.8 },
    { path: '/nosotros', priority: 0.6 },
    { path: '/aviso-legal', priority: 0.2 },
    { path: '/politica-de-privacidad', priority: 0.2 },
    { path: '/politica-de-cookies', priority: 0.2 },
  ].map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    lastModified: UPDATED,
    changeFrequency: 'monthly',
    priority,
  }));
}
