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
      expect(canonical).toBe(`https://casetasmaderik.com${path === '/' ? '' : path}`);
      expect(html).toContain('<html lang="es"');
      expect(html).toContain('name="google-site-verification" content="l2LKSlg4IhbfzGAdQjzdPHE0UjYSLac48nWuEMNIhek"');
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
      if (LEGAL.includes(path)) expect(robots).toContain('noindex');
      else expect(robots).not.toContain('noindex');
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

  test('sitemap con las 4 páginas indexables', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(
      [
        'https://casetasmaderik.com',
        'https://casetasmaderik.com/casetas',
        'https://casetasmaderik.com/contacto',
        'https://casetasmaderik.com/nosotros',
      ].sort(),
    );
    expect(xml).toContain('<lastmod>');
  });

  test('robots permite todo, bloquea /api/ y enlaza el sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/Allow: \//);
    expect(txt).toMatch(/Disallow: \/api\//);
    expect(txt).toContain('Sitemap: https://casetasmaderik.com/sitemap.xml');
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
