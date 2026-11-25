'use client';

import { useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { kitsFor } from '@/content/site';
import { mesasCalculator } from '@/content/mesas';

/**
 * Calculadora de kits: personas sentadas → kits (uno por cada 8) y enlace al
 * formulario con los kits ya puestos. Sin JS se ve con el valor por defecto
 * y el enlace funciona igual.
 */
export function MesasCalculator() {
  const c = mesasCalculator;
  const id = useId();
  const [raw, setRaw] = useState(String(c.defaultPeople));
  const parsed = Number.parseInt(raw, 10);
  const people = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), c.maxPeople) : 0;
  const kits = kitsFor(people);
  const step = (d: number) => setRaw(String(Math.min(Math.max(people + d, 0), c.maxPeople)));
  const stepBtn =
    'flex size-12 flex-none items-center justify-center rounded-sm border border-cream/30 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wood-light aria-disabled:opacity-40';

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
      <div>
        <label htmlFor={`${id}-personas`} className="block text-[0.9375rem] font-medium text-cream/85">
          {c.input}
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            className={stepBtn}
            aria-label="Diez personas menos"
            aria-controls={`${id}-personas`}
            aria-disabled={people <= 0 ? true : undefined}
            onClick={() => step(-10)}
          >
            <Minus aria-hidden="true" strokeWidth={1.5} className="size-5" />
          </button>
          <input
            id={`${id}-personas`}
            type="number"
            inputMode="numeric"
            min={0}
            max={c.maxPeople}
            step={1}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={() => setRaw(String(people))}
            className="tabular h-14 w-32 min-w-0 flex-none [appearance:textfield] rounded-sm border border-cream/30 bg-transparent text-center font-display text-[1.75rem] text-cream focus:border-wood-light focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            className={stepBtn}
            aria-label="Diez personas más"
            aria-controls={`${id}-personas`}
            aria-disabled={people >= c.maxPeople ? true : undefined}
            onClick={() => step(10)}
          >
            <Plus aria-hidden="true" strokeWidth={1.5} className="size-5" />
          </button>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Ejemplos">
          {c.presets.map((p) => (
            <li key={p}>
              <button
                type="button"
                aria-pressed={people === p}
                onClick={() => setRaw(String(p))}
                className="min-h-[44px] rounded-sm border border-cream/25 px-4 text-[0.9375rem] font-medium text-cream transition-colors hover:border-wood-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wood-light aria-pressed:border-cream aria-pressed:bg-cream aria-pressed:text-ink"
              >
                {p} personas
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-cream/20 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16">
        <p className="text-[0.75rem] font-semibold tracking-[0.14em] text-mist uppercase">{c.resultLabel}</p>
        <p className="mt-2 font-display text-[clamp(3rem,2.2rem+3.6vw,5.5rem)] leading-none font-light tracking-[-0.03em]">
          <output htmlFor={`${id}-personas`} aria-live="polite" className="tabular">
            {c.result(kits)}
          </output>
        </p>
        <p className="mt-3 text-[0.9375rem] text-mist">
          {kits > 0 ? c.seats(kits) : 'Escribe cuántas personas esperas.'}
        </p>
        <ButtonLink href={`/contacto?kits=${Math.max(kits, 1)}`} variant="light" size="lg" className="mt-8">
          {c.cta}
        </ButtonLink>
        <p className="mt-4 text-[0.875rem] text-mist">{c.note}</p>
      </div>
    </div>
  );
}
