/** Rutas y anchos del QA (sección 20 del brief). */
export const ROUTES = [
  { path: '/', name: 'inicio' },
  { path: '/casetas', name: 'casetas' },
  { path: '/nosotros', name: 'nosotros' },
  { path: '/contacto', name: 'contacto' },
  { path: '/aviso-legal', name: 'aviso-legal' },
  { path: '/politica-de-privacidad', name: 'privacidad' },
  { path: '/politica-de-cookies', name: 'cookies' },
  { path: '/pagina-que-no-existe', name: '404', status: 404 },
] as const;

export const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 820, 1024, 1180, 1280, 1366, 1440, 1536, 1920, 2560] as const;

/** Alto razonable para cada ancho (móvil vertical, tablet, escritorio). */
export function heightFor(width: number): number {
  if (width <= 430) return Math.round(width * 2.16);
  if (width <= 820) return Math.round(width * 1.33);
  if (width <= 1180) return Math.round(width * 0.75);
  return Math.round(width * 0.5625);
}

export const VIEWPORTS = [
  ...WIDTHS.map((w) => ({ width: w, height: heightFor(w), mobile: w <= 430, label: `${w}` })),
  { width: 667, height: 375, mobile: true, label: '667x375-horizontal' },
  { width: 932, height: 430, mobile: true, label: '932x430-horizontal' },
];

/** Anchos para WebKit y Firefox. */
export const CROSS_BROWSER_WIDTHS = [390, 820, 1440] as const;
