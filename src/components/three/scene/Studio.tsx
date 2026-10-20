'use client';

import { memo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { lerp, type CasetaState, type Quality } from '../state';

const KEY_DAY = new THREE.Color('#fff0dc');
const KEY_NIGHT = new THREE.Color('#9db4d0');
const SKY_DAY = new THREE.Color('#fff8ee');
const SKY_NIGHT = new THREE.Color('#283544');
const GROUND_DAY = new THREE.Color('#d8c3a5');
const GROUND_NIGHT = new THREE.Color('#1a1712');

export interface StudioProps {
  stateRef?: RefObject<CasetaState>;
  quality: Quality;
  /** Fotogramas de la sombra de contacto: 1 = horneada; Infinity = se recalcula (montaje). */
  shadowFrames?: number;
  /** Cambiar la clave vuelve a hornear la sombra de contacto. */
  shadowKey?: string | number;
  /** Sombra de contacto (desactivar si la caseta se mueve: usar blobShadow del modelo). */
  contact?: boolean;
}

/**
 * Luz de estudio: entorno hecho solo con Lightformers (sin descargas), luz
 * principal con sombra suave, cielo cálido y sombra de contacto. De noche baja
 * el entorno y la luz principal se enfría.
 */
export const Studio = memo(function Studio({
  stateRef,
  quality,
  shadowFrames = 1,
  shadowKey = 0,
  contact = true,
}: StudioProps) {
  const key = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const catcher = useRef<THREE.ShadowMaterial>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const high = quality === 'high';

  useFrame((state) => {
    const n = stateRef?.current?.night ?? 0;
    state.scene.environmentIntensity = lerp(1, 0.14, n);
    if (moon.current) moon.current.intensity = n * 0.75;
    const k = key.current;
    if (k) {
      k.intensity = lerp(2.4, 0.3, n);
      k.color.lerpColors(KEY_DAY, KEY_NIGHT, n);
    }
    const h = hemi.current;
    if (h) {
      h.intensity = lerp(0.42, 0.62, n);
      h.color.lerpColors(SKY_DAY, SKY_NIGHT, n);
      h.groundColor.lerpColors(GROUND_DAY, GROUND_NIGHT, n);
    }
    if (catcher.current) catcher.current.opacity = lerp(0.15, 0.03, n);
  });

  return (
    <>
      <Environment resolution={high ? 256 : 128} frames={1} background={false}>
        {/* Gran ventanal cenital y paneles laterales, como un estudio de fotografía */}
        <Lightformer
          form="rect"
          intensity={1.25}
          color="#fffaf2"
          position={[0, 7, 0]}
          rotation-x={Math.PI / 2}
          scale={[12, 12, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#fff1df"
          position={[-6, 3.5, 6]}
          scale={[7, 4, 1]}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.55}
          color="#f4f1ec"
          position={[7, 2.5, 1.5]}
          scale={[5, 3, 1]}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#ffffff"
          position={[1, 3, -8]}
          scale={[10, 3, 1]}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.55}
          color="#e9d9c2"
          position={[0, -4, 0]}
          rotation-x={-Math.PI / 2}
          scale={[14, 14, 1]}
        />
      </Environment>
      <hemisphereLight ref={hemi} args={[SKY_DAY, GROUND_DAY, 0.42]} />
      {/* Contraluz frío de noche para recortar la silueta sobre el fondo oscuro */}
      <directionalLight ref={moon} position={[-5, 7, -7]} intensity={0} color="#a9bdd8" />
      <directionalLight
        ref={key}
        position={[-3.2, 9.6, 4.6]}
        intensity={2.4}
        color={KEY_DAY}
        castShadow={high}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={4}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={2}
        shadow-camera-far={18}
      />
      {high ? (
        <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow renderOrder={1}>
          <planeGeometry args={[16, 16]} />
          <shadowMaterial ref={catcher} transparent opacity={0.2} color="#2b1d12" depthWrite={false} />
        </mesh>
      ) : null}
      {contact ? (
        <ContactShadows
          key={shadowKey}
          position={[0, 0.0015, 0]}
          scale={8}
          resolution={high ? 512 : 256}
          blur={2.6}
          far={1.4}
          opacity={0.62}
          frames={shadowFrames}
          color="#2a1c11"
        />
      ) : null}
    </>
  );
});
