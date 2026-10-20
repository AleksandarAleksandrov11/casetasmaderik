/** Quita comentarios y espacios sobrantes (CSS escrito a mano, sin cadenas con espacios significativos). */
function minify(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

/**
 * Hoja de estilos en línea con React 19 (`<style href precedence>`): se sube
 * al <head>, no se duplica y no genera un CSS por ruta que el prefetch de los
 * enlaces precargue en otras páginas.
 */
export function InlineStyle({ id, css }: { id: string; css: string }) {
  return (
    <style href={id} precedence="medium">
      {minify(css)}
    </style>
  );
}
