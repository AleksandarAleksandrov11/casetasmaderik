import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/presupuesto/route';
import {
  MAX_BODY_BYTES,
  RATE_LIMIT,
  buildLeadPayload,
  handleLeadRequest,
  maskPayload,
  resetRateLimit,
} from '@/lib/lead-server';
import { addDays, leadRequestSchema, todayMadrid, type LeadRequestBody } from '@/lib/validation';

const URL_GAS = 'https://script.google.com/macros/s/TEST/exec';
const SECRET = 'secreto-de-prueba-1234567890';

let ipCounter = 0;
const nextIp = () => `203.0.113.${++ipCounter % 250}`;

function validBody(overrides: Partial<LeadRequestBody> = {}): LeadRequestBody {
  const today = todayMadrid();
  return {
    id: crypto.randomUUID(),
    tipoEvento: 'Mercado navideño',
    fechaInicio: addDays(today, 30),
    fechaFin: addDays(today, 42),
    unDia: false,
    localidad: 'Madrid',
    provincia: 'Madrid',
    casetas: 4,
    comentarios: 'Acceso por la calle Mayor.',
    nombre: 'Lucía Martín',
    telefono: '+34 600 123 456',
    email: 'lucia@example.com',
    empresa: 'Ayuntamiento de Prueba',
    consentimiento: true,
    startedAt: 1_000_000,
    sentAt: 1_000_000 + 45_000,
    website: '',
    ...overrides,
  };
}

function request(body: unknown, init: { ip?: string | null; headers?: Record<string, string>; raw?: string } = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json', ...init.headers };
  const ip = init.ip === undefined ? nextIp() : init.ip;
  if (ip) headers['x-forwarded-for'] = `${ip}, 10.0.0.1`;
  return new Request('http://localhost/api/presupuesto', {
    method: 'POST',
    headers,
    body: init.raw ?? JSON.stringify(body),
  });
}

const upstreamOk = (numero: number) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify({ ok: true, numero }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  );

const prodEnv = { NODE_ENV: 'production', APPS_SCRIPT_URL: URL_GAS, APPS_SCRIPT_SECRET: SECRET };

beforeEach(() => {
  resetRateLimit();
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('POST /api/presupuesto: reenvío a Apps Script', () => {
  it('envía el payload con secreto, fecha de consentimiento y versión de política', async () => {
    const fetchMock = upstreamOk(42);
    vi.stubGlobal('fetch', fetchMock);
    const body = validBody();
    const res = await handleLeadRequest(request(body), { env: prodEnv, now: () => Date.parse('2026-10-20T10:00:00Z') });

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ ok: true, numero: 42 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(URL_GAS);
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('follow');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('text/plain;charset=utf-8');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const sent = JSON.parse(String(init.body));
    expect(sent).toMatchObject({
      secret: SECRET,
      id: body.id,
      tipoEvento: 'Mercado navideño',
      fechaFin: body.fechaFin,
      casetas: 4,
      consentimiento: true,
      website: '',
    });
    // Solo los datos del formulario: nada de UTM, procedencia ni dispositivo
    for (const k of ['pagina', 'landing', 'referrer', 'utmSource', 'dispositivo', 'politicaVersion']) {
      expect(sent).not.toHaveProperty(k);
    }
    expect(sent).not.toHaveProperty('startedAt');
    expect(sent).not.toHaveProperty('unDia');
  });

  it('con "un solo día" la fecha de fin es la de inicio', async () => {
    const fetchMock = upstreamOk(7);
    vi.stubGlobal('fetch', fetchMock);
    const body = validBody({ unDia: true, fechaFin: undefined });
    await handleLeadRequest(request(body), { env: prodEnv });
    const sent = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(sent.fechaFin).toBe(body.fechaInicio);
  });

  it('un reintento con el mismo id devuelve el mismo número sin volver a llamar a Apps Script', async () => {
    const fetchMock = upstreamOk(15);
    vi.stubGlobal('fetch', fetchMock);
    const body = validBody();
    const first = await handleLeadRequest(request(body), { env: prodEnv });
    const second = await handleLeadRequest(request(body), { env: prodEnv });
    expect(await first.json()).toEqual({ ok: true, numero: 15 });
    expect(await second.json()).toEqual({ ok: true, numero: 15 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('el handler exportado por la ruta lee las variables de entorno', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('APPS_SCRIPT_URL', URL_GAS);
    vi.stubEnv('APPS_SCRIPT_SECRET', SECRET);
    vi.stubGlobal('fetch', upstreamOk(101));
    const res = await POST(request(validBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, numero: 101 });
  });
});

describe('POST /api/presupuesto: errores de Apps Script', () => {
  it('502 si Apps Script rechaza el secreto, sin filtrarlo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ok: false, error: 'unauthorized' }))),
    );
    const res = await handleLeadRequest(request(validBody()), { env: prodEnv });
    expect(res.status).toBe(502);
    const text = await res.text();
    expect(text).not.toContain(SECRET);
    expect(JSON.parse(text)).toMatchObject({ ok: false, code: 'upstream' });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('APPS_SCRIPT_SECRET no coincide'));
  });

  it('502 si la respuesta no es JSON (por ejemplo, la página de acceso de Google)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>Inicia sesión</html>', { status: 200 })),
    );
    const res = await handleLeadRequest(request(validBody()), { env: prodEnv });
    expect(res.status).toBe(502);
  });

  it('502 si Apps Script responde con error HTTP', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('fallo', { status: 500 })),
    );
    const res = await handleLeadRequest(request(validBody()), { env: prodEnv });
    expect(res.status).toBe(502);
  });

  it('502 si la red falla o se agota el tiempo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('fetch failed'))),
    );
    expect((await handleLeadRequest(request(validBody()), { env: prodEnv })).status).toBe(502);

    const timeout = new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(timeout)),
    );
    const res = await handleLeadRequest(request(validBody()), { env: prodEnv });
    expect(res.status).toBe(502);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('no respondió en 15 s'));
  });
});

