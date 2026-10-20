import { Fragment } from 'react';
import { casetasHero } from '@/content/casetas';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ButtonLink } from '@/components/ui/Button';
import { Poster } from '@/components/three/Poster';
import { posters } from '@/components/three/posters';
import { InlineStyle } from '@/components/three/InlineStyle';
import { threeCss } from '@/components/three/styles';
import { ViewerStage } from './three/ViewerStage';
import { viewerCss } from './three/viewerStyles';

/**
 * S1 de /casetas: visor 3D con puntos de interés y controles. El texto es
 * HTML del servidor. Sin 3D se ve el poster y los puntos de interés en lista.
 */
export function CasetasViewerHero() {
  const h = casetasHero;
  return (
    <section data-header="light" className="viewer relative bg-cream" aria-labelledby="casetas-titulo">
      <InlineStyle id="caseta-3d" css={threeCss} />
      <InlineStyle id="caseta-visor" css={viewerCss} />
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
              {/* Frases enteras: el espacio entre ellas es el único punto de corte */}
              {h.title.map((phrase, i) => (
                <Fragment key={phrase}>
                  {i ? ' ' : null}
                  <span className="whitespace-nowrap">{phrase}</span>
                </Fragment>
              ))}
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
            media="wide"
            eager
            sizes={{ desktop: '(min-width: 1024px) 50vw, 60vw', mobile: '100vw' }}
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
