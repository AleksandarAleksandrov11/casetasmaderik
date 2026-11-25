import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { ButtonLink } from '@/components/ui/Button';
import { homeMesas } from '@/content/mesas';
import { noOrphans } from '@/lib/typography';

/** S2b. Mesas y bancos: el segundo producto, con foto real, dos cifras y enlace a su página. */
export function HomeMesas() {
  const m = homeMesas;
  return (
    <Section surface="paper" aria-labelledby="mesas-inicio-titulo">
      <div className="container-site grid-site items-center gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7 lg:row-start-1">
          <Label>{m.label}</Label>
          <Heading id="mesas-inicio-titulo" className="mt-6 max-w-[16ch]">
            {m.title}
          </Heading>
          <p className="text-lead mt-6 max-w-[44ch] text-stone" data-reveal>
            {noOrphans(m.text)}
          </p>
          <dl className="mt-10 grid max-w-[28rem] grid-cols-2 gap-x-8">
            {m.facts.map((f, i) => (
              <div
                key={f.label}
                className="flex flex-col-reverse justify-end border-t border-ink/15 pt-5"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}
              >
                <dt className="mt-2 text-[0.9375rem] text-stone">{f.label}</dt>
                <dd className="tabular flex items-baseline gap-2 font-display text-[clamp(2.5rem,2rem+2.4vw,4rem)] leading-none font-light tracking-[-0.03em]">
                  {f.value}
                  {f.unit ? <span className="text-[0.45em] text-wood">{f.unit}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-10" data-reveal>
            <ButtonLink href={m.link.href}>{m.link.label}</ButtonLink>
          </div>
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <div data-reveal-image className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand">
            <Image
              src={m.image.src}
              {...blurFor(m.image.src)}
              alt={m.image.alt}
              fill
              sizes="(min-width: 1540px) 584px, (min-width: 1024px) 38vw, 92vw"
              quality={80}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
