/**
 * Lógica de servidor de /api/presupuesto. Solo se importa desde el route
 * handler (y desde los tests). Valida con zod, aplica el antispam, añade el
 * secreto y reenvía la solicitud a Google Apps Script.
 */
import {
  LIMITS,
  leadRequestSchema,
  type LeadErrorCode,
  type LeadPayload,
  type LeadRequest,
  type LeadResponse,
} from '@/lib/validation';

export const MAX_BODY_BYTES = 16 * 1024;
export const UPSTREAM_TIMEOUT_MS = 15_000;
export const RATE_LIMIT = { max: 5, windowMs: 10 * 60_000 } as const;

const MESSAGES: Record<LeadErrorCode, string> = {
  invalid_json: 'La solicitud no tiene un formato válido.',
  unsupported_media_type: 'La solicitud no tiene un formato válido.',
  too_large: 'La solicitud es demasiado grande.',
  rate_limited: 'Has enviado varias solicitudes en poco tiempo. Espera unos minutos y vuelve a intentarlo.',
  validation: 'Revisa los datos del formulario.',
  upstream: 'No hemos podido registrar tu solicitud. Inténtalo de nuevo en unos minutos.',
  not_configured: 'El formulario no está disponible ahora mismo. Escríbenos por WhatsApp o por email.',
};

/* ------------------------------------------------------------------ */
/* Límite de envíos por IP                                             */
/* ------------------------------------------------------------------ */

/*
 * Límite en memoria: 5 envíos cada 10 minutos por IP. En Vercel cada instancia
 * tiene su propia memoria, así que es una primera barrera y no un límite
 * global. Mejora opcional: usar Upstash Redis (@upstash/ratelimit) con
 * UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN para compartir el contador
 * entre instancias.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, now: number = Date.now()): { ok: boolean; retryAfter: number } {
  const since = now - RATE_LIMIT.windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > since);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((recent[0] + RATE_LIMIT.windowMs - now) / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);
  // Limpieza para que el mapa no crezca sin control
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => t <= since)) hits.delete(k);
    }
  }
  return { ok: true, retryAfter: 0 };
}

export function resetRateLimit(): void {
  hits.clear();
  recentLeads.clear();
}

/** IP del cliente. En Vercel x-forwarded-for y x-real-ip los fija la plataforma. */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get('x-real-ip')?.trim();
  return real || null;
}

/* ------------------------------------------------------------------ */
/* Reintentos: misma solicitud, mismo número                           */
/* ------------------------------------------------------------------ */

const RECENT_TTL_MS = 6 * 60 * 60_000;
const recentLeads = new Map<string, { numero: number; at: number }>();

function rememberLead(id: string, numero: number, now: number): void {
  recentLeads.set(id, { numero, at: now });
  if (recentLeads.size > 500) {
    const oldest = recentLeads.keys().next().value;
    if (oldest) recentLeads.delete(oldest);
  }
}

