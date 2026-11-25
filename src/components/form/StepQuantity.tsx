'use client';

import { useFormContext, useFormState, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { Minus, Plus, Users } from 'lucide-react';
import { LIMITS, type QuoteDraft } from '@/lib/quote-data';
import { CasetaLineup } from './CasetaLineup';
import { FORM_COPY } from './copy';
import { Field, describedBy, inputClass } from './fields';
import { casetasLabel } from './format';
import { StepLegend } from './StepHeader';

const QUICK = [1, 2, 5, 10, 20] as const;

function toCount(value: string | undefined, max: number): number {
  const n = Number(value ?? '');
  return Number.isFinite(n) ? Math.min(Math.max(Math.trunc(n), 0), max) : 0;
}

const stepButton =
  'flex size-14 flex-none items-center justify-center border border-ink/20 bg-cream text-ink transition-colors duration-300 ease-brand hover:border-ink/40 hover:bg-paper aria-disabled:cursor-default aria-disabled:text-stone/50 aria-disabled:hover:border-ink/20 aria-disabled:hover:bg-cream';

type StepperProps = {
  id: string;
  count: number;
  min: number;
  max: number;
  lessLabel: string;
  moreLabel: string;
  invalid: boolean;
  describedBy?: string;
  autoFocus?: boolean;
  field: UseFormRegisterReturn;
  onSet: (n: number) => void;
};

/** Campo numérico con botones de quitar y añadir (44 px o más de zona táctil). */
function Stepper(props: StepperProps) {
  const { id, count, min, max, lessLabel, moreLabel, invalid, autoFocus, field, onSet } = props;
  return (
    <div className="flex items-stretch">
      <button
        type="button"
        aria-label={lessLabel}
        aria-controls={id}
        aria-disabled={count <= min ? true : undefined}
        onClick={() => onSet(count - 1)}
        className={`${stepButton} rounded-l-sm border-r-0`}
      >
        <Minus aria-hidden="true" strokeWidth={1.5} className="size-5" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        data-autofocus={autoFocus ? '' : undefined}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={props.describedBy}
        className={`${inputClass(invalid, false)} tabular w-24 flex-none [appearance:textfield] rounded-none text-center font-display text-[1.375rem] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        {...field}
      />
      <button
        type="button"
        aria-label={moreLabel}
        aria-controls={id}
        aria-disabled={count >= max ? true : undefined}
        onClick={() => onSet(count + 1)}
        className={`${stepButton} rounded-r-sm border-l-0`}
      >
        <Plus aria-hidden="true" strokeWidth={1.5} className="size-5" />
      </button>
    </div>
  );
}

/** Paso 3: casetas (con ilustración) y kits de mesa y dos bancos, más comentarios. */
export function StepQuantity({ idPrefix, showErrors }: { idPrefix: string; showErrors: boolean }) {
  const { control, register, setValue, trigger } = useFormContext<QuoteDraft>();
  const { errors } = useFormState({ control, name: ['casetas', 'kits', 'comentarios'] });
  const [casetas, kits] = useWatch({ control, name: ['casetas', 'kits'] });
  const count = toCount(casetas, LIMITS.casetasMax);
  const kitCount = toCount(kits, LIMITS.kitsMax);

  const ids = {
    casetas: `${idPrefix}-casetas`,
    quick: `${idPrefix}-quick`,
    kits: `${idPrefix}-kits`,
    comentarios: `${idPrefix}-comentarios`,
  };
  const casetasError = showErrors ? errors.casetas?.message : undefined;
  const kitsError = showErrors ? errors.kits?.message : undefined;
  const comentariosError = showErrors ? errors.comentarios?.message : undefined;
  // "Ni casetas ni kits": el mensaje va bajo las casetas y los dos campos se marcan
  const nothingChosen = Boolean(casetasError) && count === 0 && kitCount === 0 && !kitsError;

  // Casetas y kits se validan juntos: al cambiar uno, el error de "ninguno" se actualiza en los dos
  const set = (name: 'casetas' | 'kits', n: number, max: number) => {
    setValue(name, String(Math.min(Math.max(n, 0), max)), { shouldDirty: true });
    void trigger(['casetas', 'kits']);
  };

  return (
    <fieldset>
      <StepLegend step={2} id={`${idPrefix}-title`} />
      <div className="clear-both rounded-sm border border-sand bg-paper/60 px-2 pt-5 pb-4 sm:px-8 sm:pt-7">
        {/* Sin casetas queda una en sombra: el panel no se ve vacío y no cambia de alto */}
        <CasetaLineup
          count={Math.max(count, 1)}
          className={`transition-opacity duration-300 ease-brand ${count === 0 ? 'opacity-25 grayscale' : ''}`}
        />
        <p className="tabular mt-3 text-center text-[0.875rem] text-stone" aria-hidden="true">
          {count > 0 ? casetasLabel(count) : FORM_COPY.noCasetas}
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <Field id={ids.casetas} label={FORM_COPY.casetas} error={casetasError} className="flex-none">
          <Stepper
            id={ids.casetas}
            count={count}
            min={LIMITS.casetasMin}
            max={LIMITS.casetasMax}
            lessLabel={FORM_COPY.casetasLess}
            moreLabel={FORM_COPY.casetasMore}
            invalid={Boolean(casetasError)}
            describedBy={describedBy(ids.casetas, casetasError)}
            autoFocus
            field={register('casetas', { deps: ['kits'] })}
            onSet={(n) => set('casetas', n, LIMITS.casetasMax)}
          />
        </Field>

        <div role="group" aria-labelledby={ids.quick}>
          <p id={ids.quick} className="sr-only">
            {FORM_COPY.casetasQuick}
          </p>
          <div className="grid grid-cols-5 gap-2 sm:flex">
            {QUICK.map((n) => {
              const active = count === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={active}
                  aria-label={casetasLabel(n)}
                  onClick={() => set('casetas', n, LIMITS.casetasMax)}
                  className={[
                    'tabular flex h-11 min-w-0 items-center justify-center rounded-sm border px-0 text-[0.9375rem] font-semibold transition-colors duration-300 ease-brand sm:min-w-11 sm:px-3',
                    active ? 'border-wood bg-wood text-cream' : 'border-ink/20 bg-cream text-ink hover:border-ink/40',
                  ].join(' ')}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Field
        id={ids.kits}
        label={FORM_COPY.kits}
        hint={FORM_COPY.kitsHint}
        error={kitsError}
        className="mt-8 border-t border-sand pt-7"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Stepper
            id={ids.kits}
            count={kitCount}
            min={LIMITS.kitsMin}
            max={LIMITS.kitsMax}
            lessLabel={FORM_COPY.kitsLess}
            moreLabel={FORM_COPY.kitsMore}
            invalid={Boolean(kitsError) || nothingChosen}
            describedBy={
              [describedBy(ids.kits, kitsError, true), nothingChosen ? `${ids.casetas}-error` : '']
                .filter(Boolean)
                .join(' ') || undefined
            }
            field={register('kits', { deps: ['casetas'] })}
            onSet={(n) => set('kits', n, LIMITS.kitsMax)}
          />
          <p aria-live="polite" className="tabular flex items-center gap-2.5 text-[0.9375rem] text-ink">
            {kitCount > 0 ? (
              <>
                <Users aria-hidden="true" strokeWidth={1.5} className="size-5 flex-none text-wood" />
                {FORM_COPY.kitsPeople(kitCount * LIMITS.personasPorKit)}
              </>
            ) : null}
          </p>
        </div>
      </Field>

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
