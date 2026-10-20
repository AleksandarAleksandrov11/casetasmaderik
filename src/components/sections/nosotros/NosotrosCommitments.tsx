import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { nosotrosCommitments } from '@/content/nosotros';

/** S3. Compromisos: lista numerada grande, sin tarjetas. */
export function NosotrosCommitments() {
  const c = nosotrosCommitments;
  return (
    <Section surface="paper" aria-labelledby="compromisos-titulo">
      <div className="container-site">
        <Label>{c.label}</Label>
        <Heading id="compromisos-titulo" className="mt-6 max-w-[16ch]">
          {c.title}
        </Heading>
        <ol className="mt-16 md:mt-20">
          {c.items.map((item, i) => (
            <li
              key={item.n}
              className="grid-site items-baseline gap-y-3 border-t border-sand py-8 last:border-b md:py-10"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 0.06}s` }}
            >
              <span
                aria-hidden="true"
                className="col-span-4 font-display text-[clamp(2.75rem,2rem+3vw,5rem)] font-light leading-none tracking-[-0.03em] text-wood-dark tabular md:col-span-1 lg:col-span-2"
              >
                {item.n}
              </span>
              <h3 className="col-span-4 text-h3 md:col-span-2 lg:col-span-4">{item.title}</h3>
              <p className="col-span-4 max-w-[46ch] text-lead text-stone md:col-span-3 lg:col-span-5 lg:col-start-8">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
