'use client';

import { useState } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { ChevronDown } from 'lucide-react';
import {
  LIMITS,
  PROVINCIA_OPTIONS,
  addDays,
  daysInclusive,
  isValidDateString,
  todayLocal,
  type QuoteDraft,
} from '@/lib/quote-data';
import { FORM_COPY } from './copy';
import { CheckboxMark, Field, checkboxClass, describedBy, inputClass } from './fields';
import { daysLabel } from './format';
import { StepLegend } from './StepHeader';

const dateClass = (invalid: boolean) =>
  `${inputClass(invalid)} appearance-none tabular [&::-webkit-date-and-time-value]:text-left [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100`;

/** Paso 2: fechas, localidad y provincia. */
export function StepWhenWhere({ idPrefix, showErrors }: { idPrefix: string; showErrors: boolean }) {
  const { control, register } = useFormContext<QuoteDraft>();
  const { errors } = useFormState({ control, name: ['fechaInicio', 'fechaFin', 'localidad', 'provincia'] });
  const [fechaInicio, fechaFin, unDia] = useWatch({ control, name: ['fechaInicio', 'fechaFin', 'unDia'] });
  // Solo se renderiza en el navegador (el servidor siempre pinta el paso 1)
  const [today] = useState(todayLocal);

  const err = (name: 'fechaInicio' | 'fechaFin' | 'localidad' | 'provincia') =>
    showErrors ? errors[name]?.message : undefined;

  const ids = {
    inicio: `${idPrefix}-inicio`,
    fin: `${idPrefix}-fin`,
    unDia: `${idPrefix}-undia`,
    localidad: `${idPrefix}-localidad`,
    provincia: `${idPrefix}-provincia`,
  };

  const startValid = isValidDateString(fechaInicio);
  const minEnd = startValid && fechaInicio > today ? fechaInicio : today;
  const maxEnd = startValid ? addDays(fechaInicio, LIMITS.maxRangeDays - 1) : undefined;
  let days = '';
  if (startValid && unDia) days = daysLabel(1);
  else if (startValid && isValidDateString(fechaFin)) {
    const n = daysInclusive(fechaInicio, fechaFin);
    if (n >= 1 && n <= LIMITS.maxRangeDays) days = daysLabel(n);
  }

  return (
    <fieldset>
      <StepLegend step={1} id={`${idPrefix}-title`} />
      <div className="clear-both grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field id={ids.inicio} label={FORM_COPY.fechaInicio} error={err('fechaInicio')}>
          <input
            id={ids.inicio}
            type="date"
            min={today}
            required
            data-autofocus=""
            aria-invalid={err('fechaInicio') ? true : undefined}
            aria-describedby={describedBy(ids.inicio, err('fechaInicio'))}
            className={dateClass(Boolean(err('fechaInicio')))}
            {...register('fechaInicio', { deps: ['fechaFin'] })}
          />
        </Field>
        <div>
          <Field id={ids.fin} label={FORM_COPY.fechaFin} error={unDia ? undefined : err('fechaFin')}>
            {unDia ? (
              <input
                key="fin-mirror"
                id={ids.fin}
                type="date"
                value={fechaInicio}
                disabled
                readOnly
                aria-describedby={`${ids.fin}-hint`}
                className={dateClass(false)}
              />
            ) : (
              <input
                key="fin"
                id={ids.fin}
                type="date"
                min={minEnd}
                max={maxEnd}
                required
                aria-invalid={err('fechaFin') ? true : undefined}
                aria-describedby={[describedBy(ids.fin, err('fechaFin')), `${ids.fin}-hint`].filter(Boolean).join(' ')}
                className={dateClass(Boolean(err('fechaFin')))}
                {...register('fechaFin')}
              />
            )}
          </Field>
          {/* Siempre montado para el aviso en vivo; con el error visible no reserva hueco */}
          <p
            id={`${ids.fin}-hint`}
            aria-live="polite"
            className={`text-[0.875rem] leading-snug text-stone ${!unDia && err('fechaFin') ? 'sr-only' : 'mt-2 min-h-[1.25rem]'}`}
          >
            {days}
          </p>
        </div>
      </div>

      <label htmlFor={ids.unDia} className="mt-1 inline-flex min-h-11 items-center gap-3 text-[0.9375rem] text-ink">
        <span className="relative inline-flex">
          <input
            id={ids.unDia}
            type="checkbox"
            className={checkboxClass(false)}
            {...register('unDia', { deps: ['fechaFin'] })}
          />
          <CheckboxMark />
        </span>
        <span>{FORM_COPY.unDia}</span>
      </label>

      <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field id={ids.localidad} label={FORM_COPY.localidad} error={err('localidad')}>
          <input
            id={ids.localidad}
            type="text"
            autoComplete="address-level2"
            maxLength={LIMITS.localidadMax}
            placeholder={FORM_COPY.localidadPlaceholder}
            required
            aria-invalid={err('localidad') ? true : undefined}
            aria-describedby={describedBy(ids.localidad, err('localidad'))}
            className={inputClass(Boolean(err('localidad')))}
            {...register('localidad')}
          />
        </Field>
        <Field id={ids.provincia} label={FORM_COPY.provincia} error={err('provincia')}>
          <div className="relative">
            <select
              id={ids.provincia}
              autoComplete="address-level1"
              required
              aria-invalid={err('provincia') ? true : undefined}
              aria-describedby={describedBy(ids.provincia, err('provincia'))}
              className={`${inputClass(Boolean(err('provincia')))} appearance-none pr-11`}
              {...register('provincia')}
            >
              <option value="" disabled>
                {FORM_COPY.provinciaPlaceholder}
              </option>
              {PROVINCIA_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-stone"
            />
          </div>
        </Field>
      </div>
    </fieldset>
  );
}
