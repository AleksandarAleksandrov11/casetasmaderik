// STUB: lo sustituye el visor 3D con puntos de interés y controles.
import { casetasHero } from '@/content/casetas';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';

export function CasetasViewerHero() {
  return (
    <section data-header="light" className="relative bg-cream pt-[calc(var(--header-h)+24px)] pb-24">
      <div className="container-site">
        <Breadcrumbs
          items={[
            { name: 'Inicio', path: '/' },
            { name: 'Casetas', path: '/casetas' },
          ]}
        />
        <h1 className="text-h1 mt-6">{casetasHero.title}</h1>
        <p className="text-lead mt-6 max-w-[46ch] text-stone">{casetasHero.text}</p>
        <ButtonLink href={casetasHero.primary.href} className="mt-8">
          {casetasHero.primary.label}
        </ButtonLink>
      </div>
    </section>
  );
}
