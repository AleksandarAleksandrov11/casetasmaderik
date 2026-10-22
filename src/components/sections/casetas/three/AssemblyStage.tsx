'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import {
  useCanInteractive3D,
  useDevFlag,
  useIdleReady,
  useInView,
  useMedia,
  usePosterKey,
} from '@/components/three/hooks';
import { createCasetaState, DPR_DESKTOP, DPR_MOBILE, type Quality, type SceneHandle } from '@/components/three/state';
import { MEDIA } from '@/lib/motion';
import { force3D, markTooSlowFor3D } from '@/lib/device';
import { ASSEMBLY_FRAMES, assemblyPose, STEP_TARGET } from './assemblyShots';
import { ASSEMBLY_FRAMES_MANIFEST } from './assemblyFrames';
import type { AssemblyAnim } from './AssemblyScene';

const AssemblyScene = dynamic(() => import('./AssemblyScene'), { ssr: false });

declare global {
  interface Window {
    /** Captura de fotogramas del montaje (solo en desarrollo). */
    __assemblySet?: (p: number) => void;
  }
}

export interface AssemblyStep {
  title: string;
  text: string;
}

export interface AssemblyLabels {
  slider: string;
  folded: string;
  assembled: string;
  play: string;
  pause: string;
}

/** La caseta plegada llega desde la derecha. */
const SLIDE_FROM = 5.5;

type Tween = { from: number; to: number; start: number; dur: number; slide?: boolean };

function frameSrc(i: number, sm = false): string {
  const m = ASSEMBLY_FRAMES_MANIFEST;
  return m ? `${m.base}/montaje-${String(i).padStart(2, '0')}${sm ? '-sm' : ''}.webp` : '';
}

