import Link from 'next/link';
import { Isotipo } from '@/components/brand/Isotipo';
import { ButtonLink } from '@/components/ui/Button';
import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { ContactLink } from './ContactLink';
import { FooterWordmark } from './FooterWordmark';
import { emailHref, legalNav, nav, phoneHref, serviceAreaText, site, whatsappHref } from '@/content/site';

const linkClass =
  'inline-flex min-h-[44px] min-w-[44px] items-center text-cream/90 transition-colors duration-300 hover:text-wood-light';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-mist">{title}</h2>
      {children}
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const socials = Object.entries(site.social);
  return (
    <footer data-header="dark" data-surface="dark" className="surface-dark relative overflow-hidden bg-ink text-cream">
      <div className="container-site pt-[clamp(72px,9vw,128px)]">
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-6 lg:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-3">
            <Isotipo className="h-12 w-auto text-wood-light" />
            <p className="mt-6 max-w-[32ch] text-lead text-cream">
              Alquiler de casetas de madera para ferias, mercados y eventos.
            </p>
            <ButtonLink href="/contacto" variant="light" className="mt-8">
              Pedir presupuesto
            </ButtonLink>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <Block title="Navegación">
              <ul>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          <div className="md:col-span-4 lg:col-span-3">
            <Block title="Contacto">
              <ul>
                <li>
                  <ContactLink href={emailHref} event="click_email" place="footer" className={`${linkClass} break-all`}>
                    {site.email}
                  </ContactLink>
                </li>
                <li>
                  <ContactLink href={phoneHref} event="click_phone" place="footer" className={linkClass}>
                    {site.phone.display}
                  </ContactLink>
                </li>
                <li>
                  <ContactLink
                    href={whatsappHref()}
                    event="click_whatsapp"
                    place="footer"
                    external
                    className={linkClass}
                  >
                    WhatsApp
                  </ContactLink>
                </li>
              </ul>
              <p className="mt-4 text-[0.9375rem] text-mist">{site.hours}</p>
              <p className="mt-1 text-[0.9375rem] text-mist">{serviceAreaText}</p>
            </Block>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <Block title="Legal">
              <ul>
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <CookieSettingsButton className={`${linkClass} text-left`}>Configurar cookies</CookieSettingsButton>
                </li>
              </ul>
            </Block>
          </div>

          <div className="md:col-span-3 lg:col-span-2">
            <Block title="Síguenos">
              <ul>
                {socials.map(([network, url]) => (
                  <li key={network}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className={`${linkClass} capitalize`}>
                      {network}
                      <span className="sr-only"> (se abre en una pestaña nueva)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Block>
          </div>
        </div>
      </div>

      <FooterWordmark />

      <div className="container-site">
        <div className="flex flex-col gap-3 border-t border-mist/20 py-6 text-[0.875rem] text-mist md:flex-row md:items-center md:justify-between pb-[max(24px,var(--safe-bottom))]">
          <p>
            © {year} {site.name}. {site.legalName}, NIF {site.taxId}.
          </p>
          <div className="flex items-center gap-6">
            <a href={site.credit.url} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center hover:text-cream">
              {site.credit.label}
            </a>
            <a href="#arriba" className="group/top inline-flex min-h-[44px] items-center gap-2 hover:text-cream">
              Volver arriba
              <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-500 ease-brand group-hover/top:-translate-y-0.5" aria-hidden="true">
                <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
