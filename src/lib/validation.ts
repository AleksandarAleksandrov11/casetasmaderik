import { z } from 'zod';

/** Tipos de evento con su slug para precargar el formulario por URL. */
export const EVENT_TYPES = [
  { value: 'Mercado navideño', slug: 'mercado-navideno' },
  { value: 'Feria o bazar', slug: 'feria-bazar' },
  { value: 'Festival gastronómico', slug: 'festival-gastronomico' },
  { value: 'Evento corporativo', slug: 'evento-corporativo' },
  { value: 'Evento privado', slug: 'evento-privado' },
  { value: 'Otro', slug: 'otro' },
] as const;

export type TipoEvento = (typeof EVENT_TYPES)[number]['value'];
const EVENT_VALUES = EVENT_TYPES.map((e) => e.value) as [TipoEvento, ...TipoEvento[]];

export function eventFromSlug(slug: string | null | undefined): TipoEvento | undefined {
  if (!slug) return undefined;
  return EVENT_TYPES.find((e) => e.slug === slug.toLowerCase())?.value;
}

/** 50 provincias, Ceuta y Melilla, ordenadas alfabéticamente. */
export const PROVINCIAS = [
  'A Coruña',
  'Álava',
  'Albacete',
  'Alicante',
  'Almería',
  'Asturias',
  'Ávila',
  'Badajoz',
  'Barcelona',
  'Bizkaia',
  'Burgos',
  'Cáceres',
  'Cádiz',
  'Cantabria',
  'Castellón',
  'Ceuta',
  'Ciudad Real',
  'Córdoba',
  'Cuenca',
  'Gipuzkoa',
  'Girona',
  'Granada',
  'Guadalajara',
  'Huelva',
  'Huesca',
  'Illes Balears',
  'Jaén',
  'La Rioja',
  'Las Palmas',
  'León',
  'Lleida',
  'Lugo',
  'Madrid',
  'Málaga',
  'Melilla',
  'Murcia',
  'Navarra',
  'Ourense',
  'Palencia',
  'Pontevedra',
  'Salamanca',
  'Santa Cruz de Tenerife',
  'Segovia',
  'Sevilla',
  'Soria',
  'Tarragona',
  'Teruel',
  'Toledo',
  'Valencia',
  'Valladolid',
  'Zamora',
  'Zaragoza',
] as const;

export const FUERA_DE_ESPANA = 'Fuera de España';
export const PROVINCIA_OPTIONS = [...PROVINCIAS, FUERA_DE_ESPANA] as const;

