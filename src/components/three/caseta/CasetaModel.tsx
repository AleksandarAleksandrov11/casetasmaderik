'use client';

import { use, useCallback, useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { buildCaseta, type WallId } from './build';
import { createMaterials } from './materials';
import { createCasetaTextures, loadTextureSources } from './textures';
import { Dimensions } from './Dimensions';
import { BASE_H, COUNTER_T, FRAME_W, HALF_W, WIN_Y0 } from './spec';
import {
  bracketAngle,
  counterAngle,
  roofPose,
  shutterAngle,
  uprightFactor,
  wallFold,
  windowOpen,
  WINDOW_ORDER,
} from './rig';
import { createCasetaState, type CasetaState, type Quality } from '../state';

export interface CasetaModelProps {
  /** Estado mutable que GSAP o la escena escriben fuera de React. Si se pasa, manda sobre las props numéricas. */
  stateRef?: RefObject<CasetaState>;
  /** Apertura de contraventanas y mostradores (0..1), con transición suave. */
  shuttersOpen?: number;
  /** Día (0) a noche (1), con transición suave. */
  night?: number;
  /** Despiece: 1 = plegada, 0 = montada. */
  exploded?: number;
  /**
   * Cotas 2,90 / 2,00 / 2,47 m. Con props se animan solas; con `stateRef`
   * solo se montan y su aparición la marca `stateRef.current.dims`.
   */
  showDimensions?: boolean;
  quality?: Quality;
  /** Sombra suave bajo la base que se mueve con la caseta (escenas de montaje). */
  blobShadow?: boolean;
  /** Avisa de que hace falta otro frame (transiciones suaves con frameloop demand). */
  onChange?: () => void;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * La caseta de madera de Casetas Maderik, procedural y a escala real.
 * Grupos con nombre: base, walls (front, right, back, left), shutters,
 * counters, roof (front, back), stringLights, interior y hardware.
 */
export function CasetaModel({
  stateRef,
  shuttersOpen = 0,
  night = 0,
  exploded = 0,
  showDimensions = false,
  quality = 'high',
  blobShadow = false,
  onChange,
}: CasetaModelProps) {
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const invalidate = useThree((s) => s.invalidate);
  // Suspende hasta tener las texturas CC0 (o null si fallan): el lienzo no
  // se muestra hasta entonces y el poster sigue debajo.
  const sources = use(loadTextureSources(quality));
  const build = useMemo(() => buildCaseta(), []);
  const textures = useMemo(
    () =>
      createCasetaTextures(quality === 'high' ? 1024 : 512, Math.min(quality === 'high' ? 8 : 4, maxAniso), sources),
    [quality, maxAniso, sources],
  );
  const mats = useMemo(() => createMaterials(textures, quality), [textures, quality]);

  useEffect(() => () => build.dispose(), [build]);
  useEffect(() => () => textures.dispose(), [textures]);
  useEffect(() => () => mats.dispose(), [mats]);

  // Estado interno cuando se controla por props (visor)
  const internal = useRef<CasetaState>(
    createCasetaState({ shutters: shuttersOpen, night, exploded, dims: showDimensions ? 1 : 0 }),
  );
  const targets = useRef({ shutters: shuttersOpen, night, exploded, dims: showDimensions ? 1 : 0 });
  useEffect(() => {
    targets.current = { shutters: shuttersOpen, night, exploded, dims: showDimensions ? 1 : 0 };
    invalidate();
  }, [shuttersOpen, night, exploded, showDimensions, invalidate]);

  const wallGroups = useRef<Partial<Record<WallId, THREE.Group>>>({});
  const foldGroups = useRef<Partial<Record<WallId, THREE.Group>>>({});
  const shutterGroups = useRef<Partial<Record<WallId, THREE.Group>>>({});
  const counterGroups = useRef<Partial<Record<WallId, THREE.Group>>>({});
  const roofFrontPos = useRef<THREE.Group>(null);
  const roofFrontRot = useRef<THREE.Group>(null);
  const roofBackPos = useRef<THREE.Group>(null);
  const roofBackRot = useRef<THREE.Group>(null);
  const struts = useRef<THREE.InstancedMesh>(null);
  const brackets = useRef<THREE.InstancedMesh>(null);
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const bulbMat = useRef<THREE.MeshStandardMaterial>(null);
  const glowMat = useRef<THREE.PointsMaterial>(null);
  const poolMat = useRef<THREE.MeshBasicMaterial>(null);
  const poolSideMat = useRef<THREE.MeshBasicMaterial>(null);
  const lightA = useRef<THREE.PointLight>(null);
  const lightB = useRef<THREE.PointLight>(null);
  const lightFront = useRef<THREE.PointLight>(null);

  const strutGeo = useMemo(() => new THREE.CylinderGeometry(0.0065, 0.0065, 1, 6, 1), []);
  const bracketGeo = useMemo(() => {
    // Escuadra de pletina con tornapuntas: triángulo calado (marco de 18 mm)
    const a = 0.17;
    const t = 0.018;
    const k = t * (1 + Math.SQRT2);
    const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(a, 0), new THREE.Vector2(0, -a)]);
    s.holes.push(
      new THREE.Path([new THREE.Vector2(t, -t), new THREE.Vector2(t, -a + k), new THREE.Vector2(a - k, -t)]),
    );
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    g.translate(0.005, 0, 0);
    return g;
  }, []);
  const bulbGeo = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);
  useEffect(
    () => () => {
      strutGeo.dispose();
      bracketGeo.dispose();
      bulbGeo.dispose();
    },
    [strutGeo, bracketGeo, bulbGeo],
  );

  const allBulbs = useMemo(() => [...build.stringBulbs, ...build.interiorBulbs], [build]);
  const glowPositions = useMemo(() => {
    const arr = new Float32Array(allBulbs.length * 3);
    allBulbs.forEach((p, i) => p.toArray(arr, i * 3));
    return arr;
  }, [allBulbs]);
  const glowColors = useMemo(() => {
    const arr = new Float32Array(allBulbs.length * 3);
    allBulbs.forEach((_, i) => {
      const k = i < build.stringBulbs.length ? 1 : 0.75;
      arr.set([k, k, k], i * 3);
    });
    return arr;
  }, [allBulbs, build]);

  // Bombillas: matrices fijas en el marco del faldón delantero. Las
  // interiores se ocultan mientras la caseta no está montada (cuelgan del techo).
  const cords = useRef<THREE.Mesh>(null);
  const interiorShown = useRef<boolean | null>(null);
  const placeBulbs = useCallback(
    (interior: boolean) => {
      const m = bulbs.current;
      if (!m) return;
      const o = new THREE.Object3D();
      allBulbs.forEach((p, i) => {
        const isString = i < build.stringBulbs.length;
        o.position.copy(p);
        const r = isString ? 0.015 : interior ? 0.03 : 0;
        o.scale.set(r, r * 1.25, r);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
      if (cords.current) cords.current.visible = interior;
      interiorShown.current = interior;
    },
    [allBulbs, build],
  );
  useLayoutEffect(() => placeBulbs(true), [placeBulbs]);

  const tmp = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      d: new THREE.Vector3(),
      m: new THREE.Matrix4(),
      m2: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      o: new THREE.Object3D(),
    }),
    [],
  );

  useFrame((frame, delta) => {
    let s: CasetaState;
    if (stateRef?.current) {
      s = stateRef.current;
    } else {
      // Transición suave hacia las props
      const cur = internal.current;
      const t = targets.current;
      const k = 1 - Math.exp(-Math.min(delta, 0.05) * 4.2);
      let moving = false;
      for (const key of ['shutters', 'night', 'exploded', 'dims'] as const) {
        const diff = t[key] - cur[key];
        if (Math.abs(diff) > 0.0015) {
          cur[key] += diff * k;
          moving = true;
        } else cur[key] = t[key];
      }
      if (moving) {
        frame.invalidate();
        onChange?.();
      }
      s = cur;
    }

    const assembled = 1 - s.exploded;
    const upright = uprightFactor(assembled);
    const interior = s.exploded < 0.01;
    if (interior !== interiorShown.current) placeBulbs(interior);

    // Paredes
    for (const id of ['front', 'right', 'back', 'left'] as WallId[]) {
      const f = foldGroups.current[id];
      if (!f) continue;
      const { angle, lift } = wallFold(id, assembled);
      f.rotation.x = angle;
      f.position.y = lift;
    }

    // Ventanas: contraventana, mostrador y escuadras
    const so = tmp.o;
    let strutIndex = 0;
    let bracketIndex = 0;
    WINDOW_ORDER.forEach((id, index) => {
      const wall = build.walls.find((w) => w.id === id);
      const win = wall?.window;
      const sg = shutterGroups.current[id];
      const cg = counterGroups.current[id];
      const wg = wallGroups.current[id];
      const fg = foldGroups.current[id];
      if (!win || !sg || !cg || !wg || !fg) return;
      const open = windowOpen(s.shutters, index) * upright;
      const sa = shutterAngle(open);
      sg.rotation.x = sa;
      cg.rotation.x = counterAngle(open);
      wg.updateMatrix();
      fg.updateMatrix();
      sg.updateMatrix();
      // Marco de la pared respecto a la caseta
      tmp.m.multiplyMatrices(wg.matrix, fg.matrix);
      const hw = win.width / 2;
      const sw = win.shutterWidth / 2;
      for (const side of [-1, 1]) {
        // Tirante: de la jamba a la punta de la visera
        tmp.a.set(side * (hw + FRAME_W + 0.012), WIN_Y0 - BASE_H + 0.3, 0.03).applyMatrix4(tmp.m);
        tmp.b
          .set(side * (sw - 0.07), -win.shutterHeight + 0.035, -0.006)
          .applyMatrix4(sg.matrix)
          .applyMatrix4(tmp.m);
        tmp.d.subVectors(tmp.b, tmp.a);
        const len = tmp.d.length();
        so.position.addVectors(tmp.a, tmp.b).multiplyScalar(0.5);
        so.quaternion.setFromUnitVectors(UP, tmp.d.normalize());
        const visible = s.exploded < 0.002 && open > 0.02;
        so.scale.set(visible ? 1 : 0, visible ? len : 0, visible ? 1 : 0);
        so.updateMatrix();
        struts.current?.setMatrixAt(strutIndex++, so.matrix);

        // Escuadra plegable bajo el mostrador
        const bx = side * (win.counterLength / 2 - 0.26);
        tmp.m2.makeRotationY(-side * bracketAngle(open));
        so.position.set(bx, WIN_Y0 - BASE_H - COUNTER_T, 0.003);
        so.quaternion.setFromRotationMatrix(tmp.m2);
        const bv = s.exploded < 0.002 ? 1 : 0;
        so.scale.set(bv, bv, bv);
        so.updateMatrix();
        so.matrix.premultiply(tmp.m);
        brackets.current?.setMatrixAt(bracketIndex++, so.matrix);
      }
    });
    if (struts.current) {
      struts.current.instanceMatrix.needsUpdate = true;
      struts.current.computeBoundingSphere();
    }
    if (brackets.current) {
      brackets.current.instanceMatrix.needsUpdate = true;
      brackets.current.computeBoundingSphere();
    }

    // Cubierta
    const rf = roofPose(true, assembled);
    const rb = roofPose(false, assembled);
    if (roofFrontPos.current && roofFrontRot.current) {
      roofFrontPos.current.position.set(0, rf.y, rf.z);
      roofFrontRot.current.rotation.x = rf.angle;
    }
    if (roofBackPos.current && roofBackRot.current) {
      roofBackPos.current.position.set(0, rb.y, rb.z);
      roofBackRot.current.rotation.x = rb.angle;
    }

    // Noche: luces interiores, guirnalda y charco de luz
    const n = s.night;
    const lit = n * upright;
    const frontOpen = windowOpen(s.shutters, 0) * upright;
    const sideOpen = windowOpen(s.shutters, 1) * upright;
    if (bulbMat.current) {
      bulbMat.current.emissiveIntensity = lit * 2.6;
      bulbMat.current.color.setRGB(0.32 + lit * 0.68, 0.26 + lit * 0.67, 0.19 + lit * 0.63);
    }
    if (glowMat.current) {
      glowMat.current.opacity = lit * 0.9;
      // PointsMaterial no tiene en cuenta el zoom de la cámara
      glowMat.current.size = 1.5 * ((frame.camera as THREE.PerspectiveCamera).zoom ?? 1);
    }
    if (poolMat.current) poolMat.current.opacity = lit * (0.25 + 0.4 * frontOpen);
    if (poolSideMat.current) poolSideMat.current.opacity = lit * 0.35 * sideOpen;
    if (lightA.current) lightA.current.intensity = lit * 3.2;
    if (lightB.current) lightB.current.intensity = lit * 3.2;
    if (lightFront.current) lightFront.current.intensity = lit * 1.4;
  });

  const castShadow = quality === 'high';

  return (
    <group name="caseta">
      {showDimensions ? <Dimensions stateRef={stateRef ?? internal} /> : null}
      <group name="base">
        <mesh name="base-metal" geometry={build.baseMetal} material={mats.metal} receiveShadow />
        <mesh name="floor" geometry={build.baseWood} material={mats.wood} receiveShadow />
      </group>

      <group name="walls">
        {build.walls.map((w) => (
          <group
            key={w.id}
            name={`wall-${w.id}`}
            position={w.pivot}
            rotation-y={w.rotY}
            ref={(g) => {
              if (g) wallGroups.current[w.id] = g;
            }}
          >
            <group
              ref={(g) => {
                if (g) foldGroups.current[w.id] = g;
              }}
            >
              <mesh
                name={`${w.id}-boards`}
                geometry={w.wood}
                material={mats.wood}
                castShadow={castShadow}
                receiveShadow
              />
              {w.window ? (
                <>
                  <group
                    name={`shutter-${w.id}`}
                    position={w.window.shutterPivot}
                    ref={(g) => {
                      if (g) shutterGroups.current[w.id] = g;
                    }}
                  >
                    <mesh geometry={w.window.shutter} material={mats.wood} castShadow={castShadow} receiveShadow />
                  </group>
                  <group
                    name={`counter-${w.id}`}
                    position={w.window.counterPivot}
                    rotation-x={Math.PI / 2}
                    ref={(g) => {
                      if (g) counterGroups.current[w.id] = g;
                    }}
                  >
                    <mesh geometry={w.window.counter} material={mats.wood} castShadow={castShadow} receiveShadow />
                  </group>
                </>
              ) : null}
            </group>
          </group>
        ))}
      </group>

      <group name="hardware">
        <instancedMesh ref={struts} args={[strutGeo, mats.dark, 6]} frustumCulled={false} />
        <instancedMesh ref={brackets} args={[bracketGeo, mats.dark, 6]} frustumCulled={false} />
      </group>

      <group name="roof">
        <group ref={roofFrontPos}>
          <group name="roof-front" ref={roofFrontRot}>
            <mesh geometry={build.roofFront.shingles} material={mats.roof} castShadow={castShadow} receiveShadow />
            <mesh geometry={build.roofFront.wood} material={mats.wood} castShadow={castShadow} receiveShadow />
            <group name="stringLights">
              <mesh geometry={build.cable} material={mats.plain} />
            </group>
            <group name="interior">
              <mesh ref={cords} geometry={build.cords} material={mats.plain} />
            </group>
            <instancedMesh ref={bulbs} args={[bulbGeo, undefined, allBulbs.length]} frustumCulled={false}>
              <meshStandardMaterial
                ref={bulbMat}
                color="#9a8b74"
                emissive="#ffc27a"
                emissiveIntensity={0}
                roughness={0.35}
                metalness={0}
                toneMapped={false}
              />
            </instancedMesh>
            <points frustumCulled={false} renderOrder={10}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[glowPositions, 3]} />
                <bufferAttribute attach="attributes-color" args={[glowColors, 3]} />
              </bufferGeometry>
              <pointsMaterial
                ref={glowMat}
                map={textures.glow}
                size={3.2}
                sizeAttenuation
                transparent
                opacity={0}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexColors
                toneMapped={false}
              />
            </points>
            <pointLight
              ref={lightA}
              position={localInterior(build.roofFrontMatrix, -0.7)}
              color="#FFB36B"
              intensity={0}
              distance={4.2}
              decay={2}
            />
            <pointLight
              ref={lightB}
              position={localInterior(build.roofFrontMatrix, 0.7)}
              color="#FFB36B"
              intensity={0}
              distance={4.2}
              decay={2}
            />
            <pointLight
              ref={lightFront}
              position={localPoint(build.roofFrontMatrix, 0, 1.82, HALF_W + 0.45)}
              color="#FFC68A"
              intensity={0}
              distance={3}
              decay={2}
            />
          </group>
        </group>
        <group ref={roofBackPos}>
          <group rotation-y={Math.PI}>
            <group name="roof-back" ref={roofBackRot}>
              <mesh geometry={build.roofBack.shingles} material={mats.roof} castShadow={castShadow} receiveShadow />
              <mesh geometry={build.roofBack.wood} material={mats.wood} castShadow={castShadow} receiveShadow />
            </group>
          </group>
        </group>
      </group>

      {blobShadow ? (
        <mesh rotation-x={-Math.PI / 2} position-y={0.004} renderOrder={2}>
          <planeGeometry args={[4.9, 3.4]} />
          <meshBasicMaterial
            map={textures.blob}
            color="#1a120b"
            transparent
            opacity={0.55}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ) : null}

      {/* Luz cálida que sale por las ventanas y se posa en el suelo */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, HALF_W + 0.95]} renderOrder={5}>
        <planeGeometry args={[3.8, 2.2]} />
        <meshBasicMaterial
          ref={poolMat}
          map={textures.pool}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[1.45 + 0.8, 0.003, 0]} renderOrder={5}>
        <planeGeometry args={[1.8, 2.6]} />
        <meshBasicMaterial
          ref={poolSideMat}
          map={textures.pool}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function localPoint(m: THREE.Matrix4, x: number, y: number, z: number): [number, number, number] {
  const p = new THREE.Vector3(x, y, z).applyMatrix4(m.clone().invert());
  return [p.x, p.y, p.z];
}

function localInterior(m: THREE.Matrix4, x: number): [number, number, number] {
  return localPoint(m, x, 1.72, 0.25);
}
