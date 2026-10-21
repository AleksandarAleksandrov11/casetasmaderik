import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { ButtonLink, buttonClasses } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { ContactLink } from '@/components/layout/ContactLink';
import { emailHref, phoneHref, site, whatsappHref } from '@/content/site';

type Action = 'presupuesto' | 'email' | 'llamar' | 'whatsapp';

type CtaFinalProps = {
  variant: 'temporada' | 'general' | 'dudas';
  label?: string;
  title: string;
  text: string;
  actions?: Action[];
  image?: { src: string; alt: string };
  note?: string;
};

function Arrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={1.5}
      className="size-[18px] transition-transform duration-500 ease-brand group-hover/btn:translate-x-1"
    />
  );
}

/** El email que cita el texto es un enlace (cuando no hay ya una acción de email). */
function withEmailLink(text: string, place: string) {
  const at = text.indexOf(site.email);
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at)}
      <ContactLink
        href={emailHref}
        event="click_email"
        place={place}
        className="link-inline [hyphens:none] whitespace-nowrap"
      >
        {site.email}
      </ContactLink>
      {text.slice(at + site.email.length)}
    </>
  );
}

/**
 * CTA final reutilizable. La última sección de cada página es siempre un CTA.
 * - temporada: foto nocturna a todo el ancho con overlay tinta.
 * - general: fondo tinta.
 * - dudas: fondo papel.
 * La primera acción es siempre el botón primario con flecha (madera sobre
 * claro, crema sobre oscuro), también cuando solo hay llamada o WhatsApp.
 */
export function CtaFinal({
  variant,
  label,
  title,
  text,
  actions = ['presupuesto', 'llamar', 'whatsapp'],
  image,
  note,
}: CtaFinalProps) {
  const dark = variant !== 'dudas';
  const surface = variant === 'temporada' ? 'photo' : variant === 'general' ? 'dark' : 'paper';
  const place = `cta-${variant}`;
  const primary = buttonClasses({ variant: dark ? 'light' : 'primary', size: 'lg' });
  const secondaryLink = `link-underline gap-2 ${dark ? '!text-cream' : ''}`;

  const buttons = actions.map((a, i) => {
    const lead = i === 0;
    if (a === 'presupuesto') {
      return (
        <ButtonLink key={a} href="/contacto" variant={dark ? 'light' : 'primary'} size="lg">
          Pedir presupuesto
        </ButtonLink>
      );
    }
    if (a === 'llamar') {
      return lead ? (
        <ContactLink
          key={a}
          href={phoneHref}
          event="click_phone"
          place={place}
          magnetic
          ariaLabel={`Llamar al ${site.phone.display}`}
          className={primary}
        >
          <span>Llamar</span>
          <Arrow />
        </ContactLink>
      ) : (
        <ContactLink
          key={a}
          href={phoneHref}
          event="click_phone"
          place={place}
          magnetic
          ariaLabel={`Llamar al ${site.phone.display}`}
          className={buttonClasses({ variant: dark ? 'outline-light' : 'outline', size: 'lg' })}
        >
          <span className="-ml-1 flex size-5 items-center justify-center" aria-hidden="true">
            <Phone strokeWidth={1.5} className="size-[18px]" />
          </span>
          <span>Llamar</span>
        </ContactLink>
      );
    }
    if (a === 'email') {
      return lead ? (
        <ContactLink key={a} href={emailHref} event="click_email" place={place} magnetic className={primary}>
          <span>Escribir un email</span>
          <Arrow />
        </ContactLink>
      ) : (
        <ContactLink key={a} href={emailHref} event="click_email" place={place} className={secondaryLink}>
          <Mail aria-hidden="true" strokeWidth={1.5} className="size-5" />
          Escribir un email
        </ContactLink>
      );
    }
    return lead ? (
      <ContactLink
        key={a}
        href={whatsappHref()}
        event="click_whatsapp"
        place={place}
        external
        magnetic
        className={primary}
      >
        <span>Escribir por WhatsApp</span>
        <Arrow />
      </ContactLink>
    ) : (
      <ContactLink
        key={a}
        href={whatsappHref()}
        event="click_whatsapp"
        place={place}
        external
        className={secondaryLink}
      >
        <WhatsAppIcon className="size-5" />
        Escribir por WhatsApp
      </ContactLink>
    );
  });

  return (
    <Section surface={surface} spacing={false} className="overflow-hidden">
      {variant === 'temporada' && image ? (
        <div className="absolute inset-0" aria-hidden="true">
          <div data-parallax className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
            <Image
              src={image.src}
              {...blurFor(image.src)}
              alt=""
              fill
              // object-cover en una caja más alta que ancha (y un 24 % más alta por el
              // parallax): en móvil la foto se dibuja a unas tres veces el ancho
              sizes="(max-width: 639px) 300vw, (max-width: 1023px) 130vw, 100vw"
              quality={70}
              className="object-cover object-center"
            />
          </div>
          {/* En móvil la foto se dibuja a unas tres veces el ancho y las luces de la guirnalda
              crecen detrás de la etiqueta: algo más de velo para mantener el AA */}
          <div className="absolute inset-0 bg-ink/82 sm:bg-ink/72" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/30" />
        </div>
      ) : null}
      <div
        className={`container-site relative ${
          variant === 'temporada' ? 'py-[clamp(120px,16vw,240px)]' : 'py-[clamp(96px,13vw,200px)]'
        }`}
      >
        <div className="max-w-[56rem]">
          {label ? <Label>{label}</Label> : null}
          <Heading className={label ? 'mt-6' : ''}>{title}</Heading>
          {/* data-cta-lead y data-cta-actions: en móvil horizontal, con el aviso de cookies pendiente,
              se quedan a la izquierda de su tarjeta (consent.css) */}
          <p
            data-reveal
            data-cta-lead
            className={`text-lead mt-6 max-w-[44ch] ${dark ? 'text-cream/85' : 'text-stone'}`}
          >
            {actions.includes('email') ? text : withEmailLink(text, place)}
          </p>
          {/* data-wa-avoid: el botón flotante de WhatsApp no tapa estas acciones */}
          <div
            data-reveal
            data-wa-avoid
            data-cta-actions
            style={{ ['--reveal-delay' as string]: '0.1s' }}
            className="mt-10 flex w-fit max-w-full flex-wrap items-center gap-x-6 gap-y-4"
          >
            {buttons}
          </div>
          {note ? <p className={`mt-8 text-[0.9375rem] ${dark ? 'text-mist' : 'text-stone'}`}>{note}</p> : null}
        </div>
      </div>
    </Section>
  );
}
