import { Mail, Phone } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactLink } from '@/components/layout/ContactLink';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { QuoteFormIsland } from '@/components/form/QuoteFormIsland';
import { QuoteFormStatic } from '@/components/form/QuoteFormStatic';
import { Label } from '@/components/ui/Label';
import { contactoHero } from '@/content/contacto';
import { emailHref, phoneHref, site, whatsappHref } from '@/content/site';

function ContactList({ className = '' }: { className?: string }) {
  const item = 'flex min-h-[48px] items-center gap-4 text-ink transition-colors duration-300 hover:text-wood-dark';
  return (
    <div className={className}>
      <ul className="border-t border-sand">
        <li className="border-b border-sand">
          <ContactLink href={phoneHref} event="click_phone" place="contacto-hero" className={item}>
            <Phone aria-hidden="true" strokeWidth={1.5} className="size-5 text-wood" />
            <span>{site.phone.display}</span>
          </ContactLink>
        </li>
        <li className="border-b border-sand">
          <ContactLink href={whatsappHref()} event="click_whatsapp" place="contacto-hero" external className={item}>
            <WhatsAppIcon className="size-5 text-wood" />
            <span>WhatsApp</span>
          </ContactLink>
        </li>
        <li className="border-b border-sand">
          <ContactLink href={emailHref} event="click_email" place="contacto-hero" className={`${item} break-all`}>
            <Mail aria-hidden="true" strokeWidth={1.5} className="size-5 flex-none text-wood" />
            <span>{site.email}</span>
          </ContactLink>
        </li>
      </ul>
      <p className="mt-4 text-[0.9375rem] text-stone">{site.hours}</p>
    </div>
  );
}

/** S1. Título y datos a la izquierda, formulario a la derecha. En móvil, el formulario va justo debajo del título. */
export function ContactoHero() {
  const h = contactoHero;
  return (
    <section
      data-header="light"
      className="relative bg-cream pt-[calc(var(--header-h)+8px)] pb-[clamp(72px,9vw,140px)] lg:pt-[calc(var(--header-h)+32px)]"
    >
      <div className="container-site">
        <Breadcrumbs
          items={[
            { name: 'Inicio', path: '/' },
            { name: 'Contacto', path: '/contacto' },
          ]}
        />
        <div className="mt-4 grid gap-x-16 gap-y-8 lg:mt-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Label className="hidden lg:inline-flex">{h.label}</Label>
            <h1 className="text-[clamp(2rem,1.4rem+3vw,4.25rem)] leading-[1.02] tracking-[-0.03em] lg:mt-6">
              {h.title}
            </h1>
            <p className="text-lead mt-4 max-w-[40ch] text-stone lg:mt-6">{h.text}</p>
            <ContactList className="mt-12 hidden lg:block" />
          </div>
          <div id="formulario" className="scroll-mt-24 lg:col-span-7">
            <QuoteFormIsland>
              <QuoteFormStatic />
            </QuoteFormIsland>
          </div>
          <ContactList className="lg:hidden" />
        </div>
      </div>
    </section>
  );
}
