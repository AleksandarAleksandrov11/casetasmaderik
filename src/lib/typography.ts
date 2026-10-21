/**
 * Composición en español: una palabra de una letra (y, o, e, u, a) no se queda
 * sola al final de una línea; se une a la siguiente con un espacio de no
 * separación. Solo para texto que se ve en pantalla (no para metadatos,
 * JSON-LD ni atributos). Sin lookbehind en la expresión regular: también se
 * ejecuta en el navegador y Safari no lo admite antes de la 16.4.
 */
const ONE_LETTER = /^[(¿¡"“]*[aeouyAEOUY]$/;

export function noOrphans(text: string): string {
  // Palabras en las posiciones pares y espacios en las impares
  const parts = text.split(/(\s+)/);
  for (let i = 0; i + 2 < parts.length; i += 2) {
    if (ONE_LETTER.test(parts[i]) && parts[i + 2] !== '') parts[i + 1] = ' ';
  }
  return parts.join('');
}
