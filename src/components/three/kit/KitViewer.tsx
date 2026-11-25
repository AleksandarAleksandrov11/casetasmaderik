'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { FoldVertical, Rotate3d, Ruler } from 'lucide-react';
import { useCanInteractive3D, useDevFlag, useIdleReady, useInView, useMedia, usePosterKey } from '../hooks';
import { createCasetaState, DPR_DESKTOP, DPR_MOBILE, type Quality, type SceneHandle } from '../state';
import { clampOrbit, createOrbit, nearestAngle, wrap360 } from '../interactive/orbit';
import { MEDIA } from '@/lib/motion';
import { force3D, markTooSlowFor3D } from '@/lib/device';
import { onFirstIntent } from '@/lib/intent';
import { KIT_FRAMES } from './frames';
import { KIT_DIM_LABEL, KIT_START, KIT_VIEWS } from './spec';
import type { KitTargets } from './KitScene';

const KitScene = dynamic(() => import('./KitScene'), { ssr: false });

export interface KitViewerLabels {
  hint: string;
  fold: string;
  dims: string;
  toolbar: string;
  sceneDescription: string;
}

type Toggle = 'fold' | 'dims';

function frameSrc(key: string, i: number, sm = false): string {
  if (!KIT_FRAMES) return '';
  return `${KIT_FRAMES.base}/${key}-${String(i).padStart(2, '0')}${sm ? '-sm' : ''}.webp`;
}

function frameSet(key: string, i: number): string {
  if (!KIT_FRAMES) return '';
  return `${frameSrc(key, i, true)} ${KIT_FRAMES.smWidth}w, ${frameSrc(key, i)} ${KIT_FRAMES.width}w`;
}

function frameIndex(az: number): number {
  if (!KIT_FRAMES) return 0;
  const n = KIT_FRAMES.angles.length;
  return Math.round(wrap360(az - KIT_FRAMES.angles[0]) / (360 / n)) % n;
}

/**
 * Kit de mesa y dos bancos interactivo: se gira arrastrando, con las flechas o
 * Ctrl + rueda (zoom), se pliega y se muestra su largo. Con WebGL es el modelo
 * 3D; sin él, la misma vista con fotogramas pregenerados (también se gira y se
 * pliega). El primer fotograma es el poster que llega con el HTML. Usa las
 * mismas clases que la caseta interactiva (interactive/styles.ts).
 */
