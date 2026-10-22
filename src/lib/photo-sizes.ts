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
