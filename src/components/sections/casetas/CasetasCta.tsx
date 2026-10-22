import { Section } from '@/components/ui/Section';
import { CtaBackdrop, CtaIntro, ctaResponseNote } from '@/components/sections/shared/CtaFinal';
import { casetasConfigurator } from '@/content/casetas';
import { CasetasConfigurator } from './CasetasConfigurator';

/**
 * S6. CTA final de /casetas: la misma estructura que el CTA común (foto con
 * velo, etiqueta, H2, texto, acciones y nota) con el selector de casetas antes
 * de las acciones. Desde lg, a dos columnas: el bloque a la izquierda y la fila
 * de casetas a la derecha, centrada en vertical con todo el bloque, para que el
 * cambio se vea junto al control que lo provoca.
 */
export function CasetasCta() {
  const c = casetasConfigurator;
  return (
    <Section surface="photo" spacing={false} className="overflow-hidden" aria-labelledby="configurador-titulo">
      <CtaBackdrop image={c.image} focus="50% 70%" />
      <div className="container-site relative py-[clamp(112px,12vw,200px)]">
        <CasetasConfigurator
          intro={<CtaIntro split id="configurador-titulo" label={c.label} title={c.title} text={c.text} />}
          note={ctaResponseNote}
        />
      </div>
    </Section>
  );
}
