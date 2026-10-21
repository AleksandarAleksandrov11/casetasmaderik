import { describe, expect, it } from 'vitest';
import { noOrphans } from '@/lib/typography';

describe('noOrphans', () => {
  it('une las palabras de una letra a la siguiente', () => {
    expect(noOrphans('llámanos o escríbenos')).toBe('llámanos o escríbenos');
    expect(noOrphans('fechas, lugar y disponibilidad')).toBe('fechas, lugar y disponibilidad');
  });

  it('encadena varias seguidas', () => {
    expect(noOrphans('(RGPD) y a la Ley')).toBe('(RGPD) y a la Ley');
  });

  it('no toca letras dentro de palabras ni el final del texto', () => {
    expect(noOrphans('casa a')).toBe('casa a');
    expect(noOrphans('Casetas Maderik')).toBe('Casetas Maderik');
    expect(noOrphans('¿O prefieres llamar?')).toBe('¿O prefieres llamar?');
  });
});
