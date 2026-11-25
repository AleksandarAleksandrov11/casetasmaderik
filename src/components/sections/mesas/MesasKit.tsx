import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { mesasKit } from '@/content/mesas';
import { noOrphans } from '@/lib/typography';

/**
 * S2. El kit: qué incluye y sus datos, con la foto del kit montado, tres
 * detalles (tablero, patas y cantos) y el kit plegado.
 */
export function MesasKit() {
  const k = mesasKit;
  return (
    <Section surface="paper" aria-labelledby="kit-titulo">
      <div className="container-site grid-site gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <Label>{k.label}</Label>
          <Heading id="kit-titulo" className="mt-6 max-w-[14ch]">
            {k.title}
          </Heading>
          <p className="text-lead mt-6 max-w-[44ch] text-stone" data-reveal>
            {noOrphans(k.text)}
          </p>
          <dl className="mt-12 grid gap-x-10 sm:grid-cols-2">
            {k.facts.map((f, i) => (
              <div
                key={f.id}
                className="border-t border-ink/15 py-5"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 0.06}s` }}
              >
                <dt className="text-[0.75rem] font-semibold tracking-[0.14em] text-stone uppercase">{f.term}</dt>
                <dd className="mt-2 font-display text-[1.375rem] leading-tight">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8">
          <div data-reveal-image className="relative aspect-square overflow-hidden rounded-sm bg-sand">
            <Image
              src={k.photo.src}
              {...blurFor(k.photo.src)}
              alt={k.photo.alt}
              width={k.photo.width}
              height={k.photo.height}
              sizes="(min-width: 1540px) 584px, (min-width: 1024px) 38vw, 92vw"
              quality={80}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <ul className="col-span-4 grid grid-cols-3 gap-3 sm:gap-5 md:col-span-6 lg:col-span-6">
          {k.details.map((d, i) => (
            <li key={d.src} data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}>
              <figure>
                <div className="relative aspect-square overflow-hidden rounded-sm bg-sand">
                  <Image
                    src={d.src}
                    {...blurFor(d.src)}
                    alt={d.alt}
                    fill
                    sizes="(min-width: 1024px) 200px, 30vw"
                    quality={80}
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-[0.875rem] leading-snug text-stone">{d.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <figure className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8" data-reveal>
          <div className="relative aspect-[835/409] overflow-hidden rounded-sm bg-sand">
            <Image
              src={k.folded.src}
              {...blurFor(k.folded.src)}
              alt={k.folded.alt}
              fill
              sizes="(min-width: 1540px) 584px, (min-width: 1024px) 38vw, 92vw"
              quality={80}
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-[0.875rem] leading-snug text-stone">{k.folded.caption}</figcaption>
        </figure>
      </div>
    </Section>
  );
}
