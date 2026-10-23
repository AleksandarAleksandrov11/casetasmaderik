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
      <div className="flex flex-1 items-center rounded-sm border border-sand bg-cream p-[clamp(14px,1.6vw,24px)] shadow-[0_1px_0_rgb(14_22_21/0.04)]">
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
 * S2. Ficha técnica en tres bloques, cada uno con su fondo: medidas (papel
 * con veta de madera), características (degradado cálido) y planos acotados
 * (cuadrícula de plano técnico). Las texturas son CSS y SVG en línea.
 */
export function CasetasSpecs() {
  const s = casetasSpecs;
  return (
    <Section surface="paper" spacing={false} aria-labelledby="medidas-titulo" className="border-t border-sand">
      {/* 1. Medidas: cifras grandes */}
      <div className="specs-grain pt-[var(--section-y)] pb-[clamp(64px,8vw,120px)]">
        <div className="container-site">
          <Label>{s.label}</Label>
          <Heading id="medidas-titulo" className="mt-6">
            {s.title}
          </Heading>
          <dl className="mt-[clamp(48px,6vw,88px)] grid grid-cols-2 gap-x-[clamp(16px,2vw,32px)] gap-y-10 lg:grid-cols-4">
            {s.dimensions.map((d, i) => (
              <div
                key={d.id}
                className="flex flex-col border-t border-ink/15 pt-5"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}
              >
                <dt className="flex items-center gap-3 text-[0.9375rem] font-medium text-charcoal">
                  <DimensionGlyph id={d.id} />
                  <span>{d.term}</span>
                </dt>
                <dd className="tabular mt-6 font-display text-[clamp(3.25rem,7.4vw,7.5rem)] leading-[0.9] tracking-[-0.04em] text-ink">
                  {d.value}
                  <span aria-hidden="true" className="ml-[0.08em] text-[0.36em] tracking-normal text-wood-dark">
                    {d.unit}
                  </span>
                  <span className="sr-only"> {d.spoken}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* 2. Características */}
      <div className="specs-warm border-t border-sand py-[clamp(64px,8vw,120px)]">
        <div className="container-site grid-site gap-y-10">
          <h3 className="text-h3 col-span-4 md:col-span-6 lg:col-span-3">{s.featuresTitle}</h3>
          <dl className="col-span-4 grid gap-x-[clamp(16px,2vw,32px)] sm:grid-cols-2 md:col-span-6 lg:col-span-9 lg:grid-cols-3">
            {s.features.map((f) => {
              const Icon = FEATURE_ICONS[f.id] ?? Package;
              return (
                // dt y dd hijos directos del div (lo exige <dl>): el icono va dentro del dt
                // y el dd se alinea con el texto (24 px de icono + 16 px de hueco)
                <div key={f.id} className="border-t border-ink/12 py-6">
                  <dt className="flex items-center gap-4 text-[0.875rem] text-stone">
                    <Icon aria-hidden="true" strokeWidth={1.25} className="size-6 shrink-0 text-wood-dark" />
                    <span>{f.term}</span>
                  </dt>
                  <dd className="mt-1 pl-10 text-[1.0625rem] leading-snug font-medium text-ink">{f.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      {/* 3. Planos acotados sobre cuadrícula de plano técnico */}
      <div className="specs-blueprint border-t border-sand pt-[clamp(64px,8vw,120px)] pb-[var(--section-y)]">
        <div className="container-site">
          {/* Una columna: título, nota y planos. Dos: la nota ocupa el hueco junto a la planta.
              Tres: la nota va arriba a la derecha, a la altura del título */}
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            <h3 className="text-h3 md:col-span-2 lg:self-end">{s.plansTitle}</h3>
            <p className="flex max-w-[30rem] items-start gap-3 self-start rounded-sm border border-wood-light/60 bg-cream px-4 py-3 text-[0.9375rem] leading-relaxed text-charcoal md:order-last md:self-center lg:order-none lg:col-start-3 lg:row-start-1 lg:max-w-none lg:self-end">
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
          {site.features.techSheet ? (
            <a href={s.download.href} className="link-underline mt-12" download>
              <Download aria-hidden="true" strokeWidth={1.5} className="size-[18px]" />
              {s.download.label}
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
