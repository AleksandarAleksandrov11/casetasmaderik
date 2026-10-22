import type { Metadata } from 'next';
import { ContactoHero } from '@/components/sections/contacto/ContactoHero';
import { ContactoChannels } from '@/components/sections/contacto/ContactoChannels';
import { ContactoNext } from '@/components/sections/contacto/ContactoNext';
import { FaqSection } from '@/components/sections/shared/FaqSection';
import { CtaFinal } from '@/components/sections/shared/CtaFinal';
import { JsonLd } from '@/components/ui/JsonLd';
import { contactoCta, contactoFaqIntro, contactoMeta } from '@/content/contacto';
import { contactoFaqs } from '@/content/faqs';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbNode, faqNode, graph, organizationNode, webPageNode, websiteNode } from '@/lib/schema';

export const metadata: Metadata = pageMetadata({ ...contactoMeta, path: '/contacto' });

export default function ContactoPage() {
  return (
    <>
      <JsonLd
        data={graph([
          organizationNode(),
          websiteNode(),
          webPageNode({
            kind: 'ContactPage',
            path: '/contacto',
            name: contactoMeta.title,
            description: contactoMeta.description,
            breadcrumb: true,
          }),
          breadcrumbNode('/contacto', [
            { name: 'Inicio', path: '/' },
            { name: 'Contacto', path: '/contacto' },
          ]),
          faqNode('/contacto', contactoFaqs),
        ])}
      />
      <ContactoHero />
      <ContactoChannels />
      <ContactoNext />
      <FaqSection
        id="preguntas-presupuesto"
        surface="cream"
        align="center"
        label={contactoFaqIntro.label}
        title={contactoFaqIntro.title}
        faqs={contactoFaqs}
      />
      {/* Con foto, para que el cierre no se funda con el footer tinta */}
      <CtaFinal
        variant="temporada"
        title={contactoCta.title}
        text={contactoCta.text}
        image={contactoCta.image}
        actions={['llamar', 'whatsapp']}
      />
    </>
  );
}