function recalledLead(id: string, now: number): number | null {
  const hit = recentLeads.get(id);
  if (!hit) return null;
  if (now - hit.at > RECENT_TTL_MS) {
    recentLeads.delete(id);
    return null;
  }
  return hit.numero;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function json(body: LeadResponse, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

function fail(
  code: LeadErrorCode,
  status: number,
  extra: Partial<Extract<LeadResponse, { ok: false }>> = {},
  headers?: Record<string, string>,
) {
  return json({ ok: false, error: MESSAGES[code], code, ...extra }, status, headers);
}

/** Lee el cuerpo sin pasar de `limit` bytes. Devuelve null si lo supera. */
async function readBody(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(all);
}

/** Construye la carga para Apps Script a partir de la petición validada. */
export function buildLeadPayload(req: LeadRequest, secret: string): LeadPayload {
  return {
    secret,
    id: req.id,
    tipoEvento: req.tipoEvento,
    tipoEventoOtro: req.tipoEvento === 'Otro' ? req.tipoEventoOtro : undefined,
    fechaInicio: req.fechaInicio,
    fechaFin: req.unDia || !req.fechaFin ? req.fechaInicio : req.fechaFin,
    localidad: req.localidad,
    provincia: req.provincia,
    casetas: req.casetas,
    comentarios: req.comentarios,
    nombre: req.nombre,
    telefono: req.telefono,
    email: req.email.trim().toLowerCase(),
    empresa: req.empresa,
    consentimiento: true,
    website: '',
  };
}

const maskText = (value: string) => (value ? `${value.trim().charAt(0)}***` : '');

/** Copia del payload apta para logs: sin secreto ni datos personales completos. */
export function maskPayload(p: LeadPayload): Record<string, unknown> {
  const [user = '', domain = ''] = p.email.split('@');
  return {
    id: p.id,
    tipoEvento: p.tipoEvento,
    fechaInicio: p.fechaInicio,
    fechaFin: p.fechaFin,
    localidad: p.localidad,
    provincia: p.provincia,
    casetas: p.casetas,
    nombre: maskText(p.nombre),
    telefono: `***${p.telefono.replace(/\D/g, '').slice(-2)}`,
    email: `${maskText(user)}@${domain}`,
    empresa: p.empresa ? maskText(p.empresa) : undefined,
    comentarios: p.comentarios ? `${p.comentarios.length} caracteres` : undefined,
  };
}

function fieldErrors(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) out[key] = issue.message;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Manejador                                                           */
/* ------------------------------------------------------------------ */

type Env = Record<string, string | undefined>;

export type HandlerOptions = {
  env?: Env;
  now?: () => number;
  fetchImpl?: typeof fetch;
};

export async function handleLeadRequest(request: Request, options: HandlerOptions = {}): Promise<Response> {
  const env = options.env ?? process.env;
  const now = options.now ?? Date.now;
  const doFetch = options.fetchImpl ?? fetch;

  // 1. Tamaño máximo del cuerpo
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return fail('too_large', 413);

  // 2. Solo JSON: un formulario de otra web no puede enviarlo sin CORS
  const type = request.headers.get('content-type') ?? '';
  if (!type.toLowerCase().includes('application/json')) return fail('unsupported_media_type', 415);

  // 3. Límite por IP (sin IP conocida no se limita: en Vercel siempre llega)
  const ip = clientIp(request.headers);
  if (ip) {
    const limit = rateLimit(ip, now());
    if (!limit.ok) return fail('rate_limited', 429, {}, { 'Retry-After': String(limit.retryAfter) });
  }

  const raw = await readBody(request, MAX_BODY_BYTES);
  if (raw === null) return fail('too_large', 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail('invalid_json', 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('invalid_json', 400);

  // 4. Campo trampa: se responde como si todo hubiera ido bien y no se guarda
  const trap = (body as Record<string, unknown>).website;
  if (typeof trap === 'string' && trap.trim() !== '') {
    console.info('[presupuesto] Envío descartado: campo trampa relleno.');
    return json({ ok: true, numero: 0 });
  }

  // 5. Validación con las mismas reglas que el cliente
  const parsed = leadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail('validation', 400, { fields: fieldErrors(parsed.error.issues) });
  }
  const lead = parsed.data;

  // 6. Tiempo mínimo de relleno (con el reloj del propio navegador)
  const elapsed = (lead.sentAt ?? now()) - lead.startedAt;
  if (elapsed < LIMITS.minFillMs) {
    console.info('[presupuesto] Envío descartado: enviado demasiado rápido.');
    return json({ ok: true, numero: 0 });
  }

  // 7. Reintento de una solicitud ya registrada en esta instancia
  const known = recalledLead(lead.id, now());
  if (known !== null) return json({ ok: true, numero: known });

  const url = env.APPS_SCRIPT_URL?.trim();
  const secret = env.APPS_SCRIPT_SECRET?.trim() ?? '';
  const payload = buildLeadPayload(lead, secret);

  // 8. Sin Apps Script: modo de prueba en desarrollo o con LEADS_MOCK=1
  if (!url) {
    if (env.NODE_ENV !== 'production' || env.LEADS_MOCK === '1') {
      console.info('[presupuesto] Modo de prueba (sin APPS_SCRIPT_URL). Solicitud recibida:', maskPayload(payload));
      return json({ ok: true, numero: 0 });
    }
    console.error(
      '[presupuesto] Falta la variable de entorno APPS_SCRIPT_URL. Las solicitudes no se están guardando. Configúrala en Vercel (Settings > Environment Variables).',
    );
    return fail('not_configured', 500);
  }
  if (!secret) {
    console.error(
      '[presupuesto] Falta la variable de entorno APPS_SCRIPT_SECRET. Copia el secreto desde el menú de la hoja.',
    );
    return fail('not_configured', 500);
  }

  // 9. Reenvío a Google Apps Script
  try {
    const res = await doFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[presupuesto] Apps Script respondió ${res.status}. Solicitud ${lead.id} no guardada.`);
      return fail('upstream', 502);
    }
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(
        `[presupuesto] La respuesta de Apps Script no es JSON (solicitud ${lead.id}). Revisa que la implementación sea "Aplicación web" con acceso "Cualquier usuario" y que la URL termine en /exec.`,
      );
      return fail('upstream', 502);
    }
    const result = data as { ok?: unknown; numero?: unknown; error?: unknown };
    if (result.ok === true && typeof result.numero === 'number' && Number.isFinite(result.numero)) {
      if (result.numero > 0) rememberLead(lead.id, result.numero, now());
      return json({ ok: true, numero: result.numero });
    }
    const reason = typeof result.error === 'string' ? result.error : 'respuesta inesperada';
    console.error(
      reason === 'unauthorized'
        ? '[presupuesto] Apps Script rechazó el secreto: APPS_SCRIPT_SECRET no coincide con el de la hoja.'
        : `[presupuesto] Apps Script devolvió un error (${reason}) para la solicitud ${lead.id}.`,
    );
    return fail('upstream', 502);
  } catch (error) {
    const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    console.error(
      timeout
        ? `[presupuesto] Apps Script no respondió en ${UPSTREAM_TIMEOUT_MS / 1000} s (solicitud ${lead.id}).`
        : `[presupuesto] No se pudo contactar con Apps Script (solicitud ${lead.id}): ${error instanceof Error ? error.message : String(error)}`,
    );
    return fail('upstream', 502);
  }
}
