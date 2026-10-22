'use client';

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { onFirstIntent } from '@/lib/intent';

// Misma clave que el borrador de storage.ts (no se importa para no traer su código)
const DRAFT_KEY = 'cm:presupuesto';

let formModule: Promise<ComponentType> | null = null;
function loadForm(): Promise<ComponentType> {
  formModule ??= import('./QuoteForm')
    .then((mod) => mod.QuoteForm)
    .catch((error: unknown) => {
      formModule = null;
      throw error;
    });
  return formModule;
}

/**
 * Carga el formulario interactivo fuera del JavaScript inicial: con la primera
 * interacción con la página (scroll, toque, tecla o ratón), al primer toque o
 * foco en la versión estática, o enseguida si hay un borrador o parámetros en
 * la URL. Hasta entonces se ve la versión estática del servidor (children), con
 * las mismas medidas, así que el cambio no desplaza nada.
 */
export function QuoteFormIsland({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Form, setForm] = useState<ComponentType | null>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const load = () => {
      loadForm()
        .then((C) => {
          if (!cancelled) setForm(() => C);
        })
        .catch(() => undefined);
    };
    const onPointer = () => load();
    const onFocus = () => {
      restoreFocus.current = true;
      load();
    };
    // Elección hecha antes de cargar: se pasa por la URL, que el formulario lee
    const onChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.name === 'evento') {
        const url = new URL(window.location.href);
        url.searchParams.set('evento', input.value);
        window.history.replaceState(window.history.state, '', url);
      }
      load();
    };
    const onSubmit = (e: Event) => {
      e.preventDefault();
      load();
    };
    el.addEventListener('pointerdown', onPointer);
    el.addEventListener('focusin', onFocus);
    el.addEventListener('change', onChange);
    el.addEventListener('submit', onSubmit);

    let urgent = /[?&](evento|casetas|provincia)=/.test(window.location.search);
    try {
      urgent ||= window.sessionStorage.getItem(DRAFT_KEY) !== null;
    } catch {
      // Sin sessionStorage no hay borrador que recuperar
    }

    let stopWaiting = () => {};
    if (urgent) load();
    else stopWaiting = onFirstIntent(load);

    return () => {
      cancelled = true;
      el.removeEventListener('pointerdown', onPointer);
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('change', onChange);
      el.removeEventListener('submit', onSubmit);
      stopWaiting();
    };
  }, []);

  // Si el foco estaba en la versión estática, pasa al mismo sitio del formulario
  useEffect(() => {
    if (!Form || !restoreFocus.current) return;
    const id = requestAnimationFrame(() => {
      const root = ref.current?.querySelector('[data-quote-form]');
      const target =
        root?.querySelector<HTMLElement>('input[name="evento"]:checked') ??
        root?.querySelector<HTMLElement>('input[name="evento"]');
      target?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [Form]);

  return <div ref={ref}>{Form ? <Form /> : children}</div>;
}
