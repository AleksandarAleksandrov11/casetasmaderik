/** Formatos cortos en español para el resumen del formulario. */
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'] as const;

type Parts = { y: number; m: number; d: number };

function parts(date: string): Parts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

/**
 * Rango de fechas compacto: "12 dic", "12 al 24 dic", "28 nov al 6 dic" o
 * "28 dic 2026 al 3 ene 2027". El año solo aparece si no es el actual o si el
 * rango cambia de año.
 */
export function formatDateRange(start: string, end?: string, currentYear: number = new Date().getFullYear()): string {
  const a = parts(start);
  if (!a) return '';
  const b = end ? parts(end) : null;
  const month = (p: Parts) => MONTHS[p.m - 1];
  if (!b || (a.y === b.y && a.m === b.m && a.d === b.d)) {
    return `${a.d} ${month(a)}${a.y !== currentYear ? ` ${a.y}` : ''}`;
  }
  if (a.y !== b.y) return `${a.d} ${month(a)} ${a.y} al ${b.d} ${month(b)} ${b.y}`;
  const year = a.y !== currentYear ? ` ${a.y}` : '';
  if (a.m === b.m) return `${a.d} al ${b.d} ${month(a)}${year}`;
  return `${a.d} ${month(a)} al ${b.d} ${month(b)}${year}`;
}

export function casetasLabel(n: number): string {
  return n === 1 ? '1 caseta' : `${n.toLocaleString('es-ES')} casetas`;
}

export function daysLabel(n: number): string {
  return n === 1 ? '1 día' : `${n.toLocaleString('es-ES')} días`;
}

/** Primer nombre para el saludo de la pantalla de éxito. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
