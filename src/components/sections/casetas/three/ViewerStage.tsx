'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Hand, X } from 'lucide-react';
import { useCan3D, useDevFlag, useIdleReady, useInView, useMedia, usePosterKey } from '@/components/three/hooks';
import { createCasetaState, DPR_DESKTOP, DPR_MOBILE, type Quality, type SceneHandle } from '@/components/three/state';
import { MEDIA } from '@/lib/motion';
import { markTooSlowFor3D } from '@/lib/device';
import { ANCHORS } from './anchors';
import { WIDE } from './media';
import { clampOrbit, createOrbit, nearestAngle, VIEWER_START } from './orbit';
import type { ViewerTargets } from './ViewerScene';

const ViewerScene = dynamic(() => import('./ViewerScene'), { ssr: false });

export interface Hotspot {
  id: string;
  title: string;
  text: string;
}

export interface ViewerLabels {
  hint: string;
  open: string;
  close: string;
  day: string;
  night: string;
  sceneDescription: string;
}

/**
 * Visor 3D de /casetas: giro con arrastre (horizontal en táctil, para no
 * bloquear el scroll de la página), pellizco o Ctrl + rueda para el zoom,
 * flechas del teclado, seis puntos de interés accesibles y controles
 * Abrir / Cerrar y Día / Noche con transición suave.
 * Sin 3D se queda el poster y la lista de puntos de interés en texto.
 */
