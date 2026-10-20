import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosAbout } from '@/content/nosotros';

/**
 * Ancho al que se dibuja la foto 3:2, no el de la caja. En 4:5 (móvil y lg)
 * object-cover la escala a 1,87 veces el ancho de la caja; entre sm y lg la
 * caja es 3:2, como la foto, y basta con su ancho.
 */
const PHOTO_SIZES = '(min-width: 1552px) 1320px, (min-width: 1024px) 85vw, (min-width: 640px) 92vw, 172vw';

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
          <div className="text-lead mt-8 max-w-[46ch] space-y-5 text-stone">
            {a.paragraphs.map((p, i) => (
              <p key={p} data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}>
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7">
          {/* 4:5 en móvil y en lg, junto al texto; apilada entre sm y lg, 3:2. Bajo lg no pasa del 85 % del
              alto de la pantalla: en un móvil en horizontal se estrecha sin perder la proporción */}
          <div
            data-reveal-image
            className="relative aspect-[4/5] overflow-hidden rounded-sm bg-paper max-lg:max-h-[85svh] sm:aspect-[3/2] lg:aspect-[4/5]"
          >
            <Image
              src={a.image.src}
              {...blurFor(a.image.src)}
              alt={a.image.alt}
              fill
              sizes={PHOTO_SIZES}
              quality={75}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
