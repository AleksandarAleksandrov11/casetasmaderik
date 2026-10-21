import { Fragment } from 'react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { ContactLink } from './ContactLink';
import { FooterWordmark } from './FooterWordmark';
import { emailHref, legalNav, nav, phoneHref, serviceAreaText, site, whatsappHref } from '@/content/site';

/*
 * Objetivo táctil de 44 px. Interlineado corto y relleno vertical: si un enlace
 * llega a partirse, sus dos líneas quedan juntas y separadas del siguiente.
 */
const linkClass =
  'inline-flex min-h-[44px] min-w-[44px] items-center py-2 leading-snug text-cream/90 transition-colors duration-300 hover:text-wood-light';

// Con tope de medida: una zona de servicio larga se parte en líneas y no ensancha la columna
const noteClass = 'max-w-[30ch] text-[0.9375rem] text-mist';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 font-sans text-[0.8125rem] font-semibold tracking-[0.18em] text-mist uppercase">{title}</h2>
      {children}
    </div>
  );
}

/**
 * El horario se parte por la coma: si no cabe en una línea salta ahí
 * ("Lunes a viernes," / "de 9:00 a 19:00") y nunca dentro del tramo horario.
 */
function Hours({ text }: { text: string }) {
  return (
    <>
      {text.split(/(?<=,)\s+/).map((part, i) => (
        <Fragment key={part}>
          {i > 0 ? ' ' : null}
          <span className="inline-block">{part}</span>
        </Fragment>
      ))}
    </>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const socials = Object.entries(site.social);
  return (
    <footer
      id="pie"
      data-header="dark"
      data-surface="dark"
      className="surface-dark relative overflow-hidden bg-ink text-cream"
    >
      <div className="container-site @container pt-[clamp(72px,9vw,128px)]">
        {/*
         * Rejilla del pie. Los escalones dependen del sitio real del contenedor
         * y se miden en rem (consultas de contenedor), no en px de viewport:
         * con el texto del navegador ampliado los grupos piden más sitio y la
         * rejilla baja sola de escalón, sin partir enlaces ni desbordar.
         *  · Por debajo de 26rem: una columna.
         *  · Desde 26rem: los grupos en 2 × 2, con el email entero en su columna.
         *  · Desde 43rem: una fila de cuatro grupos al ancho de su contenido y
         *    con el mismo aire entre ellos.
         *  · Desde 70.5rem: la rejilla de 12 columnas de la web (grid-site), con
         *    la marca en las columnas 1 a 4 y los grupos en las 5 a 12, al mismo
         *    canto derecho que el wordmark.
         * Cada umbral es la suma del contenido más su aire mínimo, con margen.
         */}
        <div className="grid-site gap-y-12 @min-[43rem]:gap-y-16">
          {/*
           * Frase y botón en una banda: comparten fila (frase a la izquierda,
           * botón al canto derecho) cuando caben, y si no, el botón baja solo.
           * content-start: en la columna de la marca las dos líneas quedan
           * arriba y no se reparten el alto de la fila.
           */}
          <div className="col-span-full flex flex-wrap content-start items-end justify-between gap-8 @min-[70.5rem]:col-span-4">
            {/* En la rejilla de 12, el -mt compensa el interlineado: la frase cuelga de la misma línea que los títulos */}
            <p className="text-lead max-w-[32ch] text-cream @min-[70.5rem]:-mt-2">
              Alquiler de casetas de madera para ferias, mercados y eventos.
            </p>
            <ButtonLink href="/contacto" variant="light">
              Pedir presupuesto
            </ButtonLink>
          </div>

          <div className="col-span-full grid gap-x-8 gap-y-12 @min-[26rem]:grid-cols-2 @min-[43rem]:grid-cols-[repeat(4,auto)] @min-[43rem]:justify-between @min-[70.5rem]:col-span-8">
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
              <p className={`mt-4 ${noteClass}`}>
                <Hours text={site.hours} />
              </p>
              <p className={`mt-1 ${noteClass}`}>{serviceAreaText}</p>
            </Block>

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
        <div className="flex flex-col gap-3 border-t border-mist/20 py-6 pb-[max(24px,var(--safe-bottom))] text-[0.875rem] text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {site.legalName}, NIF {site.taxId}.
          </p>
          <div className="flex items-center gap-6">
            <a href="#arriba" className="group/top inline-flex min-h-[44px] items-center gap-2 hover:text-cream">
              Volver arriba
              <svg
                viewBox="0 0 16 16"
                className="size-4 transition-transform duration-500 ease-brand group-hover/top:-translate-y-0.5"
                aria-hidden="true"
              >
                <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
