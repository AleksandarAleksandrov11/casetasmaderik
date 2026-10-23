'use client';

import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { LIMITS, type QuoteDraft } from '@/lib/quote-data';
import { FORM_COPY, STEPS } from './copy';
import { CheckboxMark, Field, FieldError, checkboxClass, describedBy, inputClass } from './fields';
import { casetasLabel, formatDateRange } from './format';
import { StepLegend } from './StepHeader';

type Part = { step: number; text: string; label: string };

/** Resumen en una línea; cada dato vuelve a su paso para editarlo. */
function Summary({ onEdit }: { onEdit: (step: number) => void }) {
  const { control } = useFormContext<QuoteDraft>();
  const [tipoEvento, tipoEventoOtro, fechaInicio, fechaFin, unDia, localidad, casetas] = useWatch({
    control,
    name: ['tipoEvento', 'tipoEventoOtro', 'fechaInicio', 'fechaFin', 'unDia', 'localidad', 'casetas'],
  });
  const evento = tipoEvento === 'Otro' ? tipoEventoOtro.trim() || 'Otro' : tipoEvento;
  const n = Number(casetas);
  const fechas = formatDateRange(fechaInicio, unDia ? undefined : fechaFin);
  const cantidad = Number.isFinite(n) && n > 0 ? casetasLabel(n) : '';
  // El nombre accesible contiene siempre el texto visible (WCAG 2.5.3)
  const parts: Part[] = [
    { step: 0, text: evento, label: `Cambiar el tipo de evento: ${evento}` },
    { step: 1, text: fechas, label: `Cambiar las fechas: ${fechas}` },
    { step: 1, text: localidad.trim(), label: `Cambiar el lugar: ${localidad.trim()}` },
    { step: 2, text: cantidad, label: `Cambiar el número de casetas: ${cantidad}` },
  ].filter((p) => p.text);

  return (
    <div className="clear-both rounded-sm border border-sand bg-paper/60 px-4 py-3 sm:px-5">
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-wood-dark uppercase">
        {FORM_COPY.summaryLabel}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-4 text-[0.9375rem] text-ink sm:gap-x-1.5">
        {parts.map((part, i) => (
          <span key={`${part.step}-${i}`} className="inline-flex items-center gap-x-1.5">
            {i > 0 ? (
              <span aria-hidden="true" className="text-stone max-sm:hidden">
                ·
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => onEdit(part.step)}
              aria-label={part.label}
              title={`${FORM_COPY.summaryEdit}: ${STEPS[part.step].short.toLowerCase()}`}
              className="inline-flex min-h-11 items-center rounded-xs underline decoration-sand decoration-1 underline-offset-[5px] transition-[text-decoration-color,color] duration-300 ease-brand hover:text-wood-dark hover:decoration-wood"
            >
              {part.text}
            </button>
          </span>
        ))}
      </p>
    </div>
  );
}

/** Paso 4: datos de contacto, privacidad y primera capa informativa. */
export function StepContact({
  idPrefix,
  showErrors,
  onEdit,
  onConsent,
}: {
  idPrefix: string;
  showErrors: boolean;
  onEdit: (step: number) => void;
  /** Al marcar la casilla: el formulario muestra el botón de enviar. */
  onConsent?: () => void;
}) {
  const { control, register } = useFormContext<QuoteDraft>();
  const { errors } = useFormState({ control, name: ['nombre', 'telefono', 'email', 'empresa', 'consentimiento'] });
  const err = (name: 'nombre' | 'telefono' | 'email' | 'empresa' | 'consentimiento') =>
    showErrors ? errors[name]?.message : undefined;

  const ids = {
    nombre: `${idPrefix}-nombre`,
    telefono: `${idPrefix}-telefono`,
    email: `${idPrefix}-email`,
    empresa: `${idPrefix}-empresa`,
    consent: `${idPrefix}-consentimiento`,
    legal: `${idPrefix}-legal`,
  };

  return (
    <fieldset>
      <StepLegend step={3} id={`${idPrefix}-title`} />
      <Summary onEdit={onEdit} />

      <div className="mt-8 grid gap-x-4 gap-y-6 sm:grid-cols-2">
        <Field id={ids.nombre} label={FORM_COPY.nombre} error={err('nombre')} className="sm:col-span-2">
          <input
            id={ids.nombre}
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={LIMITS.nombreMax}
            required
            data-autofocus=""
            aria-invalid={err('nombre') ? true : undefined}
            aria-describedby={describedBy(ids.nombre, err('nombre'))}
            className={inputClass(Boolean(err('nombre')))}
            {...register('nombre')}
          />
        </Field>
        <Field id={ids.telefono} label={FORM_COPY.telefono} error={err('telefono')}>
          <input
            id={ids.telefono}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={24}
            required
            aria-invalid={err('telefono') ? true : undefined}
            aria-describedby={describedBy(ids.telefono, err('telefono'))}
            className={inputClass(Boolean(err('telefono')))}
            {...register('telefono')}
          />
        </Field>
        <Field id={ids.email} label={FORM_COPY.email} error={err('email')}>
          <input
            id={ids.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={254}
            required
            aria-invalid={err('email') ? true : undefined}
            aria-describedby={describedBy(ids.email, err('email'))}
            className={inputClass(Boolean(err('email')))}
            {...register('email')}
          />
        </Field>
        <Field id={ids.empresa} label={FORM_COPY.empresa} optional error={err('empresa')} className="sm:col-span-2">
          <input
            id={ids.empresa}
            type="text"
            autoComplete="organization"
            maxLength={LIMITS.empresaMax}
            aria-invalid={err('empresa') ? true : undefined}
            aria-describedby={describedBy(ids.empresa, err('empresa'))}
            className={inputClass(Boolean(err('empresa')))}
            {...register('empresa')}
          />
        </Field>
      </div>

      <div className="mt-8 border-t border-sand pt-6">
        <div className="flex items-start gap-3">
          <span className="relative mt-[11px] inline-flex">
            <input
              id={ids.consent}
              type="checkbox"
              required
              aria-invalid={err('consentimiento') ? true : undefined}
              aria-describedby={[describedBy(ids.consent, err('consentimiento')), ids.legal].filter(Boolean).join(' ')}
              className={checkboxClass(Boolean(err('consentimiento')))}
              {...register('consentimiento', {
                onChange: (event: { target: { checked?: boolean } }) => {
                  if (event.target.checked) onConsent?.();
                },
              })}
            />
            <CheckboxMark />
          </span>
          <label htmlFor={ids.consent} className="min-h-11 py-[9px] text-[0.9375rem] leading-snug text-ink">
            {FORM_COPY.privacyBefore}
            {/* Enlace normal: se abre en otra pestaña y no merece precarga */}
            <a href="/politica-de-privacidad" target="_blank" rel="noopener" className="link-inline">
              {FORM_COPY.privacyLink}
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            {FORM_COPY.privacyAfter}
          </label>
        </div>
        <FieldError id={ids.consent} message={err('consentimiento')} />
        <p id={ids.legal} className="mt-4 text-[0.8125rem] leading-relaxed text-stone">
          {FORM_COPY.legal}
        </p>
      </div>
    </fieldset>
  );
}
