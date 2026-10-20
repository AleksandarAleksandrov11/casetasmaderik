import { describe, expect, it } from 'vitest';
import {
  EMPTY_DRAFT,
  EVENT_TYPES,
  PROVINCIA_OPTIONS,
  addDays,
  daysInclusive,
  draftToLeadRequest,
  eventFromSlug,
  firstInvalidStep,
  isValidDateString,
  isValidPhone,
  leadRequestSchema,
  normalizePhone,
  stepOfField,
  todayLocal,
  todayMadrid,
  validateStep,
  type QuoteDraft,
} from '@/lib/validation';
import { casetasLabel, daysLabel, firstName, formatDateRange } from '@/components/form/format';
import { sanitizeValues } from '@/components/form/storage';
import { computeLayout } from '@/components/form/lineup-geometry';

const TODAY = '2026-10-20';

const validDraft: QuoteDraft = {
  ...EMPTY_DRAFT,
  tipoEvento: 'Mercado navideño',
  fechaInicio: '2026-12-12',
  fechaFin: '2026-12-24',
  localidad: 'Madrid',
  provincia: 'Madrid',
  casetas: '4',
  nombre: 'Lucía Martín',
  telefono: '+34 600 123 456',
  email: 'lucia@example.com',
  consentimiento: true,
};

describe('utilidades de fecha y teléfono', () => {
  it('valida fechas reales con formato YYYY-MM-DD', () => {
    expect(isValidDateString('2026-02-28')).toBe(true);
    expect(isValidDateString('2026-02-30')).toBe(false);
    expect(isValidDateString('12/12/2026')).toBe(false);
  });

  it('cuenta días con ambos extremos incluidos y suma días', () => {
    expect(daysInclusive('2026-12-12', '2026-12-24')).toBe(13);
    expect(daysInclusive('2026-12-12', '2026-12-12')).toBe(1);
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
  });

  it('calcula hoy en Madrid y en local con formato ISO', () => {
    expect(todayMadrid(new Date('2026-10-20T23:30:00Z'))).toBe('2026-10-21');
    expect(todayLocal(new Date(2026, 9, 5))).toBe('2026-10-05');
  });

  it('acepta teléfonos de 9 a 15 dígitos con +34', () => {
    expect(isValidPhone('600123456')).toBe(true);
    expect(isValidPhone('+34 600 12 34 56')).toBe(true);
    expect(isValidPhone('(+34) 600-123-456')).toBe(true);
    expect(isValidPhone('12345678')).toBe(false);
    expect(isValidPhone('1234567890123456')).toBe(false);
    expect(isValidPhone('600abc456')).toBe(false);
    expect(normalizePhone(' +34 600 12 34 56 ')).toBe('+34600123456');
  });

  it('traduce el slug de la URL al tipo de evento', () => {
    expect(eventFromSlug('mercado-navideno')).toBe('Mercado navideño');
    expect(eventFromSlug('FERIA-BAZAR')).toBe('Feria o bazar');
    expect(eventFromSlug('no-existe')).toBeUndefined();
    expect(eventFromSlug(null)).toBeUndefined();
    expect(EVENT_TYPES).toHaveLength(6);
  });

  it('ofrece 52 provincias más "Fuera de España"', () => {
    expect(PROVINCIA_OPTIONS).toHaveLength(53);
    expect(PROVINCIA_OPTIONS.at(-1)).toBe('Fuera de España');
  });
});

