import {
  Briefcase,
  Check,
  Flower2,
  MapPin,
  PencilLine,
  Store,
  TreePine,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { emailHref, phoneHref, site, whatsappHref } from '@/content/site';
import { STEP_COUNT, type TipoEvento } from '@/lib/quote-data';
import { noOrphans } from '@/lib/typography';
import { FORM_COPY, STEPS } from './copy';

/*
 * Piezas sin estado del formulario, compartidas por el formulario interactivo
 * (QuoteForm) y por su versión estática del servidor (QuoteFormStatic), que
 * se ve mientras se descarga el JavaScript. Así las dos miden lo mismo.
 */

export const ROOT_CLASS = 'relative scroll-mt-[calc(var(--header-h-compact)+16px)] [html:not(.js)_&]:hidden';
/*
 * Tarjeta crema con borde fino sobre el fondo papel del hero, en tres franjas:
 * cabecera con los pasos, cuerpo con la pregunta y pie con las acciones.
 */
export const PANEL_CLASS =
  'rounded-sm border border-sand bg-cream shadow-[0_1px_2px_rgb(14_22_21/0.04),0_32px_64px_-40px_rgb(14_22_21/0.22)]';
const PAD_X = 'px-5 sm:px-8 lg:px-10';
export const BODY_CLASS = `${PAD_X} pt-7 pb-9 sm:pt-9 sm:pb-11`;
// flex-wrap (no reverse): si el botón principal baja de fila, el orden visual sigue al del teclado
export const ACTIONS_CLASS = `flex flex-wrap items-center gap-3 rounded-b-sm border-t border-sand bg-paper/70 py-4 sm:py-5 ${PAD_X}`;
/*
 * Las tarjetas se reparten según el ancho real de la rejilla (container
 * queries), no según la pantalla: el formulario vive en columnas muy distintas
 * (móvil, tablet, columna del hero en escritorio). Sobre 6 columnas cada
 * tarjeta ocupa 3 (dos por fila) y 2 desde 32rem (tres por fila). Por debajo
 * de 18,5rem (móviles de 320 a 360 px) pasan a filas de una línea. Así
 * "gastronómico" cabe siempre entero, sin cortes.
 */
export const EVENT_GRID_CLASS = '@container clear-both grid grid-cols-6 gap-2.5 sm:gap-3';
// ml-auto lo deja a la derecha aunque no haya botón Atrás; en móvil ocupa el resto de la fila
export const NEXT_BUTTON_CLASS = 'ml-auto min-w-[10.5rem] max-sm:min-w-fit max-sm:flex-1 max-sm:px-4';

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
    'group relative col-span-3 flex min-h-[124px] cursor-pointer flex-col justify-between gap-6 rounded-sm border p-4 sm:min-h-[136px] sm:p-5',
    '@lg:col-span-2',
    // Filas a todo el ancho en las rejillas más estrechas: icono, nombre y marca en una línea
    `@max-[18.5rem]:col-span-6 @max-[18.5rem]:min-h-14 @max-[18.5rem]:flex-row @max-[18.5rem]:items-center @max-[18.5rem]:justify-start @max-[18.5rem]:gap-3 @max-[18.5rem]:px-4 @max-[18.5rem]:py-3`,
    'transition-[border-color,background-color,box-shadow] duration-300 ease-brand',
    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-wood has-[:focus-visible]:outline-solid',
    checked
      ? 'border-wood bg-wood/[0.06] shadow-[inset_0_0_0_1px_var(--color-wood)]'
      : 'border-ink/15 bg-cream hover:border-ink/40 hover:bg-paper/50',
  ].join(' ');
}

