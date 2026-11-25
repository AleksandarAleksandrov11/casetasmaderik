import { Fragment } from 'react';
import { mesasHero } from '@/content/mesas';
import { ButtonLink } from '@/components/ui/Button';
import { InlineStyle } from '@/components/three/InlineStyle';
import { threeCss } from '@/components/three/styles';
import { KitViewer } from '@/components/three/kit/KitViewer';
import { interactiveCss } from '@/components/three/interactive/styles';
import { viewerCss } from '@/components/sections/casetas/viewerStyles';

/** Solo dos botones en la botonera del kit: en móvil, dos columnas. */
const kitCss = /* css */ `
@media (max-width: 559.98px) {
  .ic--kit .ic__dock {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.ic--kit .viewer__measures {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 1024px) {
  .ic--kit .viewer__measures {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;

/**
 * S1 de /mesas-y-bancos: el kit en 3D en el centro, el titular a su izquierda
 * y las cifras con el botón a su derecha (misma maqueta que el visor de
 * /casetas). En móvil y tableta, en columna.
 */
export function MesasViewerHero() {
  const h = mesasHero;
  return (
    <section data-header="light" className="viewer" aria-labelledby="mesas-titulo">
      <InlineStyle id="caseta-3d" css={threeCss} />
      <InlineStyle id="caseta-interactiva" css={interactiveCss} />
      <InlineStyle id="caseta-visor" css={viewerCss} />
      <InlineStyle id="kit-visor" css={kitCss} />
      <div className="container-site">
        <KitViewer
          labels={{ ...h.controls, sceneDescription: h.sceneDescription }}
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          left={
            <>
              <h1 id="mesas-titulo" className="viewer__title">
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
                {h.facts.map((m) => (
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
