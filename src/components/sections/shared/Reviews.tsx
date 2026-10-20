import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { reviews } from '@/content/reviews';
import { site } from '@/content/site';

/**
 * Opiniones de clientes, preparado y oculto hasta tener reseñas reales
 * (site.features.reviews). Al activarlo, sustituye a una sección de la página
 * para respetar el máximo de seis.
 */
export function Reviews() {
  if (!site.features.reviews || reviews.length === 0) return null;
  return (
    <Section surface="paper" aria-labelledby="opiniones-titulo">
      <div className="container-site">
        <Label>Opiniones</Label>
        <Heading id="opiniones-titulo" className="mt-6">
          Lo que dicen quienes ya han montado con nosotros
        </Heading>
        <ul className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={`${r.author}-${r.text.slice(0, 20)}`} className="border-t border-sand pt-6" data-reveal>
              <blockquote>
                <p className="text-lead">{r.text}</p>
                <footer className="mt-5 text-[0.9375rem] text-stone">
                  <cite className="not-italic font-semibold text-ink">{r.author}</cite>
                  {r.role ? `, ${r.role}` : null}
                  {r.source ? (
                    <>
                      {' · '}
                      <a href={r.source.url} className="link-inline" target="_blank" rel="noopener noreferrer">
                        {r.source.label}
                      </a>
                    </>
                  ) : null}
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
