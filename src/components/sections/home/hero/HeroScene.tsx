'use client';

import type { RefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import CasetaCanvas from '@/components/three/scene/CasetaCanvas';
import { CasetaModel } from '@/components/three/caseta/CasetaModel';
import { Studio } from '@/components/three/scene/Studio';
import { PerfProbe } from '@/components/three/scene/PerfProbe';
import { applyShot } from '@/components/three/scene/camera';
import type { CameraShot, CasetaState, FitMode, Quality } from '@/components/three/state';

export interface HeroSceneProps {
  stateRef: RefObject<CasetaState>;
  shotRef: RefObject<CameraShot>;
  onInvalidate: (fn: (() => void) | null) => void;
  fit: FitMode;
  quality: Quality;
  dpr: number | [number, number];
  active: boolean;
  capture?: boolean;
  onFirstFrame?: () => void;
  onError?: () => void;
  onSlow?: () => void;
  onTooSlow?: () => void;
}

/** Escena del hero de Inicio (chunk diferido). */
export default function HeroScene({
  stateRef,
  shotRef,
  onInvalidate,
  fit,
  quality,
  dpr,
  active,
  capture,
  onFirstFrame,
  onError,
  onSlow,
  onTooSlow,
}: HeroSceneProps) {
  return (
    <CasetaCanvas
      quality={quality}
      dpr={dpr}
      active={active}
      onInvalidate={onInvalidate}
      capture={capture}
      onFirstFrame={onFirstFrame}
      onError={onError}
      className="caseta-canvas"
    >
      <Rig shotRef={shotRef} fit={fit} />
      <CasetaModel stateRef={stateRef} quality={quality} showDimensions />
      <Studio stateRef={stateRef} quality={quality} />
      {!capture && (onSlow || onTooSlow) ? <PerfProbe key={quality} onSlow={onSlow} onTooSlow={onTooSlow} /> : null}
    </CasetaCanvas>
  );
}

function Rig({ shotRef, fit }: { shotRef: RefObject<CameraShot>; fit: FitMode }) {
  useFrame((state) => {
    const shot = shotRef.current;
    if (!shot) return;
    applyShot(state.camera as THREE.PerspectiveCamera, shot, state.size.width, state.size.height, fit);
    // Las etiquetas y anclas proyectan con la cámara de este mismo frame
    state.camera.updateMatrixWorld();
  }, -2);
  return null;
}
