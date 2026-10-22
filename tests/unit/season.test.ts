import { describe, expect, it } from 'vitest';
import { getSeason, isChristmasSeason } from '@/lib/season';

const madrid = (iso: string) => new Date(iso);

describe('temporada navideña (15 sep a 15 dic, hora de Madrid)', () => {
  it('fuera de temporada el 14 de septiembre', () => {
    expect(getSeason(madrid('2026-09-14T12:00:00+02:00'))).toBe('general');
  });
  it('empieza el 15 de septiembre a medianoche en Madrid', () => {
    expect(getSeason(madrid('2026-09-15T00:00:00+02:00'))).toBe('navidad');
    // 14 sep a las 23:30 en UTC ya es 15 sep en Madrid
    expect(getSeason(new Date('2026-09-14T22:30:00Z'))).toBe('navidad');
  });
  it('dentro de temporada en octubre y noviembre', () => {
    expect(isChristmasSeason(madrid('2026-10-20T10:00:00+02:00'))).toBe(true);
    expect(isChristmasSeason(madrid('2026-11-30T10:00:00+01:00'))).toBe(true);
  });
  it('incluye el 15 de diciembre y termina el 16', () => {
    expect(getSeason(madrid('2026-12-15T23:59:00+01:00'))).toBe('navidad');
    expect(getSeason(madrid('2026-12-16T00:00:00+01:00'))).toBe('general');
  });
  it('fuera de temporada en primavera y verano', () => {
    expect(getSeason(madrid('2027-03-01T12:00:00+01:00'))).toBe('general');
    expect(getSeason(madrid('2027-08-31T12:00:00+02:00'))).toBe('general');
  });
});
