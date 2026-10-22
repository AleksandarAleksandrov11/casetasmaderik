import { homeHero } from '@/content/home';
import { ButtonLink } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { InlineStyle } from '@/components/three/InlineStyle';
import { threeCss } from '@/components/three/styles';
import { InteractiveCaseta } from '@/components/three/interactive/InteractiveCaseta';
import { interactiveCss } from '@/components/three/interactive/styles';
import { heroCss } from './heroStyles';

/**
 * S1. Hero de Inicio: titular grande en mayúsculas y la caseta interactiva
 * (se gira, se abren ventanas y puerta, se encienden las luces). Al encender
 * las luces el hero entero pasa a noche. El texto es HTML del servidor y el
 * primer fotograma de la caseta llega con el HTML.
 */
export function HomeHero() {
  const h = homeHero;
  const ticker = [...h.ticker, ...h.ticker];
  return (
    <section className="hero" data-hero="" data-header="light" aria-labelledby="hero-titulo">
      <InlineStyle id="caseta-3d" css={threeCss} />
      <InlineStyle id="caseta-interactiva" css={interactiveCss} />
      <InlineStyle id="hero" css={heroCss} />
      <div className="hero__inner container-site">
        <h1 id="hero-titulo" className="hero__title">
          {h.title.map((line, i) => (
            <span key={line} className={i === 0 ? 'hero__line hero__line--kicker' : 'hero__line'}>
              {line}
              {i < h.title.length - 1 ? ' ' : null}
            </span>
          ))}
        </h1>
        <p className="hero__sub">{h.subtitle}</p>
        <div className="hero__ctas">
          <ButtonLink href={h.primary.href} className="hero__primary">
            {h.primary.label}
          </ButtonLink>
          <TextLink href={h.secondary.href} className="hero__secondary">
            {h.secondary.label}
          </TextLink>
        </div>
        <div className="hero__media">
          <InteractiveCaseta
            variant="hero"
            labels={{ ...h.controls, sceneDescription: h.sceneDescription }}
            priority
            demo
            themeSection
            sizes="(min-width: 1024px) 56vw, 100vw"
          />
        </div>
      </div>
      <div className="hero__ticker" aria-hidden="true">
        <div className="hero__track">
          {ticker.map((t, i) => (
            <span key={i} className="hero__tick">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
