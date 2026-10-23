import Image from 'next/image';
import { QuoteFormIsland } from '@/components/form/QuoteFormIsland';
import { QuoteFormStatic } from '@/components/form/QuoteFormStatic';
import { blurFor } from '@/content/image-blur';
import { contactoHero } from '@/content/contacto';
import { noOrphans } from '@/lib/typography';

/**
 * S1. Fondo papel. En escritorio, título, entradilla y una foto real de la
 * caseta a la izquierda (5 columnas, fija al hacer scroll mientras se rellena
 * el formulario) y el formulario como protagonista a la derecha (7 columnas).
 * En móvil y tablet, título y entradilla y justo debajo el formulario; la foto
 * se queda para escritorio, donde acompaña sin empujar el formulario hacia abajo.
 */
export function ContactoHero() {
  const h = contactoHero;
  return (
    <section
      data-header="light"
      className="relative bg-paper pt-[calc(var(--header-h)+20px)] pb-[clamp(72px,9vw,128px)] lg:pt-[calc(var(--header-h)+40px)]"
    >
      <div className="container-site">
        <div className="grid grid-cols-1 gap-x-[clamp(32px,4vw,72px)] gap-y-8 lg:grid-cols-12 max-lg:low-landscape:gap-y-6">
          <div className="@container lg:sticky lg:top-[calc(var(--header-h-compact)+24px)] lg:col-span-5 lg:self-start">
            {/*
             * Tamaño de H1 de las páginas interiores con tope relativo a la
             * columna (11cqi): "presupuesto" cabe siempre en su línea y el
             * título no pasa de tres líneas en la columna de escritorio.
             */}
            <h1 className="text-h1 max-w-[14ch] text-[length:min(var(--fs-h1),11cqi)] text-balance max-lg:text-[length:min(var(--fs-h1),12.5cqi)] max-lg:low-landscape:max-w-none max-lg:low-landscape:text-[length:clamp(calc(var(--fs-h2)*1.04),6cqi,var(--fs-h1))]">
              {noOrphans(h.title)}
            </h1>
            <p className="text-lead mt-5 max-w-[38ch] text-stone lg:mt-6 max-lg:low-landscape:max-w-none">{h.text}</p>
            <figure className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-sm bg-sand lg:block xl:aspect-[5/4]">
              <Image
                src={h.image.src}
                {...blurFor(h.image.src)}
                alt={h.image.alt}
                fill
                sizes="(min-width: 1440px) 560px, 40vw"
                quality={75}
                className="object-cover object-[50%_60%]"
              />
              <figcaption className="absolute bottom-4 left-4 rounded-xs bg-cream/92 px-3 py-1.5 text-[0.8125rem] font-semibold text-ink backdrop-blur-sm">
                {h.caption}
              </figcaption>
            </figure>
          </div>
          <div id="formulario" className="scroll-mt-24 lg:col-span-7">
            <QuoteFormIsland>
              <QuoteFormStatic />
            </QuoteFormIsland>
          </div>
        </div>
      </div>
    </section>
  );
}
