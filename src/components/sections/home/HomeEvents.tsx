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
    <Section surface="cream" spacing={false} className="overflow-clip" aria-labelledby="eventos-titulo">
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
          <li
            key={card.slug}
            data-rail-item
            className="w-[78vw] max-w-[420px] flex-none snap-start sm:w-[44vw] lg:w-[min(28vw,440px)]"
          >
            <Link href={`/contacto?evento=${card.slug}`} className="group/card block rounded-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-paper">
                <Image
                  src={card.image}
                  {...blurFor(card.image)}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1024px) 440px, (min-width: 640px) 44vw, 78vw"
                  quality={75}
                  className="object-cover transition-transform duration-[1200ms] ease-brand group-hover/card:scale-[1.04]"
                />
                <span className="tabular absolute top-4 left-4 font-display text-[0.875rem] tracking-[0.08em] text-cream/90">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <h3 className="text-h3">{card.title}</h3>
                <ArrowUpRight
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mt-1 size-6 flex-none text-wood transition-transform duration-500 ease-brand group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
                />
              </div>
              <p className="mt-2 max-w-[36ch] text-stone">{card.text}</p>
              <span className="sr-only">Pedir presupuesto para este tipo de evento</span>
            </Link>
          </li>
        ))}
      </HorizontalRail>
    </Section>
  );
}
