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
/*
 * Panel papel con campos crema: los dos tonos de la paleta, sin blancos puros
 * ni mezclas. surface-paper oscurece los enlaces (madera oscura) para el AA.
 */
export const PANEL_CLASS =
  'surface-paper rounded-sm border border-sand bg-paper px-5 py-7 sm:px-9 sm:py-10 lg:px-11 lg:py-11';
export const ACTIONS_CLASS = 'mt-10 flex items-center gap-3 border-t border-sand pt-6';
/*
 * Las tarjetas se reparten según el ancho real de la rejilla (container
 * queries), no según la pantalla: el formulario vive en columnas muy distintas
 * (móvil, tablet, media columna en escritorio). Sobre 6 columnas cada tarjeta
 * ocupa 3 (dos por fila) y 2 desde 32rem (tres por fila). Por debajo de 17,5rem
 * (móviles de 320 px) pasan a filas compactas de una línea, con la marca de
 * selección en el sitio del icono. Así "gastronómico" cabe siempre entero.
 */
export const EVENT_GRID_CLASS = '@container clear-both grid grid-cols-6 gap-3';
// ml-auto lo deja a la derecha aunque no haya botón Atrás; en móvil ocupa toda la fila
export const NEXT_BUTTON_CLASS = 'ml-auto min-w-[10.5rem] max-sm:flex-1';

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
    'group relative col-span-3 flex min-h-[116px] cursor-pointer flex-col justify-between gap-5 rounded-sm border p-4 sm:min-h-[128px] sm:p-5',
    '@lg:col-span-2',
    // Dos por fila en móviles de 360 a 380 px: algo menos de relleno (la letra baja en EventCardContent)
    '@min-[17.5rem]:@max-[18.5rem]:p-3.5',
    /*
     * Filas a todo el ancho por debajo de 17,5rem: icono y nombre en una línea,
     * todas de 56 px. Sin hueco a la derecha para la marca (va sobre el icono),
     * así el paso mide casi lo mismo que con dos tarjetas por fila.
     */
    '@max-[17.5rem]:col-span-6 @max-[17.5rem]:min-h-14 @max-[17.5rem]:flex-row @max-[17.5rem]:items-center @max-[17.5rem]:justify-start @max-[17.5rem]:gap-3 @max-[17.5rem]:px-3.5 @max-[17.5rem]:py-3',
    'transition-[border-color,background-color] duration-300 ease-brand',
    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-wood has-[:focus-visible]:outline-solid',
    checked ? 'border-wood bg-wood/[0.06]' : 'border-sand bg-cream hover:border-ink/35',
  ].join(' ');
}

/** Icono, nombre y marca de selección de una tarjeta de tipo de evento. */
export function EventCardContent({ value, checked }: { value: TipoEvento; checked: boolean }) {
  const Icon = EVENT_ICONS[value];
  /*
   * En las tarjetas el nombre se compone siempre en dos líneas, cortado tras la
   * primera palabra ("Feria / o bazar", nunca una "o" a final de línea): todas
   * las tarjetas leen igual, quepa o no el nombre entero. En filas, una línea.
   */
  const cut = value.indexOf(' ');
  const first = cut === -1 ? value : value.slice(0, cut);
  const rest = cut === -1 ? '' : value.slice(cut + 1);
  return (
    <>
      <Icon
        aria-hidden="true"
        strokeWidth={1.5}
        className={`size-7 flex-none text-wood transition-[translate,opacity] duration-500 ease-brand group-hover:-translate-y-0.5 ${checked ? '@max-[17.5rem]:opacity-0' : ''}`}
      />
      <span className="min-w-0 pr-1 font-display text-[1.0625rem] leading-[1.2] break-words hyphens-auto text-ink sm:text-[1.125rem] @max-[17.5rem]:text-base @min-[17.5rem]:@max-[18.5rem]:text-base">
        {first}
        {rest ? (
          <>
            {' '}
            <span className="block @max-[17.5rem]:inline">{rest}</span>
          </>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={[
          'absolute top-4 right-4 flex size-[22px] items-center justify-center rounded-full border transition-[background-color,border-color,opacity] duration-300 ease-brand sm:top-5 sm:right-5',
          // En filas, la marca ocupa el sitio del icono (centrada sobre sus 28 px) y solo aparece al elegir
          '@max-[17.5rem]:top-[calc(50%-11px)] @max-[17.5rem]:right-auto @max-[17.5rem]:left-[calc(0.875rem+3px)]',
          checked
            ? 'border-wood bg-wood opacity-100'
            : 'border-sand bg-cream opacity-0 @min-[17.5rem]:group-hover:opacity-100',
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
      <div className="surface-paper rounded-sm border border-sand bg-paper px-5 py-7 sm:px-9 sm:py-10">
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
