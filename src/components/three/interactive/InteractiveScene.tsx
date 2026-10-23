'use client';

import { useEffect, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import CasetaCanvas from '../scene/CasetaCanvas';
import { CasetaModel } from '../caseta/CasetaModel';
import { Studio } from '../scene/Studio';
import { PerfProbe } from '../scene/PerfProbe';
import { applyShot } from '../scene/camera';
import { windowOpen } from '../caseta/rig';
import { easeInOut, type CasetaState, type Quality } from '../state';
import { ANCHORS } from './anchors';
import { FRAME_RATIO, SPAN_H, SPAN_W, TARGET, type InteractiveTargets, type Orbit } from './orbit';

declare global {
  interface Window {
    /** Captura de fotogramas (solo en desarrollo): fija vista y estado sin transición. */
    __casetaSet?: (v: Partial<InteractiveTargets> & { az?: number; el?: number }) => void;
  }
}

export interface InteractiveSceneProps {
  stateRef: RefObject<CasetaState>;
  targetsRef: RefObject<InteractiveTargets>;
  orbitRef: RefObject<Orbit>;
  /** Marcador del punto de interés activo (lo coloca la escena por proyección). */
  markerRef: RefObject<HTMLElement | null>;
  activeRef: RefObject<string | null>;
  quality: Quality;
  dpr: number | [number, number];
  active: boolean;
  capture?: boolean;
  /** Sin autorrotación ni transiciones largas. */
  reduced: boolean;
  /** Noche: cotas en claro. */
  night: boolean;
  onInvalidate: (fn: (() => void) | null) => void;
  onFirstFrame?: () => void;
  onError?: () => void;
  onSlow?: () => void;
  onTooSlow?: () => void;
}

/** Caseta interactiva en 3D (chunk diferido): hero de Inicio y visor de /casetas. */
export default function InteractiveScene(props: InteractiveSceneProps) {
  const { quality, dpr, active, capture, onInvalidate, onFirstFrame, onError, onSlow, onTooSlow, stateRef, night } =
    props;
  return (
    <CasetaCanvas
      quality={quality}
      dpr={dpr}
      active={active}
      capture={capture}
      onInvalidate={onInvalidate}
      onFirstFrame={onFirstFrame}
      onError={onError}
      className="caseta-canvas"
    >
      <Rig {...props} />
      <CasetaModel stateRef={stateRef} quality={quality} showDimensions dimsColor={night ? '#F3EDE4' : '#4a3f36'} />
      <Studio stateRef={stateRef} quality={quality} />
      {!capture && (onSlow || onTooSlow) ? (
        <PerfProbe key={quality} onSlow={onSlow} onTooSlow={onTooSlow} floorFps={11} />
      ) : null}
    </CasetaCanvas>
  );
}

const _p = new THREE.Vector3();
const _n = new THREE.Vector3();
const _d = new THREE.Vector3();

function Rig({ stateRef, targetsRef, orbitRef, markerRef, activeRef, capture, reduced }: InteractiveSceneProps) {
  const get = useThree((s) => s.get);

  // Puente de captura de fotogramas (scripts/posters/capture-turntable.mjs)
  useEffect(() => {
    if (!capture) return;
    window.__casetaSet = (v) => {
      const o = orbitRef.current;
      const s = stateRef.current;
      const t = targetsRef.current;
      if (!o || !s || !t) return;
      o.auto = false;
      if (v.az !== undefined) o.az = o.azT = v.az;
      if (v.el !== undefined) o.el = o.elT = v.el;
      for (const k of ['shutters', 'door', 'night', 'dims'] as const) {
        if (v[k] !== undefined) s[k] = t[k] = v[k];
      }
      get().invalidate();
    };
    return () => {
      window.__casetaSet = undefined;
    };
  }, [capture, get, orbitRef, stateRef, targetsRef]);

  useFrame((state, rawDelta) => {
    const o = orbitRef.current;
    const s = stateRef.current;
    const t = targetsRef.current;
    if (!o || !s || !t) return;
    const delta = Math.min(rawDelta, 0.05);
    let moving = false;

    if (o.auto && !capture && !reduced) {
      o.azT += delta * 6;
      moving = true;
    }
    const k = 1 - Math.exp(-delta * 7);
    for (const [cur, tgt] of [
      ['az', 'azT'],
      ['el', 'elT'],
      ['zoom', 'zoomT'],
    ] as const) {
      const diff = o[tgt] - o[cur];
      if (Math.abs(diff) > 0.0005) {
        o[cur] += diff * k;
        moving = true;
      } else o[cur] = o[tgt];
    }

    // Contraventanas, puerta, luz y cotas con transición suave
    const ks = 1 - Math.exp(-delta * (reduced ? 6 : 2.6));
    for (const key of ['shutters', 'door', 'night', 'dims'] as const) {
      const diff = t[key] - s[key];
      if (Math.abs(diff) > 0.001) {
        s[key] += diff * ks;
        moving = true;
      } else s[key] = t[key];
    }

    const { width, height } = state.size;
    const wide = width / Math.max(height, 1) > FRAME_RATIO;
    applyShot(
      state.camera as THREE.PerspectiveCamera,
      {
        az: o.az,
        el: o.el,
        dist: TARGET.dist,
        tx: TARGET.tx,
        ty: TARGET.ty,
        ax: TARGET.ax,
        ay: TARGET.ay,
        span: (wide ? SPAN_H : SPAN_W) / o.zoom,
      },
      width,
      height,
      wide ? 'h' : 'w',
    );
    state.camera.updateMatrixWorld();

    // Marcador del punto de interés activo
    const marker = markerRef.current;
    const id = activeRef.current;
    const a = id ? ANCHORS[id] : undefined;
    if (marker) {
      if (!a) {
        if (marker.dataset.hidden !== '1') marker.dataset.hidden = '1';
      } else {
        const f = easeInOut(windowOpen(s.shutters, 0));
        _p.set(
          a.closed[0] + (a.open[0] - a.closed[0]) * f,
          a.closed[1] + (a.open[1] - a.closed[1]) * f,
          a.closed[2] + (a.open[2] - a.closed[2]) * f,
        );
        _n.set(...a.normal).normalize();
        _d.subVectors(state.camera.position, _p).normalize();
        const facing = _n.dot(_d) > 0.1;
        _p.project(state.camera);
        const x = ((_p.x + 1) / 2) * width;
        const y = ((1 - _p.y) / 2) * height;
        marker.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        const hidden = facing ? '0' : '1';
        if (marker.dataset.hidden !== hidden) marker.dataset.hidden = hidden;
      }
    }

    if (moving) state.invalidate();
  }, -2);
  return null;
}
