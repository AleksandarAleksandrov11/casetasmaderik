'use client';

import { useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { CasetaLineup } from '@/components/form/CasetaLineup';
import { casetasConfigurator } from '@/content/casetas';

/** Selector de número de casetas con la ilustración isométrica. */
export function CasetasConfigurator() {
  const c = casetasConfigurator;
  const [selected, setSelected] = useState(c.options[0].id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const option = c.options.find((o) => o.id === selected) ?? c.options[0];

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const dir =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + c.options.length) % c.options.length;
    setSelected(c.options[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-5">
        <div
          role="radiogroup"
          aria-label="Número de casetas"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2"
        >
          {c.options.map((o, i) => {
            const active = o.id === selected;
            return (
              <button
                key={o.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(o.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={[
                  'flex min-h-[64px] items-center justify-center rounded-sm border px-4 font-display text-[1.25rem] transition-colors duration-300',
                  active ? 'border-cream bg-cream text-ink' : 'border-cream/25 text-cream hover:border-cream/60',
                ].join(' ')}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <ButtonLink href={`/contacto?casetas=${option.value}`} variant="light" size="lg" className="mt-10">
          {c.cta}
        </ButtonLink>
        <p className="mt-4 text-[0.9375rem] text-mist" aria-live="polite">
          {option.value === 1
            ? 'Una caseta.'
            : `Te llevamos al formulario con ${option.value} casetas, y lo ajustas allí.`}
        </p>
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <CasetaLineup count={option.draw} max={12} tone="dark" className="w-full" />
      </div>
    </div>
  );
}
