import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { DoorOpen, FoldHorizontal, TreePine, Umbrella } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { TextLink } from '@/components/ui/TextLink';
import { homeCaseta } from '@/content/home';

const ICONS = { trees: TreePine, umbrella: Umbrella, door: DoorOpen, fold: FoldHorizontal } as const;

const fmt = (v: number, d: number) => v.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });

/** S2. La caseta: cifras que cuentan, características y foto real. */
export function HomeCaseta() {
  const c = homeCaseta;
  return (
    <Section surface="dark" aria-labelledby="la-caseta-titulo">
      <div className="container-site grid-site gap-y-16">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <Label>{c.label}</Label>
          <Heading id="la-caseta-titulo" className="mt-6 max-w-[14ch]">
            {c.title}
          </Heading>

          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10">
            {c.figures.map((f, i) => (
              // En columna invertida, justify-end lleva la cifra arriba, pegada a su línea, aunque
              // la etiqueta de la celda vecina ocupe dos líneas
              <div
                key={f.label}
                className="flex flex-col-reverse justify-end border-t border-mist/25 pt-5"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}
              >
                <dt className="mt-3 text-[0.9375rem] text-mist">{f.label}</dt>
                <dd className="flex items-baseline gap-2 font-display leading-none font-light tracking-[-0.03em] text-cream">
                  {/* La cifra cuenta desde cero sobre una copia invisible del valor final: la caja
                      mide siempre lo mismo y la unidad no se mueve mientras cuenta */}
                  <span className="tabular grid text-[clamp(2.75rem,2rem+3.6vw,5.25rem)]">
                    <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                      {fmt(f.value, f.decimals)}
                    </span>
                    <span className="col-start-1 row-start-1" data-count={f.value} data-decimals={f.decimals}>
                      {fmt(f.value, f.decimals)}
                    </span>
                  </span>
                  {f.unit ? (
                    <span className="text-[clamp(1.25rem,1rem+1vw,1.75rem)] text-wood-light">{f.unit}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-14 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {c.features.map((f, i) => {
              const Icon = ICONS[f.icon as keyof typeof ICONS];
              return (
                <li
                  key={f.text}
                  className="flex items-center gap-4 text-cream/90"
                  data-reveal
                  style={{ ['--reveal-delay' as string]: `${0.1 + i * 0.06}s` }}
                >
                  <Icon aria-hidden="true" strokeWidth={1.5} className="size-6 flex-none text-wood-light" />
                  <span>{f.text}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4" data-reveal>
            <ButtonLink href={c.secondary.href} variant="light">
              {c.secondary.label}
            </ButtonLink>
            <TextLink href={c.primary.href}>{c.primary.label}</TextLink>
          </div>
        </div>

        <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8">
          <figure className="lg:sticky lg:top-[calc(var(--header-h-compact)+40px)] max-lg:short-landscape:max-w-[calc(100svh-6rem)]">
            <div data-reveal-image className="relative aspect-square overflow-hidden rounded-sm bg-charcoal">
              <Image
                src={c.image.src}
                {...blurFor(c.image.src)}
                alt={c.image.alt}
                width={682}
                height={682}
                sizes="(min-width: 1540px) 584px, (min-width: 1024px) 38vw, 92vw"
                quality={80}
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-4 text-[0.875rem] text-mist">
              Caseta de 2,90 × 2,00 m con las contraventanas abiertas.
            </figcaption>
          </figure>
        </div>
      </div>
    </Section>
  );
}
