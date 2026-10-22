import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { TextLink } from '@/components/ui/TextLink';
import { homeProcess } from '@/content/home';

/** S4. Cómo trabajamos: tres pasos con una línea que se dibuja con el scroll. */
export function HomeProcess() {
  const p = homeProcess;
  return (
    <Section surface="paper" aria-labelledby="proceso-titulo">
      <div className="container-site">
        <div className="max-w-[48rem]">
          <Label>{p.label}</Label>
          <Heading id="proceso-titulo" className="mt-6">
            {p.title.map((line, i) => (
              <span key={line} className="block">
                {i > 0 ? ' ' : null}
                {line}
              </span>
            ))}
          </Heading>
        </div>

        <ol data-draw-scope className="relative mt-16 grid gap-12 md:mt-24 md:grid-cols-3 md:gap-10 lg:gap-16">
          {/* Línea del proceso: horizontal en escritorio, vertical en móvil */}
          <span aria-hidden="true" className="absolute top-[11px] right-0 left-0 hidden h-px bg-sand md:block">
            <span data-draw-line="x" className="block h-px w-full origin-left bg-wood" />
          </span>
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[11px] w-px bg-sand md:hidden">
            <span data-draw-line="y" className="block h-full w-px origin-top bg-wood" />
          </span>

          {p.steps.map((s, i) => (
            <li
              key={s.n}
              className="relative pl-12 md:pt-14 md:pl-0"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${i * 0.12}s` }}
            >
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 flex size-[23px] items-center justify-center rounded-full border border-wood bg-paper"
              >
                <span className="size-[7px] rounded-full bg-wood" />
              </span>
              <p className="tabular font-display text-[0.9375rem] tracking-[0.12em] text-wood-dark">{s.n}</p>
              <h3 className="text-h3 mt-3">{s.title}</h3>
              <p className="mt-4 max-w-[34ch] text-stone">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 md:mt-20" data-reveal>
          <TextLink href={p.link.href}>{p.link.label}</TextLink>
        </div>
      </div>
    </Section>
  );
}
