'use client';

import { useRef } from 'react';
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { EVENT_TYPES, LIMITS, type QuoteDraft, type TipoEvento } from '@/lib/quote-data';
import { EVENT_GRID_CLASS, EventCardContent, eventCardClass } from './frame';
import { FORM_COPY } from './copy';
import { Field, FieldError, describedBy, inputClass } from './fields';
import { StepLegend } from './StepHeader';

type StepEventProps = {
  idPrefix: string;
  showErrors: boolean;
  /** Elección con el ratón o el dedo: el formulario avanza solo (salvo "Otro"). */
  onPointerPick: (value: TipoEvento) => void;
};

/** Paso 1: tipo de evento con tarjetas seleccionables (radios nativos). */
export function StepEvent({ idPrefix, showErrors, onPointerPick }: StepEventProps) {
  const { control, register } = useFormContext<QuoteDraft>();
  const { errors } = useFormState({ control, name: ['tipoEvento', 'tipoEventoOtro'] });
  const tipo = useWatch({ control, name: 'tipoEvento' });
  const pointer = useRef(false);
  const focusOtro = useRef(false);

  const groupId = `${idPrefix}-tipo`;
  const otroId = `${idPrefix}-otro`;
  const tipoError = showErrors ? errors.tipoEvento?.message : undefined;
  const otroError = showErrors ? errors.tipoEventoOtro?.message : undefined;
  const otro = register('tipoEventoOtro');

  return (
    <fieldset aria-describedby={describedBy(groupId, tipoError)}>
      <StepLegend step={0} id={`${idPrefix}-title`} />
      <Controller
        control={control}
        name="tipoEvento"
        render={({ field }) => (
          <div className={EVENT_GRID_CLASS}>
            {EVENT_TYPES.map((option, index) => {
              const checked = field.value === option.value;
              return (
                <label
                  key={option.value}
                  onPointerDown={() => {
                    pointer.current = true;
                  }}
                  className={eventCardClass(checked)}
                >
                  <input
                    ref={index === 0 ? field.ref : undefined}
                    type="radio"
                    name="evento"
                    value={option.slug}
                    checked={checked}
                    required
                    aria-describedby={describedBy(groupId, tipoError)}
                    className="sr-only"
                    onChange={() => field.onChange(option.value)}
                    onBlur={field.onBlur}
                    onKeyDown={() => {
                      pointer.current = false;
                    }}
                    onClick={() => {
                      if (!pointer.current) return;
                      pointer.current = false;
                      if (option.value === 'Otro') focusOtro.current = true;
                      onPointerPick(option.value);
                    }}
                  />
                  <EventCardContent value={option.value} checked={checked} />
                </label>
              );
            })}
          </div>
        )}
      />
      <FieldError id={groupId} message={tipoError} />

      {tipo === 'Otro' ? (
        <div key="otro" className="q-drop mt-6">
          <Field id={otroId} label={FORM_COPY.otroLabel} error={otroError}>
            <input
              id={otroId}
              type="text"
              autoComplete="off"
              maxLength={LIMITS.otroMax}
              placeholder={FORM_COPY.otroPlaceholder}
              required
              aria-invalid={otroError ? true : undefined}
              aria-describedby={describedBy(otroId, otroError)}
              data-autofocus=""
              className={inputClass(Boolean(otroError))}
              {...otro}
              ref={(el) => {
                otro.ref(el);
                if (el && focusOtro.current) {
                  focusOtro.current = false;
                  el.focus({ preventScroll: true });
                }
              }}
            />
          </Field>
        </div>
      ) : null}
    </fieldset>
  );
}