describe('POST /api/presupuesto: sin APPS_SCRIPT_URL', () => {
  it('en desarrollo registra el payload enmascarado y devuelve el número 0', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const body = validBody();
    const res = await handleLeadRequest(request(body), { env: { NODE_ENV: 'development' } });
    expect(await res.json()).toEqual({ ok: true, numero: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
    const logged = JSON.stringify((console.info as unknown as { mock: { calls: unknown[][] } }).mock.calls);
    expect(logged).not.toContain('lucia@example.com');
    expect(logged).not.toContain('Lucía Martín');
    expect(logged).not.toContain('600 123 456');
  });

  it('en producción con LEADS_MOCK=1 también funciona (tests e2e)', async () => {
    const res = await handleLeadRequest(request(validBody()), { env: { NODE_ENV: 'production', LEADS_MOCK: '1' } });
    expect(await res.json()).toEqual({ ok: true, numero: 0 });
  });

  it('en producción sin la variable responde 500 y lo registra con claridad', async () => {
    const res = await handleLeadRequest(request(validBody()), { env: { NODE_ENV: 'production' } });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ ok: false, code: 'not_configured' });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('APPS_SCRIPT_URL'));
  });

  it('en producción sin secreto responde 500', async () => {
    const res = await handleLeadRequest(request(validBody()), {
      env: { NODE_ENV: 'production', APPS_SCRIPT_URL: URL_GAS },
    });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/presupuesto: antispam y validación', () => {
  it('campo trampa relleno: responde ok sin reenviar', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = await handleLeadRequest(request(validBody({ website: 'https://spam.example' })), { env: prodEnv });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, numero: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('enviado en menos de 4 s: responde ok sin reenviar', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = await handleLeadRequest(request(validBody({ startedAt: 5_000, sentAt: 7_500 })), { env: prodEnv });
    expect(await res.json()).toEqual({ ok: true, numero: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sin sentAt usa el reloj del servidor', async () => {
    const fetchMock = upstreamOk(3);
    vi.stubGlobal('fetch', fetchMock);
    const now = 10_000_000;
    const fast = await handleLeadRequest(request(validBody({ startedAt: now - 1_000, sentAt: undefined })), {
      env: prodEnv,
      now: () => now,
    });
    expect(await fast.json()).toEqual({ ok: true, numero: 0 });
    const slow = await handleLeadRequest(request(validBody({ startedAt: now - 60_000, sentAt: undefined })), {
      env: prodEnv,
      now: () => now,
    });
    expect(await slow.json()).toEqual({ ok: true, numero: 3 });
  });

  it('datos no válidos: 400 con el error de cada campo', async () => {
    const res = await handleLeadRequest(
      request(
        validBody({
          email: 'no-es-email',
          casetas: 0,
          tipoEvento: 'Otro',
          tipoEventoOtro: undefined,
          consentimiento: false as true,
        }),
      ),
      { env: prodEnv },
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.code).toBe('validation');
    expect(Object.keys(data.fields)).toEqual(
      expect.arrayContaining(['email', 'casetas', 'tipoEventoOtro', 'consentimiento']),
    );
  });

  it('fechas fuera de rango: 400', async () => {
    const today = todayMadrid();
    const res = await handleLeadRequest(
      request(validBody({ fechaInicio: addDays(today, -5), fechaFin: addDays(today, -1) })),
      {
        env: prodEnv,
      },
    );
    expect(res.status).toBe(400);
    expect((await res.json()).fields.fechaInicio).toBe('La fecha de inicio debe ser hoy o posterior.');
  });

  it('JSON roto: 400', async () => {
    const res = await handleLeadRequest(request(null, { raw: '{"id":' }), { env: prodEnv });
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe('invalid_json');
  });

  it('solo acepta application/json: 415', async () => {
    const res = await handleLeadRequest(request(validBody(), { headers: { 'content-type': 'text/plain' } }), {
      env: prodEnv,
    });
    expect(res.status).toBe(415);
  });

  it('cuerpo demasiado grande: 413 (por cabecera y por tamaño real)', async () => {
    const declared = await handleLeadRequest(
      request(validBody(), { headers: { 'content-length': String(MAX_BODY_BYTES + 1) } }),
      { env: prodEnv },
    );
    expect(declared.status).toBe(413);
    const real = await handleLeadRequest(request(validBody({ comentarios: 'x'.repeat(MAX_BODY_BYTES) })), {
      env: prodEnv,
    });
    expect(real.status).toBe(413);
  });

  it(`límite de ${RATE_LIMIT.max} envíos cada 10 minutos por IP`, async () => {
    vi.stubGlobal('fetch', upstreamOk(1));
    let t = 50_000_000;
    const now = () => t;
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      const res = await handleLeadRequest(request(validBody(), { ip: '198.51.100.7' }), { env: prodEnv, now });
      expect(res.status).toBe(200);
    }
    const blocked = await handleLeadRequest(request(validBody(), { ip: '198.51.100.7' }), { env: prodEnv, now });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect((await blocked.json()).code).toBe('rate_limited');

    // Otra IP no se ve afectada
    const other = await handleLeadRequest(request(validBody(), { ip: '198.51.100.8' }), { env: prodEnv, now });
    expect(other.status).toBe(200);

    // Pasados 10 minutos se vuelve a permitir
    t += RATE_LIMIT.windowMs + 1;
    const later = await handleLeadRequest(request(validBody(), { ip: '198.51.100.7' }), { env: prodEnv, now });
    expect(later.status).toBe(200);
  });

  it('usa x-real-ip si no hay x-forwarded-for', async () => {
    vi.stubGlobal('fetch', upstreamOk(1));
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      await handleLeadRequest(request(validBody(), { ip: null, headers: { 'x-real-ip': '192.0.2.44' } }), {
        env: prodEnv,
      });
    }
    const res = await handleLeadRequest(request(validBody(), { ip: null, headers: { 'x-real-ip': '192.0.2.44' } }), {
      env: prodEnv,
    });
    expect(res.status).toBe(429);
  });
});

describe('payload y logs', () => {
  it('enmascara los datos personales', () => {
    const parsed = leadRequestSchema.parse(validBody());
    const payload = buildLeadPayload(parsed, SECRET);
    const masked = maskPayload(payload);
    const text = JSON.stringify(masked);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain('lucia@');
    expect(masked.email).toBe('l***@example.com');
    expect(masked.nombre).toBe('L***');
    expect(masked.telefono).toBe('***56');
  });
});
