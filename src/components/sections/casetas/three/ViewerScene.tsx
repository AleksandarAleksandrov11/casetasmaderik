'use client';

import type { RefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import CasetaCanvas from '@/components/three/scene/CasetaCanvas';
import { CasetaModel } from '@/components/three/caseta/CasetaModel';
import { Studio } from '@/components/three/scene/Studio';
import { PerfProbe } from '@/components/three/scene/PerfProbe';
import { applyShot } from '@/components/three/scene/camera';
import { windowOpen } from '@/components/three/caseta/rig';
import { easeInOut, type CasetaState, type FitMode, type Quality } from '@/components/three/state';
import { ANCHORS } from './anchors';
import type { ViewerOrbit } from './orbit';

export interface ViewerTargets {
  shutters: number;
  night: number;
}

export interface ViewerSceneProps {
  stateRef: RefObject<CasetaState>;
  targetsRef: RefObject<ViewerTargets>;
  orbitRef: RefObject<ViewerOrbit>;
  hotspotsRef: RefObject<(HTMLElement | null)[]>;
  hotspotIds: string[];
  /** 'h' en escritorio (caja apaisada), 'w' en móvil (caja cuadrada). */
  fit: FitMode;
  quality: Quality;
  dpr: number | [number, number];
  active: boolean;
  capture?: boolean;
  onInvalidate: (fn: (() => void) | null) => void;
  onFirstFrame?: () => void;
  onError?: () => void;
  onSlow?: () => void;
  onTooSlow?: () => void;
}

/** Visor 3D de /casetas (chunk diferido). */
export default function ViewerScene(props: ViewerSceneProps) {
  const { quality, dpr, active, capture, onInvalidate, onFirstFrame, onError, onSlow, onTooSlow, stateRef } = props;
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
      <ViewerRig {...props} />
      <CasetaModel stateRef={stateRef} quality={quality} />
      <Studio stateRef={stateRef} quality={quality} />
      {!capture && (onSlow || onTooSlow) ? <PerfProbe key={quality} onSlow={onSlow} onTooSlow={onTooSlow} /> : null}
    </CasetaCanvas>
  );
}

const _p = new THREE.Vector3();
const _n = new THREE.Vector3();
const _d = new THREE.Vector3();

/** Base de encuadre (metros visibles a zoom 1) según el ajuste. */
const SPAN_H = 4.75;
const SPAN_W = 5.35;

function ViewerRig({ stateRef, targetsRef, orbitRef, hotspotsRef, hotspotIds, capture, fit }: ViewerSceneProps) {
  useFrame((state, rawDelta) => {
    const o = orbitRef.current;
    const s = stateRef.current;
    const t = targetsRef.current;
    if (!o || !s || !t) return;
    const delta = Math.min(rawDelta, 0.05);
    let moving = false;

    // Órbita: autorrotación lenta y suavizado hacia los objetivos
    if (o.auto && !capture) {
      o.azT += delta * 7;
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

    // Transición suave de contraventanas y día/noche
    const ks = 1 - Math.exp(-delta * 2.6);
    for (const key of ['shutters', 'night'] as const) {
      const diff = t[key] - s[key];
      if (Math.abs(diff) > 0.001) {
        s[key] += diff * ks;
        moving = true;
      } else s[key] = t[key];
    }

    const { width, height } = state.size;
    applyShot(
      state.camera as THREE.PerspectiveCamera,
      {
        az: o.az,
        el: o.el,
        dist: 12,
        tx: 0.12,
        ty: 1.12,
        ax: 0.5,
        ay: 0.53,
        span: (fit === 'h' ? SPAN_H : SPAN_W) / o.zoom,
      },
      width,
      height,
      fit,
    );
    state.camera.updateMatrixWorld();

    // Puntos de interés: proyección y ocultación cuando quedan detrás
    const els = hotspotsRef.current ?? [];
    const f = easeInOut(windowOpen(s.shutters, 0));
    hotspotIds.forEach((id, i) => {
      const el = els[i];
      const a = ANCHORS[id];
      if (!el || !a) return;
      _p.set(
        a.closed[0] + (a.open[0] - a.closed[0]) * f,
        a.closed[1] + (a.open[1] - a.closed[1]) * f,
        a.closed[2] + (a.open[2] - a.closed[2]) * f,
      );
      _n.set(...a.normal).normalize();
      _d.subVectors(state.camera.position, _p).normalize();
      const facing = _n.dot(_d) > 0.12;
      _p.project(state.camera);
      const x = ((_p.x + 1) / 2) * width;
      const y = ((1 - _p.y) / 2) * height;
      const inside = x > 8 && x < width - 8 && y > 8 && y < height - 8;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const hidden = !(facing && inside);
      if ((el.dataset.hidden === '1') !== hidden) el.dataset.hidden = hidden ? '1' : '0';
      const side = x > width * 0.55 ? 'left' : 'right';
      if (el.dataset.side !== side) el.dataset.side = side;
      const vside = y > height * 0.6 ? 'up' : 'down';
      if (el.dataset.vside !== vside) el.dataset.vside = vside;
    });

    if (moving) state.invalidate();
  }, -2);
  return null;
}
