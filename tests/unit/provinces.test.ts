import { describe, expect, it } from 'vitest';
import { SPAIN_PROVINCES } from '@/components/sections/nosotros/spain-provinces';
import { provinceHref, provinceSlug } from '@/components/sections/nosotros/province-link';
import { PROVINCIAS } from '@/lib/quote-data';

describe('mapa de provincias', () => {
  it('las 52 provincias del mapa son exactamente las del formulario', () => {
    expect(SPAIN_PROVINCES.map((p) => p.name).sort()).toEqual([...PROVINCIAS].sort());
    expect(SPAIN_PROVINCES).toHaveLength(52);
  });

  it('cada provincia tiene un identificador ASCII único para el sprite', () => {
    const slugs = PROVINCIAS.map(provinceSlug);
    expect(new Set(slugs).size).toBe(PROVINCIAS.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(provinceSlug('A Coruña')).toBe('a-coruna');
    expect(provinceSlug('Álava')).toBe('alava');
  });

  it('enlaza al formulario con el nombre codificado', () => {
    expect(provinceHref('A Coruña')).toBe('/contacto?provincia=A%20Coru%C3%B1a');
    expect(provinceHref('Madrid')).toBe('/contacto?provincia=Madrid');
  });
});
