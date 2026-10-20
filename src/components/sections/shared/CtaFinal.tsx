import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Phone } from 'lucide-react';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { ContactLink } from '@/components/layout/ContactLink';
import { phoneHref, site, whatsappHref } from '@/content/site';

type Action = 'presupuesto' | 'llamar' | 'whatsapp';

type CtaFinalProps = {
  variant: 'temporada' | 'general' | 'dudas';
  label?: string;
  title: string;
  text: string;
  actions?: Action[];
  image?: { src: string; alt: string };
  note?: string;
};

/**
 * CTA final reutilizable. La última sección de cada página es siempre un CTA.
 * - temporada: foto nocturna a todo el ancho con overlay tinta.
 * - general: fondo tinta.
 * - dudas: fondo papel.
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

  const buttons = actions.map((a) => {
    if (a === 'presupuesto') {
      return (
        <ButtonLink key={a} href="/contacto" variant={dark ? 'light' : 'primary'} size="lg">
          Pedir presupuesto
        </ButtonLink>
      );
    }
    if (a === 'llamar') {
      return (
        <ButtonAnchor
          key={a}
          href={phoneHref}
          variant={dark ? 'outline-light' : 'outline'}
          size="lg"
          icon={<Phone strokeWidth={1.5} className="size-[18px]" />}
          aria-label={`Llamar al ${site.phone.display}`}
        >
          Llamar
        </ButtonAnchor>
      );
    }
    return (
      <ContactLink
        key={a}
        href={whatsappHref()}
        event="click_whatsapp"
        place={`cta-${variant}`}
        external
        className={`link-underline gap-2 ${dark ? '!text-cream' : ''}`}
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
              sizes="100vw"
              quality={70}
              className="object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-ink/72" />
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
          <p data-reveal className={`mt-6 max-w-[44ch] text-lead ${dark ? 'text-cream/85' : 'text-stone'}`}>
            {text}
          </p>
          <div data-reveal style={{ ['--reveal-delay' as string]: '0.1s' }} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            {buttons}
          </div>
          {note ? <p className={`mt-8 text-[0.9375rem] ${dark ? 'text-mist' : 'text-stone'}`}>{note}</p> : null}
        </div>
      </div>
    </Section>
  );
}
