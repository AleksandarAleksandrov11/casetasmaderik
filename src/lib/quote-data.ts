/**
 * Datos y utilidades del formulario de presupuesto SIN zod. Los usa la
 * interfaz del formulario para no cargar zod en el JavaScript inicial; las
 * reglas de validación (zod) viven en validation.ts, que reexporta todo esto.
 */
import type { LeadRequestBody } from './validation';

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
export const EVENT_VALUES = EVENT_TYPES.map((e) => e.value) as [TipoEvento, ...TipoEvento[]];

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

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Fecha de hoy en Madrid con formato YYYY-MM-DD. */
export function todayMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Fecha de hoy en la zona horaria del navegador (o del servidor) con formato YYYY-MM-DD. */
export function todayLocal(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Suma días naturales a una fecha YYYY-MM-DD. */
export function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
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
  // Admite "(+34) 600 12 34 56": el prefijo entre paréntesis se aplana antes de comprobar
  const flat = value.trim().replace(/^\((\+?\d{1,4})\)/, '$1');
  if (!/^[+\d][\d\s().-]*$/.test(flat)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

/** Campos que valida cada paso. */
export const STEP_FIELDS = [
  ['tipoEvento', 'tipoEventoOtro'],
  ['fechaInicio', 'fechaFin', 'unDia', 'localidad', 'provincia'],
  ['casetas', 'comentarios'],
  ['nombre', 'telefono', 'email', 'empresa', 'consentimiento'],
] as const;

export const STEP_COUNT = 4;

/** Paso (0 a 3) en el que vive cada campo. */
export function stepOfField(field: string): number {
  const index = STEP_FIELDS.findIndex((fields) => (fields as readonly string[]).includes(field));
  return index === -1 ? STEP_COUNT - 1 : index;
}

export const DISPOSITIVOS = ['móvil', 'tablet', 'escritorio'] as const;

/* ------------------------------------------------------------------ */
/* Contratos de la API                                                 */
/* ------------------------------------------------------------------ */

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

export type LeadErrorCode =
  | 'invalid_json'
  | 'unsupported_media_type'
  | 'too_large'
  | 'rate_limited'
  | 'validation'
  | 'upstream'
  | 'not_configured';

export type LeadResponse =
  { ok: true; numero: number } | { ok: false; error: string; code?: LeadErrorCode; fields?: Record<string, string> };

/* ------------------------------------------------------------------ */
/* Borrador del formulario (cliente)                                   */
/* ------------------------------------------------------------------ */

/**
 * Valores del formulario tal y como viven en los campos: todo texto salvo las
 * casillas. Se guardan en sessionStorage y se validan paso a paso.
 */
export type QuoteDraft = {
  tipoEvento: TipoEvento | '';
  tipoEventoOtro: string;
  fechaInicio: string;
  fechaFin: string;
  unDia: boolean;
  localidad: string;
  provincia: string;
  casetas: string;
  comentarios: string;
  nombre: string;
  telefono: string;
  email: string;
  empresa: string;
  consentimiento: boolean;
  website: string;
};

export type DraftField = keyof QuoteDraft;
export type DraftErrors = Partial<Record<DraftField, string>>;

export const EMPTY_DRAFT: QuoteDraft = {
  tipoEvento: '',
  tipoEventoOtro: '',
  fechaInicio: '',
  fechaFin: '',
  unDia: false,
  localidad: '',
  provincia: '',
  casetas: '1',
  comentarios: '',
  nombre: '',
  telefono: '',
  email: '',
  empresa: '',
  consentimiento: false,
  website: '',
};

export const optionalText = (value: string): string | undefined => (value.trim() === '' ? undefined : value);

export type LeadContext = {
  id: string;
  startedAt: number;
  sentAt: number;
  pagina: string;
  landing?: string;
  referrer?: string;
  utm?: Partial<Record<'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content', string>>;
  dispositivo: (typeof DISPOSITIVOS)[number];
};

const collapse = (value: string) => value.trim().replace(/\s+/g, ' ');

/** Convierte el borrador validado en el cuerpo que se envía a la API. */
export function draftToLeadRequest(draft: QuoteDraft, ctx: LeadContext): LeadRequestBody {
  const utm = ctx.utm ?? {};
  return {
    id: ctx.id,
    tipoEvento: draft.tipoEvento as TipoEvento,
    tipoEventoOtro: draft.tipoEvento === 'Otro' ? collapse(draft.tipoEventoOtro) : undefined,
    fechaInicio: draft.fechaInicio,
    fechaFin: draft.unDia ? undefined : draft.fechaFin,
    unDia: draft.unDia,
    localidad: collapse(draft.localidad),
    provincia: draft.provincia as (typeof PROVINCIA_OPTIONS)[number],
    casetas: Number(draft.casetas),
    comentarios: optionalText(draft.comentarios)?.trim(),
    nombre: collapse(draft.nombre),
    telefono: collapse(draft.telefono),
    email: draft.email.trim().toLowerCase(),
    empresa: optionalText(draft.empresa) ? collapse(draft.empresa) : undefined,
    consentimiento: true,
    pagina: ctx.pagina.slice(0, 300),
    landing: ctx.landing?.slice(0, 300),
    referrer: ctx.referrer?.slice(0, 200),
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
    utmCampaign: utm.utm_campaign,
    utmTerm: utm.utm_term,
    utmContent: utm.utm_content,
    dispositivo: ctx.dispositivo,
    startedAt: Math.max(0, Math.round(ctx.startedAt)),
    sentAt: Math.max(0, Math.round(ctx.sentAt)),
    website: draft.website,
  };
}
