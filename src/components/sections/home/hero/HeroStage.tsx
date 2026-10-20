'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useCan3D, useDevFlag, useIdleReady, useInView, useMedia, usePosterKey } from '@/components/three/hooks';
import { copyShot, createCasetaState, type CameraShot, type Quality, type SceneHandle } from '@/components/three/state';
import { MEDIA } from '@/lib/motion';
import { DESKTOP, HERO_WIDE, MOBILE, OG_SHOT, type HeroShots } from './shots';
import '@/components/three/three.css';
import './hero.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

const INK = '#0e1615';
const CREAM = '#fbf8f3';

/**
 * Isla de cliente del hero: decide si hay 3D, fija la sección con scroll
 * (sticky) y escribe la coreografía en refs que el lienzo lee en cada frame.
 * Sin 3D (sin WebGL, movimiento reducido o ahorro de datos) se queda el
 * poster y la sección no se fija.
 */
export function HeroStage({
  children,
  poster,
  sceneDescription,
  scrollLabel,
}: {
  children: ReactNode;
  poster: ReactNode;
  sceneDescription: string;
  scrollLabel: string;
}) {
  const can3D = useCan3D();
  const posterKey = usePosterKey();
  const capture = posterKey === 'hero' || posterKey === 'hero-mobile' || posterKey === 'og';
  const isDesktop = useMedia(HERO_WIDE);
  const finePointer = useMedia(MEDIA.finePointer);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stateRef = useRef(createCasetaState());
  const shotRef = useRef<CameraShot>(copyShot(DESKTOP.start));
  const handleRef = useRef<SceneHandle>({ invalidate: null });
  const load = useIdleReady(can3D && !(posterKey && !capture), Boolean(posterKey));
  const inView = useInView(stage, '100px 0px');
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);

  const shots: HeroShots = isDesktop ? DESKTOP : MOBILE;
  const quality: Quality = isDesktop && finePointer && !slow ? 'high' : 'low';
  const bigScreen = useMedia(MEDIA.desktop);
  const forceHigh = useDevFlag('hq') || capture;
  const dpr: number | [number, number] = capture
    ? window.devicePixelRatio
    : slow
      ? 1
      : bigScreen
        ? [1, 1.75]
        : [1, 1.5];
  const mode = can3D && !(posterKey && !capture) ? '3d' : 'static';

  const onFirstFrame = useCallback(() => setLive(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const onSlow = useCallback(() => setSlow(true), []);
  const onInvalidate = useCallback((fn: (() => void) | null) => {
    handleRef.current.invalidate = fn;
  }, []);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      if (posterKey) {
        // Captura de posters: plano inicial fijo (sin scroll ni fijado)
        const wide = window.matchMedia(HERO_WIDE).matches;
        Object.assign(shotRef.current, posterKey === 'og' ? OG_SHOT : wide ? DESKTOP.start : MOBILE.start);
        return;
      }
      if (mode !== '3d') return;
      const mm = gsap.matchMedia();
      mm.add({ wide: HERO_WIDE, all: 'all' }, (ctx) => {
        const desktop = Boolean(ctx.conditions?.wide);
        const S = desktop ? DESKTOP : MOBILE;
        const st = stateRef.current;
        const shot = shotRef.current;
        Object.assign(shot, S.start);
        Object.assign(st, { shutters: 0, night: 0, dims: 0, exploded: 0 });
        const q = gsap.utils.selector(el);
        const sub = q('[data-hero-sub]');
        const night = q('[data-hero-night]');
        const scroll = q('[data-hero-scroll]');
        const ctas = q('[data-hero-ctas]');
        const head = q('[data-hero-head]');
        let dark = false;

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: desktop ? true : 0.5,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            handleRef.current.invalidate?.();
            const isDark = st.night > 0.5;
            if (isDark !== dark) {
              dark = isDark;
              el.dataset.header = dark ? 'dark' : 'light';
              el.toggleAttribute('data-night', dark);
            }
          },
        });

        // 0 a 0,35: de tres cuartos a frente; se abren las contraventanas
        tl.to(scroll, { autoAlpha: 0, y: 12, duration: 0.06 }, 0)
          .to(shot, { ...S.front, duration: 0.34, ease: 'sine.inOut' }, 0)
          .to(st, { shutters: 1, duration: 0.3 }, 0.03)
          // 0,35 a 0,65: cae la noche
          .to(shot, { ...S.night, duration: 0.3, ease: 'sine.inOut' }, 0.35)
          .to(st, { night: 1, duration: 0.24, ease: 'sine.inOut' }, 0.36)
          .to(el, { '--hero-bg': INK, duration: 0.2, ease: 'sine.inOut' }, 0.38)
          .to(
            el,
            {
              '--hero-fg': CREAM,
              '--hero-muted': '#a3a7a4',
              '--hero-accent': '#c49a76',
              '--hero-link': CREAM,
              '--hero-btn-bg': CREAM,
              '--hero-btn-fg': INK,
              '--hero-btn-sweep': '#c49a76',
              duration: 0.08,
              ease: 'sine.inOut',
            },
            0.45,
          )
          .to(sub, { autoAlpha: 0, y: -10, duration: 0.07 }, 0.42)
          .fromTo(night, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.09, ease: 'power2.out' }, 0.5)
          // 0,65 a 0,9: cotas
          .to(shot, { ...S.dims, duration: 0.25, ease: 'sine.inOut' }, 0.65)
          .to(st, { dims: 1, duration: 0.22 }, 0.67)
          // 0,9 a 1: la cámara se aleja, el CTA toma protagonismo
          .to(shot, { ...S.end, duration: 0.1, ease: 'sine.inOut' }, 0.9)
          .to(head, { y: desktop ? -18 : -8, duration: 0.1, ease: 'sine.inOut' }, 0.9)
          .to(
            ctas,
            {
              y: desktop ? -18 : -8,
              scale: desktop ? 1.05 : 1,
              transformOrigin: 'left center',
              duration: 0.1,
              ease: 'sine.inOut',
            },
            0.9,
          );
        tl.duration(1);

        return () => {
          el.dataset.header = 'light';
          el.removeAttribute('data-night');
        };
      });
    },
    { scope: section, dependencies: [mode, posterKey], revertOnUpdate: true },
  );

  const show3D = mode === '3d' && load && !failed;

  return (
    <section
      ref={section}
      className="hero"
      data-hero=""
      data-mode={mode}
      data-header="light"
      aria-labelledby="hero-titulo"
    >
      <div ref={stage} className="hero__stage">
        <div className="caseta-visual hero__visual" aria-hidden="true" data-live={live && !failed ? '' : undefined}>
          {poster}
          {show3D ? (
            <HeroScene
              stateRef={stateRef}
              shotRef={shotRef}
              onInvalidate={onInvalidate}
              fit={shots.fit}
              quality={forceHigh ? 'high' : quality}
              dpr={dpr}
              active={inView || capture}
              capture={capture}
              onFirstFrame={onFirstFrame}
              onError={onError}
              onSlow={quality === 'high' && !forceHigh ? onSlow : undefined}
            />
          ) : null}
        </div>
        {children}
        <div className="hero__scroll" data-hero-scroll="" aria-hidden="true">
          <span className="hero__scroll-line" />
          <span>{scrollLabel}</span>
        </div>
        <p className="sr-only">{sceneDescription}</p>
      </div>
    </section>
  );
}
