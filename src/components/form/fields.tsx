'use client';

import type { ReactNode } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { FORM_COPY } from './copy';

/** Ids accesibles de un campo: mensaje de error y texto de ayuda. */
export function describedBy(id: string, error?: string, hint?: boolean): string | undefined {
  const ids = [error ? `${id}-error` : '', hint ? `${id}-hint` : ''].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

export const inputClass = (invalid: boolean, full = true) =>
  [
    `block ${full ? 'w-full' : ''} min-h-14 rounded-sm border bg-white px-4 text-base text-ink`,
    'placeholder:text-stone/75 transition-[border-color,background-color] duration-300 ease-brand',
    'hover:border-ink/35 focus:border-wood',
    'disabled:cursor-not-allowed disabled:bg-paper/60 disabled:text-stone',
    invalid ? 'border-error hover:border-error' : 'border-sand',
  ].join(' ');

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-2 flex items-start gap-2 text-[0.875rem] leading-snug text-error">
      <CircleAlert aria-hidden="true" strokeWidth={1.75} className="mt-px size-4 flex-none" />
      <span>{message}</span>
    </p>
  );
}

type FieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Etiqueta, control, ayuda y error con los ids enlazados. */
export function Field({ id, label, error, hint, optional, className = '', children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-[0.9375rem] font-semibold text-ink">
        <span>{label}</span>
        {optional ? <span className="text-[0.8125rem] font-normal text-stone">{FORM_COPY.optional}</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[0.875rem] leading-snug text-stone">
          {hint}
        </p>
      ) : null}
      <FieldError id={id} message={error} />
    </div>
  );
}

/** Casilla con el estilo de marca. El input nativo conserva teclado y lectores. */
export function CheckboxMark() {
  return (
    <Check
      aria-hidden="true"
      strokeWidth={2.5}
      className="pointer-events-none absolute inset-0 m-auto size-3.5 text-cream opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
    />
  );
}

export const checkboxClass = (invalid: boolean) =>
  [
    'peer size-[22px] flex-none appearance-none rounded-xs border bg-white transition-colors duration-200',
    'checked:border-wood checked:bg-wood hover:border-wood',
    invalid ? 'border-error' : 'border-ink/40',
  ].join(' ');
