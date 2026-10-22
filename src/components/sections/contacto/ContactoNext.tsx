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
        {/* Subgrid: número, título y texto comparten filas en las tres columnas, así los textos empiezan a la misma altura aunque un título ocupe dos líneas */}
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-x-12 md:gap-y-0">
          {n.steps.map((s, i) => (
            <li
              key={s.n}
              className="border-t border-sand pt-6 md:row-span-3 md:grid md:grid-rows-subgrid"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 0.1}s` }}
            >
              <p className="tabular font-display text-[0.9375rem] tracking-[0.12em] text-wood">{s.n}</p>
              <h3 className="text-h3 mt-3">{s.title}</h3>
              <p className="mt-3 max-w-[32ch] text-stone">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
