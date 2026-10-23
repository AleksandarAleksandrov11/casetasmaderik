import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { homeGuide } from '@/content/home';
import { noOrphans } from '@/lib/typography';

/** S5. Guía breve del alquiler: qué incluye, para qué eventos y cómo pedir presupuesto. */
export function HomeGuide() {
  const g = homeGuide;
  return (
    <Section surface="cream" aria-labelledby="guia-titulo">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Label>{g.label}</Label>
            <Heading id="guia-titulo" className="mt-6">
              {g.title}
            </Heading>
          </div>
          <p className="text-lead text-stone lg:col-span-6 lg:col-start-7 lg:self-end">{noOrphans(g.intro)}</p>
        </div>
        <div className="mt-14 grid gap-10 border-t border-sand pt-10 md:grid-cols-3 md:gap-12 lg:mt-20">
          {g.columns.map((c) => (
            <div key={c.title}>
              <h3 className="text-h3 font-display">{c.title}</h3>
              <p className="mt-4 text-stone">{noOrphans(c.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
