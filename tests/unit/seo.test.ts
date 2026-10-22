import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// path-to-regexp incluido en Next (el mismo motor de patrones que usa Vercel)
import { pathToRegexp } from 'next/dist/compiled/path-to-regexp';
import { homeMeta } from '@/content/home';
import { casetasMeta } from '@/content/casetas';
import { nosotrosMeta } from '@/content/nosotros';
import { contactoMeta } from '@/content/contacto';
import { avisoLegal, politicaCookies, politicaPrivacidad } from '@/content/legal';
import { casetasFaqs, contactoFaqs, homeFaqs } from '@/content/faqs';
import {
  breadcrumbNode,
  faqNode,
  graph,
  organizationNode,
  productNode,
  serviceNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

const pages = [
  { path: '/', ...homeMeta },
  { path: '/casetas', ...casetasMeta },
  { path: '/nosotros', ...nosotrosMeta },
  { path: '/contacto', ...contactoMeta },
  { path: avisoLegal.path, title: avisoLegal.metaTitle, description: avisoLegal.description },
  { path: politicaPrivacidad.path, title: politicaPrivacidad.metaTitle, description: politicaPrivacidad.description },
  { path: politicaCookies.path, title: politicaCookies.metaTitle, description: politicaCookies.description },
];

describe('metadatos', () => {
  it.each(pages)('$path: título de 60 caracteres como máximo', ({ title }) => {
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith(' | Casetas Maderik')).toBe(true);
  });

  it.each(pages)('$path: descripción entre 140 y 160 caracteres', ({ description }) => {
    expect(description.length).toBeGreaterThanOrEqual(140);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('títulos y descripciones únicos', () => {
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length);
  });

  it('canonical absoluto sin barra final', () => {
    for (const p of pages) {
      const meta = pageMetadata({ title: p.title, description: p.description, path: p.path });
      const canonical = String(meta.alternates?.canonical);
      expect(canonical.startsWith('https://casetasmaderik.es')).toBe(true);
      expect(canonical.endsWith('/')).toBe(false);
    }
    expect(absoluteUrl('/')).toBe('https://casetasmaderik.es');
  });

  it('las legales no se indexan', () => {
    const meta = pageMetadata({ ...avisoLegal, title: avisoLegal.metaTitle, noindex: true });
    expect(meta.robots).toMatchObject({ index: false, follow: true });
  });
});

describe('JSON-LD', () => {
  const roundTrip = (v: unknown): unknown => JSON.parse(JSON.stringify(v));

  it('Organization con los campos obligatorios', () => {
    const org = roundTrip(organizationNode()) as Record<string, unknown>;
    for (const key of ['name', 'legalName', 'taxID', 'url', 'logo', 'email', 'telephone', 'contactPoint', 'sameAs']) {
      expect(org[key], key).toBeTruthy();
    }
    expect(org.taxID).toBe('G75277475');
    expect(org.telephone).toBe('+34656324123');
  });

  it('Product con medidas en metros y sin precio', () => {
    const prod = roundTrip(productNode()) as Record<string, { value: number; unitCode: string }>;
    expect(prod.width).toMatchObject({ value: 2.9, unitCode: 'MTR' });
    expect(prod.depth).toMatchObject({ value: 2, unitCode: 'MTR' });
    expect(prod.height).toMatchObject({ value: 2.47, unitCode: 'MTR' });
    expect(JSON.stringify(prod)).not.toMatch(/price/i);
  });

  it('Service con proveedor, área y catálogo', () => {
    const svc = roundTrip(serviceNode()) as Record<string, unknown>;
    expect(svc.serviceType).toBe('Alquiler de casetas de madera para eventos');
    expect(svc.provider).toBeTruthy();
    expect(svc.areaServed).toBeTruthy();
    expect(JSON.stringify(svc.hasOfferCatalog)).toContain('itemOffered');
  });

  it.each([
    ['/', homeFaqs],
    ['/casetas', casetasFaqs],
    ['/contacto', contactoFaqs],
  ] as const)('FAQPage de %s con todas las preguntas', (path, faqs) => {
    const node = roundTrip(faqNode(path, faqs)) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(node.mainEntity).toHaveLength(faqs.length);
    for (const q of node.mainEntity) {
      expect(q.name.length).toBeGreaterThan(5);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(5);
    }
  });

  it('grafo serializable con @context e @id únicos', () => {
    const g = roundTrip(
      graph([
        organizationNode(),
        websiteNode(),
        webPageNode({ path: '/casetas', name: 'x', description: 'y', breadcrumb: true }),
        breadcrumbNode('/casetas', [
          { name: 'Inicio', path: '/' },
          { name: 'Casetas', path: '/casetas' },
        ]),
        serviceNode(),
        productNode(),
      ]),
    ) as { '@context': string; '@graph': { '@id': string; '@type': string }[] };
    expect(g['@context']).toBe('https://schema.org');
    const ids = g['@graph'].map((n) => n['@id']);
    expect(new Set(ids).size).toBe(ids.length);
    const crumbs = g['@graph'].find((n) => n['@type'] === 'BreadcrumbList') as unknown as {
      itemListElement: { position: number }[];
    };
    expect(crumbs.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});

describe('redirecciones de vercel.json', () => {
  type Rule = { source: string; destination: string; statusCode?: number; has?: unknown[] };
  const config = JSON.parse(readFileSync(join(__dirname, '..', '..', 'vercel.json'), 'utf8')) as { redirects: Rule[] };
  const rules = config.redirects.filter((r) => !r.has);

  const resolve = (url: string) => {
    for (const r of rules) {
      if (pathToRegexp(r.source, [], { strict: false }).test(url)) return r;
    }
    return null;
  };

  it.each([
    ['/product-category/casetas', '/casetas'],
    ['/product-category/casetas/', '/casetas'],
    ['/product/caseta-de-madera-para-eventos-y-ferias-290-x-200-m-2', '/casetas'],
    ['/product/caseta-de-madera-para-eventos-y-ferias-290-x-200-m-2/', '/casetas'],
    ['/tienda', '/casetas'],
    ['/tienda/', '/casetas'],
    ['/mi-cuenta', '/contacto'],
    ['/mi-cuenta/', '/contacto'],
    ['/carrito', '/contacto'],
    ['/carrito/', '/contacto'],
    ['/pago', '/contacto'],
    ['/pago/', '/contacto'],
    ['/feed', '/'],
    ['/feed/', '/'],
  ])('%s redirige a %s con un 301', (from, to) => {
    const rule = resolve(from);
    expect(rule, from).not.toBeNull();
    expect(rule!.destination).toBe(to);
    expect(rule!.statusCode).toBe(301);
  });

  it('www redirige al dominio raíz', () => {
    const www = config.redirects.find((r) => r.has);
    expect(www?.destination).toBe('https://casetasmaderik.es/:path*');
    expect(www?.statusCode).toBe(301);
  });

  it('las páginas nuevas no se redirigen', () => {
    for (const p of ['/', '/casetas', '/nosotros', '/contacto']) expect(resolve(p)).toBeNull();
  });
});
