import type { ReactNode } from 'react';
import {
  AppWindow,
  DoorOpen,
  Download,
  Info,
  Package,
  TreePine,
  Umbrella,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { casetasSpecs } from '@/content/casetas';
import { site } from '@/content/site';
import { noOrphans } from '@/lib/typography';
import { FloorPlan, FrontElevation, SideElevation } from './TechnicalPlans';

const FEATURE_ICONS: Record<string, LucideIcon> = {
  material: TreePine,
  ventanas: AppWindow,
  acceso: DoorOpen,
  cubierta: Umbrella,
  formato: Package,
  montaje: Wrench,
};

/** Pictograma de cota (como en los planos): qué mide cada cifra. */
function DimensionGlyph({ id }: { id: string }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: '0 0 28 28',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.25,
    'aria-hidden': true,
    className: 'shrink-0 text-wood',
  } as const;
  if (id === 'alto') {
    return (
      <svg {...common}>
        <path d="M14 3v22M9 3h10M9 25h10" />
      </svg>
    );
  }
  if (id === 'ancho') {
    return (
      <svg {...common}>
        <path d="M5 21 23 7M3 18.5l4 5M21 4.5l4 5" />
      </svg>
    );
  }
  if (id === 'superficie') {
    return (
      <svg {...common}>
        <rect x={4.5} y={7.5} width={19} height={13} />
        <path d="M4.5 14h19" strokeDasharray="2 2" opacity={0.6} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 14h22M3 9v10M25 9v10" />
    </svg>
  );
}

/**
 * Plano en su tarjeta blanca. Las tres tarjetas tienen siempre el mismo ancho
 * y los tres SVG el mismo marco, así los planos comparten escala en cada rejilla.
 */
function PlanFigure({ title, delay, children }: { title: string; delay?: string; children: ReactNode }) {
  return (
    <figure
      className="plan flex flex-col"
      data-reveal
      style={delay ? { ['--reveal-delay' as string]: delay } : undefined}
    >
      <div className="flex flex-1 items-center rounded-sm border border-sand bg-white p-[clamp(14px,1.6vw,24px)]">
        {children}
      </div>
      <figcaption className="mt-4 flex items-center gap-3 text-[0.9375rem] text-stone">
        <span aria-hidden="true" className="h-px w-4 bg-wood" />
        {title}
      </figcaption>
    </figure>
  );
}

/**
 * S2. Ficha técnica: medidas y características en una sola ficha (tarjeta
 * crema sobre papel liso). Las cifras arriba y las características debajo,
 * en celdas separadas por líneas finas: la rejilla tiene un hueco de 1 px y
 * el fondo arena de la tarjeta se ve entre las celdas.
 */
export function CasetasSpecs() {
  const s = casetasSpecs;
  return (
    <>
      <Section surface="paper" spacing={false} aria-labelledby="ficha-titulo" className="border-t border-sand">
        <div className="container-site pt-[var(--section-y)] pb-[clamp(72px,9vw,136px)]">
          <Label>{s.label}</Label>
          <Heading id="ficha-titulo" className="mt-6">
            {s.title}
          </Heading>

          <div
            className="mt-[clamp(40px,5vw,72px)] grid gap-px overflow-hidden rounded-sm border border-sand bg-sand"
            data-reveal="fade"
          >
            {/* Medidas: cifras grandes */}
            <dl className="grid grid-cols-2 gap-px lg:grid-cols-4">
              {s.dimensions.map((d, i) => {
                const delay = { ['--reveal-delay' as string]: `${i * 0.08}s` };
                return (
                  // dt y dd hijos directos del div (lo exige <dl>). La cifra va abajo: si un
                  // término ocupa dos líneas, las cifras de la fila siguen alineadas
                  <div key={d.id} className="flex flex-col bg-cream p-[clamp(18px,2.6vw,40px)]">
                    <dt
                      className="flex items-center gap-3 text-[0.9375rem] leading-snug font-medium text-charcoal"
                      data-reveal
                      style={delay}
                    >
                      <DimensionGlyph id={d.id} />
                      <span>{d.term}</span>
                    </dt>
                    <dd
                      className="tabular mt-auto pt-[clamp(20px,3vw,40px)] font-display text-[clamp(2.75rem,9vw,4.5rem)] leading-[0.9] tracking-[-0.04em] whitespace-nowrap text-ink lg:text-[clamp(4rem,6.4vw,6.5rem)]"
                      data-reveal
                      style={delay}
                    >
                      {d.value}
                      <span aria-hidden="true" className="ml-[0.08em] text-[0.36em] tracking-normal text-wood-dark">
                        {d.unit}
                      </span>
                      <span className="sr-only"> {d.spoken}</span>
                    </dd>
                  </div>
                );
              })}
            </dl>

            {/* Características: icono, término y valor */}
            <dl
              aria-label={s.featuresTitle}
              className="grid grid-cols-1 gap-px min-[22.5rem]:grid-cols-2 lg:grid-cols-3"
            >
              {s.features.map((f) => {
                const Icon = FEATURE_ICONS[f.id] ?? Package;
                return (
                  // dt y dd hijos directos del div (lo exige <dl>): el icono va dentro del dt
                  <div key={f.id} className="bg-cream px-[clamp(18px,2.6vw,40px)] py-[clamp(18px,2.2vw,32px)]">
                    <dt className="flex items-center gap-3 text-[0.875rem] text-stone">
                      <Icon aria-hidden="true" strokeWidth={1.25} className="size-6 shrink-0 text-wood-dark" />
                      <span>{f.term}</span>
                    </dt>
                    <dd className="mt-3 text-[1rem] leading-snug font-medium text-ink sm:text-[1.0625rem]">
                      {noOrphans(f.value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {site.features.techSheet ? (
            <a href={s.download.href} className="link-underline mt-10" download>
              <Download aria-hidden="true" strokeWidth={1.5} className="size-[18px]" />
              {s.download.label}
            </a>
          ) : null}
        </div>
      </Section>

      {/* Planos acotados: crema liso, planos en tarjetas blancas */}
      <Section surface="cream" spacing={false} aria-labelledby="planos-titulo" className="border-t border-sand">
        <div className="container-site pt-[clamp(72px,9vw,136px)] pb-[var(--section-y)]">
          {/* Una columna: título, nota y planos. Dos: la nota ocupa el hueco junto a la planta.
              Tres: la nota va arriba a la derecha, a la altura del título */}
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            <Heading id="planos-titulo" size="h3" className="md:col-span-2 lg:self-end">
              {s.plansTitle}
            </Heading>
            <p className="flex max-w-[30rem] items-start gap-3 self-start rounded-sm border border-wood-light/60 bg-paper px-4 py-3 text-[0.9375rem] leading-relaxed text-charcoal md:order-last md:self-center lg:order-none lg:col-start-3 lg:row-start-1 lg:max-w-none lg:self-end">
              <Info aria-hidden="true" strokeWidth={1.5} className="mt-[3px] size-[18px] shrink-0 text-wood-dark" />
              <span>{noOrphans(s.plansNote)}</span>
            </p>
            <PlanFigure title={s.plans[0].title}>
              <FrontElevation />
            </PlanFigure>
            <PlanFigure title={s.plans[1].title} delay="0.1s">
              <SideElevation />
            </PlanFigure>
            <PlanFigure title={s.plans[2].title} delay="0.2s">
              <FloorPlan />
            </PlanFigure>
          </div>
        </div>
      </Section>
    </>
  );
}