export function KitViewer({
  labels,
  priority = false,
  sizes,
  left,
  right,
}: {
  labels: KitViewerLabels;
  priority?: boolean;
  sizes: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  const can3D = useCanInteractive3D();
  const capture = usePosterKey() === 'kit';
  const reduced = useMedia(MEDIA.reduced);
  const fine = useMedia(MEDIA.finePointer);
  const big = useMedia(MEDIA.desktop);
  const forceHigh = useDevFlag('hq') || capture;

  const [on, setOn] = useState<Record<Toggle, boolean>>({ fold: false, dims: false });
  const box = useRef<HTMLDivElement>(null);
  const targetsRef = useRef<KitTargets>({ fold: 0, dims: 0 });
  const stateRef = useRef(createCasetaState());
  const orbitRef = useRef(createOrbit(KIT_START, true));
  const handleRef = useRef<SceneHandle>({ invalidate: null });

  const [intent, setIntent] = useState(false);
  useEffect(() => onFirstIntent(() => setIntent(true)), []);

  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [tooSlow, setTooSlow] = useState(false);
  const [live, setLive] = useState(false);
  const [touched, setTouched] = useState(false);

  const mode: '3d' | 'frames' = capture || (can3D && !failed && !tooSlow) ? '3d' : 'frames';
  const load = useIdleReady(mode === '3d' && (fine || intent || capture), capture);
  const inView = useInView(box, '150px 0px');
  const quality: Quality = forceHigh ? 'high' : big && fine && !slow ? 'high' : 'low';
  const dpr: number | [number, number] = capture ? 1 : slow ? 1 : big ? DPR_DESKTOP : DPR_MOBILE;

  const invalidate = useCallback(() => handleRef.current.invalidate?.(), []);
  const onInvalidate = useCallback((fn: (() => void) | null) => {
    handleRef.current.invalidate = fn;
  }, []);
  const onFirstFrame = useCallback(() => setLive(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const onSlow = useCallback(() => setSlow(true), []);
  const onTooSlow = useCallback(() => {
    if (force3D()) return;
    markTooSlowFor3D();
    setTooSlow(true);
  }, []);

  // Fotogramas: el pedido se muestra en cuanto está descargado; hasta entonces sigue el anterior
  const key = on.fold ? '1' : '0';
  const [index, setIndex] = useState(0);
  const [wanted, setWanted] = useState<string[]>([]);
  const loaded = useRef(new Set<string>(['0-0']));
  const [tick, setTick] = useState(0);
  const [shown, setShown] = useState({ key: '0', index: 0 });
  const wantKey = useCallback((k: string) => setWanted((w) => (w.includes(k) ? w : [...w, k])), []);
  useEffect(() => {
    if (mode !== 'frames' || !KIT_FRAMES) return;
    if (!loaded.current.has(`${key}-${index}`)) return;
    setShown((cur) => (cur.key === key && cur.index === index ? cur : { key, index }));
  }, [mode, key, index, tick]);

  useEffect(() => {
    if (mode === '3d') invalidate();
  }, [mode, invalidate]);

  const stopAuto = useCallback(() => {
    orbitRef.current.auto = false;
    setTouched(true);
  }, []);

  const face = (view: { az: number; el: number }) => {
    const o = orbitRef.current;
    o.azT = nearestAngle(o.az, view.az);
    o.elT = view.el;
    clampOrbit(o);
    if (mode === 'frames') {
      o.az = o.azT;
      setIndex(frameIndex(o.azT));
    }
  };

  const set = (name: Toggle, value: boolean) => {
    stopAuto();
    if (value) face(KIT_VIEWS[name]);
    setOn((prev) => {
      const next = { ...prev, [name]: value };
      targetsRef.current = { fold: next.fold ? 1 : 0, dims: next.dims ? 1 : 0 };
      if (mode === 'frames' && name === 'fold') wantKey(next.fold ? '1' : '0');
      return next;
    });
    invalidate();
  };

  const syncFrames = () => {
    if (mode !== 'frames') return;
    wantKey(key);
    setIndex(frameIndex(orbitRef.current.azT));
  };

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Puntero sintético o ya liberado: el arrastre sigue sin captura
    }
    stopAuto();
    if (mode === 'frames') wantKey(key);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const o = orbitRef.current;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current > 0 && mode === '3d') o.zoomT *= dist / pinch.current;
      pinch.current = dist;
    } else {
      o.azT -= (cur.x - prev.x) * 0.4;
      if (mode === '3d') o.elT += (cur.y - prev.y) * 0.3;
    }
    clampOrbit(o);
    if (mode === 'frames') {
      o.az = o.azT;
      const i = frameIndex(o.azT);
      if (i !== index) setIndex(i);
    }
    invalidate();
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = 0;
  };

  useEffect(() => {
    const el = box.current;
    if (!el || mode !== '3d') return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const o = orbitRef.current;
      o.zoomT *= Math.exp(-e.deltaY * 0.004);
      clampOrbit(o);
      o.auto = false;
      handleRef.current.invalidate?.();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [mode]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const o = orbitRef.current;
    const step = mode === 'frames' && KIT_FRAMES ? 360 / KIT_FRAMES.angles.length : 15;
    const map: Record<string, () => void> = {
      ArrowLeft: () => (o.azT += step),
      ArrowRight: () => (o.azT -= step),
      ArrowUp: () => (o.elT += 5),
      ArrowDown: () => (o.elT -= 5),
      '+': () => (o.zoomT *= 1.12),
      '=': () => (o.zoomT *= 1.12),
      '-': () => (o.zoomT /= 1.12),
    };
    const fn = map[e.key];
    if (!fn) return;
    e.preventDefault();
    fn();
    clampOrbit(o);
    stopAuto();
    syncFrames();
    invalidate();
  };

  const live3D = live && !failed && mode === '3d';
  const toggles: { name: Toggle; label: string; icon: ReactNode }[] = [
    { name: 'fold', label: labels.fold, icon: <FoldVertical aria-hidden="true" strokeWidth={1.5} /> },
    { name: 'dims', label: labels.dims, icon: <Ruler aria-hidden="true" strokeWidth={1.5} /> },
  ];

  return (
    <div
      className="ic ic--viewer ic--kit"
      data-mode={mode}
      data-live={live3D ? '' : undefined}
      data-capture={capture ? '' : undefined}
    >
      {left ? <div className="ic__left">{left}</div> : null}
      {right ? <div className="ic__right">{right}</div> : null}
      <div
        ref={box}
        className="ic__stage"
        role="group"
        aria-roledescription={mode === '3d' ? 'visor 3D' : 'visor'}
        aria-label={labels.sceneDescription}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="ic__glow" aria-hidden="true" />
        <div className="ic__visual" aria-hidden="true">
          {KIT_FRAMES ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- fotogramas pregenerados con srcset propio */}
              <img
                className="ic__frame"
                data-on={mode === '3d' || (shown.key === '0' && shown.index === 0) ? '' : undefined}
                src={frameSrc('0', 0)}
                srcSet={frameSet('0', 0)}
                sizes={sizes}
                width={KIT_FRAMES.width}
                height={KIT_FRAMES.height}
                alt={labels.sceneDescription.split('.')[0]}
                draggable={false}
                decoding="async"
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
              />
              {mode === 'frames'
                ? wanted.map((k) =>
                    KIT_FRAMES!.angles.map((_, i) =>
                      k === '0' && i === 0 ? null : (
                        // eslint-disable-next-line @next/next/no-img-element -- fotogramas pregenerados con srcset propio
                        <img
                          key={`${k}-${i}`}
                          className="ic__frame"
                          data-on={shown.key === k && shown.index === i ? '' : undefined}
                          src={frameSrc(k, i)}
                          srcSet={frameSet(k, i)}
                          sizes={sizes}
                          width={KIT_FRAMES!.width}
                          height={KIT_FRAMES!.height}
                          alt=""
                          draggable={false}
                          decoding="async"
                          onLoad={() => {
                            loaded.current.add(`${k}-${i}`);
                            setTick((t) => t + 1);
                          }}
                        />
                      ),
                    ),
                  )
                : null}
            </>
          ) : null}
          {mode === '3d' && load ? (
            <KitScene
              stateRef={stateRef}
              targetsRef={targetsRef}
              orbitRef={orbitRef}
              quality={quality}
              dpr={dpr}
              active={inView || capture}
              capture={capture}
              reduced={reduced}
              onInvalidate={onInvalidate}
              onFirstFrame={onFirstFrame}
              onError={onError}
              onSlow={quality === 'high' && !forceHigh ? onSlow : undefined}
              onTooSlow={forceHigh ? undefined : onTooSlow}
            />
          ) : null}
        </div>

        {mode === 'frames' && on.dims ? (
          <p className="ic__dims" aria-hidden="true">
            <Ruler aria-hidden="true" strokeWidth={1.5} />
            {KIT_DIM_LABEL}
          </p>
        ) : null}

        <p className="ic__hint" data-hidden={touched ? '' : undefined} aria-hidden="true">
          <Rotate3d aria-hidden="true" strokeWidth={1.5} />
          {labels.hint}
        </p>
      </div>

      <div className="ic__dock" role="toolbar" aria-label={labels.toolbar}>
        {toggles.map((t) => (
          <button
            key={t.name}
            type="button"
            className="ic__toggle"
            aria-pressed={on[t.name]}
            onClick={() => set(t.name, !on[t.name])}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