/** Fotograma más cercano a la progresión. */
function nearestFrame(p: number): number {
  let best = 0;
  ASSEMBLY_FRAMES.forEach((f, i) => {
    if (Math.abs(f - p) < Math.abs(ASSEMBLY_FRAMES[best] - p)) best = i;
  });
  return best;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Montaje interactivo: un control desliza la caseta de plegada a montada, los
 * tres pasos (transporte, montaje y recogida) la llevan a cada estado y
 * "Ver el montaje" lo reproduce entero. Con WebGL es el modelo 3D; sin él,
 * fotogramas pregenerados con el mismo encuadre.
 */
export function AssemblyStage({
  intro,
  steps,
  labels,
  sceneDescription,
}: {
  intro: ReactNode;
  steps: AssemblyStep[];
  labels: AssemblyLabels;
  sceneDescription: string;
}) {
  const can3D = useCanInteractive3D();
  const posterKey = usePosterKey();
  const capture = posterKey === 'assembly-frames';
  const reduced = useMedia(MEDIA.reduced);
  const big = useMedia(MEDIA.desktop);
  const fine = useMedia(MEDIA.finePointer);
  const forceHigh = useDevFlag('hq') || capture;
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const pRef = useRef(1);
  const pose0 = assemblyPose(1);
  const stateRef = useRef(createCasetaState({ exploded: pose0.exploded, shutters: pose0.shutters }));
  const shotRef = useRef(pose0.shot);
  const animRef = useRef<AssemblyAnim>({ slide: 0 });
  const handleRef = useRef<SceneHandle>({ invalidate: null });

  const [value, setValue] = useState(100);
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tooSlow, setTooSlow] = useState(false);
  const [touched, setTouched] = useState(false);

  const mode: '3d' | 'frames' = capture || (can3D && !failed && !tooSlow) ? '3d' : 'frames';
  const near = useInView(section, '60% 0px');
  const inView = useInView(stage, '100px 0px');
  const load = useIdleReady(mode === '3d' && (near || capture), capture);
  const show3D = mode === '3d' && load;
  const quality: Quality = forceHigh ? 'high' : big && fine ? 'high' : 'low';
  const dpr: number | [number, number] = capture ? 1 : big ? DPR_DESKTOP : DPR_MOBILE;

  const onInvalidate = useCallback((fn: (() => void) | null) => {
    handleRef.current.invalidate = fn;
  }, []);
  const onFirstFrame = useCallback(() => setLive(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const onTooSlow = useCallback(() => {
    // Con el 3D forzado (pruebas sin GPU) se queda el 3D aunque vaya lento
    if (force3D()) return;
    markTooSlowFor3D();
    setTooSlow(true);
  }, []);

  /** Aplica una progresión al estado 3D y al control. */
  const apply = useCallback((p: number) => {
    pRef.current = p;
    const pose = assemblyPose(p);
    stateRef.current.exploded = pose.exploded;
    stateRef.current.shutters = pose.shutters;
    Object.assign(shotRef.current, pose.shot);
    setValue(Math.round(p * 100));
    handleRef.current.invalidate?.();
  }, []);

  // Animaciones (paso a paso o reproducción completa) con requestAnimationFrame
  const raf = useRef(0);
  const queue = useRef<Tween[]>([]);
  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    queue.current = [];
    setPlaying(false);
  }, []);
  const run = useCallback(
    (tweens: Tween[]) => {
      cancelAnimationFrame(raf.current);
      queue.current = tweens;
      setPlaying(true);
      let started = performance.now();
      const tick = (now: number) => {
        const t = queue.current[0];
        if (!t) {
          raf.current = 0;
          setPlaying(false);
          return;
        }
        const k = Math.min(1, (now - started) / t.dur);
        const v = t.from + (t.to - t.from) * ease(k);
        if (t.slide) {
          animRef.current.slide = v;
          handleRef.current.invalidate?.();
        } else apply(v);
        if (k >= 1) {
          queue.current.shift();
          started = now;
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [apply],
  );
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const fullPlay = useCallback(() => {
    setStep(0);
    apply(0);
    animRef.current.slide = mode === '3d' && !reduced ? SLIDE_FROM : 0;
    const tweens: Tween[] = [];
    if (mode === '3d' && !reduced) tweens.push({ from: SLIDE_FROM, to: 0, start: 0, dur: 1100, slide: true });
    tweens.push({ from: 0, to: 1, start: 0, dur: mode === '3d' ? 4600 : 2400 });
    run(tweens);
    window.setTimeout(() => setStep(1), mode === '3d' && !reduced ? 1100 : 0);
  }, [apply, mode, reduced, run]);

  const fullPlayArrival = () => {
    apply(0);
    if (mode === '3d' && !reduced) {
      animRef.current.slide = SLIDE_FROM;
      run([{ from: SLIDE_FROM, to: 0, start: 0, dur: 1100, slide: true }]);
    } else stop();
  };

  const goStep = (i: number) => {
    setTouched(true);
    setStep(i);
    const to = STEP_TARGET[i];
    if (i === 0) {
      fullPlayArrival();
      return;
    }
    const from = pRef.current;
    if (Math.abs(to - from) < 0.001) return;
    run([{ from, to, start: 0, dur: reduced ? 1 : 900 + Math.abs(to - from) * 2600 }]);
  };

  // Reproducción automática una vez, la primera vez que se ve (sin movimiento reducido)
  const auto = useRef(false);
  useEffect(() => {
    if (auto.current || touched || reduced || capture || !inView) return;
    if (mode === '3d' ? !live : !ASSEMBLY_FRAMES_MANIFEST) return;
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || auto.current) return;
        auto.current = true;
        io.disconnect();
        fullPlay();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, live, touched, reduced, capture, inView, fullPlay]);

  // Captura de fotogramas
  useEffect(() => {
    if (!capture) return;
    window.__assemblySet = (p: number) => {
      animRef.current.slide = 0;
      apply(p);
    };
    return () => {
      window.__assemblySet = undefined;
    };
  }, [capture, apply]);

  const frame = nearestFrame(value / 100);
  const manifest = ASSEMBLY_FRAMES_MANIFEST;
  const sizes = '(min-width: 1024px) 50vw, 100vw';

  return (
    <section
      ref={section}
      id="montaje"
      className="assembly surface-dark"
      data-mode={mode}
      data-live={live && !failed && mode === '3d' ? '' : undefined}
      data-capture={capture ? '' : undefined}
      data-header="dark"
      data-surface="dark"
      aria-labelledby="montaje-titulo"
    >
      <div className="assembly__grid container-site">
        <div className="assembly__copy">
          {intro}
          <ol className="assembly__steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <button type="button" className="assembly__step" aria-pressed={step === i} onClick={() => goStep(i)}>
                  <span className="assembly__step-n" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="assembly__step-body">
                    <span className="assembly__step-title">{s.title}</span>
                    <span className="assembly__step-text">{s.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="assembly__media">
          <div ref={stage} className="assembly__stage">
            <div className="assembly__visual" aria-hidden="true">
              {manifest
                ? (mode === '3d' ? [ASSEMBLY_FRAMES.length - 1] : ASSEMBLY_FRAMES.map((_, i) => i)).map((i) => (
                    // eslint-disable-next-line @next/next/no-img-element -- fotogramas pregenerados con srcset propio
                    <img
                      key={i}
                      className="assembly__frame"
                      data-on={(mode === '3d' ? i === ASSEMBLY_FRAMES.length - 1 : i === frame) ? '' : undefined}
                      src={frameSrc(i)}
                      srcSet={`${frameSrc(i, true)} ${manifest.smWidth}w, ${frameSrc(i)} ${manifest.width}w`}
                      sizes={sizes}
                      width={manifest.width}
                      height={manifest.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  ))
                : null}
              {show3D ? (
                <AssemblyScene
                  stateRef={stateRef}
                  shotRef={shotRef}
                  animRef={animRef}
                  fit="h"
                  quality={quality}
                  dpr={dpr}
                  active={inView || capture}
                  capture={capture}
                  onInvalidate={onInvalidate}
                  onFirstFrame={onFirstFrame}
                  onError={onError}
                  onTooSlow={forceHigh ? undefined : onTooSlow}
                />
              ) : null}
            </div>
          </div>

          <div className="assembly__controls">
            <button
              type="button"
              className="assembly__play"
              onClick={() => {
                setTouched(true);
                if (playing) stop();
                else fullPlay();
              }}
            >
              {playing ? <Pause aria-hidden="true" strokeWidth={1.5} /> : <Play aria-hidden="true" strokeWidth={1.5} />}
              <span>{playing ? labels.pause : labels.play}</span>
            </button>
            <label className="assembly__range">
              <span className="sr-only">{labels.slider}</span>
              <span className="assembly__range-end" aria-hidden="true">
                {labels.folded}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                aria-valuetext={`${value} %: ${value < 10 ? labels.folded : value > 90 ? labels.assembled : labels.slider}`}
                style={{ '--range-p': `${value}%` } as CSSProperties}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setTouched(true);
                  if (playing) stop();
                  animRef.current.slide = 0;
                  setStep(v < pRef.current ? 2 : 1);
                  apply(v);
                }}
              />
              <span className="assembly__range-end" aria-hidden="true">
                {labels.assembled}
              </span>
            </label>
          </div>
        </div>
      </div>
      <p className="sr-only">{sceneDescription}</p>
    </section>
  );
}
