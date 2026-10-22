import { Phone } from 'lucide-react';
import { ContactLink } from '@/components/layout/ContactLink';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { QuoteFormIsland } from '@/components/form/QuoteFormIsland';
import { QuoteFormStatic } from '@/components/form/QuoteFormStatic';
import { Label } from '@/components/ui/Label';
import { contactoHero } from '@/content/contacto';
import { phoneHref, site, whatsappHref } from '@/content/site';

/**
 * Atajo para hablar sin rellenar el formulario, junto a él en escritorio. Solo
 * teléfono y WhatsApp: el email y el horario están en la sección siguiente.
 */
function ContactShortcuts({ className = '' }: { className?: string }) {
  const item = 'flex min-h-[48px] items-center gap-4 text-ink transition-colors duration-300 hover:text-wood-dark';
  return (
    <ul className={`border-t border-sand ${className}`}>
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
    </ul>
  );
}

/**
 * S1. Título y atajos de contacto a la izquierda, formulario a la derecha (6 y 6
 * columnas). En móvil, el formulario va justo debajo del título y los canales
 * se dejan para la sección siguiente.
 */
export function ContactoHero() {
  const h = contactoHero;
  return (
    <section
      data-header="light"
      className="relative bg-cream pt-[calc(var(--header-h)+8px)] pb-[clamp(72px,9vw,140px)] lg:pt-[calc(var(--header-h)+32px)]"
    >
      <div className="container-site">
        {/*
         * Móviles en horizontal (poca altura, misma consulta que el héroe de
         * Inicio): título y entradilla en una línea cada uno y menos aire hasta
         * el formulario, para que su cabecera ("Paso 1 de 4" y la barra) se vea
         * sin hacer scroll.
         */}
        <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-8 lg:mt-12 lg:grid-cols-12 max-lg:low-landscape:gap-y-6">
          <div className="@container lg:col-span-6">
            <Label className="hidden lg:inline-flex">{h.label}</Label>
            {/*
             * Tamaño de H1 de las páginas interiores (por encima de los H2), con
             * tope relativo a la columna (13,5cqi) para que "Pide presupuesto"
             * quepa siempre en una línea y el título nunca se parta en tres.
             * En horizontal, 7,3cqi deja el título entero en una línea (mide
             * 13,3em) sin bajar nunca del 104 % de los H2.
             */}
            <h1 className="text-h1 text-[length:min(var(--fs-h1),13.5cqi)] lg:mt-6 max-lg:low-landscape:text-[length:clamp(calc(var(--fs-h2)*1.04),7.3cqi,var(--fs-h1))]">
              {h.title}
            </h1>
            {/* En horizontal, la entradilla en una línea, tan ancha como el título */}
            <p className="text-lead mt-4 max-w-[40ch] text-stone lg:mt-6 max-lg:low-landscape:max-w-none">{h.text}</p>
            <ContactShortcuts className="mt-8 hidden lg:block" />
          </div>
          <div id="formulario" className="scroll-mt-24 lg:col-span-6">
            <QuoteFormIsland>
              <QuoteFormStatic />
            </QuoteFormIsland>
          </div>
        </div>
      </div>
    </section>
  );
}
