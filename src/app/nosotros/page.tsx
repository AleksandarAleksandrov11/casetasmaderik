import type { Metadata } from 'next';
import { NosotrosHero } from '@/components/sections/nosotros/NosotrosHero';
import { NosotrosAbout } from '@/components/sections/nosotros/NosotrosAbout';
import { NosotrosCommitments } from '@/components/sections/nosotros/NosotrosCommitments';
import { NosotrosSeason } from '@/components/sections/nosotros/NosotrosSeason';
import { NosotrosArea } from '@/components/sections/nosotros/NosotrosArea';
import { CtaFinal } from '@/components/sections/shared/CtaFinal';
import { Reviews } from '@/components/sections/shared/Reviews';
import { reviews } from '@/content/reviews';
import { site } from '@/content/site';
import { JsonLd } from '@/components/ui/JsonLd';
import { nosotrosCta, nosotrosMeta } from '@/content/nosotros';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbNode, graph, organizationNode, webPageNode, websiteNode } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({ ...nosotrosMeta, path: '/nosotros' });

export default function NosotrosPage() {
  return (
    <>
      <JsonLd
        data={graph([
          organizationNode(),
          websiteNode(),
          webPageNode({
            kind: 'AboutPage',
            path: '/nosotros',
            name: nosotrosMeta.title,
            description: nosotrosMeta.description,
            breadcrumb: true,
          }),
          breadcrumbNode('/nosotros', [
            { name: 'Inicio', path: '/' },
            { name: 'Nosotros', path: '/nosotros' },
          ]),
        ])}
      />
      <NosotrosHero />
      <NosotrosAbout />
      <NosotrosCommitments />
      <NosotrosSeason />
      {/* Máximo seis secciones: con reseñas reales, sustituyen al mapa (la zona sigue en el pie) */}
      {site.features.reviews && reviews.length > 0 ? <Reviews /> : <NosotrosArea />}
      <CtaFinal
        variant="temporada"
        title={nosotrosCta.title}
        text={nosotrosCta.text}
        image={nosotrosCta.image}
        actions={['presupuesto', 'llamar']}
      />
    </>
  );
}
