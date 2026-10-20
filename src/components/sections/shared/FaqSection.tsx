import type { ReactNode } from 'react';
import { AccordionItem } from '@/components/ui/Accordion';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section, type Surface } from '@/components/ui/Section';
import type { Faq } from '@/content/faqs';

type FaqSectionProps = {
  id?: string;
  label: string;
  title: string;
  faqs: Faq[];
  surface?: Surface;
  aside?: ReactNode;
};

/** Preguntas frecuentes. El JSON-LD FAQPage lo añade la página en su grafo. */
export function FaqSection({ id, label, title, faqs, surface = 'cream', aside }: FaqSectionProps) {
  return (
    <Section id={id} surface={surface} aria-labelledby={id ? `${id}-titulo` : undefined}>
      <div className="container-site grid-site gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:col-span-4">
          <Label>{label}</Label>
          <Heading id={id ? `${id}-titulo` : undefined} className="mt-6">
            {title}
          </Heading>
          {aside ? <div className="mt-8">{aside}</div> : null}
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-6" data-reveal>
          {faqs.map((f) => (
            <AccordionItem key={f.q} question={f.q}>
              <p>{f.a}</p>
            </AccordionItem>
          ))}
        </div>
      </div>
    </Section>
  );
}
