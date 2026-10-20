import type { Metadata } from 'next';
import { CasetasViewerHero } from '@/components/sections/casetas/CasetasViewerHero';
import { CasetasSpecs } from '@/components/sections/casetas/CasetasSpecs';
import { AssemblySection } from '@/components/sections/casetas/AssemblySection';
import { CasetasGallery } from '@/components/sections/casetas/CasetasGallery';
import { CasetasCta } from '@/components/sections/casetas/CasetasCta';
import { FaqSection } from '@/components/sections/shared/FaqSection';
import { JsonLd } from '@/components/ui/JsonLd';
import { casetasFaqIntro, casetasMeta } from '@/content/casetas';
import { casetasFaqs } from '@/content/faqs';
import { pageMetadata } from '@/lib/seo';
import {
  breadcrumbNode,
  faqNode,
  graph,
  organizationNode,
  productNode,
  serviceNode,
  webPageNode,
  websiteNode,
} from '@/lib/schema';

export const metadata: Metadata = pageMetadata({ ...casetasMeta, path: '/casetas' });

export default function CasetasPage() {
  return (
    <>
      <JsonLd
        data={graph([
          organizationNode(),
          websiteNode(),
          webPageNode({
            path: '/casetas',
            name: casetasMeta.title,
            description: casetasMeta.description,
            breadcrumb: true,
          }),
          breadcrumbNode('/casetas', [
            { name: 'Inicio', path: '/' },
            { name: 'Casetas', path: '/casetas' },
          ]),
          serviceNode(),
          productNode(),
          faqNode('/casetas', casetasFaqs),
        ])}
      />
      <CasetasViewerHero />
      <CasetasSpecs />
      <AssemblySection />
      <CasetasGallery />
      <FaqSection id="preguntas" label={casetasFaqIntro.label} title={casetasFaqIntro.title} faqs={casetasFaqs} />
      <CasetasCta />
    </>
  );
}
