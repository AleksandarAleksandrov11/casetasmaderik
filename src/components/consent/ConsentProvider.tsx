'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CookieConsentConfig } from 'vanilla-cookieconsent';
import { CONSENT_COOKIE, CONSENT_DAYS, CONSENT_REVISION, consentTexts, cookieCategories } from '@/content/cookies';
import { captureEntry, forgetAttribution, rememberAttribution } from '@/lib/utm';
import { EVT } from '@/lib/events';
import { setConsentState } from './trackEvent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import './consent.css';

type ConsentContextValue = {
  ready: boolean;
  analytics: boolean;
  marketing: boolean;
  showPreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue>({
  ready: false,
  analytics: false,
  marketing: false,
  showPreferences: () => undefined,
});

export function useConsent(): ConsentContextValue {
  return useContext(ConsentContext);
}

type CC = typeof import('vanilla-cookieconsent');

/** Altura del aviso, para reservar ese espacio al final de la página. */
function measureBanner() {
  const banner = document.querySelector<HTMLElement>('#cc-main .cm');
  if (banner) document.documentElement.style.setProperty('--cc-banner-h', `${banner.offsetHeight}px`);
}

/**
 * La librería encierra el Tabulador dentro del aviso aunque no sea modal.
 * Se intercepta antes (fase de captura en window) para que el foco pueda
 * salir del aviso y seguir por la página.
 */
function releaseBannerFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab') return;
  const wrapper = document.querySelector('#cc-main .cm-wrapper');
  if (wrapper && e.target instanceof Node && wrapper.contains(e.target)) e.stopPropagation();
}

function buildConfig(cc: CC, update: () => void): CookieConsentConfig {
  const t = consentTexts;
  const categories: CookieConsentConfig['categories'] = {};
  for (const c of cookieCategories) {
    categories[c.id] = c.readOnly
      ? { enabled: true, readOnly: true }
      : {
          enabled: false,
          autoClear: { cookies: c.clear.map((name) => ({ name })), reloadPage: false },
        };
  }
  const table = (rows: (typeof cookieCategories)[number]['rows']) =>
    rows.length > 0
      ? {
          headers: { name: 'Nombre', provider: 'Proveedor', purpose: 'Finalidad', duration: 'Duración' },
          body: rows.map((r) => ({ name: r.name, provider: r.provider, purpose: r.purpose, duration: r.duration })),
        }
      : undefined;

  return {
    revision: CONSENT_REVISION,
    mode: 'opt-in',
    autoShow: true,
    // La detección propia de bots de la librería oculta el aviso con navigator.webdriver
    hideFromBots: false,
    disablePageInteraction: false,
    cookie: { name: CONSENT_COOKIE, expiresAfterDays: CONSENT_DAYS, sameSite: 'Lax' },
    guiOptions: {
      consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true, flipButtons: false },
      preferencesModal: { layout: 'box', equalWeightButtons: true, flipButtons: false },
    },
    categories,
    onConsent: update,
    onModalShow: ({ modalName }) => {
      if (modalName !== 'consentModal') return;
      // El aviso no es modal: no bloquea la página ni retiene el foco
      document.querySelector('#cc-main .cm')?.setAttribute('aria-modal', 'false');
      measureBanner();
    },
    onModalHide: ({ modalName }) => {
      if (modalName === 'consentModal') document.documentElement.style.removeProperty('--cc-banner-h');
    },
    onChange: ({ changedCategories }) => {
      update();
      // Al retirar un consentimiento se borran sus cookies y se recarga
      const revoked = changedCategories.filter((c) => !cc.acceptedCategory(c));
      if (revoked.length > 0) {
        for (const id of revoked) {
          const cat = cookieCategories.find((c) => c.id === id);
          if (cat && cat.clear.length > 0) {
            cc.eraseCookies(cat.clear);
            cc.eraseCookies(cat.clear, '/', `.${window.location.hostname.replace(/^www\./, '')}`);
          }
        }
        // Avisa a GA4 y al píxel antes de recargar
        const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
        if (revoked.includes('analytics')) {
          w.gtag?.('consent', 'update', { analytics_storage: 'denied' });
          forgetAttribution();
        }
        if (revoked.includes('marketing')) {
          w.gtag?.('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
          w.fbq?.('consent', 'revoke');
        }
        window.location.reload();
      }
    },
    language: {
      default: 'es',
      translations: {
        es: {
          consentModal: {
            title: t.consentModal.title,
            description: t.consentModal.description,
            acceptAllBtn: t.consentModal.acceptAllBtn,
            acceptNecessaryBtn: t.consentModal.acceptNecessaryBtn,
            showPreferencesBtn: t.consentModal.showPreferencesBtn,
            footer: '<a href="/politica-de-cookies">Política de cookies</a>',
          },
          preferencesModal: {
            title: t.preferencesModal.title,
            acceptAllBtn: t.preferencesModal.acceptAllBtn,
            acceptNecessaryBtn: t.preferencesModal.acceptNecessaryBtn,
            savePreferencesBtn: t.preferencesModal.savePreferencesBtn,
            closeIconLabel: t.preferencesModal.closeIconLabel,
            sections: [
              { description: t.preferencesModal.intro },
              ...cookieCategories.map((c) => ({
                title: c.title,
                description: c.description,
                linkedCategory: c.id,
                cookieTable: table(c.rows),
              })),
              {
                title: 'Más información',
                description:
                  'Consulta la <a href="/politica-de-cookies">política de cookies</a> y la <a href="/politica-de-privacidad">política de privacidad</a>.',
              },
            ],
          },
        },
      },
    },
  };
}

/** Inicializa vanilla-cookieconsent y expone el estado del consentimiento. */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ ready: false, analytics: false, marketing: false });
  const [cc, setCc] = useState<CC | null>(null);

  useEffect(() => {
    let cancelled = false;
    captureEntry();
    window.addEventListener('keydown', releaseBannerFocus, true);
    window.addEventListener('resize', measureBanner);
    const isBot = /bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent);
    import('vanilla-cookieconsent').then((mod) => {
      if (cancelled) return;
      const lib = mod as CC;
      setCc(lib);
      const update = () => {
        const next = {
          ready: true,
          analytics: lib.acceptedCategory('analytics'),
          marketing: lib.acceptedCategory('marketing'),
        };
        setConsentState(next);
        setState(next);
        rememberAttribution(next.analytics);
        document.documentElement.dataset.consent =
          [next.analytics ? 'analytics' : '', next.marketing ? 'marketing' : ''].filter(Boolean).join(' ') || 'none';
        window.dispatchEvent(new CustomEvent(EVT.consent, { detail: next }));
      };
      if (isBot) {
        setState((s) => ({ ...s, ready: true }));
        return;
      }
      lib.run(buildConfig(lib, update)).then(() => {
        if (!lib.validConsent()) setState((s) => ({ ...s, ready: true }));
      });
    });
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', releaseBannerFocus, true);
      window.removeEventListener('resize', measureBanner);
    };
  }, []);

  const showPreferences = useCallback(() => {
    cc?.showPreferences();
  }, [cc]);

  const value = useMemo(() => ({ ...state, showPreferences }), [state, showPreferences]);
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
