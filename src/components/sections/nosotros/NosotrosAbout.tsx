import Image from 'next/image';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosAbout } from '@/content/nosotros';

/** S2. Quiénes somos: texto y foto partidos. */
export function NosotrosAbout() {
  const a = nosotrosAbout;
  return (
    <Section surface="cream" aria-labelledby="quienes-titulo">
      <div className="container-site grid-site items-center gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <Label>{a.label}</Label>
          <Heading id="quienes-titulo" className="mt-6">
            {a.title}
          </Heading>
          <div className="mt-8 space-y-5 text-lead text-stone">
            {a.paragraphs.map((p, i) => (
              <p key={p} data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}>
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7">
          <div data-reveal-image className="relative aspect-[4/5] overflow-hidden rounded-sm bg-paper">
            <Image
              src={a.image.src}
              alt={a.image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 92vw"
              quality={75}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
