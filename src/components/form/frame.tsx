import { Briefcase, Check, Flower2, PencilLine, Store, TreePine, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { emailHref, phoneHref, site, whatsappHref } from '@/content/site';
import { STEP_COUNT, type TipoEvento } from '@/lib/quote-data';
import { FORM_COPY, STEPS } from './copy';

/*
 * Piezas sin estado del formulario, compartidas por el formulario interactivo
 * (QuoteForm) y por su versión estática del servidor (QuoteFormStatic), que
 * se ve mientras se descarga el JavaScript. Así las dos miden lo mismo.
 */

export const ROOT_CLASS = 'relative scroll-mt-[calc(var(--header-h-compact)+16px)] [html:not(.js)_&]:hidden';
export const PANEL_CLASS = 'rounded-sm border border-sand bg-paper/55 px-5 py-7 sm:px-9 sm:py-10 lg:px-11 lg:py-11';
export const ACTIONS_CLASS = 'mt-10 flex items-center justify-between gap-3 border-t border-sand pt-6';
export const EVENT_GRID_CLASS = 'clear-both grid grid-cols-2 gap-3 sm:grid-cols-3';
export const NEXT_BUTTON_CLASS = 'min-w-[10.5rem] max-sm:flex-1';

const EVENT_ICONS: Record<TipoEvento, LucideIcon> = {
  'Mercado navideño': TreePine,
  'Feria o bazar': Store,
  'Festival gastronómico': UtensilsCrossed,
  'Evento corporativo': Briefcase,
  'Evento privado': Flower2,
  Otro: PencilLine,
};

export function eventCardClass(checked: boolean): string {
  return [
    'group relative flex min-h-[116px] cursor-pointer flex-col justify-between gap-5 rounded-sm border bg-white p-4 sm:min-h-[128px] sm:p-5',
    'transition-[border-color,background-color] duration-300 ease-brand',
    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-wood has-[:focus-visible]:outline-solid',
    checked ? 'border-wood bg-wood/[0.06]' : 'border-sand hover:border-ink/35',
  ].join(' ');
}

/** Icono, nombre y marca de selección de una tarjeta de tipo de evento. */
export function EventCardContent({ value, checked }: { value: TipoEvento; checked: boolean }) {
  const Icon = EVENT_ICONS[value];
  return (
    <>
      <Icon
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-7 text-wood transition-transform duration-500 ease-brand group-hover:-translate-y-0.5"
      />
      <span className="pr-1 font-display text-[1.0625rem] leading-[1.2] text-ink sm:text-[1.125rem]">{value}</span>
      <span
        aria-hidden="true"
        className={[
          'absolute top-4 right-4 flex size-[22px] items-center justify-center rounded-full border transition-[background-color,border-color,opacity] duration-300 ease-brand sm:top-5 sm:right-5',
          checked ? 'border-wood bg-wood opacity-100' : 'border-sand bg-white opacity-0 group-hover:opacity-100',
        ].join(' ')}
      >
        <Check strokeWidth={2.5} className={`size-3 text-cream ${checked ? '' : 'opacity-0'}`} />
      </span>
    </>
  );
}

/** "Paso 1 de 4" y barra de progreso. */
export function FormProgress({ step }: { step: number }) {
  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex items-baseline justify-between gap-4 text-[0.875rem]">
        <p className="tabular font-semibold text-ink">{FORM_COPY.stepOf(step + 1, STEP_COUNT)}</p>
        <p className="text-stone">{STEPS[step].short}</p>
      </div>
      <div className="relative mt-3 h-0.5 overflow-hidden bg-sand" aria-hidden="true">
        <div
          className="q-progress absolute inset-0 origin-left bg-wood"
          style={{ transform: `scaleX(${(step + 1) / STEP_COUNT})` }}
        />
      </div>
    </div>
  );
}

/** Sin JavaScript el formulario no se muestra: email, teléfono y WhatsApp. */
export function NoScriptContact() {
  return (
    <noscript>
      <div className="rounded-sm border border-sand bg-paper/55 px-5 py-7 sm:px-9 sm:py-10">
        <p className="font-display text-[1.5rem] leading-tight text-ink">{FORM_COPY.noscriptTitle}</p>
        <p className="mt-3 text-stone">{FORM_COPY.noscriptText}</p>
        <ul className="mt-6 space-y-1 text-[1.0625rem]">
          <li>
            <a href={emailHref} className="link-underline">
              {site.email}
            </a>
          </li>
          <li>
            <a href={phoneHref} className="link-underline">
              {site.phone.display}
            </a>
          </li>
          <li>
            <a href={whatsappHref()} className="link-underline" rel="noopener noreferrer">
              WhatsApp
            </a>
          </li>
        </ul>
      </div>
    </noscript>
  );
}
