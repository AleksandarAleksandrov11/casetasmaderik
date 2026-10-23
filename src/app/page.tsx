import type { Metadata } from 'next';
import { HomeHero } from '@/components/sections/home/HomeHero';
import { HomeCaseta } from '@/components/sections/home/HomeCaseta';
import { HomeEvents } from '@/components/sections/home/HomeEvents';
import { HomeProcess } from '@/components/sections/home/HomeProcess';
import { HomeGuide } from '@/components/sections/home/HomeGuide';
import { FaqSection } from '@/components/sections/shared/FaqSection';
import { CtaFinal } from '@/components/sections/shared/CtaFinal';
import { TextLink } from '@/components/ui/TextLink';
import { JsonLd } from '@/components/ui/JsonLd';
import { homeFaqIntro, homeMeta, seasonCta } from '@/content/home';
import { homeFaqs } from '@/content/faqs';
import { getSeason } from '@/lib/season';
import { pageMetadata } from '@/lib/seo';
import { faqNode, graph, organizationNode, productNode, serviceNode, webPageNode, websiteNode } from '@/lib/schema';

// El CTA de temporada cambia solo: la página se regenera a diario
export const revalidate = 86400;

export const metadata: Metadata = pageMetadata({ ...homeMeta, path: '/' });

export default function HomePage() {
  const season = getSeason(new Date());
  const cta = seasonCta[season];
  return (
    <>
      <JsonLd
        data={graph([
          organizationNode(),
          websiteNode(),
          webPageNode({ path: '/', name: homeMeta.title, description: homeMeta.description }),
          serviceNode(),
          productNode(),
          faqNode('/', homeFaqs),
        ])}
      />
      <HomeHero />
      <HomeCaseta />
      <HomeEvents />
      <HomeProcess />
      <HomeGuide />
      <FaqSection
        id="preguntas-frecuentes"
        label={homeFaqIntro.label}
        title={homeFaqIntro.title}
        faqs={homeFaqs}
        surface="paper"
        aside={<TextLink href={homeFaqIntro.link.href}>{homeFaqIntro.link.label}</TextLink>}
      />
      <CtaFinal
        place="cta-temporada"
        image={seasonCta.image}
        label={cta.label}
        title={cta.title}
        text={cta.text}
        note={seasonCta.responseNote}
      />
    </>
  );
}
