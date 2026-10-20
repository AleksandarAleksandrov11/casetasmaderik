import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { TextLink } from '@/components/ui/TextLink';
import { nosotrosArea } from '@/content/nosotros';
import { site } from '@/content/site';
import { CANARIAS_FRAME, SPAIN_PROVINCES, SPAIN_VIEWBOX } from './spain-provinces';

/**
 * S5. Dónde trabajamos: mapa minimalista de España. Resalta las provincias de
 * site.serviceArea.regions; si no hay ninguna, el mapa completo en tono suave.
 */
export function NosotrosArea() {
  const a = nosotrosArea;
  const regions = site.serviceArea.regions as readonly string[];
  const all = regions.length === 0;
  const zone = all ? site.serviceArea.label : regions.join(', ');
  return (
    <Section surface="cream" aria-labelledby="zona-titulo">
      <div className="container-site grid-site items-center gap-y-14">
        <div className="col-span-4 md:col-span-6 lg:col-span-4">
          <Label>{a.label}</Label>
          <Heading id="zona-titulo" className="mt-6">
            {a.title}
          </Heading>
          <p className="mt-6 max-w-[38ch] text-lead text-stone" data-reveal>
            {all
              ? `Montamos casetas en toda ${zone}. Cuéntanos dónde es tu evento y revisamos transporte y accesos.`
              : `Trabajamos en ${zone}. Si tu evento está en otra provincia, consúltanos.`}
          </p>
          <div className="mt-8" data-reveal>
            <TextLink href="/contacto">Consultar disponibilidad</TextLink>
          </div>
        </div>
        <figure className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-6" data-reveal>
          <svg
            viewBox={SPAIN_VIEWBOX}
            className="h-auto w-full"
            role="img"
            aria-label={`Mapa de España. Zona de servicio: ${zone}.`}
          >
            <g strokeWidth={1.2} strokeLinejoin="round">
              {SPAIN_PROVINCES.map((p) => {
                const on = all || regions.includes(p.name);
                return (
                  <path
                    key={p.name}
                    d={p.d}
                    className={
                      all
                        ? 'fill-[#ebe2d5] stroke-cream transition-colors duration-500 hover:fill-wood-light'
                        : on
                          ? 'fill-wood stroke-cream'
                          : 'fill-[#ebe2d5] stroke-cream'
                    }
                  >
                    <title>{p.name}</title>
                  </path>
                );
              })}
            </g>
            <rect
              x={CANARIAS_FRAME.x}
              y={CANARIAS_FRAME.y}
              width={CANARIAS_FRAME.w}
              height={CANARIAS_FRAME.h}
              fill="none"
              className="stroke-sand"
              strokeWidth={1}
            />
          </svg>
          {!all ? (
            <figcaption className="mt-4 text-[0.9375rem] text-stone">Provincias en las que trabajamos: {zone}.</figcaption>
          ) : null}
        </figure>
      </div>
    </Section>
  );
}
