'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect } from 'react';
import { GA_ID, META_PIXEL_ID } from '@/content/cookies';
import { site } from '@/content/site';
import { useConsent } from './ConsentProvider';

type Gtag = (...args: unknown[]) => void;

// Los scripts de Vercel solo existen en despliegues de Vercel. En local se
// pueden forzar con NEXT_PUBLIC_ANALYTICS_LOCAL=1.
const VERCEL_ANALYTICS = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV) || process.env.NEXT_PUBLIC_ANALYTICS_LOCAL === '1';

function loadScript(src: string, id: string): void {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Google Analytics 4 con Consent Mode v2: solo tras aceptar las analíticas. */
function useGoogleAnalytics(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !GA_ID) return;
    const w = window as unknown as { dataLayer: unknown[]; gtag?: Gtag };
    w.dataLayer = w.dataLayer || [];
    if (!w.gtag) {
      // gtag necesita recibir el objeto arguments
      w.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer.push(arguments);
      };
      w.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500,
      });
      w.gtag('js', new Date());
      w.gtag('config', GA_ID, { anonymize_ip: true });
    }
    w.gtag('consent', 'update', { analytics_storage: 'granted' });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`, 'ga4');
  }, [enabled]);
}

/** Meta Pixel: solo con consentimiento de marketing, flag activo e ID configurado. */
function useMetaPixel(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !META_PIXEL_ID || !site.features.metaPixel) return;
    interface Fbq {
      (...args: unknown[]): void;
      queue: unknown[];
      callMethod?: (...a: unknown[]) => void;
      loaded: boolean;
      version: string;
      push: Fbq;
    }
    const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };
    if (!w.fbq) {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      } as Fbq;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.push = fbq;
      w.fbq = fbq;
      w._fbq = fbq;
      loadScript('https://connect.facebook.net/en_US/fbevents.js', 'meta-pixel');
      fbq('init', META_PIXEL_ID);
    }
    w.fbq('track', 'PageView');
  }, [enabled]);
}

/** Monta la analítica únicamente con el consentimiento correspondiente. */
export function AnalyticsGate() {
  const { analytics, marketing } = useConsent();
  useGoogleAnalytics(analytics);
  useMetaPixel(marketing);
  if (!analytics || !VERCEL_ANALYTICS) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
