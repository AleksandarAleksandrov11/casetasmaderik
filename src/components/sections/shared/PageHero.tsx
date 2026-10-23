import Image from 'next/image';
import type { ReactNode } from 'react';
import { blurFor } from '@/content/image-blur';
import { photoSizes } from '@/lib/photo-sizes';
import { noOrphans } from '@/lib/typography';

/**
 * Ancho al que se dibuja la foto, con tope de 2x (es contenido, sin overlay).
 * Por debajo de lg, el ancho de la pantalla menos los márgenes, sin pasar de
 * 880 px: la foto de la caseta mide 682 px y así no se amplía más de 1,3x. En
 * lg, la caja ocupa 5 de 12 columnas (un 40 % del contenedor, como mucho unos
 * 580 px) y la foto cuadrada la cubre a lo ancho.
 */
const HERO_SIZES = photoSizes(
  [
    ['(max-width: 1023px)', 'min(calc(100vw - 40px), 880px)'],
    [null, 'min(40vw, 600px)'],
  ],
  2,
);

type PageHeroProps = {
  /** H1 de la página, con su palabra clave */
  title: string;
  text: string;
  /** Foto del hero: es la imagen LCP y se pide con prioridad alta */
  image: { src: string; alt: string };
  /** Punto de la foto que queda a la vista al recortar, como object-position */
  focus?: string;
  /** Acciones bajo la entradilla (botones o enlaces) */
  children?: ReactNode;
};

/**
 * Hero de las páginas interiores: título arriba, junto al header, y foto de
 * tamaño contenido. En escritorio, título y entradilla a la izquierda (7
 * columnas) y la foto a la derecha (5); por debajo de lg, la foto va en una
 * banda bajo el texto. Sin migas ni etiqueta sobre el H1.
 */
export function PageHero({ title, text, image, focus = '50% 50%', children }: PageHeroProps) {
  return (
    <section
      data-header="light"
      data-surface="light"
      className="relative bg-cream pt-[calc(var(--header-h)+clamp(16px,3vw,48px))] pb-[clamp(56px,8vw,128px)]"
    >
      <div className="container-site grid-site items-center gap-y-10 md:gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:pr-[clamp(0px,3vw,48px)]">
          <h1 className="text-h1 max-w-[16ch]">{noOrphans(title)}</h1>
          <p className="text-lead mt-6 max-w-[44ch] text-stone md:mt-8">{noOrphans(text)}</p>
          {children ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5 md:mt-10">{children}</div>
          ) : null}
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-5">
          <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-paper max-lg:max-w-[880px] lg:aspect-[5/4] max-lg:landscape:aspect-[21/9]">
            <Image
              src={image.src}
              {...blurFor(image.src)}
              alt={image.alt}
              fill
              sizes={HERO_SIZES}
              quality={75}
              // Como recomienda Next 16 para la imagen LCP: eager y fetchPriority alta
              loading="eager"
              fetchPriority="high"
              style={{ objectPosition: focus }}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
