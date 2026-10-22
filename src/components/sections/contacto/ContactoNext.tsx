import Image from 'next/image';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { blurFor } from '@/content/image-blur';
import { contactoNext } from '@/content/contacto';
import { noOrphans } from '@/lib/typography';

/**
 * S3. Qué pasa después. Fondo papel. En escritorio, foto real de la caseta a
 * la izquierda (5 columnas) y a la derecha el título y los tres pasos en una
 * línea de tiempo vertical: la línea une los círculos 1, 2 y 3 y termina en el
 * 3. En móvil y tablet, título, foto y pasos, en ese orden.
 */
export function ContactoNext() {
  const n = contactoNext;
  return (
    <Section surface="paper" aria-labelledby="despues-titulo">
      <div className="container-site grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-[clamp(32px,4vw,72px)] lg:gap-y-14">
        <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:pt-2">
          <Label>{n.label}</Label>
          <Heading id="despues-titulo" className="mt-6 max-w-[14ch]">
            {n.title}
          </Heading>
        </div>

        <div data-reveal-image className="relative lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand lg:aspect-auto lg:h-full lg:min-h-[34rem]">
            <Image
              src={n.image.src}
              {...blurFor(n.image.src)}
              alt={n.image.alt}
              fill
              sizes="(min-width: 1440px) 560px, (min-width: 1024px) 40vw, 100vw"
              quality={75}
              className="object-cover"
            />
          </div>
        </div>

        <ol className="lg:col-span-6 lg:col-start-7 lg:row-start-2">
          {n.steps.map((s, i) => {
            const last = i === n.steps.length - 1;
            return (
              <li
                key={s.n}
                className={`relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 sm:gap-x-7 ${last ? '' : 'pb-10 sm:pb-12'}`}
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 0.12}s` }}
              >
                {/* Tramo de línea hasta el círculo siguiente: el último paso no tiene, la línea acaba en el 3 */}
                {last ? null : (
                  <span
                    aria-hidden="true"
                    className="absolute top-12 bottom-0 left-6 w-px -translate-x-1/2 bg-wood/35"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="tabular relative flex size-12 items-center justify-center rounded-full border border-wood bg-cream font-display text-[1.0625rem] text-wood-dark"
                >
                  {i + 1}
                </span>
                <div className="pt-2.5">
                  <h3 className="text-h3">
                    <span className="sr-only">Paso {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-[40ch] text-stone">{noOrphans(s.text)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
