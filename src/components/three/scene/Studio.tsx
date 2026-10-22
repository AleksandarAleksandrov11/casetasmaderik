'use client';

import { memo, useLayoutEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { lerp, type CasetaState, type Quality } from '../state';
import { HALF_L, HALF_W } from '../caseta/spec';

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

type V3 = [number, number, number];

/** Paneles de luz del entorno: color, intensidad, posición, tamaño y hacia dónde miran. */
const PANELS: { color: string; intensity: number; position: V3; scale: [number, number]; target: V3 }[] = [
  // Gran ventanal cenital
  { color: '#fffaf2', intensity: 1.25, position: [0, 7, 0], scale: [12, 12], target: [0, 0, 0] },
  // Luz principal delante a la izquierda
  { color: '#fff1df', intensity: 3.4, position: [-6, 3.5, 6], scale: [7, 4], target: [0, 1, 0] },
  // Relleno suave a la derecha
  { color: '#f4f1ec', intensity: 0.55, position: [7, 2.5, 1.5], scale: [5, 3], target: [0, 1, 0] },
  // Contraluz
  { color: '#ffffff', intensity: 1.4, position: [1, 3, -8], scale: [10, 3], target: [0, 1, 0] },
  // Rebote cálido del suelo
  { color: '#e9d9c2', intensity: 0.55, position: [0, -4, 0], scale: [14, 14], target: [0, 0, 0] },
];

/**
 * Sombra arrojada: se desvanece con la distancia a la planta de la caseta
 * (metros fuera del rectángulo de 2,90 × 2,00). Así termina suave dentro del
 * encuadre, como con una luz de estudio grande, y nunca en un corte recto en
 * el borde del lienzo ni del poster. Tono casi negro cálido: oscurece igual
 * sobre crema y nunca aclara sobre tinta.
 */
const SHADOW_COLOR = '#1a120c';
const SHADOW_FADE_FROM = 0.05;
const SHADOW_FADE_TO = 0.8;

const glsl = (n: number) => n.toFixed(3);

function fadeShadow(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec2 vGround;')
    .replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvGround = (modelMatrix * vec4(transformed, 1.0)).xz;',
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\nvarying vec2 vGround;')
    .replace(
      '#include <tonemapping_fragment>',
      `vec2 outside = max(abs(vGround) - vec2(${glsl(HALF_L)}, ${glsl(HALF_W)}), 0.0);
      gl_FragColor.a *= 1.0 - smoothstep(${glsl(SHADOW_FADE_FROM)}, ${glsl(SHADOW_FADE_TO)}, length(outside));
      #include <tonemapping_fragment>`,
    );
}

/**
 * Entorno de estudio sin descargas: unos paneles emisivos (como los
 * Lightformer de drei) prefiltrados una sola vez con PMREMGenerator. Más
 * ligero que <Environment> de drei, que arrastra los cargadores HDR y EXR.
 */
function StudioEnvironment() {
  const get = useThree((s) => s.get);
  useLayoutEffect(() => {
    const { gl, scene } = get();
    const env = new THREE.Scene();
    const geo = new THREE.PlaneGeometry(1, 1);
    const mats: THREE.Material[] = [];
    for (const p of PANELS) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.color).multiplyScalar(p.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      mats.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...p.position);
      mesh.scale.set(p.scale[0], p.scale[1], 1);
      mesh.lookAt(...p.target);
      env.add(mesh);
    }
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.02, 0.1, 100);
    scene.environment = rt.texture;
    return () => {
      if (scene.environment === rt.texture) scene.environment = null;
      rt.dispose();
      pmrem.dispose();
      geo.dispose();
      mats.forEach((m) => m.dispose());
    };
  }, [get]);
  return null;
}

/**
 * Luz de estudio: entorno hecho solo con paneles de luz (sin descargas), luz
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
      <StudioEnvironment />
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
          <shadowMaterial
            ref={catcher}
            transparent
            opacity={0.15}
            color={SHADOW_COLOR}
            depthWrite={false}
            onBeforeCompile={fadeShadow}
          />
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
