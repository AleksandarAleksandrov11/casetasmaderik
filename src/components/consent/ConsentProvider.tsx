'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CookieConsentConfig } from 'vanilla-cookieconsent';
import { CONSENT_COOKIE, CONSENT_DAYS, CONSENT_REVISION, consentTexts, cookieCategories } from '@/content/cookies';
import { captureEntry, forgetAttribution, rememberAttribution } from '@/lib/utm';
import { EVT } from '@/lib/events';
import { BOT_UA, CONSENT_PENDING_CLASS } from './pending';
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

/**
 * Publica en --consent-h la franja inferior que ocupa el aviso: del borde
 * superior del aviso al borde inferior de la ventana. Sustituye a la
 * estimación de globals.css. offsetTop no incluye la transformación de entrada.
 */
function measureBanner() {
  const root = document.documentElement;
  const banner = document.querySelector<HTMLElement>('#cc-main .cm');
  if (!banner || !root.classList.contains(CONSENT_PENDING_CLASS)) return;
  const band = Math.max(0, Math.ceil(window.innerHeight - banner.offsetTop));
  root.style.setProperty('--consent-h', `${band}px`);
}

/** El aviso ya no está: la página recupera todo su alto. */
function releaseBanner() {
  const root = document.documentElement;
  root.classList.remove(CONSENT_PENDING_CLASS);
  root.style.removeProperty('--consent-h');
}

let bannerObserver: ResizeObserver | null = null;

function watchBanner(on: boolean) {
  bannerObserver?.disconnect();
  bannerObserver = null;
  const banner = document.querySelector<HTMLElement>('#cc-main .cm');
  if (!on || !banner || typeof ResizeObserver === 'undefined') return;
  bannerObserver = new ResizeObserver(measureBanner);
  bannerObserver.observe(banner);
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
      // Barra inferior; consent.css la convierte en hoja (móvil) o tarjeta (móvil en horizontal)
      consentModal: { layout: 'bar', position: 'bottom', equalWeightButtons: true, flipButtons: false },
      preferencesModal: { layout: 'box', equalWeightButtons: true, flipButtons: false },
    },
    categories,
    onConsent: update,
    onModalShow: ({ modalName }) => {
      if (modalName !== 'consentModal') return;
      // El aviso no es modal: no bloquea la página ni retiene el foco
      document.querySelector('#cc-main .cm')?.setAttribute('aria-modal', 'false');
      document.documentElement.classList.add(CONSENT_PENDING_CLASS);
      measureBanner();
      watchBanner(true);
    },
    onModalHide: ({ modalName }) => {
      if (modalName !== 'consentModal') return;
      watchBanner(false);
      releaseBanner();
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
    const isBot = BOT_UA.test(navigator.userAgent);
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
        releaseBanner();
        setState((s) => ({ ...s, ready: true }));
        return;
      }
      lib.run(buildConfig(lib, update)).then(() => {
        // Con un consentimiento válido el aviso no llega a mostrarse
        if (lib.validConsent()) releaseBanner();
        else setState((s) => ({ ...s, ready: true }));
      });
    }, releaseBanner);
    return () => {
      cancelled = true;
      watchBanner(false);
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
