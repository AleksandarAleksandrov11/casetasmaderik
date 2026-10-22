import Link from 'next/link';

type Crumb = { name: string; path: string };

/** Migas de pan visibles. El JSON-LD BreadcrumbList lo añade cada página. */
export function Breadcrumbs({ items, tone = 'light' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  return (
    <nav aria-label="Migas de pan" className="text-[0.875rem]">
      <ol className={`flex flex-wrap items-center gap-x-2 ${tone === 'dark' ? 'text-cream/85' : 'text-stone'}`}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className={tone === 'dark' ? 'text-cream' : 'text-ink'}>
                  {item.name}
                </span>
              ) : (
                <>
                  {/* Área táctil de 44 px: el relleno lateral se compensa con margen
                      negativo, así el separador queda a la misma distancia de las dos migas */}
                  <Link
                    href={item.path}
                    className="-mx-1.5 inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-1.5 underline-offset-4 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <span aria-hidden="true" className="opacity-60">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
