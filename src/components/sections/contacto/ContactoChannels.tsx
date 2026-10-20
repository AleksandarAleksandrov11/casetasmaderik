import { Mail, Phone } from 'lucide-react';
import { ContactLink } from '@/components/layout/ContactLink';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { contactoChannels } from '@/content/contacto';
import { emailHref, phoneHref, site, whatsappHref } from '@/content/site';

/** S2. Otras formas de contacto en tres columnas. */
export function ContactoChannels() {
  const c = contactoChannels;
  const data = {
    phone: {
      href: phoneHref,
      value: site.phone.display,
      icon: <Phone aria-hidden="true" strokeWidth={1.5} className="size-7" />,
      event: 'click_phone' as const,
      external: false,
    },
    whatsapp: {
      href: whatsappHref(),
      value: 'Abrir chat',
      icon: <WhatsAppIcon className="size-7" />,
      event: 'click_whatsapp' as const,
      external: true,
    },
    email: {
      href: emailHref,
      value: site.email,
      icon: <Mail aria-hidden="true" strokeWidth={1.5} className="size-7" />,
      event: 'click_email' as const,
      external: false,
    },
  };
  return (
    <Section surface="paper" aria-labelledby="canales-titulo">
      <div className="container-site">
        <Label>{c.label}</Label>
        <Heading id="canales-titulo" className="mt-6">
          {c.title}
        </Heading>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-sm border border-sand bg-sand md:grid-cols-3">
          {c.channels.map((ch, i) => {
            const d = data[ch.id as keyof typeof data];
            return (
              <li key={ch.id} className="bg-paper" data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}>
                <ContactLink
                  href={d.href}
                  event={d.event}
                  place="contacto-canales"
                  external={d.external}
                  className="group/ch flex h-full flex-col gap-10 p-8 transition-colors duration-500 hover:bg-cream focus-visible:outline-offset-[-6px] md:p-10"
                >
                  <span className="text-wood-dark">{d.icon}</span>
                  <span>
                    <span className="text-h3 block font-display">{ch.title}</span>
                    <span className="text-lead mt-2 block break-words text-ink underline decoration-sand underline-offset-4 transition-colors group-hover/ch:decoration-wood">
                      {d.value}
                    </span>
                    <span className="mt-3 block text-[0.9375rem] text-stone">{ch.note}</span>
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
