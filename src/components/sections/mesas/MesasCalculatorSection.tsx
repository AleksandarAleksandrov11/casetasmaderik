import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { mesasCalculator } from '@/content/mesas';
import { noOrphans } from '@/lib/typography';
import { MesasCalculator } from './MesasCalculator';

/** S3. ¿Cuántos kits necesito? Un kit por cada 8 personas sentadas. */
export function MesasCalculatorSection() {
  const c = mesasCalculator;
  return (
    <Section surface="dark" aria-labelledby="calculadora-titulo">
      <div className="container-site">
        <Label>{c.label}</Label>
        <Heading id="calculadora-titulo" className="mt-6 max-w-[16ch]">
          {c.title}
        </Heading>
        <p className="text-lead mt-6 max-w-[46ch] text-cream/85" data-reveal>
          {noOrphans(c.text)}
        </p>
        <div className="mt-[clamp(40px,5vw,72px)]">
          <MesasCalculator />
        </div>
      </div>
    </Section>
  );
}
