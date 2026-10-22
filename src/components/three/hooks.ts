'use client';

import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from 'react';
import { EVT_3D_SLOW, canUse3D, canUseInteractive3D } from '@/lib/device';

/**
 * Hooks de carga del 3D: decidir si se usa (WebGL, sin movimiento reducido ni
 * ahorro de datos), esperar al primer pintado y a un momento ocioso, y pausar
 * el lienzo cuando sale de pantalla.
 */

const REDUCED = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener('change', cb);
  window.addEventListener(EVT_3D_SLOW, cb);
  return () => {
    mq.removeEventListener('change', cb);
    window.removeEventListener(EVT_3D_SLOW, cb);
  };
}

/** true si el 3D se puede usar. En el servidor y en la hidratación es false. */
export function useCan3D(): boolean {
  return useSyncExternalStore(subscribe, canUse3D, () => false);
}

/** true si la caseta interactiva puede usar 3D (si no, va con fotogramas). */
export function useCanInteractive3D(): boolean {
  return useSyncExternalStore(subscribe, canUseInteractive3D, () => false);
}

/** Media query reactiva (false en el servidor). */
export function useMedia(query: string): boolean {
  const sub = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    [query],
  );
  const get = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(sub, get, () => false);
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * true cuando la página ya pintó y cargó, y el navegador está ocioso. Así el
 * chunk de three nunca compite con el LCP.
 */
export function useIdleReady(enabled: boolean, immediate = false): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled || ready) return;
    const w = window as IdleWindow;
    let idle = 0;
    let timer = 0;
    const go = () => setReady(true);
    const schedule = () => {
      if (immediate) {
        timer = window.setTimeout(go, 0);
        return;
      }
      if (w.requestIdleCallback) idle = w.requestIdleCallback(go, { timeout: 2500 });
      else timer = window.setTimeout(go, 600);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    return () => {
      window.removeEventListener('load', schedule);
      if (idle && w.cancelIdleCallback) w.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, [enabled, ready, immediate]);
  return ready;
}

/** true mientras el elemento está en pantalla (con margen). */
export function useInView(ref: RefObject<Element | null>, rootMargin = '200px 0px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/**
 * Modo captura de posters (solo en desarrollo): `?poster=<clave>` fija el
 * estado del lienzo para que el script de Playwright lo capture.
 */
export function usePosterKey(): string | null {
  return useSyncExternalStore(
    () => () => undefined,
    () => (process.env.NODE_ENV !== 'production' ? new URLSearchParams(window.location.search).get('poster') : null),
    () => null,
  );
}

/** Parámetro de depuración en la URL (solo en desarrollo), p. ej. `?hq` fuerza la calidad alta. */
export function useDevFlag(name: string): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => process.env.NODE_ENV !== 'production' && new URLSearchParams(window.location.search).has(name),
    () => false,
  );
}
