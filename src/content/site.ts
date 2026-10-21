/**
 * Datos de negocio de Casetas Maderik. Toda la web (UI, metadatos, JSON-LD,
 * legales, llms.txt y Apps Script) sale de aquí. Los datos marcados con
 * PENDIENTE están en PENDIENTES.md.
 */
export const site = {
  name: 'Casetas Maderik',
  legalName: 'AJE ZENTIO',
  taxId: 'G75277475',
  url: 'https://casetasmaderik.es',
  locale: 'es_ES',
  language: 'es-ES',
  email: 'info@casetasmaderik.es', // PENDIENTE: confirmar que el buzón existe y recibe correo
  phone: { display: '+34 656 32 41 23', e164: '+34656324123' },
  whatsapp: {
    number: '34656324123', // PENDIENTE: confirmar que es el mismo número
    message: 'Hola, quiero pedir presupuesto para alquilar casetas de madera.',
  },
  address: null as null | {
    street: string;
    postalCode: string;
    locality: string;
    region: string;
    country: string;
  }, // PENDIENTE: domicilio social (obligatorio en el aviso legal)
  registry: null as null | string, // PENDIENTE: datos registrales de la asociación
  serviceArea: { label: 'España', regions: [] as string[] }, // PENDIENTE: provincias o ciudades
  // Espacios de no separación (\u00A0): el horario y la cifra con su unidad no se parten entre líneas
  hours: 'Lunes a viernes, de\u00A09:00\u00A0a\u00A019:00', // PENDIENTE: horario real
  responseTime: 'menos de 24\u00A0horas laborables', // PENDIENTE: tiempo de respuesta real
  social: {
    instagram: 'https://www.instagram.com/casetasmaderik/', // PENDIENTE: confirmar URL
  } as Record<string, string>,
  googleSiteVerification: 'l2LKSlg4IhbfzGAdQjzdPHE0UjYSLac48nWuEMNIhek',
  privacyPolicyVersion: '2026-10',
  legalUpdated: '20 de octubre de 2026',
  features: {
    reviews: false, // PENDIENTE: activar cuando haya reseñas reales
    metaPixel: false, // Solo se carga si además existe NEXT_PUBLIC_META_PIXEL_ID
    localBusiness: false, // Se activa cuando haya domicilio
    techSheet: false, // PENDIENTE: ficha técnica en PDF
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
  image: '/images/real/caseta-madera-alquiler-feria-abierta.jpg',
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
    : `Trabajamos en ${site.serviceArea.label}`;
