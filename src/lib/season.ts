/**
 * Temporada navideña: del 15 de septiembre al 15 de diciembre (ambos
 * incluidos), calculado con la fecha de Madrid.
 */
export type Season = 'navidad' | 'general';

export const SEASON_START = { month: 9, day: 15 } as const;
export const SEASON_END = { month: 12, day: 15 } as const;

/** Mes (1 a 12) y día en la zona horaria de Madrid. */
export function madridMonthDay(date: Date): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  return { month, day };
}

export function getSeason(date: Date): Season {
  const { month, day } = madridMonthDay(date);
  const value = month * 100 + day;
  const start = SEASON_START.month * 100 + SEASON_START.day;
  const end = SEASON_END.month * 100 + SEASON_END.day;
  return value >= start && value <= end ? 'navidad' : 'general';
}

export function isChristmasSeason(date: Date): boolean {
  return getSeason(date) === 'navidad';
}
