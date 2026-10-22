import type { Metadata } from 'next';
import { site } from '@/content/site';

type PageSeo = {
  /** Título completo tal y como debe aparecer (con " | Casetas Maderik"). */
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogAlt?: string;
};

export const SITE_SUFFIX = ` | ${site.name}`;

export function absoluteUrl(path: string): string {
  if (path === '/' || path === '') return site.url;
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`.replace(/\/$/, '');
}

/**
 * Metadatos por página: canonical absoluto sin barra final, idioma es-ES,
 * Open Graph y Twitter. La imagen OG la genera cada ruta con opengraph-image.
 */
export function pageMetadata({ title, description, path, noindex = false }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: { 'es-ES': url },
    },
    openGraph: {
      type: 'website',
      locale: site.locale,
      siteName: site.name,
      url,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  };
}