describe('validación por pasos del borrador', () => {
  it('el borrador completo es válido', () => {
    expect(firstInvalidStep(validDraft, 3, TODAY)).toBe(-1);
  });

  it('paso 1: obliga a elegir y pide detalle con "Otro"', () => {
    expect(validateStep(0, EMPTY_DRAFT, TODAY)).toEqual({ tipoEvento: 'Elige el tipo de evento.' });
    expect(validateStep(0, { ...EMPTY_DRAFT, tipoEvento: 'Otro' }, TODAY)).toEqual({
      tipoEventoOtro: 'Cuéntanos qué evento es.',
    });
    expect(validateStep(0, { ...EMPTY_DRAFT, tipoEvento: 'Otro', tipoEventoOtro: 'Feria medieval' }, TODAY)).toEqual({});
    // El texto de "Otro" se ignora si se elige otro tipo
    expect(validateStep(0, { ...EMPTY_DRAFT, tipoEvento: 'Feria o bazar', tipoEventoOtro: '' }, TODAY)).toEqual({});
  });

  it('paso 2: muestra todos los errores a la vez', () => {
    const errors = validateStep(1, EMPTY_DRAFT, TODAY);
    expect(errors).toEqual({
      fechaInicio: 'Indica la fecha de inicio.',
      fechaFin: 'Indica la fecha de fin o marca “Es un solo día”.',
      localidad: 'Indica la localidad.',
      provincia: 'Elige una provincia.',
    });
  });

  it('paso 2: reglas de fechas', () => {
    const base = { ...validDraft };
    expect(validateStep(1, { ...base, fechaInicio: '2026-10-19' }, TODAY).fechaInicio).toBe(
      'La fecha de inicio debe ser hoy o posterior.',
    );
    expect(validateStep(1, { ...base, fechaInicio: TODAY, fechaFin: TODAY }, TODAY)).toEqual({});
    expect(validateStep(1, { ...base, fechaFin: '2026-12-01' }, TODAY).fechaFin).toBe(
      'La fecha de fin debe ser igual o posterior a la de inicio.',
    );
    expect(validateStep(1, { ...base, fechaFin: '2027-12-12' }, TODAY).fechaFin).toBe('El rango máximo es de 365 días.');
    expect(validateStep(1, { ...base, fechaFin: '2027-12-11' }, TODAY)).toEqual({});
    expect(validateStep(1, { ...base, fechaFin: '', unDia: true }, TODAY)).toEqual({});
    expect(validateStep(1, { ...base, fechaFin: '2020-01-01', unDia: true }, TODAY)).toEqual({});
  });

  it('paso 3: número de casetas entre 1 y 200', () => {
    expect(validateStep(2, { ...validDraft, casetas: '' }, TODAY).casetas).toBe('Indica cuántas casetas necesitas.');
    expect(validateStep(2, { ...validDraft, casetas: '0' }, TODAY).casetas).toBe('Mínimo 1 caseta.');
    expect(validateStep(2, { ...validDraft, casetas: '201' }, TODAY).casetas).toBe('Para más de 200 casetas, llámanos.');
    expect(validateStep(2, { ...validDraft, casetas: '2.5' }, TODAY).casetas).toBe('Indica un número entero.');
    expect(validateStep(2, { ...validDraft, casetas: '200' }, TODAY)).toEqual({});
    expect(validateStep(2, { ...validDraft, comentarios: 'x'.repeat(1001) }, TODAY).comentarios).toBe(
      'Máximo 1000 caracteres.',
    );
  });

  it('paso 4: contacto y privacidad', () => {
    const errors = validateStep(3, EMPTY_DRAFT, TODAY);
    expect(Object.keys(errors).sort()).toEqual(['consentimiento', 'email', 'nombre', 'telefono']);
    expect(errors.consentimiento).toBe('Debes aceptar la política de privacidad.');
    expect(validateStep(3, { ...validDraft, telefono: '123' }, TODAY).telefono).toBe(
      'Indica un teléfono válido, de 9 a 15 dígitos.',
    );
    expect(validateStep(3, { ...validDraft, email: 'lucia@' }, TODAY).email).toBe('Indica un email válido.');
    expect(validateStep(3, { ...validDraft, nombre: 'L' }, TODAY).nombre).toBe('Indica tu nombre y apellidos.');
  });

  it('sabe a qué paso pertenece cada campo', () => {
    expect(stepOfField('tipoEventoOtro')).toBe(0);
    expect(stepOfField('provincia')).toBe(1);
    expect(stepOfField('comentarios')).toBe(2);
    expect(stepOfField('email')).toBe(3);
  });

  it('localiza el primer paso con errores', () => {
    expect(firstInvalidStep({ ...validDraft, localidad: '' }, 3, TODAY)).toBe(1);
    expect(firstInvalidStep({ ...validDraft, localidad: '' }, 0, TODAY)).toBe(-1);
  });
});

