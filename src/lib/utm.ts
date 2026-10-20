/**
 * Datos de contexto del formulario: UTM, landing y referrer. Se toman al
 * entrar en la web y se guardan en memoria (no en el dispositivo); solo se
 * guardan en sessionStorage, para sobrevivir a una recarga, si hay
 * consentimiento analítico.
 */
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = 'cm:attribution';

type Attribution = { landing?: string; referrer?: string; utm: Utm };

export function readUtmFromUrl(search: string): Utm {
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 150);
  }
  return utm;
}

/** Solo el dominio del referrer, y solo si es externo. */
export function referrerDomain(referrer: string, currentHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (!host || host === currentHost.replace(/^www\./, '')) return undefined;
    return host;
  } catch {
    return undefined;
  }
}

function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

// Página de entrada de esta carga, en memoria
let entry: Attribution | null = null;

/** Se llama una vez al cargar la web, antes de cualquier navegación interna. */
export function captureEntry(): void {
  if (entry) return;
  entry = {
    landing: window.location.pathname,
    referrer: referrerDomain(document.referrer, window.location.hostname),
    utm: readUtmFromUrl(window.location.search),
  };
}

function readStored(): Attribution | null {
  const stored = safeSession()?.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Attribution;
  } catch {
    return null;
  }
}

/** Con consentimiento analítico, guarda la atribución de la entrada en la sesión. */
export function rememberAttribution(analyticsAllowed: boolean): void {
  if (!analyticsAllowed) return;
  const store = safeSession();
  if (!store) return;
  captureEntry();
  const existing = readStored();
  if (existing) {
    // Si llegan UTM nuevos en la misma sesión, se actualizan
    if (entry && Object.keys(entry.utm).length > 0) {
      store.setItem(STORAGE_KEY, JSON.stringify({ ...existing, utm: entry.utm }));
    }
    return;
  }
  store.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function forgetAttribution(): void {
  safeSession()?.removeItem(STORAGE_KEY);
}

/** Contexto que se envía con el formulario. */
export function collectAttribution(analyticsAllowed: boolean): Attribution {
  const currentUtm = readUtmFromUrl(window.location.search);
  const base = entry ?? {
    referrer: referrerDomain(document.referrer, window.location.hostname),
    utm: {},
  };
  const stored = analyticsAllowed ? readStored() : null;
  const utm =
    Object.keys(currentUtm).length > 0 ? currentUtm : Object.keys(base.utm).length > 0 ? base.utm : (stored?.utm ?? {});
  return {
    landing: stored?.landing ?? base.landing,
    referrer: stored?.referrer ?? base.referrer,
    utm,
  };
}
