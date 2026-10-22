import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { homeEvents } from '@/content/home';
import { HorizontalRail } from './HorizontalRail';

/** S3. Eventos: tarjetas en scroll horizontal fijado (escritorio) o carrusel (móvil). */
export function HomeEvents() {
  const e = homeEvents;
  return (
    <Section
      surface="cream"
      spacing={false}
      // Fuera de la sección fijada: el aire que le falta hasta --section-y (el pin no cambia), menos el
      // hueco que ya deja el centrado en pantallas altas (--rail-free, lo mide HorizontalRail)
      className="overflow-clip lg:pt-[max(0px,calc(var(--section-y)-clamp(56px,9svh,128px)-var(--rail-free,0px)))] lg:pb-[max(0px,calc(var(--section-y)-clamp(32px,6svh,96px)-var(--rail-free,0px)))]"
      aria-labelledby="eventos-titulo"
    >
      <HorizontalRail
        header={
          <div className="container-site flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Label>{e.label}</Label>
              <Heading id="eventos-titulo" className="mt-6">
                {e.title}
              </Heading>
            </div>
            <p className="text-lead max-w-[34ch] text-stone" data-reveal>
              {e.intro}
            </p>
          </div>
        }
      >
        {e.cards.map((card, i) => (
          // Subrejilla: todas las fotos comparten fila (mismo alto) y los pies arrancan a la misma
          // altura aunque un título ocupe dos líneas. En escritorio encajado (ver HorizontalRail)
          // la fila de la foto cede alto para que todo quepa en pantalla, y el ancho de la tarjeta
          // sale del alto disponible (100cqh menos el pie, unos 7,5rem) para que la foto se quede en
          // torno a 5:4 apaisada como mucho. En móvil en horizontal, el mismo tope con el alto de la
          // ventana (la foto mide como mucho 100svh menos 9rem).
          <li
            key={card.slug}
            data-rail-item
            className="row-span-2 grid w-[78vw] max-w-[min(420px,calc((100svh-9rem)*1.25))] snap-start grid-rows-subgrid sm:w-[40vw] lg:w-[26vw] rail-fit:w-[min(26vw,420px,calc((100cqh-7.5rem)*1.25))]"
          >
            <Link
              href={`/contacto?evento=${card.slug}`}
              className="group/card row-span-2 grid grid-rows-subgrid rounded-sm"
            >
              <div
                data-rail-media
                className="relative aspect-[4/5] max-h-[calc(100svh-9rem)] min-h-0 self-stretch justify-self-stretch overflow-hidden rounded-sm bg-paper"
              >
                {/* Fotos recortadas a 4:5: la caja nunca es más vertical, así que el ancho servido es el de la caja */}
                <Image
                  src={card.image}
                  {...blurFor(card.image)}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1620px) 420px, (min-width: 1024px) 26vw, (min-width: 640px) 40vw, 78vw"
                  quality={75}
                  className="object-cover transition-transform duration-[1200ms] ease-brand group-hover/card:scale-[1.04]"
                  style={{ objectPosition: card.focus }}
                />
                {/* Velo para que el número llegue al AA (4,5:1) incluso sobre una lona blanca de la foto */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/85 via-ink/55 to-transparent" />
                <span className="tabular absolute top-4 left-4 font-display text-[0.875rem] tracking-[0.08em] text-cream">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              {/* En escritorio el título se ajusta al ancho de la tarjeta (cqw) para caber en una línea:
                  el pie más alto marca la fila de todos y así las fotos no pierden alto */}
              <div className="@container mt-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-h3 lg:text-[length:clamp(1.125rem,calc(8.4cqw-3.5px),var(--fs-h3))]">
                    {card.title}
                  </h3>
                  <ArrowUpRight
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="mt-1 size-6 flex-none text-wood transition-transform duration-500 ease-brand group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                  />
                </div>
                <p className="mt-2 max-w-[36ch] text-stone">{card.text}</p>
              </div>
              <span className="sr-only">Pedir presupuesto para este tipo de evento</span>
            </Link>
          </li>
        ))}
      </HorizontalRail>
    </Section>
  );
}
