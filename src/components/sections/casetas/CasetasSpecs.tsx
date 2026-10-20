import { Download } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { casetasSpecs } from '@/content/casetas';
import { site } from '@/content/site';
import { FloorPlan, FrontElevation, SideElevation } from './TechnicalPlans';

/** S2. Medidas y características con planos acotados. */
export function CasetasSpecs() {
  const s = casetasSpecs;
  return (
    <Section surface="cream" aria-labelledby="medidas-titulo" className="border-t border-sand">
      <div className="container-site grid-site gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-4">
          <Label>{s.label}</Label>
          <Heading id="medidas-titulo" className="mt-6">
            {s.title}
          </Heading>
          {site.features.techSheet ? (
            <a href={s.download.href} className="link-underline mt-8" download>
              <Download aria-hidden="true" strokeWidth={1.5} className="size-[18px]" />
              {s.download.label}
            </a>
          ) : null}
        </div>
        <dl className="col-span-4 grid gap-x-10 sm:grid-cols-2 md:col-span-6 lg:col-span-7 lg:col-start-6" data-reveal>
          {s.rows.map((row) => (
            <div key={row.term} className="flex items-baseline justify-between gap-6 border-t border-sand py-4">
              <dt className="text-stone">{row.term}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="container-site mt-[clamp(72px,9vw,128px)]">
        <h3 className="text-h3">{s.plansTitle}</h3>
        <div className="mt-10 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1.25fr]">
          <figure className="plan flex flex-col" data-reveal>
            <div className="flex flex-1 items-center rounded-sm border border-sand bg-paper/60 p-[clamp(16px,2.5vw,32px)]">
              <FrontElevation />
            </div>
            <figcaption className="mt-4 text-[0.9375rem] text-stone">{s.plans[0].title}</figcaption>
          </figure>
          <figure className="plan flex flex-col" data-reveal style={{ ['--reveal-delay' as string]: '0.1s' }}>
            <div className="flex flex-1 items-center rounded-sm border border-sand bg-paper/60 p-[clamp(16px,2.5vw,32px)]">
              <SideElevation />
            </div>
            <figcaption className="mt-4 text-[0.9375rem] text-stone">{s.plans[1].title}</figcaption>
          </figure>
          <figure
            className="plan flex flex-col md:col-span-2 lg:col-span-1"
            data-reveal
            style={{ ['--reveal-delay' as string]: '0.2s' }}
          >
            <div className="flex flex-1 items-center rounded-sm border border-sand bg-paper/60 p-[clamp(16px,2.5vw,32px)]">
              <FloorPlan />
            </div>
            <figcaption className="mt-4 text-[0.9375rem] text-stone">{s.plans[2].title}</figcaption>
          </figure>
        </div>
        <p className="mt-8 max-w-[60ch] text-[0.9375rem] text-stone">
          Medidas exteriores aproximadas. Te confirmamos el espacio necesario para tu recinto en el presupuesto.
        </p>
      </div>
    </Section>
  );
}
