'use client';

import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';
import { LIMITS, type QuoteDraft } from '@/lib/quote-data';
import { CasetaLineup } from './CasetaLineup';
import { FORM_COPY } from './copy';
import { Field, describedBy, inputClass } from './fields';
import { casetasLabel } from './format';
import { StepLegend } from './StepHeader';

const QUICK = [1, 2, 5, 10, 20] as const;

function toCount(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(Math.trunc(n), 0), LIMITS.casetasMax) : 0;
}

const stepButton =
  'flex size-14 flex-none items-center justify-center border border-sand bg-cream text-ink transition-colors duration-300 ease-brand hover:border-ink/35 hover:bg-paper aria-disabled:cursor-default aria-disabled:text-stone/50 aria-disabled:hover:border-sand aria-disabled:hover:bg-cream';

/** Paso 3: número de casetas con ilustración y comentarios. */
export function StepQuantity({ idPrefix, showErrors }: { idPrefix: string; showErrors: boolean }) {
  const { control, register, setValue } = useFormContext<QuoteDraft>();
  const { errors } = useFormState({ control, name: ['casetas', 'comentarios'] });
  const casetas = useWatch({ control, name: 'casetas' });
  const count = toCount(casetas);

  const ids = { casetas: `${idPrefix}-casetas`, quick: `${idPrefix}-quick`, comentarios: `${idPrefix}-comentarios` };
  const casetasError = showErrors ? errors.casetas?.message : undefined;
  const comentariosError = showErrors ? errors.comentarios?.message : undefined;

  const set = (n: number) =>
    setValue('casetas', String(Math.min(Math.max(n, LIMITS.casetasMin), LIMITS.casetasMax)), {
      shouldValidate: true,
      shouldDirty: true,
    });

  return (
    <fieldset>
      <StepLegend step={2} id={`${idPrefix}-title`} />
      <div className="clear-both rounded-sm border border-sand bg-cream px-2 pt-5 pb-4 sm:px-8 sm:pt-7">
        <CasetaLineup count={count} />
        <p className="tabular mt-3 text-center text-[0.875rem] text-stone" aria-hidden="true">
          {count > 0 ? casetasLabel(count) : ' '}
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <Field id={ids.casetas} label={FORM_COPY.casetas} error={casetasError} className="flex-none">
          <div className="flex items-stretch">
            <button
              type="button"
              aria-label={FORM_COPY.casetasLess}
              aria-controls={ids.casetas}
              aria-disabled={count <= LIMITS.casetasMin ? true : undefined}
              onClick={() => set(count - 1)}
              className={`${stepButton} rounded-l-sm border-r-0`}
            >
              <Minus aria-hidden="true" strokeWidth={1.5} className="size-5" />
            </button>
            <input
              id={ids.casetas}
              type="number"
              inputMode="numeric"
              min={LIMITS.casetasMin}
              max={LIMITS.casetasMax}
              step={1}
              required
              data-autofocus=""
              aria-invalid={casetasError ? true : undefined}
              aria-describedby={describedBy(ids.casetas, casetasError)}
              className={`${inputClass(Boolean(casetasError), false)} tabular w-24 flex-none [appearance:textfield] rounded-none text-center font-display text-[1.375rem] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              {...register('casetas')}
            />
            <button
              type="button"
              aria-label={FORM_COPY.casetasMore}
              aria-controls={ids.casetas}
              aria-disabled={count >= LIMITS.casetasMax ? true : undefined}
              onClick={() => set(count + 1)}
              className={`${stepButton} rounded-r-sm border-l-0`}
            >
              <Plus aria-hidden="true" strokeWidth={1.5} className="size-5" />
            </button>
          </div>
        </Field>

        <div role="group" aria-labelledby={ids.quick}>
          <p id={ids.quick} className="sr-only">
            {FORM_COPY.casetasQuick}
          </p>
          <div className="flex gap-2">
            {QUICK.map((n) => {
              const active = count === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={active}
                  aria-label={casetasLabel(n)}
                  onClick={() => set(n)}
                  className={[
                    'tabular flex h-11 min-w-11 items-center justify-center rounded-sm border px-3 text-[0.9375rem] font-semibold transition-colors duration-300 ease-brand',
                    active ? 'border-wood bg-wood text-cream' : 'border-sand bg-cream text-ink hover:border-ink/35',
                  ].join(' ')}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Field id={ids.comentarios} label={FORM_COPY.comentarios} optional error={comentariosError} className="mt-7">
        <textarea
          id={ids.comentarios}
          rows={3}
          maxLength={LIMITS.comentariosMax}
          placeholder={FORM_COPY.comentariosPlaceholder}
          aria-invalid={comentariosError ? true : undefined}
          aria-describedby={describedBy(ids.comentarios, comentariosError)}
          className={`${inputClass(Boolean(comentariosError))} min-h-28 resize-y py-3.5 leading-relaxed`}
          {...register('comentarios')}
        />
      </Field>
    </fieldset>
  );
}
