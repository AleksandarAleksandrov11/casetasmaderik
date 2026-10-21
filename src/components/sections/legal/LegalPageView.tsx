import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ContactLink } from '@/components/layout/ContactLink';
import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { buttonClasses } from '@/components/ui/Button';
import { JsonLd } from '@/components/ui/JsonLd';
import { Label } from '@/components/ui/Label';
import { cookieCategories } from '@/content/cookies';
import type { LegalBlock, LegalInline, LegalLink, LegalPage } from '@/content/legal';
import { CtaFinal } from '@/components/sections/shared/CtaFinal';
import { site } from '@/content/site';
import { breadcrumbNode, graph, organizationNode, webPageNode, websiteNode } from '@/lib/schema';

/**
 * Columnas del listado de cookies en el orden de la sección 15 del brief, que es
 * el que anuncian los lectores de pantalla. La rejilla (ver .cookie-table en
 * globals.css) solo cambia dónde se ve cada celda, nunca el orden del marcado.
 */
const COOKIE_COLUMNS = [
  { col: 'nombre', label: 'Nombre' },
  { col: 'proveedor', label: 'Proveedor' },
  { col: 'finalidad', label: 'Finalidad' },
  { col: 'duracion', label: 'Duración' },
  { col: 'tipo', label: 'Tipo' },
] as const;

type CookieColumn = (typeof COOKIE_COLUMNS)[number];

/** Dato corto de una cookie. La etiqueta visible solo se ve en las fichas de móvil. */
function MetaCell({ col, label, value }: CookieColumn & { value: string }) {
  return (
    <td role="cell" data-col={col} className="cookie-meta">
      {/* Los lectores de pantalla ya anuncian la cabecera de columna */}
      <span aria-hidden="true" className="cookie-label">
        {label}
      </span>
      <span>{value}</span>
    </td>
  );
}

const [nombre, proveedor, finalidad, duracion, tipo] = COOKIE_COLUMNS;

/**
 * Listado de cookies. Es una tabla semántica maquetada con una rejilla por áreas
 * común a todas las tablas y con la misma medida que el texto. En móvil cada
 * cookie es una ficha (nada queda cortado ni oculto); desde 32.5rem de ancho es
 * una tabla con una sola fila de cabecera. Como el CSS cambia el display de la
 * tabla, los roles ARIA explícitos conservan su semántica en todos los lectores.
 */
function CookieTable() {
  return (
    <div className="space-y-12">
      {cookieCategories.map((cat) => (
        <div key={cat.id}>
          <h3>{cat.title}</h3>
          <p>{cat.description}</p>
          {cat.rows.length > 0 ? (
            <div className="cookie-table">
              <table role="table">
                <caption className="sr-only">Cookies {cat.title.toLowerCase()}</caption>
                <thead role="rowgroup">
                  <tr role="row">
                    {COOKIE_COLUMNS.map(({ col, label }) => (
                      <th key={col} role="columnheader" scope="col" data-col={col}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {cat.rows.map((r) => (
                    <tr key={r.name} role="row">
                      <th role="rowheader" scope="row" data-col={nombre.col}>
                        {r.name}
                      </th>
                      <MetaCell {...proveedor} value={r.provider} />
                      <td role="cell" data-col={finalidad.col} className="cookie-purpose">
                        {r.purpose}
                      </td>
                      <MetaCell {...duracion} value={r.duration} />
                      <MetaCell {...tipo} value={r.type} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-stone">Ahora mismo no usamos cookies de esta categoría.</p>
          )}
        </div>
      ))}
    </div>
  );
}

/** Enlace dentro del texto legal: los de contacto registran el clic como el resto de la web. */
function InlineLink({ text, href }: LegalLink) {
  if (href.startsWith('mailto:')) {
    return (
      <ContactLink href={href} event="click_email" place="legal">
        {text}
      </ContactLink>
    );
  }
  if (href.startsWith('tel:')) {
    return (
      <ContactLink href={href} event="click_phone" place="legal" className="whitespace-nowrap">
        {text}
      </ContactLink>
    );
  }
  if (href.startsWith('/')) return <Link href={href}>{text}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {text}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

function Inline({ parts }: { parts: LegalInline[] }) {
  return parts.map((part, i) => (typeof part === 'string' ? part : <InlineLink key={i} {...part} />));
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          <Inline parts={block.text} />
        </p>
      );
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'ul':
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline parts={item} />
            </li>
          ))}
        </ul>
      );
    case 'cookie-table':
      return <CookieTable />;
    case 'cookie-button':
      // Botón primario completo: texto y flecha, como ButtonLink
      return (
        <div className="my-6">
          <CookieSettingsButton className={buttonClasses({ variant: 'primary' })}>
            <span>Configurar cookies</span>
            <ArrowRight
              aria-hidden="true"
              strokeWidth={1.5}
              className="size-[18px] transition-transform duration-500 ease-brand group-hover/btn:translate-x-1"
            />
          </CookieSettingsButton>
        </div>
      );
  }
}

/**
 * Maquetación de lectura cómoda: texto a unos 70 caracteres (la medida está en
 * .prose-legal) e índice lateral en escritorio, sobre la rejilla de 12 columnas.
 */
export function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <>
      <JsonLd
        data={graph([
          organizationNode(),
          websiteNode(),
          webPageNode({ path: page.path, name: page.metaTitle, description: page.description, breadcrumb: true }),
          breadcrumbNode(page.path, [
            { name: 'Inicio', path: '/' },
            { name: page.title, path: page.path },
          ]),
        ])}
      />
      <section data-header="light" className="bg-cream pt-[calc(var(--header-h)+24px)] pb-[clamp(88px,10vw,160px)]">
        <div className="container-site">
          <Breadcrumbs
            items={[
              { name: 'Inicio', path: '/' },
              { name: page.title, path: page.path },
            ]}
          />
          <h1 className="text-h1 mt-6">{page.title}</h1>
          <p className="text-lead mt-6 max-w-[30em] text-stone">{page.intro}</p>
          <p className="mt-4 text-[0.9375rem] text-stone">Última actualización: {site.legalUpdated}</p>

          <div className="grid-site mt-14 gap-y-12 border-t border-sand pt-12">
            <nav aria-label="Índice" className="col-span-full min-w-0 lg:col-span-4 lg:pr-8">
              <div className="lg:sticky lg:top-[calc(var(--header-h-compact)+32px)]">
                <Label>Índice</Label>
                {/* El relleno vertical separa las entradas aunque una ocupe dos líneas */}
                <ol className="mt-4 space-y-1 text-[0.9375rem]">
                  {page.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="inline-flex min-h-[44px] items-center py-2 leading-snug text-balance text-stone hover:text-ink"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
            <article className="prose-legal col-span-full min-w-0 lg:col-span-8 lg:col-start-5">
              {page.sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-t`} className="first:[&>h2]:mt-0">
                  <h2 id={`${s.id}-t`}>{s.title}</h2>
                  {s.blocks.map((b, i) => (
                    <Block key={i} block={b} />
                  ))}
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>
      <CtaFinal
        variant="dudas"
        title={page.cta.title}
        text={page.cta.text}
        actions={page.cta.actions ?? ['llamar', 'whatsapp']}
      />
    </>
  );
}
