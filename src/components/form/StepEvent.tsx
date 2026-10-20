'use client';

import { useRef } from 'react';
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form';
import { AnimatePresence, m } from 'motion/react';
import { Briefcase, Check, Flower2, PencilLine, Store, TreePine, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { EVENT_TYPES, LIMITS, type QuoteDraft, type TipoEvento } from '@/lib/quote-data';
import { FORM_COPY } from './copy';
import { Field, FieldError, describedBy, inputClass } from './fields';
import { StepLegend } from './StepHeader';

const ICONS: Record<TipoEvento, LucideIcon> = {
  'Mercado navideño': TreePine,
  'Feria o bazar': Store,
  'Festival gastronómico': UtensilsCrossed,
  'Evento corporativo': Briefcase,
  'Evento privado': Flower2,
  Otro: PencilLine,
};

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
          <div className="clear-both grid grid-cols-2 gap-3 sm:grid-cols-3">
            {EVENT_TYPES.map((option, index) => {
              const Icon = ICONS[option.value];
              const checked = field.value === option.value;
              return (
                <label
                  key={option.value}
                  onPointerDown={() => {
                    pointer.current = true;
                  }}
                  className={[
                    'group relative flex min-h-[116px] cursor-pointer flex-col justify-between gap-5 rounded-sm border bg-white p-4 sm:min-h-[128px] sm:p-5',
                    'transition-[border-color,background-color] duration-300 ease-brand',
                    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-wood has-[:focus-visible]:outline-solid',
                    checked ? 'border-wood bg-wood/[0.06]' : 'border-sand hover:border-ink/35',
                  ].join(' ')}
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
                  <Icon aria-hidden="true" strokeWidth={1.5} className="size-7 text-wood transition-transform duration-500 ease-brand group-hover:-translate-y-0.5" />
                  <span className="pr-1 font-display text-[1.0625rem] leading-[1.2] text-ink sm:text-[1.125rem]">{option.value}</span>
                  <span
                    aria-hidden="true"
                    className={[
                      'absolute top-4 right-4 flex size-[22px] items-center justify-center rounded-full border transition-[background-color,border-color,opacity] duration-300 ease-brand sm:top-5 sm:right-5',
                      checked ? 'border-wood bg-wood opacity-100' : 'border-sand bg-white opacity-0 group-hover:opacity-100',
                    ].join(' ')}
                  >
                    <Check strokeWidth={2.5} className={`size-3 text-cream ${checked ? '' : 'opacity-0'}`} />
                  </span>
                </label>
              );
            })}
          </div>
        )}
      />
      <FieldError id={groupId} message={tipoError} />

      <AnimatePresence initial={false}>
        {tipo === 'Otro' ? (
          <m.div
            key="otro"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-6"
          >
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
          </m.div>
        ) : null}
      </AnimatePresence>
    </fieldset>
  );
}
