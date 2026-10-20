import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton';
import { buttonClasses } from '@/components/ui/Button';
import { JsonLd } from '@/components/ui/JsonLd';
import { cookieCategories } from '@/content/cookies';
import type { LegalBlock, LegalPage } from '@/content/legal';
import { site } from '@/content/site';
import { breadcrumbNode, graph, organizationNode, webPageNode, websiteNode } from '@/lib/schema';

function CookieTable() {
  return (
    <div className="space-y-10">
      {cookieCategories.map((cat) => (
        <div key={cat.id}>
          <h3>{cat.title}</h3>
          <p>{cat.description}</p>
          {cat.rows.length > 0 ? (
            <div className="-mx-1 overflow-x-auto px-1">
              <table>
                <caption className="sr-only">Cookies {cat.title.toLowerCase()}</caption>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Proveedor</th>
                    <th scope="col">Finalidad</th>
                    <th scope="col">Duración</th>
                    <th scope="col">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.rows.map((r) => (
                    <tr key={r.name}>
                      <td className="font-medium whitespace-nowrap">{r.name}</td>
                      <td>{r.provider}</td>
                      <td>{r.purpose}</td>
                      <td>{r.duration}</td>
                      <td>{r.type}</td>
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

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'p':
      return <p>{block.text}</p>;
    case 'h3':
      return <h3>{block.text}</h3>;
    case 'ul':
      return (
        <ul>
          {block.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case 'cookie-table':
      return <CookieTable />;
    case 'cookie-button':
      return (
        <div className="my-6">
          <CookieSettingsButton className={buttonClasses({ variant: 'primary' })}>Configurar cookies</CookieSettingsButton>
        </div>
      );
  }
}

/** Maquetación de lectura cómoda: columna de 70 caracteres e índice lateral. */
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
          <h1 className="mt-6 text-h1">{page.title}</h1>
          <p className="mt-6 max-w-[62ch] text-lead text-stone">{page.intro}</p>
          <p className="mt-4 text-[0.9375rem] text-stone">Última actualización: {site.legalUpdated}</p>

          <div className="mt-14 grid gap-12 border-t border-sand pt-12 lg:grid-cols-12">
            <nav aria-label="Índice" className="lg:col-span-3">
              <div className="lg:sticky lg:top-[calc(var(--header-h-compact)+32px)]">
                <p className="text-[0.8125rem] font-semibold tracking-[0.18em] text-wood uppercase">Índice</p>
                <ol className="mt-4 space-y-1 text-[0.9375rem]">
                  {page.sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="inline-flex min-h-[40px] items-center text-stone hover:text-ink">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
            <article className="prose-legal lg:col-span-8 lg:col-start-5">
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
    </>
  );
}
