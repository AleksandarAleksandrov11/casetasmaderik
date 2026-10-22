import { EMPTY_DRAFT, EVENT_TYPES, STEP_COUNT, type QuoteDraft } from '@/lib/quote-data';

/**
 * Borrador del formulario en sessionStorage: no se pierde al recargar y
 * desaparece al cerrar la pestaña. La casilla de privacidad nunca se guarda
 * marcada: se vuelve a pedir el consentimiento.
 */
const KEY = 'cm:presupuesto';
const VERSION = 1;

export type StoredDraft = {
  id: string;
  startedAt: number;
  step: number;
  values: QuoteDraft;
};

function store(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

const EVENT_VALUES = EVENT_TYPES.map((e) => e.value) as readonly string[];

/** Solo acepta claves conocidas con el tipo correcto. */
export function sanitizeValues(input: unknown): QuoteDraft {
  const out: QuoteDraft = { ...EMPTY_DRAFT };
  if (!input || typeof input !== 'object') return out;
  const raw = input as Record<string, unknown>;
  for (const key of Object.keys(EMPTY_DRAFT) as (keyof QuoteDraft)[]) {
    const value = raw[key];
    if (key === 'unDia') {
      if (typeof value === 'boolean') out.unDia = value;
    } else if (key === 'consentimiento' || key === 'website') {
      continue;
    } else if (key === 'tipoEvento') {
      if (typeof value === 'string' && EVENT_VALUES.includes(value)) out.tipoEvento = value as QuoteDraft['tipoEvento'];
    } else if (typeof value === 'string') {
      out[key] = value.slice(0, 1000);
    }
  }
  return out;
}

export function loadDraft(): StoredDraft | null {
  const raw = store()?.getItem(KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (data.v !== VERSION || typeof data.id !== 'string' || typeof data.startedAt !== 'number') return null;
    const step = typeof data.step === 'number' ? Math.min(Math.max(0, Math.floor(data.step)), STEP_COUNT - 1) : 0;
    return { id: data.id, startedAt: data.startedAt, step, values: sanitizeValues(data.values) };
  } catch {
    return null;
  }
}

export function saveDraft(draft: StoredDraft): void {
  try {
    const values: Partial<QuoteDraft> = { ...draft.values };
    delete values.consentimiento;
    delete values.website;
    store()?.setItem(KEY, JSON.stringify({ v: VERSION, ...draft, values }));
  } catch {
    // Sin espacio o almacenamiento bloqueado: el formulario sigue funcionando
  }
}

export function clearDraft(): void {
  try {
    store()?.removeItem(KEY);
  } catch {
    // Nada que hacer
  }
}

/** UUID v4. randomUUID solo existe en contextos seguros. */
export function createId(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === 'function') return c.randomUUID();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
