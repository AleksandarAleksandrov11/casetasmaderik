import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosArea } from '@/content/nosotros';
import { site } from '@/content/site';
import { PROVINCIAS } from '@/lib/quote-data';
import { noOrphans } from '@/lib/typography';
import { CANARIAS_FRAME, SPAIN_VIEWBOX } from './spain-provinces';
import { ProvinceMap } from './ProvinceMap';

/**
 * S5. Dónde trabajamos: mapa interactivo de España. Cada provincia lleva al
 * formulario con ella ya elegida. Si site.serviceArea.regions tiene
 * provincias, se destacan en el mapa; si no, toda España en el mismo tono.
 * Al cliente solo viajan los nombres: la geometría está en /mapa-espana.svg.
 */
export function NosotrosArea() {
  const a = nosotrosArea;
  const regions = site.serviceArea.regions as readonly string[];
  const all = regions.length === 0;
  const zone = all ? site.serviceArea.label : regions.join(', ');
  return (
    <Section surface="cream" aria-labelledby="zona-titulo">
      <div className="container-site grid-site gap-y-10 lg:gap-y-12">
        <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:row-start-1">
          <Label>{a.label}</Label>
          <Heading id="zona-titulo" className="mt-6">
            {a.title}
          </Heading>
          <p className="text-lead mt-6 max-w-[38ch] text-stone" data-reveal>
            {noOrphans(all ? a.text : `Trabajamos en ${zone}. Si tu evento está en otra provincia, consúltanos.`)}
          </p>
        </div>
        <ProvinceMap
          provinces={PROVINCIAS}
          zone={all ? [] : regions}
          viewBox={SPAIN_VIEWBOX}
          canarias={CANARIAS_FRAME}
          idle={all ? `Toda ${zone}` : zone}
        />
      </div>
    </Section>
  );
}