describe('petición a la API', () => {
  const ctx = {
    id: '3f1c2b7e-8a4d-4c1e-9f2a-5b6c7d8e9f01',
    startedAt: 1_000,
    sentAt: 60_000,
    pagina: '/contacto',
    landing: '/',
    referrer: 'google.com',
    utm: { utm_source: 'instagram', utm_campaign: 'navidad' },
    dispositivo: 'móvil' as const,
  };

  it('convierte el borrador y pasa la validación del servidor', () => {
    const body = draftToLeadRequest({ ...validDraft, email: ' Lucia@Example.com ', localidad: '  Madrid   centro ' }, ctx);
    expect(body).toMatchObject({
      casetas: 4,
      email: 'lucia@example.com',
      localidad: 'Madrid centro',
      utmSource: 'instagram',
      utmCampaign: 'navidad',
      consentimiento: true,
      tipoEventoOtro: undefined,
    });
    const parsed = leadRequestSchema.safeParse({ ...body, fechaInicio: addDays(todayMadrid(), 10), fechaFin: addDays(todayMadrid(), 12) });
    expect(parsed.success).toBe(true);
  });

  it('con un solo día no envía fecha de fin', () => {
    const body = draftToLeadRequest({ ...validDraft, unDia: true }, ctx);
    expect(body.fechaFin).toBeUndefined();
    expect(body.unDia).toBe(true);
  });

  it('el servidor rechaza "Otro" sin detalle y consentimiento falso', () => {
    const body = draftToLeadRequest(
      { ...validDraft, tipoEvento: 'Otro', tipoEventoOtro: '', fechaInicio: addDays(todayMadrid(), 5), fechaFin: addDays(todayMadrid(), 6) },
      ctx,
    );
    const result = leadRequestSchema.safeParse({ ...body, consentimiento: false });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain('consentimiento');
  });
});

describe('formatos del resumen', () => {
  it('rango de fechas compacto en español', () => {
    expect(formatDateRange('2026-12-12', '2026-12-24', 2026)).toBe('12 al 24 dic');
    expect(formatDateRange('2026-11-28', '2026-12-06', 2026)).toBe('28 nov al 6 dic');
    expect(formatDateRange('2026-12-28', '2027-01-03', 2026)).toBe('28 dic 2026 al 3 ene 2027');
    expect(formatDateRange('2026-09-05', undefined, 2026)).toBe('5 sept');
    expect(formatDateRange('2027-03-01', '2027-03-01', 2026)).toBe('1 mar 2027');
    expect(formatDateRange('', undefined, 2026)).toBe('');
  });

  it('singular y plural', () => {
    expect(casetasLabel(1)).toBe('1 caseta');
    expect(casetasLabel(4)).toBe('4 casetas');
    expect(daysLabel(1)).toBe('1 día');
    expect(daysLabel(13)).toBe('13 días');
    expect(firstName('  Lucía Martín ')).toBe('Lucía');
  });
});

describe('borrador en sessionStorage', () => {
  it('descarta claves desconocidas, tipos erróneos y nunca restaura la casilla de privacidad', () => {
    const values = sanitizeValues({
      tipoEvento: 'Mercado navideño',
      localidad: 'Toledo',
      unDia: true,
      consentimiento: true,
      website: 'spam',
      casetas: 7,
      extra: 'x',
    });
    expect(values.tipoEvento).toBe('Mercado navideño');
    expect(values.localidad).toBe('Toledo');
    expect(values.unDia).toBe(true);
    expect(values.consentimiento).toBe(false);
    expect(values.website).toBe('');
    expect(values.casetas).toBe(EMPTY_DRAFT.casetas);
    expect('extra' in values).toBe(false);
    expect(sanitizeValues({ tipoEvento: 'Boda' }).tipoEvento).toBe('');
  });
});

describe('CasetaLineup: disposición', () => {
  it('dibuja como mucho max casetas y cuenta el resto', () => {
    const l = computeLayout(30, 12);
    expect(l.slots).toHaveLength(12);
    expect(l.extra).toBe(18);
    expect(l.plus).not.toBeNull();
  });

  it('una fila hasta la mitad de max y dos filas después, con lienzo fijo', () => {
    const one = computeLayout(6, 12);
    const two = computeLayout(7, 12);
    expect(new Set(one.slots.map((s) => s.row))).toEqual(new Set([0]));
    expect(two.slots.filter((s) => s.row === 0)).toHaveLength(4);
    expect(two.slots.filter((s) => s.row === 1)).toHaveLength(3);
    expect(one.width).toBe(two.width);
    expect(one.height).toBe(two.height);
  });

  it('acepta cero y valores no válidos', () => {
    expect(computeLayout(0, 12).slots).toHaveLength(0);
    expect(computeLayout(-3, 12).slots).toHaveLength(0);
    expect(computeLayout(3, 0).slots).toHaveLength(1);
  });
});
