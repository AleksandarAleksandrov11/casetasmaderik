import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// path-to-regexp incluido en Next (el mismo motor de patrones que usa Vercel)
import { pathToRegexp } from 'next/dist/compiled/path-to-regexp';
import { homeMeta } from '@/content/home';
import { casetasMeta } from '@/content/casetas';
import { mesasMeta } from '@/content/mesas';
import { nosotrosMeta } from '@/content/nosotros';
import { contactoMeta } from '@/content/contacto';
import { avisoLegal, politicaCookies, politicaPrivacidad } from '@/content/legal';
import { casetasFaqs, contactoFaqs, homeFaqs, mesasFaqs } from '@/content/faqs';
import {
  breadcrumbNode,
  faqNode,
  graph,
  kitProductNode,
  kitServiceNode,
  localBusinessNode,
  organizationNode,
  productNode,
  serviceNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';
import { site } from '@/content/site';
import { absoluteUrl, pageMetadata } from '@/lib/seo';

const pages = [
  { path: '/', ...homeMeta },
  { path: '/casetas', ...casetasMeta },
  { path: '/mesas-y-bancos', ...mesasMeta },
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
      expect(canonical.startsWith('https://www.casetasmaderik.com')).toBe(true);
      expect(canonical.endsWith('/')).toBe(false);
    }
    expect(absoluteUrl('/')).toBe('https://www.casetasmaderik.com');
  });

  it('las legales no se indexan y las demás sí', () => {
    const legal = pageMetadata({ ...avisoLegal, title: avisoLegal.metaTitle, noindex: true });
    expect(legal.robots).toMatchObject({ index: false, follow: true });
    const home = pageMetadata({ title: homeMeta.title, description: homeMeta.description, path: '/' });
    expect(home.robots).toMatchObject({ index: true, follow: true });
  });

  it('el logo de Organization es un PNG cuadrado (Google no admite SVG)', () => {
    const org = JSON.parse(JSON.stringify(organizationNode())) as {
      logo: { url: string; width: number; height: number };
    };
    expect(org.logo.url).toBe('https://www.casetasmaderik.com/brand/logo-512.png');
    expect(org.logo.width).toBe(org.logo.height);
    expect(Number(org.logo.width)).toBeGreaterThanOrEqual(112);
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
    expect(org.telephone).toBe('+34682795753');
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
    ['/mesas-y-bancos', mesasFaqs],
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

  it('no hay redirecciones por host: www y raíz los resuelve Vercel (Settings > Domains), así no hay bucles', () => {
    expect(config.redirects.some((r) => r.has)).toBe(false);
  });

  it('las páginas nuevas no se redirigen', () => {
    for (const p of ['/', '/casetas', '/mesas-y-bancos', '/nosotros', '/contacto']) expect(resolve(p)).toBeNull();
  });
});

describe('datos del negocio', () => {
  it('el domicilio es Puerto Neveros, 9, 28935 Móstoles y sale en LocalBusiness', () => {
    const node = JSON.parse(JSON.stringify(localBusinessNode())) as {
      address: Record<string, string>;
      areaServed: unknown;
    };
    expect(node.address).toMatchObject({
      streetAddress: 'Puerto Neveros, 9',
      postalCode: '28935',
      addressLocality: 'Móstoles',
      addressRegion: 'Madrid',
      addressCountry: 'ES',
    });
    expect(JSON.stringify(node.areaServed)).toContain('España');
  });

  it('los textos legales llevan el domicilio y ya no hablan de datos registrales ni de pendientes', () => {
    const text = JSON.stringify([avisoLegal, politicaPrivacidad]);
    expect(text).toContain('Puerto Neveros, 9, 28935 Móstoles (Madrid)');
    expect(text).not.toMatch(/registrales|Pendiente de publicar/i);
  });

  it('la zona de servicio es la España peninsular: el mapa excluye islas, Ceuta y Melilla', async () => {
    const { PROVINCIAS, PROVINCIAS_PENINSULA } = await import('@/lib/quote-data');
    expect(site.serviceArea.phrase).toBe('toda la España peninsular');
    for (const p of ['Illes Balears', 'Las Palmas', 'Santa Cruz de Tenerife', 'Ceuta', 'Melilla']) {
      expect(PROVINCIAS_PENINSULA).not.toContain(p);
    }
    expect(PROVINCIAS_PENINSULA).toContain('Madrid');
    expect(PROVINCIAS_PENINSULA.length).toBe(PROVINCIAS.length - 5);
  });
});

describe('kit de mesa y dos bancos', () => {
  it('un kit por cada 8 personas sentadas, como en las fotos del cliente', async () => {
    const { kitsFor } = await import('@/content/site');
    expect(kitsFor(80)).toBe(10);
    expect(kitsFor(200)).toBe(25);
    expect(kitsFor(400)).toBe(50);
    expect(kitsFor(81)).toBe(11);
    expect(kitsFor(0)).toBe(0);
  });

  it('Product y Service del kit con solo los datos confirmados', () => {
    const p = JSON.parse(JSON.stringify(kitProductNode())) as Record<string, unknown>;
    expect(p['@id']).toBe('https://www.casetasmaderik.com/mesas-y-bancos#product');
    expect(p.image).toBe('https://www.casetasmaderik.com/images/mesas/kit-mesa-dos-bancos-madera-abeto.webp');
    expect(JSON.stringify(p)).toContain('2,20 m');
    expect(JSON.stringify(p.additionalProperty)).toContain('"value":8');
    expect(p).not.toHaveProperty('height');
    const s = JSON.parse(JSON.stringify(kitServiceNode())) as Record<string, unknown>;
    expect(JSON.stringify(s.hasOfferCatalog)).toContain('/mesas-y-bancos#product');
  });

  it('la página está en el menú', async () => {
    const { nav } = await import('@/content/site');
    expect(nav.map((n) => n.href)).toContain('/mesas-y-bancos');
  });
});