export const LIMITS = {
  casetasMin: 1,
  casetasMax: 200,
  maxRangeDays: 365,
  nombreMax: 100,
  localidadMax: 100,
  empresaMax: 120,
  comentariosMax: 1000,
  otroMax: 80,
  minFillMs: 4000,
} as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Fecha de hoy en Madrid con formato YYYY-MM-DD. */
export function todayMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function isValidDateString(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Días naturales entre dos fechas YYYY-MM-DD, ambas incluidas. */
export function daysInclusive(start: string, end: string): number {
  const a = Date.parse(`${start}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000) + 1;
}

/** Deja solo dígitos y un + inicial. */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
  if (!/^[+\d][\d\s().-]*$/.test(value.trim())) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

const requiredText = (max: number, empty: string, long: string) => z.string(empty).trim().min(1, empty).max(max, long);

/* ------------------------------------------------------------------ */
/* Pasos del formulario (cliente)                                      */
/* ------------------------------------------------------------------ */

export const stepEventSchema = z
  .object({
    tipoEvento: z.enum(EVENT_VALUES, 'Elige el tipo de evento.'),
    tipoEventoOtro: z.string().trim().max(LIMITS.otroMax, 'Máximo 80 caracteres.').optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tipoEvento === 'Otro' && !v.tipoEventoOtro) {
      ctx.addIssue({ code: 'custom', path: ['tipoEventoOtro'], message: 'Cuéntanos qué evento es.' });
    }
  });

export const stepWhenWhereShape = {
  fechaInicio: z.string('Indica la fecha de inicio.').min(1, 'Indica la fecha de inicio.'),
  fechaFin: z.string().optional(),
  unDia: z.boolean(),
  localidad: requiredText(LIMITS.localidadMax, 'Indica la localidad.', 'Máximo 100 caracteres.'),
  provincia: z.enum(PROVINCIA_OPTIONS, 'Elige una provincia.'),
};

type DateFields = { fechaInicio: string; fechaFin?: string; unDia: boolean };

/** Reglas de fechas compartidas por cliente y servidor. */
export function checkDates(v: DateFields, ctx: z.RefinementCtx, today: string, toleranceDays = 0): void {
  if (!isValidDateString(v.fechaInicio)) {
    ctx.addIssue({ code: 'custom', path: ['fechaInicio'], message: 'Indica una fecha válida.' });
    return;
  }
  if (daysInclusive(today, v.fechaInicio) < 1 - toleranceDays) {
    ctx.addIssue({ code: 'custom', path: ['fechaInicio'], message: 'La fecha de inicio debe ser hoy o posterior.' });
  }
  if (v.unDia) return;
  if (!v.fechaFin) {
    ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'Indica la fecha de fin o marca “Es un solo día”.' });
    return;
  }
  if (!isValidDateString(v.fechaFin)) {
    ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'Indica una fecha válida.' });
    return;
  }
  const days = daysInclusive(v.fechaInicio, v.fechaFin);
  if (days < 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['fechaFin'],
      message: 'La fecha de fin debe ser igual o posterior a la de inicio.',
    });
  } else if (days > LIMITS.maxRangeDays) {
    ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'El rango máximo es de 365 días.' });
  }
}

export const stepWhenWhereSchema = z
  .object(stepWhenWhereShape)
  .superRefine((v, ctx) => checkDates(v, ctx, todayMadrid()));

export const casetasSchema = z.coerce
  .number('Indica cuántas casetas necesitas.')
  .int('Indica un número entero.')
  .min(LIMITS.casetasMin, 'Mínimo 1 caseta.')
  .max(LIMITS.casetasMax, 'Para más de 200 casetas, llámanos.');

export const stepQuantitySchema = z.object({
  casetas: casetasSchema,
  comentarios: z.string().trim().max(LIMITS.comentariosMax, 'Máximo 1000 caracteres.').optional(),
});

export const stepContactSchema = z.object({
  nombre: requiredText(LIMITS.nombreMax, 'Indica tu nombre.', 'Máximo 100 caracteres.').refine(
    (v) => v.length >= 2,
    'Indica tu nombre y apellidos.',
  ),
  telefono: z
    .string('Indica tu teléfono.')
    .trim()
    .min(1, 'Indica tu teléfono.')
    .refine(isValidPhone, 'Indica un teléfono válido, de 9 a 15 dígitos.'),
  email: z
    .string('Indica tu email.')
    .trim()
    .min(1, 'Indica tu email.')
    .pipe(z.email('Indica un email válido.').max(254)),
  empresa: z.string().trim().max(LIMITS.empresaMax, 'Máximo 120 caracteres.').optional(),
  consentimiento: z.boolean().refine((v) => v === true, 'Debes aceptar la política de privacidad.'),
  website: z.string().optional(),
});

/** Valores completos del formulario en el cliente. */
export const quoteFormSchema = z
  .object({
    tipoEvento: z.enum(EVENT_VALUES, 'Elige el tipo de evento.'),
    tipoEventoOtro: z.string().trim().max(LIMITS.otroMax, 'Máximo 80 caracteres.').optional(),
    ...stepWhenWhereShape,
    casetas: casetasSchema,
    comentarios: z.string().trim().max(LIMITS.comentariosMax, 'Máximo 1000 caracteres.').optional(),
    ...stepContactSchema.shape,
  })
  .superRefine((v, ctx) => {
    if (v.tipoEvento === 'Otro' && !v.tipoEventoOtro) {
      ctx.addIssue({ code: 'custom', path: ['tipoEventoOtro'], message: 'Cuéntanos qué evento es.' });
    }
    checkDates(v, ctx, todayMadrid());
  });

export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export type QuoteFormValues = z.output<typeof quoteFormSchema>;

/** Campos que valida cada paso. */
export const STEP_FIELDS = [
  ['tipoEvento', 'tipoEventoOtro'],
  ['fechaInicio', 'fechaFin', 'unDia', 'localidad', 'provincia'],
  ['casetas', 'comentarios'],
  ['nombre', 'telefono', 'email', 'empresa', 'consentimiento'],
] as const;

/* ------------------------------------------------------------------ */
/* Petición a /api/presupuesto (servidor)                              */
/* ------------------------------------------------------------------ */

const shortOptional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const DISPOSITIVOS = ['móvil', 'tablet', 'escritorio'] as const;

export const leadRequestSchema = z
  .object({
    id: z.uuid('Identificador no válido.'),
    tipoEvento: z.enum(EVENT_VALUES, 'Elige el tipo de evento.'),
    tipoEventoOtro: shortOptional(LIMITS.otroMax),
    fechaInicio: z.string().regex(DATE_RE, 'Indica una fecha válida.'),
    fechaFin: z.string().optional(),
    unDia: z.boolean(),
    localidad: requiredText(LIMITS.localidadMax, 'Indica la localidad.', 'Máximo 100 caracteres.'),
    provincia: z.enum(PROVINCIA_OPTIONS, 'Elige una provincia.'),
    casetas: z.number().int().min(LIMITS.casetasMin).max(LIMITS.casetasMax),
    comentarios: shortOptional(LIMITS.comentariosMax),
    nombre: requiredText(LIMITS.nombreMax, 'Indica tu nombre.', 'Máximo 100 caracteres.'),
    telefono: z.string().trim().refine(isValidPhone, 'Indica un teléfono válido.'),
    email: z.email('Indica un email válido.').max(254),
    empresa: shortOptional(LIMITS.empresaMax),
    consentimiento: z.literal(true, 'Debes aceptar la política de privacidad.'),
    pagina: z.string().max(300),
    landing: shortOptional(300),
    referrer: shortOptional(200),
    utmSource: shortOptional(150),
    utmMedium: shortOptional(150),
    utmCampaign: shortOptional(150),
    utmTerm: shortOptional(150),
    utmContent: shortOptional(150),
    dispositivo: z.enum(DISPOSITIVOS),
    startedAt: z.number().int().nonnegative(),
    website: z.string().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tipoEvento === 'Otro' && !v.tipoEventoOtro) {
      ctx.addIssue({ code: 'custom', path: ['tipoEventoOtro'], message: 'Cuéntanos qué evento es.' });
    }
    // Un día de margen por diferencias de zona horaria del navegador
    checkDates(v, ctx, todayMadrid(), 1);
  });

export type LeadRequest = z.output<typeof leadRequestSchema>;

/** Carga que se envía a Google Apps Script. */
export type LeadPayload = {
  secret: string;
  id: string;
  tipoEvento: TipoEvento;
  tipoEventoOtro?: string;
  fechaInicio: string;
  fechaFin: string;
  localidad: string;
  provincia: string;
  casetas: number;
  comentarios?: string;
  nombre: string;
  telefono: string;
  email: string;
  empresa?: string;
  consentimiento: true;
  consentimientoFecha: string;
  politicaVersion: string;
  pagina: string;
  landing?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  dispositivo: (typeof DISPOSITIVOS)[number];
  website?: string;
};

export type LeadResponse = { ok: true; numero: number } | { ok: false; error: string };
