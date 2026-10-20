import { Fragment } from 'react';
import Link from 'next/link';
import { homeHero } from '@/content/home';
import { ButtonLink } from '@/components/ui/Button';
import { Poster } from '@/components/three/Poster';
import { posters } from '@/components/three/posters';
import { HeroStage } from './hero/HeroStage';

/**
 * S1. Hero 3D de Inicio. Todo el texto es HTML del servidor (el H1 es el
 * LCP y nunca se oculta). Debajo del lienzo va el poster con el mismo
 * encuadre; sin WebGL o con movimiento reducido se queda solo el poster.
 */
export function HomeHero() {
  const h = homeHero;
  return (
    <HeroStage
      sceneDescription={h.sceneDescription}
      scrollLabel={h.scroll}
      poster={
        <Poster
          desktop={posters.heroDesktop}
          mobile={posters.heroMobile}
          media="wide"
          eager
          sizes={{ desktop: '(min-width: 1024px) 60vw, 70vw', mobile: '100vw' }}
        />
      }
    >
      <div className="hero__content container-site">
        <div className="hero__col">
          <div data-hero-head="">
            <p className="label hero__label">{h.label}</p>
            <h1 id="hero-titulo" className="hero__title">
              {h.titleLines.map((l, i) => (
                <Fragment key={l.text}>
                  {i > 0 ? ' ' : null}
                  <span className={`hero__line ${l.weight === 'strong' ? 'hero__line--strong' : 'hero__line--light'}`}>
                    {l.text}
                  </span>
                </Fragment>
              ))}
            </h1>
            <div className="hero__copy">
              <p className="hero__sub" data-hero-sub="">
                {h.subtitle}
              </p>
              <p className="hero__night" data-hero-night="" aria-hidden="true">
                {h.night}
              </p>
            </div>
          </div>
          <div className="hero__ctas" data-hero-ctas="">
            <ButtonLink href={h.primary.href} className="hero__primary">
              {h.primary.label}
            </ButtonLink>
            <Link href={h.secondary.href} className="link-underline hero__secondary">
              {h.secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </HeroStage>
  );
}
