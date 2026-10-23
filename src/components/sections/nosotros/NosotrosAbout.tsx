import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosAbout } from '@/content/nosotros';

/** S2. Quiénes somos: texto a la izquierda y el logo de la marca en un panel crema. */
export function NosotrosAbout() {
  const a = nosotrosAbout;
  return (
    <Section surface="paper" aria-labelledby="quienes-titulo">
      <div className="container-site grid-site items-center gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-6">
          <Label>{a.label}</Label>
          <Heading id="quienes-titulo" className="mt-6">
            {a.title}
          </Heading>
          <div className="text-lead mt-8 max-w-[46ch] space-y-5 text-stone">
            {a.paragraphs.map((p, i) => (
              <p key={p} data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}>
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="col-span-4 md:col-span-4 md:col-start-2 lg:col-span-5 lg:col-start-8">
          <div
            data-reveal
            className="flex aspect-[4/3] items-center justify-center rounded-sm border border-sand bg-cream lg:aspect-[1/1]"
          >
            {/* SVG del logo apilado (isotipo y nombre): ligero y nítido a cualquier tamaño */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.logo.src}
              width={a.logo.width}
              height={a.logo.height}
              alt={a.logo.alt}
              loading="lazy"
              decoding="async"
              className="h-auto w-[46%] max-w-[260px]"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
