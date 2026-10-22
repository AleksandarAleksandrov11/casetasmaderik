import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { casetasConfigurator } from '@/content/casetas';
import { CasetasConfigurator } from './CasetasConfigurator';

/** S6. CTA final con configurador (oscuro). Una línea fina lo cierra antes del footer, también tinta. */
export function CasetasCta() {
  const c = casetasConfigurator;
  return (
    <Section surface="dark" className="pb-0!" aria-labelledby="configurador-titulo">
      <div className="container-site">
        <div className="max-w-[44rem]">
          <Label>{c.label}</Label>
          <Heading id="configurador-titulo" className="mt-6">
            {c.title}
          </Heading>
          <p className="text-lead mt-6 max-w-[44ch] text-cream/80">{c.text}</p>
        </div>
        <div className="mt-14">
          <CasetasConfigurator />
        </div>
        <div aria-hidden="true" className="mt-[var(--section-y)] border-t border-mist/20" />
      </div>
    </Section>
  );
}
