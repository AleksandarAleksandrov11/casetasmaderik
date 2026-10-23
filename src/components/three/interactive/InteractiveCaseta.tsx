'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { DoorOpen, Lightbulb, PanelTopOpen, Rotate3d, Ruler, X } from 'lucide-react';
import { useCanInteractive3D, useDevFlag, useIdleReady, useInView, useMedia, usePosterKey } from '../hooks';
import { createCasetaState, DPR_DESKTOP, DPR_MOBILE, type Quality, type SceneHandle } from '../state';
import { MEDIA } from '@/lib/motion';
import { force3D, markTooSlowFor3D } from '@/lib/device';
import { onFirstIntent } from '@/lib/intent';
import { ANCHORS } from './anchors';
import { clampOrbit, createOrbit, nearestAngle, START_VIEW, wrap360, type InteractiveTargets } from './orbit';
import { TURNTABLE } from './turntable';

const InteractiveScene = dynamic(() => import('./InteractiveScene'), { ssr: false });

export interface InteractiveLabels {
  hint: string;
  windows: string;
  door: string;
  lights: string;
  dims: string;
  toolbar: string;
  sceneDescription: string;
}

export interface CasetaFeature {
  id: string;
  title: string;
  text: string;
}

type Toggle = 'windows' | 'door' | 'night' | 'dims';

const DIMS_TEXT = '2,90 × 2,00 × 2,47 m';

/** Clave del fotograma: ventanas, puerta y luz. */
function frameKey(windows: boolean, door: boolean, night: boolean): string {
  return `${windows ? 1 : 0}${door ? 1 : 0}${night ? 1 : 0}`;
}

function frameSrc(key: string, i: number, sm = false): string {
  if (!TURNTABLE) return '';
  return `${TURNTABLE.base}/${key}-${String(i).padStart(2, '0')}${sm ? '-sm' : ''}.webp`;
}

function frameSet(key: string, i: number): string {
  if (!TURNTABLE) return '';
  return `${frameSrc(key, i, true)} ${TURNTABLE.smWidth}w, ${frameSrc(key, i)} ${TURNTABLE.width}w`;
}

/** Vista a la que gira la caseta al activar cada botón. */
const TOGGLE_VIEWS: Record<Toggle, { az: number; el: number }> = {
  windows: { az: 10, el: 9 },
  door: { az: -66, el: 8 },
  night: { az: -24, el: 8 },
  dims: { az: -34, el: 20 },
};

function toTargets(v: Record<Toggle, boolean>): InteractiveTargets {
  return { shutters: v.windows ? 1 : 0, door: v.door ? 1 : 0, night: v.night ? 1 : 0, dims: v.dims ? 1 : 0 };
}

/** Fotograma más cercano a un azimut. */
function frameIndex(az: number): number {
  if (!TURNTABLE) return 0;
  const n = TURNTABLE.angles.length;
  const step = 360 / n;
  return Math.round(wrap360(az - TURNTABLE.angles[0]) / step) % n;
}

/**
 * Caseta interactiva: se gira arrastrando (horizontal en táctil, para no
 * bloquear el scroll), con las flechas del teclado o Ctrl + rueda para el
 * zoom, y se abren ventanas y puerta, se enciende la luz y se muestran las
 * medidas. Con WebGL es el modelo 3D; sin él (ahorro de datos, WebGL por
 * software, equipos lentos) se usa la misma vista con fotogramas
 * pregenerados, que también se gira y se abre. El primer fotograma es el
 * poster que llega con el HTML.
 */
