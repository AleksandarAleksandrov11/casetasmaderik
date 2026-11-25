'use client';

import { useEffect, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import CasetaCanvas from '../scene/CasetaCanvas';
import { Studio } from '../scene/Studio';
import { PerfProbe } from '../scene/PerfProbe';
import { applyShot } from '../scene/camera';
import type { CasetaState, Quality } from '../state';
import type { Orbit } from '../interactive/orbit';
import { KitModel } from './KitModel';
import { KIT_FRAME, KIT_SPAN_W } from './spec';

/** Objetivos del kit (0..1): la escena los suaviza. */
export interface KitTargets {
  fold: number;
  dims: number;
}

declare global {
  interface Window {
    /** Captura de fotogramas (solo en desarrollo): fija vista y estado sin transición. */
    __kitSet?: (v: Partial<KitTargets> & { az?: number; el?: number }) => void;
  }
}

export interface KitSceneProps {
  stateRef: RefObject<CasetaState>;
  targetsRef: RefObject<KitTargets>;
  orbitRef: RefObject<Orbit>;
  quality: Quality;
  dpr: number | [number, number];
  active: boolean;
  capture?: boolean;
  reduced: boolean;
  onInvalidate: (fn: (() => void) | null) => void;
  onFirstFrame?: () => void;
  onError?: () => void;
  onSlow?: () => void;
  onTooSlow?: () => void;
}

/** Kit de mesa y dos bancos en 3D (chunk diferido) para /mesas-y-bancos. */
export default function KitScene(props: KitSceneProps) {
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
      <Rig {...props} />
      <KitModel stateRef={stateRef} quality={quality} dimsColor="#4a3f36" />
      {/* El kit se mueve al plegarse: la sombra de contacto se recalcula en cada frame dibujado */}
      <Studio quality={quality} shadowFrames={Infinity} />
      {!capture && (onSlow || onTooSlow) ? (
        <PerfProbe key={quality} onSlow={onSlow} onTooSlow={onTooSlow} floorFps={11} />
      ) : null}
    </CasetaCanvas>
  );
}

function Rig({ stateRef, targetsRef, orbitRef, capture, reduced }: KitSceneProps) {
  const get = useThree((s) => s.get);

  // Puente de captura de fotogramas (scripts/posters/capture-kit.mjs)
  useEffect(() => {
    if (!capture) return;
    window.__kitSet = (v) => {
      const o = orbitRef.current;
      const s = stateRef.current;
      const t = targetsRef.current;
      if (!o || !s || !t) return;
      o.auto = false;
      if (v.az !== undefined) o.az = o.azT = v.az;
      if (v.el !== undefined) o.el = o.elT = v.el;
      if (v.fold !== undefined) s.exploded = t.fold = v.fold;
      if (v.dims !== undefined) s.dims = t.dims = v.dims;
      get().invalidate();
    };
    return () => {
      window.__kitSet = undefined;
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

    // Plegado a ritmo constante (se lee como un movimiento mecánico) y cota con transición suave
    const foldStep = delta * (reduced ? 2.5 : 0.8);
    const fd = t.fold - s.exploded;
    if (Math.abs(fd) > 0.0005) {
      s.exploded += Math.sign(fd) * Math.min(Math.abs(fd), foldStep);
      moving = true;
    } else s.exploded = t.fold;
    const kd = 1 - Math.exp(-delta * (reduced ? 6 : 2.6));
    const dd = t.dims - s.dims;
    if (Math.abs(dd) > 0.001) {
      s.dims += dd * kd;
      moving = true;
    } else s.dims = t.dims;

    const { width, height } = state.size;
    const wide = width / Math.max(height, 1) > KIT_FRAME.ratio;
    applyShot(
      state.camera as THREE.PerspectiveCamera,
      {
        az: o.az,
        el: o.el,
        dist: KIT_FRAME.dist,
        tx: KIT_FRAME.tx,
        ty: KIT_FRAME.ty,
        ax: KIT_FRAME.ax,
        ay: KIT_FRAME.ay,
        span: (wide ? KIT_FRAME.spanH : KIT_SPAN_W) / o.zoom,
      },
      width,
      height,
      wide ? 'h' : 'w',
    );
    state.camera.updateMatrixWorld();
    if (moving) state.invalidate();
  }, -2);
  return null;
}
