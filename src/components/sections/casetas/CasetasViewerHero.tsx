import { Fragment } from 'react';
import { casetasHero } from '@/content/casetas';
import { ButtonLink } from '@/components/ui/Button';
import { InlineStyle } from '@/components/three/InlineStyle';
import { threeCss } from '@/components/three/styles';
import { InteractiveCaseta } from '@/components/three/interactive/InteractiveCaseta';
import { interactiveCss } from '@/components/three/interactive/styles';
import { viewerCss } from './viewerStyles';

/**
 * S1 de /casetas: la caseta interactiva en el centro, el titular a su
 * izquierda y las medidas con el botón a su derecha, a la misma altura. En
 * móvil y tableta, titular, caseta, botonera y medidas en columna.
 */
export function CasetasViewerHero() {
  const h = casetasHero;
  return (
    <section data-header="light" className="viewer" aria-labelledby="casetas-titulo">
      <InlineStyle id="caseta-3d" css={threeCss} />
      <InlineStyle id="caseta-interactiva" css={interactiveCss} />
      <InlineStyle id="caseta-visor" css={viewerCss} />
      <div className="container-site">
        <InteractiveCaseta
          variant="viewer"
          labels={{ ...h.controls, sceneDescription: h.sceneDescription }}
          features={h.hotspots}
          initial={{ windows: true }}
          priority
          themeSection
          sizes="(min-width: 1024px) 52vw, 100vw"
          left={
            <>
              <h1 id="casetas-titulo" className="viewer__title">
                {/* Frases enteras: el espacio entre ellas es el único punto de corte */}
                {h.title.map((phrase, i) => (
                  <Fragment key={phrase}>
                    {i ? ' ' : null}
                    <span className="whitespace-nowrap">{phrase}</span>
                  </Fragment>
                ))}
              </h1>
              <p className="viewer__text">{h.text}</p>
            </>
          }
          right={
            <>
              <dl className="viewer__measures">
                {h.measures.map((m) => (
                  <div key={m.label} className="viewer__measure">
                    <dt>{m.label}</dt>
                    <dd>
                      {m.value}
                      <span> {m.unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href={h.primary.href} className="viewer__cta">
                {h.primary.label}
              </ButtonLink>
            </>
          }
        />
      </div>
    </section>
  );
}
