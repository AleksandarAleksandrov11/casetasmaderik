'use client';

import { useRef, useState, type ReactNode } from 'react';
import { CasetaLineup } from '@/components/form/CasetaLineup';
import { CtaActions, CtaNote } from '@/components/sections/shared/CtaParts';
import { casetasConfigurator } from '@/content/casetas';

/**
 * Selector de número de casetas con la ilustración isométrica, en el orden del
 * CTA común: bloque de texto (intro), selector, acciones y nota. En móvil y
 * tablet, una columna centrada con la ilustración entre el texto y el selector
 * (el cambio se ve sin que lo tape el dedo); desde lg, la ilustración ocupa la
 * columna derecha a toda la altura del bloque y centrada en vertical.
 */
export function CasetasConfigurator({ intro, note }: { intro: ReactNode; note: ReactNode }) {
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
    <div
      data-cta-block
      className="grid grid-cols-1 text-center lg:grid-cols-12 lg:grid-rows-[auto_auto_auto_auto] lg:gap-x-12 lg:text-left"
    >
      <div className="lg:col-span-6">{intro}</div>

      <div className="mt-10 lg:col-span-6 lg:col-start-7 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-center">
        <CasetaLineup count={option.value} max={12} zoom tone="dark" className="mx-auto max-w-[30rem] lg:max-w-none" />
      </div>

      <div className="lg:col-span-6 lg:row-start-2">
        <div
          role="radiogroup"
          aria-label="Número de casetas"
          className="mx-auto mt-10 grid max-w-[34rem] grid-cols-2 gap-3 sm:grid-cols-4 lg:mx-0"
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
                  'flex min-h-[60px] items-center justify-center rounded-sm border px-3 font-display text-[1.125rem] whitespace-nowrap transition-colors duration-300',
                  active
                    ? 'border-cream bg-cream text-ink'
                    : 'border-cream/30 bg-ink/35 text-cream hover:border-cream/70',
                ].join(' ')}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-6 lg:row-start-3">
        <CtaActions
          split
          place="cta-configurador"
          actions={['presupuesto', 'llamar', 'whatsapp']}
          presupuestoHref={`/contacto?casetas=${option.value}`}
        />
      </div>

      <div className="lg:col-span-6 lg:row-start-4">
        <CtaNote>{note}</CtaNote>
      </div>
    </div>
  );
}
