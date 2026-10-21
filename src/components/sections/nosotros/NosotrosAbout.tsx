import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosAbout } from '@/content/nosotros';
import { CoverPhoto, photoSizes } from './CoverPhoto';

/**
 * Ancho al que se dibuja la foto 3:2. En 4:5 (móvil en vertical y lg) la foto
 * cubre la caja a 1,87 veces su ancho; en 3:2 (de sm a lg y móviles en
 * horizontal) basta con el ancho de la caja, que como mucho es 1,5 veces el 85 %
 * del alto de la pantalla. Tope de 2x: es la foto de contenido, sin overlay.
 */
const PHOTO_SIZES = photoSizes(
  [
    ['(max-width: 639px) and (orientation: portrait)', '172vw'],
    ['(max-width: 1023px)', 'min(92vw, 127.5vh)'],
    [null, 'min(85vw, 1320px)'],
  ],
  2,
);

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
          {/* 4:5 en móvil en vertical y en lg, junto al texto; apilada bajo lg, 3:2 desde sm y en cualquier
              móvil en horizontal. Bajo lg no pasa del 85 % del alto de la pantalla: en horizontal se
              estrecha sin perder la proporción */}
          <div
            data-reveal-image
            className="@container-size relative aspect-[4/5] overflow-hidden rounded-sm bg-paper max-lg:max-h-[85svh] sm:aspect-[3/2] lg:aspect-[4/5] max-lg:landscape:aspect-[3/2]"
          >
            <CoverPhoto image={a.image} sizes={PHOTO_SIZES} quality={75} />
          </div>
        </div>
      </div>
    </Section>
  );
}
