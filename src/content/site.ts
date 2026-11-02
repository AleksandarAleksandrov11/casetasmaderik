/**
 * Datos de negocio de Casetas Maderik. Toda la web (UI, metadatos, JSON-LD,
 * legales, llms.txt y Apps Script) sale de aquí.
 */
export const site = {
  name: 'Casetas Maderik',
  legalName: 'AJE ZENTIO',
  taxId: 'G75277475',
  url: 'https://www.casetasmaderik.com',
  locale: 'es_ES',
  language: 'es-ES',
  email: 'info@casetasmaderik.com',
  phone: { display: '+34 656 32 41 23', e164: '+34656324123' },
  whatsapp: {
    number: '34656324123',
    message: 'Hola, quiero pedir presupuesto para alquilar casetas de madera.',
  },
  address: {
    street: 'Puerto Neveros, 9',
    postalCode: '28935',
    locality: 'Móstoles',
    region: 'Madrid',
    country: 'ES',
  },
  // Toda la España peninsular: sin lista de provincias concretas (el mapa destaca las peninsulares)
  serviceArea: { label: 'España peninsular', phrase: 'toda la España peninsular', regions: [] as string[] },
  // Espacios de no separación (\u00A0): el horario y la cifra con su unidad no se parten entre líneas
  hours: 'Lunes a viernes, de\u00A09:00\u00A0a\u00A019:00',
  responseTime: 'menos de 24\u00A0horas laborables',
  social: {
    instagram: 'https://www.instagram.com/casetasmaderik/',
  } as Record<string, string>,
  googleSiteVerification: 'l2LKSlg4IhbfzGAdQjzdPHE0UjYSLac48nWuEMNIhek',
  privacyPolicyVersion: '2026-10',
  legalUpdated: '20 de octubre de 2026',
  features: {
    reviews: false, // Se activa cuando haya reseñas reales en src/content/reviews.ts
    metaPixel: false, // Solo se carga si además existe NEXT_PUBLIC_META_PIXEL_ID
    localBusiness: true,
    techSheet: false, // Se activa cuando exista la ficha técnica en PDF
  },
} as const;

export const product = {
  name: 'Caseta de madera para eventos y ferias',
  shortName: 'Caseta de madera',
  length: 2.9,
  width: 2.0,
  height: 2.47,
  area: 5.8,
  material: 'Madera de pino tratada para exterior',
  windows: 3,
  doors: 1,
  roof: 'Cubierta impermeabilizada',
  foldable: true,
  image: '/images/real/caseta-madera-alquiler-feria-abierta.webp',
} as const;

export const nav = [
  { href: '/', label: 'Inicio' },
  { href: '/casetas', label: 'Casetas' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const;

export const legalNav = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
  { href: '/politica-de-cookies', label: 'Política de cookies' },
] as const;

/** Formatea metros al estilo español: 2.9 a "2,90 m". */
export function meters(value: number, decimals = 2): string {
  return `${value.toFixed(decimals).replace('.', ',')} m`;
}

export const dimensionsLabel = `${meters(product.length)} × ${meters(product.width)} × ${meters(product.height)}`;
export const dimensionsShort = '2,90 × 2,00 × 2,47 m';

export function whatsappHref(message: string = site.whatsapp.message): string {
  return `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

export const phoneHref = `tel:${site.phone.e164}`;
export const emailHref = `mailto:${site.email}`;

export const serviceAreaText =
  site.serviceArea.regions.length > 0
    ? `Trabajamos en ${site.serviceArea.regions.join(', ')}`
    : `Trabajamos en ${site.serviceArea.phrase}`;
