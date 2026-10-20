import { casetasHero } from '@/content/casetas';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import { Poster } from '@/components/three/Poster';
import { posters } from '@/components/three/posters';
import { ViewerStage } from './three/ViewerStage';

/**
 * S1 de /casetas: visor 3D con puntos de interés y controles. El texto es
 * HTML del servidor. Sin 3D se ve el poster y los puntos de interés en lista.
 */
export function CasetasViewerHero() {
  const h = casetasHero;
  return (
    <section data-header="light" className="viewer relative bg-cream" aria-labelledby="casetas-titulo">
      <ViewerStage
        hotspots={h.hotspots}
        labels={{ ...h.controls, hint: h.hint, sceneDescription: h.sceneDescription }}
        copy={
          <>
            <Breadcrumbs
              items={[
                { name: 'Inicio', path: '/' },
                { name: 'Casetas', path: '/casetas' },
              ]}
            />
            <h1 id="casetas-titulo" className="viewer__title text-h1 mt-5">
              {h.title}
            </h1>
            <p className="viewer__text text-lead mt-6 max-w-[34ch] text-stone">{h.text}</p>
            <ButtonLink href={h.primary.href} className="mt-8">
              {h.primary.label}
            </ButtonLink>
          </>
        }
        poster={
          <Poster
            desktop={posters.viewer}
            mobile={posters.viewerMobile}
            media="lg"
            eager
            sizes={{ desktop: '(min-width: 1024px) 58vw, 100vw', mobile: '100vw' }}
          />
        }
        list={
          <ol className="viewer__list">
            {h.hotspots.map((p, i) => (
              <li key={p.id}>
                <span className="viewer__list-n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="viewer__list-title">{p.title}</p>
                <p className="viewer__list-text">{p.text}</p>
              </li>
            ))}
          </ol>
        }
      />
    </section>
  );
}
