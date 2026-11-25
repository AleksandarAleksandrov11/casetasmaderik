import type { Metadata } from 'next';
import { MesasViewerHero } from '@/components/sections/mesas/MesasViewerHero';
import { MesasKit } from '@/components/sections/mesas/MesasKit';
import { MesasCalculatorSection } from '@/components/sections/mesas/MesasCalculatorSection';
import { MesasGallery } from '@/components/sections/mesas/MesasGallery';
import { FaqSection } from '@/components/sections/shared/FaqSection';
import { CtaFinal } from '@/components/sections/shared/CtaFinal';
import { JsonLd } from '@/components/ui/JsonLd';
import { mesasCta, mesasFaqIntro, mesasMeta } from '@/content/mesas';
import { mesasFaqs } from '@/content/faqs';
import { pageMetadata } from '@/lib/seo';
import {
  breadcrumbNode,
  faqNode,
  graph,
  kitProductNode,
  kitServiceNode,
  organizationNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';

export const metadata: Metadata = pageMetadata({ ...mesasMeta, path: '/mesas-y-bancos' });

export default function MesasYBancosPage() {
  return (
    <>
      <JsonLd
        data={graph([
          organizationNode(),
          websiteNode(),
          webPageNode({
            path: '/mesas-y-bancos',
            name: mesasMeta.title,
            description: mesasMeta.description,
            breadcrumb: true,
          }),
          breadcrumbNode('/mesas-y-bancos', [
            { name: 'Inicio', path: '/' },
            { name: 'Mesas y bancos', path: '/mesas-y-bancos' },
          ]),
          kitServiceNode(),
          kitProductNode(),
          faqNode('/mesas-y-bancos', mesasFaqs),
        ])}
      />
      <MesasViewerHero />
      <MesasKit />
      <MesasCalculatorSection />
      <MesasGallery />
      <FaqSection
        id="preguntas"
        label={mesasFaqIntro.label}
        title={mesasFaqIntro.title}
        faqs={mesasFaqs}
        surface="paper"
      />
      <CtaFinal
        place="cta-mesas"
        image={mesasCta.image}
        focus="50% 60%"
        label={mesasCta.label}
        title={mesasCta.title}
        text={mesasCta.text}
        presupuestoHref="/contacto?kits=10"
      />
    </>
  );
}