export function ViewerStage({
  copy,
  poster,
  hotspots,
  labels,
  list,
}: {
  copy: ReactNode;
  poster: ReactNode;
  hotspots: Hotspot[];
  labels: ViewerLabels;
  /** Lista de puntos de interés en HTML (sin 3D). */
  list: ReactNode;
}) {
  const can3D = useCan3D();
  const posterKey = usePosterKey();
  const big = useMedia(MEDIA.desktop);
  const wide = useMedia(WIDE);
  const fine = useMedia(MEDIA.finePointer);
  const capture = posterKey === 'viewer' || posterKey === 'viewer-mobile';
  const forceHigh = useDevFlag('hq') || capture;
  const box = useRef<HTMLDivElement>(null);
  const stateRef = useRef(createCasetaState({ shutters: 1 }));
  const targetsRef = useRef<ViewerTargets>({ shutters: 1, night: 0 });
  const orbitRef = useRef(createOrbit());
  const hotspotEls = useRef<(HTMLElement | null)[]>([]);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const handleRef = useRef<SceneHandle>({ invalidate: null });
  const load = useIdleReady(can3D && !(posterKey && !capture), capture);
  const inView = useInView(box, '150px 0px');
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [open, setOpen] = useState(true);
  const [night, setNight] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const mode = can3D && !failed && !(posterKey && !capture) ? '3d' : 'static';
  const quality: Quality = forceHigh ? 'high' : big && fine && !slow ? 'high' : 'low';
  const dpr: number | [number, number] = capture ? window.devicePixelRatio : slow ? 1 : big ? DPR_DESKTOP : DPR_MOBILE;
  const ids = hotspots.map((h) => h.id);

  const invalidate = useCallback(() => handleRef.current.invalidate?.(), []);
  const onInvalidate = useCallback((fn: (() => void) | null) => {
    handleRef.current.invalidate = fn;
  }, []);
  const onFirstFrame = useCallback(() => setLive(true), []);

  // Depuración en desarrollo: ?az=&el=&zoom=&open=0&night=1 fija la vista
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const q = new URLSearchParams(window.location.search);
    const o = orbitRef.current;
    const num = (k: string) => (q.has(k) ? Number(q.get(k)) : null);
    const az = num('az');
    const el = num('el');
    const zoom = num('zoom');
    if (az !== null || capture) o.auto = false;
    if (az !== null) o.az = o.azT = az;
    if (el !== null) o.el = o.elT = el;
    if (zoom !== null) o.zoom = o.zoomT = zoom;
    if (q.get('open') === '0') stateRef.current.shutters = targetsRef.current.shutters = 0;
    if (q.get('night') === '1') stateRef.current.night = targetsRef.current.night = 1;
  }, [capture]);
  const onError = useCallback(() => setFailed(true), []);
  const onSlow = useCallback(() => setSlow(true), []);

  /** La primera interacción para la autorrotación y oculta la pista. */
  const stopAuto = useCallback(() => {
    orbitRef.current.auto = false;
    setTouched(true);
  }, []);

  // Arrastre para girar; dos dedos para el zoom
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.hotspot, .hotspot__panel')) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    stopAuto();
    setActive(null);
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
      if (pinch.current > 0) o.zoomT *= dist / pinch.current;
      pinch.current = dist;
    } else {
      o.azT -= (cur.x - prev.x) * 0.38;
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') o.elT += (cur.y - prev.y) * 0.18;
    }
    clampOrbit(o);
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
    if (e.key === 'Escape' && active) {
      const i = ids.indexOf(active);
      setActive(null);
      buttons.current[i]?.focus();
      return;
    }
    if (e.target !== e.currentTarget) return;
    const o = orbitRef.current;
    const map: Record<string, () => void> = {
      ArrowLeft: () => (o.azT += 15),
      ArrowRight: () => (o.azT -= 15),
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
    invalidate();
  };

  // Cerrar el panel al pulsar fuera
  useEffect(() => {
    if (!active) return;
    const onDoc = (e: globalThis.PointerEvent) => {
      if (!(e.target as HTMLElement).closest?.('.hotspot-wrap, .hotspot__panel')) setActive(null);
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [active]);

  /** Gira la caseta hasta el punto de interés (al enfocarlo con teclado o si está oculto). */
  const flyTo = (id: string) => {
    const a = ANCHORS[id];
    if (!a) return;
    const o = orbitRef.current;
    o.azT = nearestAngle(o.az, a.az);
    o.elT = Math.max(o.elT, id === 'cubierta' ? 22 : VIEWER_START.el);
    clampOrbit(o);
    stopAuto();
    invalidate();
  };

  const setShutters = (v: boolean) => {
    setOpen(v);
    targetsRef.current.shutters = v ? 1 : 0;
    invalidate();
  };
  const setLight = (v: boolean) => {
    setNight(v);
    targetsRef.current.night = v ? 1 : 0;
    invalidate();
  };

  const show3D = mode === '3d' && load;

  return (
    <div className="viewer__grid container-site" data-mode={mode} data-night={night ? '' : undefined}>
      <div className="viewer__copy">
        {copy}
        {mode === '3d' ? (
          <div className="viewer__controls">
            <div className="viewer__seg" role="group" aria-label="Contraventanas">
              <button type="button" aria-pressed={open} onClick={() => setShutters(true)}>
                {labels.open}
              </button>
              <button type="button" aria-pressed={!open} onClick={() => setShutters(false)}>
                {labels.close}
              </button>
            </div>
            <div className="viewer__seg" role="group" aria-label="Luz">
              <button type="button" aria-pressed={!night} onClick={() => setLight(false)}>
                {labels.day}
              </button>
              <button type="button" aria-pressed={night} onClick={() => setLight(true)}>
                {labels.night}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="viewer__media">
        <div
          ref={box}
          className="viewer__box"
          data-live={live && !failed ? '' : undefined}
          data-fit={wide ? 'h' : 'w'}
          {...(mode === '3d'
            ? {
                role: 'group',
                'aria-roledescription': 'visor 3D',
                'aria-label': labels.sceneDescription,
                tabIndex: 0,
                onKeyDown,
                onPointerDown,
                onPointerMove,
                onPointerUp,
                onPointerCancel: onPointerUp,
              }
            : {})}
        >
          <div className="caseta-visual viewer__visual" aria-hidden="true" data-live={live && !failed ? '' : undefined}>
            {poster}
            {show3D ? (
              <ViewerScene
                stateRef={stateRef}
                targetsRef={targetsRef}
                orbitRef={orbitRef}
                hotspotsRef={hotspotEls}
                hotspotIds={ids}
                fit={wide ? 'h' : 'w'}
                quality={quality}
                dpr={dpr}
                active={inView || capture}
                capture={capture}
                onInvalidate={onInvalidate}
                onFirstFrame={onFirstFrame}
                onError={onError}
                onSlow={quality === 'high' && !forceHigh ? onSlow : undefined}
                onTooSlow={forceHigh ? undefined : markTooSlowFor3D}
              />
            ) : null}
          </div>

          {mode === '3d' && live && !capture ? (
            <>
              <div className="viewer__hotspots">
                {hotspots.map((h, i) => {
                  const isOpen = active === h.id;
                  return (
                    <div
                      key={h.id}
                      className="hotspot-wrap"
                      data-hidden="1"
                      data-open={isOpen ? '' : undefined}
                      ref={(el) => {
                        hotspotEls.current[i] = el;
                      }}
                    >
                      <button
                        ref={(el) => {
                          buttons.current[i] = el;
                        }}
                        type="button"
                        className="hotspot"
                        aria-expanded={isOpen}
                        aria-controls={`punto-${h.id}`}
                        onClick={() => {
                          const wrap = hotspotEls.current[i];
                          if (!isOpen && wrap?.dataset.hidden === '1') flyTo(h.id);
                          stopAuto();
                          setActive(isOpen ? null : h.id);
                        }}
                        onFocus={(e) => {
                          if (e.currentTarget.matches(':focus-visible')) flyTo(h.id);
                        }}
                      >
                        <span className="sr-only">{h.title}</span>
                        <span className="hotspot__dot" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="viewer__panels">
                {hotspots.map((h, i) => (
                  <div key={h.id} id={`punto-${h.id}`} className="hotspot__panel" hidden={active !== h.id}>
                    <p className="hotspot__title">{h.title}</p>
                    <p className="hotspot__text">{h.text}</p>
                    <button
                      type="button"
                      className="hotspot__close"
                      aria-label={`Cerrar: ${h.title}`}
                      onClick={() => {
                        setActive(null);
                        buttons.current[i]?.focus();
                      }}
                    >
                      <X aria-hidden="true" strokeWidth={1.5} className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {mode === '3d' && live && !capture ? (
            <p className="viewer__hint" data-hidden={touched || active ? '' : undefined} aria-hidden="true">
              <Hand strokeWidth={1.5} className="size-4" aria-hidden="true" />
              {labels.hint}
            </p>
          ) : null}
        </div>
        {mode === '3d' ? null : list}
      </div>
    </div>
  );
}
