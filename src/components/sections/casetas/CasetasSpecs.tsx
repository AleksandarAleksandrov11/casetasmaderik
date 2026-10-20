import type { ReactNode } from 'react';
import { Download } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { casetasSpecs } from '@/content/casetas';
import { site } from '@/content/site';
import { InlineStyle } from '@/components/three/InlineStyle';
import { FloorPlan, FrontElevation, SideElevation, plansCss } from './TechnicalPlans';

/**
 * Plano en su tarjeta. Las tres tarjetas tienen siempre el mismo ancho y los
 * tres SVG el mismo marco, así los planos comparten escala en cada rejilla.
 */
function PlanFigure({ title, delay, children }: { title: string; delay?: string; children: ReactNode }) {
  return (
    <figure
      className="plan flex flex-col"
      data-reveal
      style={delay ? { ['--reveal-delay' as string]: delay } : undefined}
    >
      <div className="flex flex-1 items-center rounded-sm border border-sand bg-paper/60 p-[clamp(14px,1.6vw,24px)]">
        {children}
      </div>
      <figcaption className="mt-4 text-[0.9375rem] text-stone">{title}</figcaption>
    </figure>
  );
}

/** S2. Medidas y características con planos acotados. */
export function CasetasSpecs() {
  const s = casetasSpecs;
  return (
    <Section surface="cream" aria-labelledby="medidas-titulo" className="border-t border-sand">
      {/* Titular y lista apilados hasta xl: en dos columnas no cabrían "características" ni los valores */}
      <div className="container-site grid-site gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-12 xl:col-span-5">
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
        <dl
          className="col-span-4 grid gap-x-10 md:col-span-6 md:grid-cols-2 lg:col-span-12 xl:col-span-7 xl:col-start-6"
          data-reveal
        >
          {s.rows.map((row) => (
            <div key={row.term} className="flex items-baseline justify-between gap-6 border-t border-sand py-4">
              <dt className="text-stone">{row.term}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="container-site mt-[clamp(72px,9vw,128px)]">
        <InlineStyle id="caseta-planos" css={plansCss} />
        <h3 className="text-h3">{s.plansTitle}</h3>
        {/* Columnas iguales: una, dos (la planta junto a la nota) o tres */}
        <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          <PlanFigure title={s.plans[0].title}>
            <FrontElevation />
          </PlanFigure>
          <PlanFigure title={s.plans[1].title} delay="0.1s">
            <SideElevation />
          </PlanFigure>
          <PlanFigure title={s.plans[2].title} delay="0.2s">
            <FloorPlan />
          </PlanFigure>
          <p className="max-w-[44ch] text-[0.9375rem] text-stone md:self-end lg:col-span-3 lg:max-w-[60ch]">
            {s.plansNote}
          </p>
        </div>
      </div>
    </Section>
  );
}
