import Image from 'next/image';
import type { ReactNode } from 'react';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { ContactLink } from '@/components/layout/ContactLink';
import { emailHref, site } from '@/content/site';
import { noOrphans } from '@/lib/typography';
import { CtaActions, CtaNote, ctaResponseNote, type CtaAction } from './CtaParts';

export { CtaActions, CtaNote, ctaResponseNote, type CtaAction };

export type CtaImage = { src: string; alt: string };

/*
 * Piezas del CTA final. Todas las páginas cierran con la misma estructura y en
 * el mismo orden (foto a sangre con velo, etiqueta, H2, texto, acciones y nota);
 * cada una cambia la foto, los textos y las acciones. El configurador de
 * /casetas usa estas mismas piezas y añade el selector y la ilustración.
 */

/**
 * Foto a sangre con parallax y velo tinta. El velo es más denso en el centro,
 * donde va el texto, y se funde con tinta abajo para enlazar con el footer.
 * Por debajo de lg la foto se dibuja varias veces más ancha que la pantalla
 * (object-cover en una caja más alta que ancha): más velo para el AA.
 */
export function CtaBackdrop({ image, focus = 'center' }: { image: CtaImage; focus?: string }) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div data-parallax className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
        <Image
          src={image.src}
          {...blurFor(image.src)}
          alt=""
          fill
          sizes="(max-width: 639px) 300vw, (max-width: 1023px) 130vw, 100vw"
          quality={60}
          className="object-cover"
          style={{ objectPosition: focus }}
        />
      </div>
      <div className="absolute inset-0 bg-ink/80 lg:bg-ink/70" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgb(14_22_21/0.55),transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink" />
    </div>
  );
}

/** Etiqueta, H2 y texto. Centrado, o a la izquierda desde lg con `split`. */
export function CtaIntro({
  label,
  title,
  text,
  id,
  split = false,
  textNode,
}: {
  label: string;
  title: string;
  text: string;
  id?: string;
  /** Composición a dos columnas desde lg (configurador): el bloque se alinea a la izquierda. */
  split?: boolean;
  /** Texto ya maquetado (p. ej. con el email enlazado); si no, `text` con noOrphans. */
  textNode?: ReactNode;
}) {
  return (
    <>
      {/* Línea a cada lado de la etiqueta: marca el eje del bloque centrado */}
      <Label
        className={`${split ? 'lg:after:hidden' : ''} after:mt-[calc(0.5lh-0.5px)] after:block after:h-px after:w-6 after:flex-none after:bg-current after:content-['']`}
      >
        {label}
      </Label>
      <Heading id={id} size="h1" className={`mt-6 max-w-[18ch] ${split ? 'mx-auto lg:mx-0' : 'mx-auto'}`}>
        {title}
      </Heading>
      {/* data-cta-lead: con el aviso de cookies pendiente en móvil horizontal, el bloque se queda a su izquierda (consent.css) */}
      <p
        data-reveal
        data-cta-lead
        className={`text-lead mt-6 max-w-[42ch] text-cream/85 ${split ? 'mx-auto lg:mx-0' : 'mx-auto'}`}
      >
        {textNode ?? noOrphans(text)}
      </p>
    </>
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

type CtaFinalProps = {
  /** Foto de fondo de esta página (el alt va vacío: es decorativa). */
  image: CtaImage;
  /** Punto de la foto que se mantiene a la vista (object-position). */
  focus?: string;
  label: string;
  title: string;
  text: string;
  actions?: CtaAction[];
  note?: string;
  /** Ubicación para la medición de clics (cta-temporada, cta-dudas...). */
  place?: string;
};

/**
 * CTA final común: la última sección de cada página antes del footer. Bloque
 * centrado sobre la foto: etiqueta, H2 grande, texto corto, acciones y nota.
 */
export function CtaFinal({
  image,
  focus,
  label,
  title,
  text,
  actions = ['presupuesto', 'llamar', 'whatsapp'],
  note = ctaResponseNote,
  place = 'cta-final',
}: CtaFinalProps) {
  const lead = noOrphans(text);
  return (
    <Section surface="photo" spacing={false} className="overflow-hidden">
      <CtaBackdrop image={image} focus={focus} />
      <div className="container-site relative py-[clamp(112px,14vw,220px)]">
        <div data-cta-block className="mx-auto max-w-[60rem] text-center">
          <CtaIntro
            label={label}
            title={title}
            text={text}
            textNode={actions.includes('email') ? lead : withEmailLink(lead, place)}
          />
          <CtaActions actions={actions} place={place} />
          <CtaNote>{note}</CtaNote>
        </div>
      </div>
    </Section>
  );
}
