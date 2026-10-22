import { Fragment } from 'react';
import { casetasHero } from '@/content/casetas';
import { ButtonLink } from '@/components/ui/Button';
import { InlineStyle } from '@/components/three/InlineStyle';
import { threeCss } from '@/components/three/styles';
import { InteractiveCaseta } from '@/components/three/interactive/InteractiveCaseta';
import { interactiveCss } from '@/components/three/interactive/styles';
import { viewerCss } from './viewerStyles';

/**
 * S1 de /casetas: titular arriba y, debajo, la caseta interactiva a todo lo
 * ancho con sus controles y las seis partes que la giran hasta cada detalle.
 */
export function CasetasViewerHero() {
  const h = casetasHero;
  return (
    <section data-header="light" className="viewer" aria-labelledby="casetas-titulo">
      <InlineStyle id="caseta-3d" css={threeCss} />
      <InlineStyle id="caseta-interactiva" css={interactiveCss} />
      <InlineStyle id="caseta-visor" css={viewerCss} />
      <div className="viewer__head container-site">
        <h1 id="casetas-titulo" className="viewer__title">
          {/* Frases enteras: el espacio entre ellas es el único punto de corte */}
          {h.title.map((phrase, i) => (
            <Fragment key={phrase}>
              {i ? ' ' : null}
              <span className="whitespace-nowrap">{phrase}</span>
            </Fragment>
          ))}
        </h1>
        <div className="viewer__aside">
          <p className="viewer__text">{h.text}</p>
          <ButtonLink href={h.primary.href}>{h.primary.label}</ButtonLink>
        </div>
      </div>
      <div className="viewer__body container-site">
        <InteractiveCaseta
          variant="viewer"
          labels={{ ...h.controls, sceneDescription: h.sceneDescription }}
          features={h.hotspots}
          initial={{ windows: true }}
          priority
          themeSection
          sizes="(min-width: 1024px) 70vw, 100vw"
        />
      </div>
    </section>
  );
}
