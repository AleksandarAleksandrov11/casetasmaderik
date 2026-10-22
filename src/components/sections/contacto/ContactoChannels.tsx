import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { ContactLink } from '@/components/layout/ContactLink';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { contactoChannels } from '@/content/contacto';
import { emailHref, phoneHref, site, whatsappHref } from '@/content/site';

/** El email solo puede partirse tras la arroba ("info@" / "casetasmaderik.es"), nunca a mitad de palabra. */
function EmailValue() {
  const [user, domain] = site.email.split('@');
  return (
    <>
      {user}@<wbr />
      {domain}
    </>
  );
}

/**
 * S2. Otras formas de contacto. Fondo crema. En escritorio, título y entradilla
 * a la izquierda (5 columnas) y a la derecha una lista de tres filas:
 * icono, canal, dato grande y la acción. En móvil, la misma lista bajo el título.
 */
export function ContactoChannels() {
  const c = contactoChannels;
  const data = {
    phone: {
      href: phoneHref,
      value: site.phone.display,
      icon: <Phone aria-hidden="true" strokeWidth={1.5} className="size-5" />,
      event: 'click_phone' as const,
      external: false,
    },
    whatsapp: {
      href: whatsappHref(),
      value: site.phone.display,
      icon: <WhatsAppIcon className="size-5" />,
      event: 'click_whatsapp' as const,
      external: true,
    },
    email: {
      href: emailHref,
      value: <EmailValue />,
      icon: <Mail aria-hidden="true" strokeWidth={1.5} className="size-5" />,
      event: 'click_email' as const,
      external: false,
    },
  };
  return (
    <Section surface="cream" aria-labelledby="canales-titulo">
      <div className="container-site grid-site gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <Label>{c.label}</Label>
          <Heading id="canales-titulo" className="mt-6 max-w-[14ch]">
            {c.title}
          </Heading>
          <p className="text-lead mt-6 max-w-[36ch] text-stone">{c.text}</p>
        </div>
        <ul className="col-span-4 border-t border-sand md:col-span-6 lg:col-span-7 lg:mt-1">
          {c.channels.map((ch, i) => {
            const d = data[ch.id as keyof typeof data];
            return (
              <li
                key={ch.id}
                className="border-b border-sand"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}
              >
                <ContactLink
                  href={d.href}
                  event={d.event}
                  place="contacto-canales"
                  external={d.external}
                  className="group/ch grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 py-6 transition-colors duration-500 focus-visible:outline-offset-4 sm:gap-x-6 sm:py-8"
                >
                  <span className="flex size-12 items-center justify-center rounded-full border border-sand bg-paper text-wood-dark transition-colors duration-500 ease-brand group-hover/ch:border-wood group-hover/ch:bg-wood group-hover/ch:text-cream sm:size-14">
                    {d.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.8125rem] font-semibold tracking-[0.14em] text-wood-dark uppercase">
                      {ch.title}
                    </span>
                    <span className="mt-1.5 block font-display text-[1.25rem] leading-tight break-words text-ink xs:text-[1.375rem] sm:text-[1.75rem] lg:text-[clamp(1.5rem,1.1rem+0.8vw,2rem)]">
                      {d.value}
                    </span>
                    <span className="mt-1.5 block text-[0.9375rem] text-stone">{ch.note}</span>
                  </span>
                  <span className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink">
                    <span className="hidden md:inline">{ch.action}</span>
                    <span className="flex size-10 items-center justify-center rounded-full border border-ink/20 transition-[border-color,background-color,color] duration-500 ease-brand group-hover/ch:border-ink group-hover/ch:bg-ink group-hover/ch:text-cream">
                      <ArrowUpRight
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className="size-[18px] transition-transform duration-500 ease-brand group-hover/ch:translate-x-0.5 group-hover/ch:-translate-y-0.5"
                      />
                    </span>
                  </span>
                </ContactLink>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
