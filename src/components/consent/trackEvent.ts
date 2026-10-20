'use client';

/**
 * Envía eventos de conversión solo si hay consentimiento. Nada sale del
 * navegador sin que el usuario haya aceptado la categoría correspondiente.
 */
type Params = Record<string, string | number | boolean | undefined>;

type ConsentState = { analytics: boolean; marketing: boolean };

let state: ConsentState = { analytics: false, marketing: false };

export function setConsentState(next: ConsentState): void {
  state = next;
}

export function getConsentState(): ConsentState {
  return state;
}

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

export type TrackName = 'lead_submit' | 'click_whatsapp' | 'click_phone' | 'click_email';

export function trackEvent(name: TrackName, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<
    string,
    string | number | boolean
  >;

  if (state.analytics) {
    // Vercel Web Analytics (los eventos personalizados requieren plan Pro)
    import('@vercel/analytics')
      .then(({ track }) => track(name, clean))
      .catch(() => undefined);

    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (gtag) {
      if (name === 'lead_submit') {
        gtag('event', 'generate_lead', {
          tipo_evento: clean.tipo_evento,
          casetas: clean.casetas,
        });
      } else {
        gtag('event', name, clean);
      }
    }
  }

  if (state.marketing && name === 'lead_submit') {
    const fbq = (window as unknown as { fbq?: Fbq }).fbq;
    fbq?.('track', 'Lead', { content_category: clean.tipo_evento, num_items: clean.casetas });
  }
}
