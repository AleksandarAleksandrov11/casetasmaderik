import { z } from 'zod';
import {
  DATE_RE,
  DISPOSITIVOS,
  EMPTY_DRAFT,
  EVENT_VALUES,
  LIMITS,
  PROVINCIA_OPTIONS,
  STEP_COUNT,
  daysInclusive,
  isValidDateString,
  isValidPhone,
  optionalText,
  todayLocal,
  todayMadrid,
  type DraftErrors,
  type DraftField,
  type QuoteDraft,
} from './quote-data';

/**
 * Reglas de validación con zod, compartidas por el formulario (que las carga
 * de forma diferida) y por /api/presupuesto. Reexporta los datos de
 * quote-data.ts para que todo siga disponible desde aquí.
 */
export * from './quote-data';

/*
 * Sin compilación JIT: zod comprueba si puede usar new Function() y, con la
 * CSP de vercel.json (sin 'unsafe-eval'), esa comprobación deja un error de CSP
 * en la consola. Con esquemas tan pequeños no hay diferencia de rendimiento.
 */
z.config({ jitless: true });

/**
 * Las reglas cruzadas (Otro, fechas) se evalúan aunque otros campos fallen,
 * para devolver todos los errores a la vez.
 */
const ALWAYS_REFINE = { when: (payload: { value: unknown }) => typeof payload.value === 'object' && payload.value !== null };

const requiredText = (max: number, empty: string, long: string) =>
  z.string(empty).trim().min(1, empty).max(max, long);

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
  const startOk = isValidDateString(v.fechaInicio);
  if (!startOk) {
    ctx.addIssue({ code: 'custom', path: ['fechaInicio'], message: 'Indica una fecha válida.' });
  } else if (daysInclusive(today, v.fechaInicio) < 1 - toleranceDays) {
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
  if (!startOk) return;
  const days = daysInclusive(v.fechaInicio, v.fechaFin);
  if (days < 1) {
    ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'La fecha de fin debe ser igual o posterior a la de inicio.' });
  } else if (days > LIMITS.maxRangeDays) {
    ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'El rango máximo es de 365 días.' });
  }
}

export const stepWhenWhereSchema = z.object(stepWhenWhereShape).superRefine((v, ctx) => checkDates(v, ctx, todayMadrid()));

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
  email: z.string('Indica tu email.').trim().min(1, 'Indica tu email.').pipe(z.email('Indica un email válido.').max(254)),
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
  }, ALWAYS_REFINE);

export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export type QuoteFormValues = z.output<typeof quoteFormSchema>;

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
    /** Momento en que se abrió el formulario (reloj del navegador, ms). */
    startedAt: z.number().int().nonnegative(),
    /** Momento del envío (reloj del navegador, ms). Evita depender del desfase de reloj. */
    sentAt: z.number().int().nonnegative().optional(),
    website: z.string().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.tipoEvento === 'Otro' && !v.tipoEventoOtro) {
      ctx.addIssue({ code: 'custom', path: ['tipoEventoOtro'], message: 'Cuéntanos qué evento es.' });
    }
    // Un día de margen por diferencias de zona horaria del navegador
    checkDates(v, ctx, todayMadrid(), 1);
  }, ALWAYS_REFINE);

export type LeadRequest = z.output<typeof leadRequestSchema>;

/** Cuerpo JSON que el formulario envía a /api/presupuesto. */
export type LeadRequestBody = z.input<typeof leadRequestSchema>;

/* ------------------------------------------------------------------ */
/* Borrador del formulario (cliente)                                   */
/* ------------------------------------------------------------------ */

/** Reglas de fechas sin depender del resto del paso (siempre se evalúan). */
const datesSchema = (today: string) =>
  z
    .object({ fechaInicio: z.string(), fechaFin: z.string().optional(), unDia: z.boolean() })
    .superRefine((v, ctx) => checkDates(v, ctx, today));

/** Valida un paso del borrador. Devuelve el primer mensaje de cada campo. */
export function validateStep(step: number, draft: QuoteDraft, today: string = todayLocal()): DraftErrors {
  const errors: DraftErrors = {};
  const collect = (result: { success: boolean; error?: z.ZodError }) => {
    if (result.success || !result.error) return;
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === 'string' && field in EMPTY_DRAFT && !errors[field as DraftField]) {
        errors[field as DraftField] = issue.message;
      }
    }
  };

  if (step === 0) {
    collect(
      stepEventSchema.safeParse({
        tipoEvento: draft.tipoEvento || undefined,
        tipoEventoOtro: draft.tipoEvento === 'Otro' ? draft.tipoEventoOtro : undefined,
      }),
    );
  } else if (step === 1) {
    const dates = {
      fechaInicio: draft.fechaInicio,
      fechaFin: draft.unDia ? undefined : optionalText(draft.fechaFin),
      unDia: draft.unDia,
    };
    collect(
      z.object(stepWhenWhereShape).safeParse({
        ...dates,
        localidad: draft.localidad,
        provincia: draft.provincia || undefined,
      }),
    );
    collect(datesSchema(today).safeParse(dates));
  } else if (step === 2) {
    collect(
      stepQuantitySchema.safeParse({
        casetas: optionalText(draft.casetas),
        comentarios: draft.comentarios,
      }),
    );
  } else {
    collect(
      stepContactSchema.safeParse({
        nombre: draft.nombre,
        telefono: draft.telefono,
        email: draft.email,
        empresa: draft.empresa,
        consentimiento: draft.consentimiento,
        website: draft.website,
      }),
    );
  }
  return errors;
}

/** Primer paso con errores (o -1 si todo es válido). */
export function firstInvalidStep(draft: QuoteDraft, upTo: number = STEP_COUNT - 1, today?: string): number {
  for (let step = 0; step <= upTo; step++) {
    if (Object.keys(validateStep(step, draft, today)).length > 0) return step;
  }
  return -1;
}
