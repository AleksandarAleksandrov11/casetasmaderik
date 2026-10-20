import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { contactoNext } from '@/content/contacto';

/** S3. Qué pasa después: tres pasos. */
export function ContactoNext() {
  const n = contactoNext;
  return (
    <Section surface="cream" aria-labelledby="despues-titulo">
      <div className="container-site">
        <Label>{n.label}</Label>
        <Heading id="despues-titulo" className="mt-6 max-w-[18ch]">
          {n.title}
        </Heading>
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
          {n.steps.map((s, i) => (
            <li key={s.n} className="border-t border-sand pt-6" data-reveal style={{ ['--reveal-delay' as string]: `${i * 0.1}s` }}>
              <p className="font-display text-[0.9375rem] tracking-[0.12em] text-wood tabular">{s.n}</p>
              <h3 className="mt-3 text-h3">{s.title}</h3>
              <p className="mt-3 max-w-[32ch] text-stone">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
