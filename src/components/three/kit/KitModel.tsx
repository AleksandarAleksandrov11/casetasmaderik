'use client';

import { use, useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { createCasetaTextures, loadTextureSources } from '../caseta/textures';
import { Dimensions, type DimDef } from '../caseta/Dimensions';
import { easeInOut, segment, type CasetaState, type Quality } from '../state';
import { buildKit } from './build';
import {
  BATTEN_T,
  BENCH_H,
  BENCH_LEG,
  BENCH_PIVOT_X,
  BENCH_W,
  BENCH_Z,
  HALF_KL,
  KIT_DIM_LABEL,
  TABLE_H,
  TABLE_LEG,
  TABLE_PIVOT_X,
  TABLE_W,
  TOP_T,
  TUBE,
} from './spec';

const Y = 0.012;
const FRONT = BENCH_Z + BENCH_W / 2;
const OFF = 0.22;

/** Cota del largo (el único dato de medida publicado). */
const KIT_DIMS: DimDef[] = [
  {
    id: 'largo',
    label: KIT_DIM_LABEL,
    from: [-HALF_KL, Y, FRONT + OFF],
    to: [HALF_KL, Y, FRONT + OFF],
    ext: [
      [
        [-HALF_KL, Y, FRONT + 0.06],
        [-HALF_KL, Y, FRONT + OFF + 0.08],
      ],
      [
        [HALF_KL, Y, FRONT + 0.06],
        [HALF_KL, Y, FRONT + OFF + 0.08],
      ],
    ],
    labelAt: [0, Y, FRONT + OFF + 0.13],
    below: 2,
    range: [0, 1],
  },
];

/** Altura del bastidor plegado sobre el suelo. */
function sink(leg: number, angle: number): number {
  return leg * Math.cos(angle) + (TUBE / 2) * Math.sin(angle) - leg;
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _q = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

export interface KitModelProps {
  /** `exploded`: 0 desplegado, 1 plegado (los bancos acaban encima de la mesa). `dims`: cota del largo. */
  stateRef: RefObject<CasetaState>;
  quality: Quality;
  dimsColor?: string;
}

/**
 * Kit de mesa y dos bancos plegables, procedural. Al plegar, las patas giran
 * bajo el tablero (los pies resbalan por el suelo) y luego los bancos se
 * apilan sobre la mesa, como se guardan y se transportan.
 */
export function KitModel({ stateRef, quality, dimsColor }: KitModelProps) {
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const sources = use(loadTextureSources(quality));
  const build = useMemo(() => buildKit(), []);
  const textures = useMemo(
    () =>
      createCasetaTextures(quality === 'high' ? 1024 : 512, Math.min(quality === 'high' ? 8 : 4, maxAniso), sources),
    [quality, maxAniso, sources],
  );
  const mats = useMemo(() => {
    const high = quality === 'high';
    // Abeto con barniz para exterior: tono miel más anaranjado y brillo de barniz
    const wood = new THREE.MeshStandardMaterial({
      map: textures.wood,
      normalMap: high ? textures.woodNormal : null,
      normalScale: new THREE.Vector2(0.5, 0.5),
      // Más amarillo que el pino de la caseta (canales lineales: el verde por encima de 1)
      color: new THREE.Color(1.12, 1.1, 0.6),
      roughness: 0.36,
      metalness: 0,
      vertexColors: true,
      envMapIntensity: 1.15,
    });
    // Acero lacado en verde oscuro
    const steel = new THREE.MeshStandardMaterial({ color: '#1d3a2f', metalness: 0.45, roughness: 0.42 });
    return { wood, steel, dispose: () => [wood, steel].forEach((m) => m.dispose()) };
  }, [textures, quality]);

  useEffect(() => () => build.dispose(), [build]);
  useEffect(() => () => textures.dispose(), [textures]);
  useEffect(() => () => mats.dispose(), [mats]);

  const table = useRef<THREE.Group>(null);
  const tableLegs = useRef<(THREE.Group | null)[]>([]);
  const struts = useRef<(THREE.Mesh | null)[]>([]);
  const benches = useRef<(THREE.Group | null)[]>([]);
  const benchLegs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    const f = stateRef.current?.exploded ?? 0;
    // Mesa: las patas giran 90 grados hacia el centro y el tablero baja con ellas
    const tA = (Math.PI / 2) * easeInOut(segment(f, 0, 0.5));
    if (table.current) table.current.position.y = sink(TABLE_LEG, tA);
    tableLegs.current.forEach((g, i) => {
      if (g) g.rotation.z = i === 0 ? tA : -tA;
    });
    // Tornapuntas: de la pata (a 0,3 m de la bisagra) a un punto bajo el tablero hacia el centro
    struts.current.forEach((m, i) => {
      if (!m) return;
      const side = i < 2 ? -1 : 1;
      const z = (i % 2 === 0 ? -1 : 1) * (TABLE_W / 2 - 0.07);
      const pivotY = TABLE_H - TOP_T - BATTEN_T;
      const px = side * TABLE_PIVOT_X;
      const d = 0.3;
      // La pata izquierda (side -1) gira hacia +X
      _a.set(px - side * d * Math.sin(tA), pivotY - d * Math.cos(tA), z);
      _b.set(px - side * 0.34, pivotY, z);
      const dir = _b.sub(_a);
      const len = Math.max(dir.length(), 0.001);
      _q.setFromUnitVectors(UP, dir.normalize());
      m.position.copy(_a);
      m.quaternion.copy(_q);
      m.scale.set(1, len, 1);
    });

    // Bancos: pliegan un poco después y luego se apilan sobre la mesa
    const bA = (Math.PI / 2) * easeInOut(segment(f, 0.12, 0.6));
    const stack = easeInOut(segment(f, 0.55, 1));
    const tableFoldedTop = TABLE_H + sink(TABLE_LEG, Math.PI / 2);
    benches.current.forEach((g, i) => {
      if (!g) return;
      const sign = i === 0 ? 1 : -1;
      g.position.y = sink(BENCH_LEG, bA) + tableFoldedTop * stack + Math.sin(Math.PI * stack) * 0.22;
      g.position.z = sign * (BENCH_Z + (BENCH_W / 2 - BENCH_Z) * stack);
    });
    benchLegs.current.forEach((g, i) => {
      if (g) g.rotation.z = i % 2 === 0 ? bA : -bA;
    });
  });

  const legY = (h: number) => h - TOP_T - BATTEN_T;

  return (
    <group name="kit">
      <group ref={table} name="mesa">
        <mesh geometry={build.tableTop} material={mats.wood} position-y={TABLE_H} castShadow receiveShadow />
        {[-1, 1].map((s, i) => (
          <group
            key={s}
            ref={(g) => {
              tableLegs.current[i] = g;
            }}
            position={[s * TABLE_PIVOT_X, legY(TABLE_H), 0]}
          >
            <mesh geometry={build.tableLeg} material={mats.steel} castShadow />
          </group>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            ref={(m) => {
              struts.current[i] = m;
            }}
            geometry={build.strut}
            material={mats.steel}
            castShadow
          />
        ))}
      </group>
      {[0, 1].map((b) => (
        <group
          key={b}
          ref={(g) => {
            benches.current[b] = g;
          }}
          name={b === 0 ? 'banco-delantero' : 'banco-trasero'}
          position-z={b === 0 ? BENCH_Z : -BENCH_Z}
        >
          <mesh geometry={build.benchTop[b]} material={mats.wood} position-y={BENCH_H} castShadow receiveShadow />
          {[-1, 1].map((s, i) => (
            <group
              key={s}
              ref={(g) => {
                benchLegs.current[b * 2 + i] = g;
              }}
              position={[s * BENCH_PIVOT_X, legY(BENCH_H), 0]}
            >
              <mesh geometry={build.benchLeg} material={mats.steel} castShadow />
            </group>
          ))}
        </group>
      ))}
      <Dimensions stateRef={stateRef} color={dimsColor} defs={KIT_DIMS} />
    </group>
  );
}
