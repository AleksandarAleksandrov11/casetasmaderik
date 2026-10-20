'use client';

import { useEffect, useRef, type ReactNode } from 'react';

let firstRender = true;

/** Fundido y desplazamiento corto al navegar entre páginas (no en la carga inicial). */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (firstRender) {
      firstRender = false;
      return;
    }
    ref.current?.classList.add('page-enter');
  }, []);
  return <div ref={ref}>{children}</div>;
}
