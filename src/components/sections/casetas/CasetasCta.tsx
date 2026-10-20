import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { casetasConfigurator } from '@/content/casetas';
import { CasetasConfigurator } from './CasetasConfigurator';

/** S6. CTA final con configurador (oscuro). */
export function CasetasCta() {
  const c = casetasConfigurator;
  return (
    <Section surface="dark" aria-labelledby="configurador-titulo">
      <div className="container-site">
        <div className="max-w-[44rem]">
          <Label>{c.label}</Label>
          <Heading id="configurador-titulo" className="mt-6">
            {c.title}
          </Heading>
          <p className="mt-6 max-w-[44ch] text-lead text-cream/80">{c.text}</p>
        </div>
        <div className="mt-14">
          <CasetasConfigurator />
        </div>
      </div>
    </Section>
  );
}
