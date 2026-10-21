// Lighthouse CI (móvil por defecto; LHCI_PRESET=desktop para escritorio).
// Requiere el servidor en marcha: pnpm build:qa && pnpm start:qa
const base = process.env.E2E_BASE_URL || 'http://localhost:3300';
const desktop = process.env.LHCI_PRESET === 'desktop';
const chromePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';

const perf = ['error', { minScore: desktop ? 0.95 : 0.9 }];
const common = {
  'categories:performance': perf,
  'categories:accessibility': ['error', { minScore: 1 }],
  'categories:best-practices': ['error', { minScore: 1 }],
};

module.exports = {
  ci: {
    collect: {
      url: [
        '/',
        '/casetas',
        '/nosotros',
        '/contacto',
        '/aviso-legal',
        '/politica-de-privacidad',
        '/politica-de-cookies',
      ].map((p) => base + p),
      numberOfRuns: Number(process.env.LHCI_RUNS || 3),
      chromePath,
      settings: {
        ...(desktop ? { preset: 'desktop' } : {}),
        // Las opciones por defecto de Chrome sin pantalla, como PageSpeed Insights. Sin WebGL por
        // software forzado: la comprobación de WebGL tardaría ~0,6 s, algo que no pasa en un
        // dispositivo real ni en PageSpeed, y la web lo rechaza igualmente (enseña el poster)
        chromeFlags: '--headless=new --no-sandbox',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      // Las legales llevan noindex a propósito: se evalúan todas las auditorías SEO salvo la de indexación
      assertMatrix: [
        {
          matchingUrlPattern: '^(?!.*(aviso-legal|politica-de)).*$',
          assertions: { ...common, 'categories:seo': ['error', { minScore: 1 }] },
        },
        {
          matchingUrlPattern: '(aviso-legal|politica-de)',
          assertions: {
            ...common,
            'is-crawlable': 'off',
            'document-title': 'error',
            'meta-description': 'error',
            'http-status-code': 'error',
            'link-text': 'error',
            'crawlable-anchors': 'error',
            'robots-txt': 'error',
            'image-alt': 'error',
            hreflang: 'error',
            canonical: 'error',
          },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: `./tests/qa/output/lighthouse-${desktop ? 'desktop' : 'mobile'}`,
    },
  },
};