export function InteractiveCaseta({
  labels,
  features,
  initial = {},
  variant,
  priority = false,
  sizes,
  demo = false,
  fallbackPoster,
  className = '',
  themeSection = false,
  left,
  right,
  children,
}: {
  labels: InteractiveLabels;
  /** Puntos de interés: botones que giran la caseta hasta cada parte y explican qué es. */
  features?: CasetaFeature[];
  initial?: Partial<Record<Toggle, boolean>>;
  variant: 'hero' | 'viewer';
  /** Poster con prioridad alta (por encima del pliegue). */
  priority?: boolean;
  sizes: string;
  /** Abre las ventanas sola poco después de cargar, si nadie la ha tocado. */
  demo?: boolean;
  /** Poster si aún no hay fotogramas generados. */
  fallbackPoster?: ReactNode;
  className?: string;
  /** De noche, la sección que la contiene pasa a oscura (data-header="dark") y el header se adapta. */
  themeSection?: boolean;
  /** Textos a los lados de la caseta (en móvil, encima): el CSS de cada página los coloca. */
  left?: ReactNode;
  right?: ReactNode;
  /** Contenido extra dentro del escenario (p. ej. etiquetas del hero). */
  children?: ReactNode;
}) {
  const can3D = useCanInteractive3D();
  const posterKey = usePosterKey();
  const capture = posterKey === 'turntable';
  const reduced = useMedia(MEDIA.reduced);
  const fine = useMedia(MEDIA.finePointer);
  const big = useMedia(MEDIA.desktop);
  const forceHigh = useDevFlag('hq') || capture;

  const [on, setOn] = useState<Record<Toggle, boolean>>({
    windows: Boolean(initial.windows),
    door: Boolean(initial.door),
    night: Boolean(initial.night),
    dims: Boolean(initial.dims),
  });
  const box = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<string | null>(null);
  const targetsRef = useRef<InteractiveTargets>(toTargets(on));
  const stateRef = useRef(createCasetaState(toTargets(on)));
  const orbitRef = useRef(createOrbit(START_VIEW, true));
  const handleRef = useRef<SceneHandle>({ invalidate: null });

  const [intent, setIntent] = useState(false);
  useEffect(() => onFirstIntent(() => setIntent(true)), []);

  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [tooSlow, setTooSlow] = useState(false);
  const [live, setLive] = useState(false);
  const [touched, setTouched] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const mode: '3d' | 'frames' = capture || (can3D && !failed && !tooSlow) ? '3d' : 'frames';
  // El chunk de three espera a un momento ocioso; en táctil, además, a la primera interacción
  const load = useIdleReady(mode === '3d' && (fine || intent || capture), capture);
  const inView = useInView(box, '150px 0px');
  const show3D = mode === '3d' && load;
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
    // Con el 3D forzado (pruebas sin GPU) se queda el 3D aunque vaya lento
    if (force3D()) return;
    markTooSlowFor3D();
    setTooSlow(true);
  }, []);

  // Fotogramas: índice visible y estados cuyos fotogramas ya se piden
  const key = frameKey(on.windows, on.door, on.night);
  const [index, setIndex] = useState(0);
  const [wanted, setWanted] = useState<string[]>([]);
  const posterKeyState = frameKey(Boolean(initial.windows), Boolean(initial.door), Boolean(initial.night));
  // El poster cuenta como cargado: es el fondo mientras llegan los demás
  const loaded = useRef(new Set<string>([`${posterKeyState}-0`]));
  const [tick, setTick] = useState(0);
  const [shown, setShown] = useState<{ key: string; index: number }>({ key: posterKeyState, index: 0 });
  const wantKey = useCallback((k: string) => setWanted((w) => (w.includes(k) ? w : [...w, k])), []);
  // Se muestra el fotograma pedido en cuanto está descargado; hasta entonces sigue el anterior
  useEffect(() => {
    if (mode !== 'frames' || !TURNTABLE) return;
    if (!loaded.current.has(`${key}-${index}`)) return;
    setShown((cur) => (cur.key === key && cur.index === index ? cur : { key, index }));
  }, [mode, key, index, tick]);

  useEffect(() => {
    if (!themeSection) return;
    const section = box.current?.closest<HTMLElement>('section[data-header]');
    if (section) section.dataset.header = on.night ? 'dark' : 'light';
  }, [themeSection, on.night]);

  // Pasa a 3D: la órbita parte del fotograma que se estaba viendo
  useEffect(() => {
    if (mode === '3d') invalidate();
  }, [mode, invalidate]);

  const stopAuto = useCallback(() => {
    orbitRef.current.auto = false;
    setTouched(true);
  }, []);

  /** Gira la caseta hasta una vista (camino más corto). */
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
    // Al activar algo, la caseta gira hasta donde mejor se ve
    if (value) face(TOGGLE_VIEWS[name]);
    setOn((prev) => {
      const next = { ...prev, [name]: value };
      targetsRef.current = toTargets(next);
      if (mode === 'frames' && name !== 'dims') wantKey(frameKey(next.windows, next.door, next.night));
      return next;
    });
    invalidate();
  };

  // Demostración: abre las ventanas una vez, poco después de verse en 3D
  const demoDone = useRef(false);
  useEffect(() => {
    if (!demo || demoDone.current || !live || touched || reduced || capture) return;
    const t = window.setTimeout(() => {
      demoDone.current = true;
      if (orbitRef.current.auto) {
        setOn((prev) => {
          const next = { ...prev, windows: true };
          targetsRef.current = toTargets(next);
          return next;
        });
        invalidate();
      }
    }, 1600);
    return () => window.clearTimeout(t);
  }, [demo, live, touched, reduced, capture, invalidate]);

  const syncFrames = () => {
    if (mode !== 'frames') return;
    wantKey(key);
    setIndex(frameIndex(orbitRef.current.azT));
  };

  // Arrastre para girar; dos dedos para el zoom (solo 3D)
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
      // Arriba y abajo también (en táctil el escenario 3D no deja hacer scroll, ver styles.ts)
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

  // Ctrl + rueda (o pellizco del trackpad) para el zoom, sin secuestrar el scroll normal
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
    const step = mode === 'frames' && TURNTABLE ? 360 / TURNTABLE.angles.length : 15;
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

  /** Gira la caseta hasta un punto de interés y lo explica. */
  const select = (id: string | null) => {
    stopAuto();
    setActive(id);
    activeRef.current = id;
    const a = id ? ANCHORS[id] : undefined;
    if (a) {
      const o = orbitRef.current;
      o.azT = nearestAngle(o.az, a.az);
      o.elT = id === 'cubierta' ? 24 : Math.min(Math.max(o.elT, 6), 16);
      clampOrbit(o);
      if (id === 'puerta' && !on.door) set('door', true);
      if ((id === 'ventanas' || id === 'contraventana') && !on.windows) set('windows', true);
      syncFrames();
    }
    invalidate();
  };

  const live3D = live && !failed && mode === '3d';
  const night = on.night;
  const toggles: { name: Toggle; label: string; icon: ReactNode; hide?: boolean }[] = [
    { name: 'windows', label: labels.windows, icon: <PanelTopOpen aria-hidden="true" strokeWidth={1.5} /> },
    { name: 'door', label: labels.door, icon: <DoorOpen aria-hidden="true" strokeWidth={1.5} /> },
    { name: 'night', label: labels.lights, icon: <Lightbulb aria-hidden="true" strokeWidth={1.5} /> },
    { name: 'dims', label: labels.dims, icon: <Ruler aria-hidden="true" strokeWidth={1.5} /> },
  ];
  const feature = features?.find((f) => f.id === active);

  return (
    <div
      className={`ic ic--${variant} ${className}`}
      data-mode={mode}
      data-night={night ? '' : undefined}
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
          {TURNTABLE ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- fotogramas pregenerados con srcset propio */}
              <img
                className="ic__frame"
                data-on={mode === '3d' || (shown.key === posterKeyState && shown.index === 0) ? '' : undefined}
                src={frameSrc(posterKeyState, 0)}
                srcSet={frameSet(posterKeyState, 0)}
                sizes={sizes}
                width={TURNTABLE.width}
                height={TURNTABLE.height}
                alt=""
                draggable={false}
                decoding="async"
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
              />
              {mode === 'frames'
                ? wanted.map((k) =>
                    TURNTABLE!.angles.map((_, i) =>
                      k === posterKeyState && i === 0 ? null : (
                        // eslint-disable-next-line @next/next/no-img-element -- fotogramas pregenerados con srcset propio
                        <img
                          key={`${k}-${i}`}
                          className="ic__frame"
                          data-on={shown.key === k && shown.index === i ? '' : undefined}
                          src={frameSrc(k, i)}
                          srcSet={frameSet(k, i)}
                          sizes={sizes}
                          width={TURNTABLE!.width}
                          height={TURNTABLE!.height}
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
          ) : (
            fallbackPoster
          )}
          {show3D ? (
            <InteractiveScene
              stateRef={stateRef}
              targetsRef={targetsRef}
              orbitRef={orbitRef}
              markerRef={markerRef}
              activeRef={activeRef}
              quality={quality}
              dpr={dpr}
              active={inView || capture}
              capture={capture}
              reduced={reduced}
              night={on.night}
              onInvalidate={onInvalidate}
              onFirstFrame={onFirstFrame}
              onError={onError}
              onSlow={quality === 'high' && !forceHigh ? onSlow : undefined}
              onTooSlow={forceHigh ? undefined : onTooSlow}
            />
          ) : null}
          {/* Dentro del visual: comparte su escala (el hero y el visor la amplían) */}
          {live3D ? <div ref={markerRef} className="ic__marker" data-hidden="1" /> : null}
        </div>

        {mode === 'frames' && on.dims ? (
          <p className="ic__dims" aria-hidden="true">
            <Ruler aria-hidden="true" strokeWidth={1.5} />
            {DIMS_TEXT}
          </p>
        ) : null}

        <p className="ic__hint" data-hidden={touched ? '' : undefined} aria-hidden="true">
          <Rotate3d aria-hidden="true" strokeWidth={1.5} />
          {labels.hint}
        </p>
        {children}
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

      {features?.length ? (
        <div className="ic__features">
          <ul className="ic__chips" aria-label="Partes de la caseta">
            {features.map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="ic__chip"
                  aria-pressed={active === f.id}
                  aria-controls="caseta-parte"
                  onClick={() => select(active === f.id ? null : f.id)}
                >
                  <span className="ic__chip-n" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {f.title}
                </button>
              </li>
            ))}
          </ul>
          <div id="caseta-parte" className="ic__card" aria-live="polite" data-open={feature ? '' : undefined}>
            {feature ? (
              <>
                <p className="ic__card-title">{feature.title}</p>
                <p className="ic__card-text">{feature.text}</p>
                <button
                  type="button"
                  className="ic__card-close"
                  aria-label={`Cerrar: ${feature.title}`}
                  onClick={() => select(null)}
                >
                  <X aria-hidden="true" strokeWidth={1.5} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
