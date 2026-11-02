import { expect, test } from '@playwright/test';

const PAGES = ['/', '/casetas', '/nosotros', '/contacto'];
const LEGAL = ['/aviso-legal', '/politica-de-privacidad', '/politica-de-cookies'];

test.describe('SEO en el HTML servido', () => {
  for (const path of [...PAGES, ...LEGAL]) {
    test(`metadatos de ${path}`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThanOrEqual(60);
      const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? '';
      expect(desc.length).toBeGreaterThanOrEqual(140);
      expect(desc.length).toBeLessThanOrEqual(160);
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      expect(canonical).toBe(`https://www.casetasmaderik.com${path === '/' ? '' : path}`);
      expect(html).toContain('<html lang="es"');
      expect(html).toContain('name="google-site-verification" content="l2LKSlg4IhbfzGAdQjzdPHE0UjYSLac48nWuEMNIhek"');
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
      expect(robots).not.toContain('noindex');
      expect(robots).toContain('index');
      // JSON-LD válido
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) =>
        JSON.parse(m[1]),
      );
      expect(blocks.length).toBeGreaterThan(0);
      for (const b of blocks) expect(b['@context']).toBe('https://schema.org');
    });
  }

  for (const path of [...PAGES, ...LEGAL]) {
    test(`imagen OG de ${path} responde 200`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      expect(og).toBeTruthy();
      const url = new URL(og!);
      const img = await request.get(url.pathname + url.search);
      expect(img.status()).toBe(200);
      expect(img.headers()['content-type']).toContain('image/png');
    });
  }

  test('títulos y descripciones únicos', async ({ request }) => {
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const path of [...PAGES, ...LEGAL]) {
      const html = await (await request.get(path)).text();
      titles.add(html.match(/<title>([^<]+)<\/title>/)![1]);
      descs.add(html.match(/<meta name="description" content="([^"]+)"/)![1]);
    }
    expect(titles.size).toBe(PAGES.length + LEGAL.length);
    expect(descs.size).toBe(PAGES.length + LEGAL.length);
  });

  test('sitemap con todas las páginas (4 principales y 3 legales)', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(
      [
        'https://www.casetasmaderik.com',
        'https://www.casetasmaderik.com/casetas',
        'https://www.casetasmaderik.com/contacto',
        'https://www.casetasmaderik.com/nosotros',
        'https://www.casetasmaderik.com/aviso-legal',
        'https://www.casetasmaderik.com/politica-de-privacidad',
        'https://www.casetasmaderik.com/politica-de-cookies',
      ].sort(),
    );
    expect(xml).toContain('<lastmod>');
  });

  test('robots permite todo, bloquea /api/ y enlaza el sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/Allow: \//);
    expect(txt).toMatch(/Disallow: \/api\//);
    expect(txt).toContain('Sitemap: https://www.casetasmaderik.com/sitemap.xml');
  });

  test('iconos: favicon de 48 px, PNG de 48 y 96, apple-touch-icon y manifiesto', async ({ request }) => {
    const html = await (await request.get('/')).text();
    for (const rel of ['icon', 'apple-touch-icon', 'manifest']) expect(html).toContain(`rel="${rel}"`);
    const icons = [...html.matchAll(/<link rel="icon" href="([^"]+)"[^>]*>/g)].map((m) => m[1]);
    expect(icons.length).toBeGreaterThanOrEqual(3);
    for (const href of [
      ...icons,
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/apple-icon.png',
      '/icons/icon-48.png',
      '/icons/icon-512.png',
    ]) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
      expect(res.headers()['content-type'], href).toMatch(/image\//);
    }
    for (const url of ['/manifest.webmanifest', '/site.webmanifest']) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
      const m = await res.json();
      expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(
        expect.arrayContaining(['48x48', '96x96', '192x192', '512x512']),
      );
      expect(m.name).toBe('Casetas Maderik');
    }
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) => m[1]).join('');
    expect(ld).toContain('/brand/logo-512.png');
    expect(ld).not.toContain('logo-stacked.svg');
  });

  test('llms.txt con los datos de contacto', async ({ request }) => {
    const txt = await (await request.get('/llms.txt')).text();
    expect(txt).toContain('info@casetasmaderik.com');
    expect(txt).toContain('+34 656 32 41 23');
    expect(txt).toContain('2,90 × 2,00 × 2,47 m');
  });

  test('la 404 responde 404 y no se indexa', async ({ request }) => {
    const res = await request.get('/esta-pagina-no-existe');
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('noindex');
  });
});

test.describe('redirecciones de la web antigua (QA con vercel.json aplicado)', () => {
  const cases: [string, string][] = [
    ['/product-category/casetas/', '/casetas'],
    ['/product/caseta-de-madera-para-eventos-y-ferias-290-x-200-m-2/', '/casetas'],
    ['/product/caseta-de-madera-para-eventos-y-ferias-290-x-200-m-2', '/casetas'],
    ['/tienda/', '/casetas'],
    ['/mi-cuenta/', '/contacto'],
    ['/carrito/', '/contacto'],
    ['/pago/', '/contacto'],
    ['/feed/', '/'],
  ];
  for (const [from, to] of cases) {
    test(`${from} → ${to}`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(301);
      const loc = res.headers()['location'] ?? '';
      expect(new URL(loc, 'http://x').pathname).toBe(to);
      const final = await request.get(from);
      expect(final.status()).toBe(200);
    });
  }

  test('las páginas actuales con barra final redirigen a la versión sin barra', async ({ request }) => {
    const res = await request.get('/nosotros/', { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe('/nosotros');
  });

  test('cabeceras de seguridad y CSP', async ({ request }) => {
    const res = await request.get('/');
    const h = res.headers();
    expect(h['content-security-policy']).toContain("default-src 'self'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-powered-by']).toBeUndefined();
  });
});
