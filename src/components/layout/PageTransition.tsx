'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

let firstRender = true;

/** Fundido y desplazamiento corto al navegar entre páginas (no en la carga inicial). */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (firstRender) {
      firstRender = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    el.classList.add('page-enter');
    // Al terminar se quita la clase: la animación no debe seguir activa sobre el contenedor
    const done = (e: AnimationEvent) => {
      if (e.target === el) el.classList.remove('page-enter');
    };
    el.addEventListener('animationend', done);
    return () => el.removeEventListener('animationend', done);
  }, []);
  return <div ref={ref}>{children}</div>;
}
