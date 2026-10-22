'use client';

import { useEffect } from 'react';

type InViewProps = { targetId: string; className?: string; threshold?: number };

/**
 * Añade una clase al elemento indicado cuando entra en pantalla. Permite que el
 * marcado sea de servidor y aquí solo viva el observador.
 */
export function InView({ targetId, className = 'is-in', threshold = 0.3 }: InViewProps) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (!document.documentElement.classList.contains('js-motion')) {
      el.classList.add(className);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add(className);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetId, className, threshold]);
  return null;
}
