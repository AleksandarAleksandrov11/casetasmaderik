import { ArrowRight, Clock, Mail, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink, buttonClasses } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { ContactLink } from '@/components/layout/ContactLink';
import { emailHref, phoneHref, site, whatsappHref } from '@/content/site';

/*
 * Acciones y nota del CTA final, en un módulo aparte sin next/image: también
 * las usa el configurador de /casetas, que es un componente de cliente.
 */

export type CtaAction = 'presupuesto' | 'email' | 'llamar' | 'whatsapp';

/** Nota por defecto bajo las acciones. */
export const ctaResponseNote = `Te respondemos en ${site.responseTime}.`;

function Arrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={1.5}
      className="size-[18px] transition-transform duration-500 ease-brand group-hover/btn:translate-x-1"
    />
  );
}

/**
 * Acciones: la primera es el botón crema con flecha; el resto, botones de
 * contorno con su icono, todos de la misma altura. En móvil, una rejilla de dos
 * columnas: la principal a todo el ancho y las demás de dos en dos (la última
 * sola, si sobra, también a todo el ancho).
 */
export function CtaActions({
  actions,
  place,
  presupuestoHref = '/contacto',
  split = false,
}: {
  actions: CtaAction[];
  place: string;
  presupuestoHref?: string;
  split?: boolean;
}) {
  const icon = 'size-[18px]';

  const buttons = actions.map((a, i) => {
    const lead = i === 0;
    // Ancho completo en la rejilla de móvil: la principal y la última secundaria si queda sola
    const wide = lead || (i === actions.length - 1 && (actions.length - 1) % 2 === 1) ? 'col-span-2' : '';
    const primary = buttonClasses({ variant: 'light', size: 'lg', className: wide });
    // Contorno sobre la foto: un fondo tinta translúcido para que el borde y el texto no dependan de la foto
    const secondary = buttonClasses({
      variant: 'outline-light',
      size: 'lg',
      className: `bg-ink/35 max-[22rem]:gap-2 max-[22rem]:px-3 ${wide}`,
    });
    if (a === 'presupuesto') {
      return (
        <ButtonLink
          key={a}
          href={presupuestoHref}
          variant={lead ? 'light' : 'outline-light'}
          size="lg"
          className={lead ? wide : `bg-ink/35 ${wide}`}
        >
          Pedir presupuesto
        </ButtonLink>
      );
    }
    if (a === 'llamar') {
      return (
        <ContactLink
          key={a}
          href={phoneHref}
          event="click_phone"
          place={place}
          magnetic
          ariaLabel={`Llamar al ${site.phone.display}`}
          className={lead ? primary : secondary}
        >
          {lead ? null : <Phone aria-hidden="true" strokeWidth={1.5} className={icon} />}
          <span>Llamar</span>
          {lead ? <Arrow /> : null}
        </ContactLink>
      );
    }
    if (a === 'email') {
      return (
        <ContactLink
          key={a}
          href={emailHref}
          event="click_email"
          place={place}
          magnetic
          className={lead ? primary : secondary}
        >
          {lead ? null : <Mail aria-hidden="true" strokeWidth={1.5} className={icon} />}
          <span>Escribir un email</span>
          {lead ? <Arrow /> : null}
        </ContactLink>
      );
    }
    return (
      <ContactLink
        key={a}
        href={whatsappHref()}
        event="click_whatsapp"
        place={place}
        external
        magnetic
        className={lead ? primary : secondary}
      >
        {lead ? null : <WhatsAppIcon className={icon} />}
        <span>{lead ? 'Escribir por WhatsApp' : 'WhatsApp'}</span>
        {lead ? <Arrow /> : null}
      </ContactLink>
    );
  });

  return (
    // data-wa-avoid: el botón flotante de WhatsApp no tapa estas acciones.
    // data-cta-actions: con el aviso de cookies pendiente en móvil horizontal, a su izquierda (consent.css)
    <div
      data-reveal
      data-wa-avoid
      data-cta-actions
      style={{ ['--reveal-delay' as string]: '0.1s' }}
      className={`mx-auto mt-10 grid max-w-[24rem] grid-cols-2 gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 ${split ? 'lg:justify-start' : ''}`}
    >
      {buttons}
    </div>
  );
}

/** Nota final (tiempo de respuesta), con un reloj pequeño en línea con el texto. */
export function CtaNote({ children }: { children: ReactNode }) {
  return (
    <p data-cta-note className="mt-8 text-[0.9375rem] text-mist">
      <Clock
        aria-hidden="true"
        strokeWidth={1.5}
        className="mr-2 inline-block size-4 -translate-y-px align-middle text-wood-light"
      />
      {children}
    </p>
  );
}
