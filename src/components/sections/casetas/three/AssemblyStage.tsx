'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useCan3D, useDevFlag, useIdleReady, useInView, useMedia, usePosterKey } from '@/components/three/hooks';
import { copyShot, createCasetaState, type CameraShot, type Quality, type SceneHandle } from '@/components/three/state';
import { MEDIA } from '@/lib/motion';
import { ASSEMBLY_DESKTOP, ASSEMBLY_MOBILE, ASSEMBLY_POSTER, ASSEMBLY_WIDE, STEP_AT } from './assemblyShots';
import type { AssemblyAnim } from './AssemblyScene';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const AssemblyScene = dynamic(() => import('./AssemblyScene'), { ssr: false });

export interface AssemblyStep {
  title: string;
  text: string;
}

/** La caseta plegada entra desde la derecha (no pasa por debajo del texto). */
const SLIDE_FROM = 5.5;

/**
 * Montaje despiezado sincronizado con el scroll. Escritorio: sección fijada
 * (sticky) con scrub; móvil: fijado más corto y encuadre vertical. Sin 3D o
 * con movimiento reducido: no se fija, se ve el poster y los tres pasos.
 */
export function AssemblyStage({
  intro,
  steps,
  poster,
  sceneDescription,
}: {
  intro: ReactNode;
  steps: AssemblyStep[];
  poster: ReactNode;
  sceneDescription: string;
}) {
  const can3D = useCan3D();
  const posterKey = usePosterKey();
  const capture = posterKey === 'assembly';
  const wide = useMedia(ASSEMBLY_WIDE);
  const big = useMedia(MEDIA.desktop);
  const fine = useMedia(MEDIA.finePointer);
  const forceHigh = useDevFlag('hq') || capture;
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stateRef = useRef(createCasetaState({ exploded: 1 }));
  const shotRef = useRef<CameraShot>(copyShot(ASSEMBLY_DESKTOP.start));
  const animRef = useRef<AssemblyAnim>({ slide: SLIDE_FROM });
  const handleRef = useRef<SceneHandle>({ invalidate: null });
  const mode = can3D && !(posterKey && !capture) ? '3d' : 'static';
  const near = useInView(section, '120% 0px');
  const inView = useInView(stage, '100px 0px');
  const load = useIdleReady(mode === '3d' && (near || capture), capture);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);

  const quality: Quality = forceHigh ? 'high' : big && fine ? 'high' : 'low';
  const dpr: number | [number, number] = capture ? window.devicePixelRatio : big ? [1, 1.75] : [1, 1.5];

  const onInvalidate = useCallback((fn: (() => void) | null) => {
    handleRef.current.invalidate = fn;
  }, []);
  const onFirstFrame = useCallback(() => setLive(true), []);
  const onError = useCallback(() => setFailed(true), []);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;
      if (capture) {
        Object.assign(stateRef.current, { exploded: 0, shutters: 1, night: 0 });
        Object.assign(shotRef.current, ASSEMBLY_POSTER);
        animRef.current.slide = 0;
        return;
      }
      if (mode !== '3d') return;
      const mm = gsap.matchMedia();
      mm.add({ wide: ASSEMBLY_WIDE, all: 'all' }, (ctx) => {
        const isWide = Boolean(ctx.conditions?.wide);
        const S = isWide ? ASSEMBLY_DESKTOP : ASSEMBLY_MOBILE;
        const st = stateRef.current;
        const shot = shotRef.current;
        const anim = animRef.current;
        Object.assign(st, { exploded: 1, shutters: 0, night: 0, dims: 0 });
        Object.assign(shot, S.start);
        anim.slide = SLIDE_FROM;
        let step = -1;
        const setStep = (p: number) => {
          const next = p >= STEP_AT[2] ? 2 : p >= STEP_AT[1] ? 1 : 0;
          el.style.setProperty('--assembly-p', p.toFixed(4));
          if (next !== step) {
            step = next;
            el.dataset.step = String(next);
          }
        };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: isWide ? true : 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => setStep(self.progress),
          },
          onUpdate: () => handleRef.current.invalidate?.(),
        });
        // Transporte: llega plegada
        tl.to(anim, { slide: 0, duration: 0.18, ease: 'power2.out' }, 0)
          .to(shot, { ...S.mid, duration: 0.5, ease: 'sine.inOut' }, 0.12)
          // Montaje: se despliega y encaja
          .to(st, { exploded: 0, duration: 0.54 }, 0.18)
          .to(st, { shutters: 1, duration: 0.09, ease: 'sine.inOut' }, 0.72)
          .to(shot, { ...S.end, duration: 0.3, ease: 'sine.inOut' }, 0.62)
          // Recogida: se cierra y empieza a replegarse
          .to(st, { shutters: 0, duration: 0.05, ease: 'sine.inOut' }, 0.84)
          .to(st, { exploded: 0.34, duration: 0.11, ease: 'sine.inOut' }, 0.89);
        tl.duration(1);
        setStep(0);
        return () => {
          delete el.dataset.step;
        };
      });
    },
    { scope: section, dependencies: [mode, capture], revertOnUpdate: true },
  );

  const show3D = mode === '3d' && load && !failed;

  return (
    <section
      ref={section}
      className="assembly surface-dark"
      data-assembly=""
      data-mode={mode}
      data-header="dark"
      data-surface="dark"
      aria-labelledby="montaje-titulo"
    >
      <div ref={stage} className="assembly__stage">
        {mode === '3d' ? (
          <div
            className="caseta-visual assembly__visual"
            aria-hidden="true"
            data-live={live && !failed ? '' : undefined}
          >
            {show3D ? (
              <AssemblyScene
                stateRef={stateRef}
                shotRef={shotRef}
                animRef={animRef}
                fit={capture || wide ? 'h' : 'w'}
                quality={quality}
                dpr={dpr}
                active={inView || capture}
                capture={capture}
                onInvalidate={onInvalidate}
                onFirstFrame={onFirstFrame}
                onError={onError}
              />
            ) : null}
          </div>
        ) : null}
        <div className="assembly__content container-site">
          <div className="assembly__col">
            {intro}
            <ol className="assembly__steps">
              {steps.map((s, i) => (
                <li key={s.title} className="assembly__step" data-index={i}>
                  <span className="assembly__bar" aria-hidden="true">
                    <span />
                  </span>
                  <p className="assembly__step-title">
                    <span className="assembly__step-n" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.title}
                  </p>
                  <p className="assembly__step-text">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
          {mode === '3d' ? null : <div className="assembly__poster">{poster}</div>}
        </div>
        <p className="sr-only">{sceneDescription}</p>
      </div>
    </section>
  );
}
