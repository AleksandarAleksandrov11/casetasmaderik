/**
 * Configuración de cookies compartida por el banner de consentimiento y por la
 * tabla de la política de cookies, para que nunca se desincronicen.
 */
export const CONSENT_REVISION = 1;
export const CONSENT_COOKIE = 'cm_consent';
export const CONSENT_DAYS = 365;

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

export type CookieCategory = 'necessary' | 'analytics' | 'marketing';

export type CookieRow = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  type: 'Propia' | 'De terceros';
};

export type CategoryInfo = {
  id: CookieCategory;
  title: string;
  description: string;
  readOnly?: boolean;
  rows: CookieRow[];
  /** Nombres o patrones que se borran al retirar el consentimiento. */
  clear: (string | RegExp)[];
};

const analyticsRows: CookieRow[] = [
  {
    name: 'Vercel Web Analytics',
    provider: 'Vercel Inc.',
    purpose: 'Mide visitas y páginas vistas de forma agregada. No instala cookies en tu navegador.',
    duration: 'No instala cookies',
    type: 'De terceros',
  },
  {
    name: 'Vercel Speed Insights',
    provider: 'Vercel Inc.',
    purpose: 'Mide la velocidad de carga de la web. No instala cookies en tu navegador.',
    duration: 'No instala cookies',
    type: 'De terceros',
  },
  ...(GA_ID
    ? ([
        {
          name: '_ga',
          provider: 'Google LLC',
          purpose: 'Google Analytics 4: distingue usuarios para elaborar estadísticas de uso.',
          duration: '2 años',
          type: 'De terceros',
        },
        {
          name: `_ga_${GA_ID.replace(/^G-/, '')}`,
          provider: 'Google LLC',
          purpose: 'Google Analytics 4: mantiene el estado de la sesión.',
          duration: '2 años',
          type: 'De terceros',
        },
      ] satisfies CookieRow[])
    : []),
];

const marketingRows: CookieRow[] = META_PIXEL_ID
  ? [
      {
        name: '_fbp',
        provider: 'Meta Platforms Ireland Ltd.',
        purpose: 'Meta Pixel: mide la eficacia de los anuncios y permite mostrar publicidad relevante.',
        duration: '3 meses',
        type: 'De terceros',
      },
    ]
  : [];

export const cookieCategories: CategoryInfo[] = [
  {
    id: 'necessary',
    title: 'Necesarias',
    description: 'Imprescindibles para que la web funcione y para recordar tu decisión sobre las cookies.',
    readOnly: true,
    rows: [
      {
        name: CONSENT_COOKIE,
        provider: 'Casetas Maderik',
        purpose: 'Guarda tus preferencias de cookies.',
        duration: '12 meses',
        type: 'Propia',
      },
    ],
    clear: [],
  },
  {
    id: 'analytics',
    title: 'Analíticas',
    description: 'Nos ayudan a entender cómo se usa la web y a mejorarla. Solo se activan si las aceptas.',
    rows: analyticsRows,
    clear: ['_ga', /^_ga_/, '_gid'],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Miden campañas publicitarias. Solo se activarían con tu permiso.',
    rows: marketingRows,
    clear: ['_fbp', '_fbc'],
  },
];

export const consentTexts = {
  consentModal: {
    title: 'Cookies',
    // Dos bloques: así el aviso, que aparece tarde, no compite como elemento LCP
    description:
      '<span class="cc-line">Usamos cookies propias y de terceros para analizar el uso de la web y mejorar tu experiencia.</span> <span class="cc-line">Puedes aceptarlas, rechazarlas o configurarlas.</span>',
    acceptAllBtn: 'Aceptar',
    acceptNecessaryBtn: 'Rechazar',
    showPreferencesBtn: 'Configurar',
  },
  preferencesModal: {
    title: 'Configurar cookies',
    acceptAllBtn: 'Aceptar todas',
    acceptNecessaryBtn: 'Rechazar todas',
    savePreferencesBtn: 'Guardar preferencias',
    closeIconLabel: 'Cerrar',
    intro:
      'Elige qué cookies aceptas. Puedes cambiar tu decisión cuando quieras desde el enlace “Configurar cookies” del pie de página.',
    moreInfo: 'Más información en la',
  },
};
