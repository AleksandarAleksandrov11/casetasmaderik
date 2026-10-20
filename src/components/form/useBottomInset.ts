'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Alto que el aviso de cookies tapa ahora mismo sobre `el` (0 si no lo tapa). */
export function bannerOverlap(el: Element | null): number {
  const banner = document.querySelector<HTMLElement>('#cc-main .cm');
  if (!banner || !el || !document.documentElement.classList.contains('show--consent')) return 0;
  const b = banner.getBoundingClientRect();
  const f = el.getBoundingClientRect();
  const overlapsX = b.left < f.right && b.right > f.left;
  const atBottom = b.bottom >= window.innerHeight - 4 && b.height > 0;
  return overlapsX && atBottom ? Math.ceil(window.innerHeight - b.top) : 0;
}

/**
 * Alto que el aviso de cookies tapa en la parte inferior de la pantalla sobre
 * el elemento indicado (en móvil es una hoja inferior de unos 260 px). Sirve
 * para dejar margen y que el botón de enviar nunca quede debajo del aviso.
 */
export function useBottomInset(target: RefObject<HTMLElement | null>): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let observed: Element | null = null;
    const resize = new ResizeObserver(() => schedule());

    const measure = () => {
      const banner = document.querySelector<HTMLElement>('#cc-main .cm');
      if (banner !== observed) {
        if (observed) resize.unobserve(observed);
        if (banner) resize.observe(banner);
        observed = banner;
      }
      setInset(bannerOverlap(target.current));
    };

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    // El aviso entra con una transición: se vuelve a medir al terminar
    let late = 0;
    const onClass = () => {
      schedule();
      window.clearTimeout(late);
      late = window.setTimeout(schedule, 450);
    };

    const mo = new MutationObserver(onClass);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', schedule);
    onClass();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(late);
      mo.disconnect();
      resize.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [target]);

  return inset;
}
