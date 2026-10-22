import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosSeason } from '@/content/nosotros';
import { CoverPhoto, photoSizes } from './CoverPhoto';

/**
 * Ancho al que se dibuja la foto: la banda mide lo que su contenido y la capa del
 * parallax un 24 % más, así que la foto 3:2 llega a 1,86 veces el alto de la
 * banda. En móvil son unos 1.500 px sea cual sea el ancho; desde sm crece con el
 * viewport hasta 1.760 px, y a partir de ahí manda el ancho. Tope de 1x: queda
 * bajo un overlay del 78 % (86 % por debajo de lg).
 */
const SEASON_SIZES = photoSizes(
  [
    ['(max-width: 639px)', '1600px'],
    [null, 'max(100vw, min(1760px, calc(700px + 68vw)))'],
  ],
  1,
);

/** S4. Temporada alta: oscuro con foto nocturna y línea temporal mínima. */
export function NosotrosSeason() {
  const s = nosotrosSeason;
  return (
    <Section surface="photo" spacing={false} className="overflow-hidden" aria-labelledby="temporada-titulo">
      <div className="absolute inset-0" aria-hidden="true">
        <div data-parallax className="@container-size absolute inset-x-0 -top-[12%] -bottom-[12%]">
          <CoverPhoto image={s.image} sizes={SEASON_SIZES} quality={70} focus={[50, 70]} />
        </div>
        {/* Más velo por debajo de lg, donde la foto se amplía y sus luces quedan detrás del texto */}
        <div className="absolute inset-0 bg-ink/86 lg:bg-ink/78" />
      </div>
      <div className="container-site relative py-[clamp(110px,14vw,220px)]">
        <div className="max-w-[48rem]">
          <Label>{s.label}</Label>
          <Heading id="temporada-titulo" className="mt-6">
            {s.title}
          </Heading>
          <p className="text-lead mt-6 max-w-[46ch] text-cream/85" data-reveal>
            {s.text}
          </p>
        </div>
        {/*
         * Línea temporal de octubre a diciembre. Desde sm, horizontal: octubre al
         * inicio, noviembre en el centro exacto y diciembre al final, con la línea
         * de punto a punto (nada después de diciembre). En móvil, vertical: un
         * tramo de cada punto al siguiente y ninguno tras el último.
         */}
        <ol
          data-draw-scope
          className="relative mt-16 grid gap-10 [--m:clamp(1.75rem,1.4rem+1.4vw,2.5rem)] sm:grid-cols-3 sm:gap-6 md:mt-24"
        >
          <span
            aria-hidden="true"
            className="absolute top-[5px] right-[5.5px] left-[5.5px] hidden h-px bg-mist/30 sm:block"
          >
            <span data-draw-line="x" className="block h-px w-full origin-left bg-wood-light" />
          </span>
          {s.timeline.map((t, i) => {
            const last = i === s.timeline.length - 1;
            const align =
              i === 0
                ? 'sm:items-start sm:text-left'
                : last
                  ? 'sm:items-end sm:text-right'
                  : 'sm:items-center sm:text-center';
            return (
              <li
                key={t.month}
                className={`relative grid grid-cols-[11px_1fr] gap-x-5 sm:flex sm:flex-col ${align}`}
                data-reveal
                style={{ ['--reveal-delay' as string]: `${i * 0.1}s` }}
              >
                {/* Tramo vertical (móvil) hasta el punto siguiente: del centro de este punto al centro del otro */}
                {!last ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-[calc(var(--m)/2)] -bottom-[calc(2.5rem+var(--m)/2)] left-[5px] w-px bg-wood-light/60 sm:hidden"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="relative size-[11px] self-center rounded-full bg-wood-light ring-4 ring-ink/60 sm:self-auto"
                />
                <p className="font-display text-(length:--m) leading-none sm:mt-8">{t.month}</p>
                {/* Crema al 80 % y no mist: sobre las luces de la foto, mist bajaba de 4,5:1 en móvil */}
                <p className="col-start-2 mt-3 text-cream/80">{t.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
