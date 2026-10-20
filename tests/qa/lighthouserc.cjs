// Lighthouse CI (móvil por defecto; LHCI_PRESET=desktop para escritorio).
// Requiere el servidor en marcha: pnpm build:qa && pnpm exec next start -p 3300
const base = process.env.E2E_BASE_URL || 'http://localhost:3300';
const desktop = process.env.LHCI_PRESET === 'desktop';
const chromePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';

module.exports = {
  ci: {
    collect: {
      url: ['/', '/casetas', '/nosotros', '/contacto', '/politica-de-privacidad'].map((p) => base + p),
      numberOfRuns: Number(process.env.LHCI_RUNS || 1),
      chromePath,
      settings: {
        ...(desktop ? { preset: 'desktop' } : {}),
        chromeFlags: '--headless=new --no-sandbox --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: desktop ? 0.95 : 0.9 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: `./tests/qa/output/lighthouse-${desktop ? 'desktop' : 'mobile'}`,
    },
  },
};
