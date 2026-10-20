import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosSeason } from '@/content/nosotros';

/** S4. Temporada alta: oscuro con foto nocturna y línea temporal mínima. */
export function NosotrosSeason() {
  const s = nosotrosSeason;
  return (
    <Section surface="photo" spacing={false} className="overflow-hidden" aria-labelledby="temporada-titulo">
      <div className="absolute inset-0" aria-hidden="true">
        <div data-parallax className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
          <Image src={s.image.src} {...blurFor(s.image.src)} alt="" fill sizes="100vw" quality={70} className="object-cover object-[50%_70%]" />
        </div>
        <div className="absolute inset-0 bg-ink/78" />
      </div>
      <div className="container-site relative py-[clamp(110px,14vw,220px)]">
        <div className="max-w-[48rem]">
          <Label>{s.label}</Label>
          <Heading id="temporada-titulo" className="mt-6">
            {s.title}
          </Heading>
          <p className="mt-6 max-w-[46ch] text-lead text-cream/85" data-reveal>
            {s.text}
          </p>
        </div>
        <ol data-draw-scope className="relative mt-16 grid gap-10 sm:grid-cols-3 md:mt-24">
          <span aria-hidden="true" className="absolute top-[5px] right-0 left-0 hidden h-px bg-mist/30 sm:block">
            <span data-draw-line="x" className="block h-px w-full origin-left bg-wood-light" />
          </span>
          {s.timeline.map((t, i) => (
            <li key={t.month} className="relative sm:pt-10" data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.1}s` }}>
              <span aria-hidden="true" className="absolute top-0 left-0 hidden size-[11px] rounded-full bg-wood-light sm:block" />
              <p className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-none">{t.month}</p>
              <p className="mt-3 text-mist">{t.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
