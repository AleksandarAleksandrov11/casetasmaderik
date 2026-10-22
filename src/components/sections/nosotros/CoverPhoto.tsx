import Image from 'next/image';
import type { CSSProperties } from 'react';
import { blurFor } from '@/content/image-blur';

/** Tramo de sizes: media query (null en el último) y ancho al que se dibuja la foto en él. */
type SizeRule = readonly [media: string | null, width: string];

/** Tramos de densidad de pantalla: desde qué densidad y la densidad típica del tramo. */
const DENSITY_TIERS = [
  [2.5, 3],
  [2, 2],
  [1.5, 1.75],
] as const;

/**
 * Atributo sizes a partir del ancho dibujado y de una densidad máxima (píxeles
 * de archivo por píxel CSS). El navegador multiplica sizes por la densidad de la
 * pantalla y redondea al archivo siguiente; en los tramos más densos que el
 * tope, el ancho se divide por la densidad típica del tramo y se multiplica por
 * el tope, así un móvil a 3x no pide tres veces el ancho dibujado.
 */
export function photoSizes(rules: readonly SizeRule[], maxDensity: number): string {
  const tiers = DENSITY_TIERS.filter(([, typical]) => typical > maxDensity);
  return rules
    .flatMap(([media, width]) => [
      ...tiers.map(([from, typical]) => {
        const query = `(min-resolution: ${from}dppx)`;
        return `${media ? `${media} and ${query}` : query} calc(${width} * ${+(maxDensity / typical).toFixed(3)})`;
      }),
      media ? `${media} ${width}` : width,
    ])
    .join(', ');
}

type CoverPhotoProps = {
  image: { src: string; width: number; height: number; alt: string };
  sizes: string;
  quality: number;
  /** Punto de la foto que queda a la vista al recortar, como object-position (en %) */
  focus?: readonly [x: number, y: number];
  /** Imagen LCP (hero): se pide enseguida y con prioridad alta */
  lcp?: boolean;
};

/**
 * Foto que cubre su caja como object-cover, pero con el <img> del tamaño al que
 * se dibuja de verdad: el ancho de la caja o su alto por la proporción de la foto,
 * lo que sea mayor, y desplazado hasta el punto de foco. Así sizes describe el
 * ancho real del elemento y las auditorías de tamaño de imagen miden lo que se
 * ve, no la caja recortada. La caja es el padre: tiene que ser un contenedor de
 * tamaño (@container-size) y recortar lo que sobra, él o un antepasado. La
 * proporción va fija en CSS porque cada archivo redimensionado redondea su alto
 * y, con el suyo, la foto quedaría a medio píxel de cubrir la caja.
 */
export function CoverPhoto({ image, sizes, quality, focus = [50, 50], lcp = false }: CoverPhotoProps) {
  const vars = {
    '--cover-x': `${focus[0]}%`,
    '--cover-y': `${focus[1]}%`,
    '--cover-ratio': image.width / image.height,
  } as CSSProperties;
  return (
    <Image
      src={image.src}
      {...blurFor(image.src)}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      quality={quality}
      // Como recomienda Next 16 para la imagen LCP: eager y fetchPriority alta, sin <link preload>
      // (el preload salía con prioridad baja)
      {...(lcp ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
      style={vars}
      className="absolute top-(--cover-y) left-(--cover-x) aspect-(--cover-ratio) h-auto w-[max(100cqw,calc(100cqh*var(--cover-ratio)))] max-w-none -translate-x-(--cover-x) -translate-y-(--cover-y) object-cover"
    />
  );
}
