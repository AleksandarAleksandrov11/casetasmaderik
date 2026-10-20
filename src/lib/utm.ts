/**
 * Datos de contexto del formulario: UTM, landing y referrer. La landing y los
 * UTM solo se guardan en sessionStorage si hay consentimiento analítico; si no,
 * solo se envían los UTM presentes en la URL actual.
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

/** Se llama al cargar cada página. Guarda la atribución solo con consentimiento. */
export function rememberAttribution(analyticsAllowed: boolean): void {
  if (!analyticsAllowed) return;
  const store = safeSession();
  if (!store) return;
  const existing = store.getItem(STORAGE_KEY);
  const utm = readUtmFromUrl(window.location.search);
  if (existing) {
    // Si llegan UTM nuevos en la misma sesión, se actualizan
    if (Object.keys(utm).length > 0) {
      const parsed = JSON.parse(existing) as Attribution;
      store.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, utm }));
    }
    return;
  }
  const data: Attribution = {
    landing: window.location.pathname,
    referrer: referrerDomain(document.referrer, window.location.hostname),
    utm,
  };
  store.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function forgetAttribution(): void {
  safeSession()?.removeItem(STORAGE_KEY);
}

/** Contexto que se envía con el formulario. */
export function collectAttribution(analyticsAllowed: boolean): Attribution {
  const current: Attribution = {
    referrer: referrerDomain(document.referrer, window.location.hostname),
    utm: readUtmFromUrl(window.location.search),
  };
  if (!analyticsAllowed) return current;
  const stored = safeSession()?.getItem(STORAGE_KEY);
  if (!stored) return current;
  try {
    const parsed = JSON.parse(stored) as Attribution;
    return {
      landing: parsed.landing,
      referrer: parsed.referrer ?? current.referrer,
      utm: Object.keys(current.utm).length > 0 ? current.utm : parsed.utm,
    };
  } catch {
    return current;
  }
}
