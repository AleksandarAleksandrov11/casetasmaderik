'use client';

import { useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import CasetaCanvas from '@/components/three/scene/CasetaCanvas';
import { CasetaModel } from '@/components/three/caseta/CasetaModel';
import { Studio } from '@/components/three/scene/Studio';
import { applyShot } from '@/components/three/scene/camera';
import type { CameraShot, CasetaState, FitMode, Quality } from '@/components/three/state';

export interface AssemblyAnim {
  /** Desplazamiento en X de toda la caseta (llegada en el transporte). */
  slide: number;
}

export interface AssemblySceneProps {
  stateRef: RefObject<CasetaState>;
  shotRef: RefObject<CameraShot>;
  animRef: RefObject<AssemblyAnim>;
  fit: FitMode;
  quality: Quality;
  dpr: number | [number, number];
  active: boolean;
  capture?: boolean;
  onInvalidate: (fn: (() => void) | null) => void;
  onFirstFrame?: () => void;
  onError?: () => void;
}

/** Montaje despiezado (chunk diferido). La sombra va pegada a la caseta. */
export default function AssemblyScene({
  stateRef,
  shotRef,
  animRef,
  fit,
  quality,
  dpr,
  active,
  capture,
  onInvalidate,
  onFirstFrame,
  onError,
}: AssemblySceneProps) {
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
      <Rig shotRef={shotRef} fit={fit} />
      <Slide animRef={animRef}>
        <CasetaModel stateRef={stateRef} quality={quality} blobShadow />
      </Slide>
      <Studio stateRef={stateRef} quality={quality} contact={false} />
    </CasetaCanvas>
  );
}

function Rig({ shotRef, fit }: { shotRef: RefObject<CameraShot>; fit: FitMode }) {
  useFrame((state) => {
    const shot = shotRef.current;
    if (!shot) return;
    applyShot(state.camera as THREE.PerspectiveCamera, shot, state.size.width, state.size.height, fit);
    state.camera.updateMatrixWorld();
  }, -2);
  return null;
}

function Slide({ animRef, children }: { animRef: RefObject<AssemblyAnim>; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current) g.current.position.x = animRef.current?.slide ?? 0;
  }, -1);
  return <group ref={g}>{children}</group>;
}