/** Icono, nombre y marca de selección de una tarjeta de tipo de evento. */
export function EventCardContent({ value, checked }: { value: TipoEvento; checked: boolean }) {
  const Icon = EVENT_ICONS[value];
  /*
   * En las tarjetas el nombre se compone siempre en dos líneas, cortado tras la
   * primera palabra ("Feria / o bazar", nunca una "o" a final de línea): todas
   * las tarjetas leen igual. En filas, una línea.
   */
  const cut = value.indexOf(' ');
  const first = cut === -1 ? value : value.slice(0, cut);
  const rest = cut === -1 ? '' : value.slice(cut + 1);
  return (
    <>
      <span
        aria-hidden="true"
        className={`flex size-10 flex-none items-center justify-center rounded-full transition-colors duration-300 ease-brand @max-[18.5rem]:size-8 ${
          checked ? 'bg-wood text-cream' : 'bg-paper text-wood-dark group-hover:bg-sand/70'
        }`}
      >
        <Icon strokeWidth={1.5} className={`size-5 @max-[18.5rem]:size-[18px]`} />
      </span>
      <span
        className={`min-w-0 pr-1 font-display text-[1.0625rem] leading-[1.2] text-ink sm:text-[1.125rem] @max-[18.5rem]:text-base`}
      >
        {first}
        {rest ? (
          <>
            {' '}
            <span className={`block @max-[18.5rem]:inline`}>{rest}</span>
          </>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={[
          'absolute top-4 right-4 flex size-[22px] flex-none items-center justify-center rounded-full border transition-[background-color,border-color] duration-300 ease-brand sm:top-5 sm:right-5',
          `@max-[18.5rem]:static @max-[18.5rem]:ml-auto`,
          checked ? 'border-wood bg-wood' : 'border-ink/25 bg-cream group-hover:border-ink/45',
        ].join(' ')}
      >
        <Check
          strokeWidth={2.5}
          className={`size-3 text-cream transition-opacity duration-200 ${checked ? '' : 'opacity-0'}`}
        />
      </span>
    </>
  );
}

/**
 * Cabecera de la tarjeta: "Paso 1 de 4" y los cuatro pasos como segmentos. En
 * móvil, el nombre del paso actual a la derecha; desde sm, cada segmento con
 * su número y su nombre.
 */
export function FormProgress({ step }: { step: number }) {
  return (
    <div className={`border-b border-sand py-5 sm:py-6 ${PAD_X}`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="tabular text-[0.8125rem] font-semibold tracking-[0.14em] text-wood-dark uppercase">
          {FORM_COPY.stepOf(step + 1, STEP_COUNT)}
        </p>
        <p className="text-[0.875rem] text-stone sm:hidden">{STEPS[step].short}</p>
      </div>
      <ol aria-hidden="true" className="mt-4 grid grid-cols-4 gap-1.5 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s.short} className="min-w-0">
              <span className="relative block h-[3px] overflow-hidden rounded-full bg-sand">
                <span
                  className="q-progress absolute inset-0 origin-left rounded-full bg-wood"
                  style={{ transform: `scaleX(${i <= step ? 1 : 0})` }}
                />
              </span>
              <span
                className={[
                  'mt-3 hidden items-center gap-1.5 text-[0.8125rem] leading-tight sm:flex',
                  current ? 'font-semibold text-ink' : done ? 'text-wood-dark' : 'text-stone',
                ].join(' ')}
              >
                <span
                  className={[
                    'tabular flex size-5 flex-none items-center justify-center rounded-full border text-[0.6875rem] font-semibold',
                    done || current ? 'border-wood bg-wood text-cream' : 'border-ink/20 text-stone',
                  ].join(' ')}
                >
                  {done ? <Check strokeWidth={3} className="size-3" /> : i + 1}
                </span>
                <span className="truncate">{s.short}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Aviso de llegada con ?provincia=: la provincia ya elegida, sobre la cabecera
 * de la tarjeta. Entra con un fundido y la chincheta cae (solo con movimiento).
 */
export function ProvinceNotice({ provincia }: { provincia: string }) {
  return (
    <div
      className={`q-notice relative flex items-center gap-4 border-b border-sand bg-paper/70 py-4 ${PAD_X} rounded-t-sm`}
    >
      <span aria-hidden="true" className="relative flex size-11 flex-none items-center justify-center">
        <span className="q-notice-ring absolute inset-0 rounded-full bg-wood/15" />
        <span className="q-notice-pin relative flex size-11 items-center justify-center rounded-full bg-wood text-cream">
          <MapPin strokeWidth={1.75} className="size-5" />
        </span>
      </span>
      <p className="min-w-0 leading-tight">
        <span className="block text-[0.8125rem] font-semibold tracking-[0.14em] text-wood-dark uppercase">
          {FORM_COPY.provinceNoticeLabel}
        </span>
        <span className="mt-1 block font-display text-[1.25rem] text-ink sm:text-[1.375rem]">
          {noOrphans(FORM_COPY.provinceNotice(provincia))}
        </span>
      </p>
    </div>
  );
}

/** Sin JavaScript el formulario no se muestra: email, teléfono y WhatsApp. */
export function NoScriptContact() {
  return (
    <noscript>
      <div className="rounded-sm border border-sand bg-cream px-5 py-7 sm:px-9 sm:py-10">
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
