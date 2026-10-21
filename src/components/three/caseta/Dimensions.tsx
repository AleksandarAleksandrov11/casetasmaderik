'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { HALF_L, HALF_W, TOTAL_H } from './spec';
import { easeOut, segment, type CasetaState } from '../state';

type V3 = [number, number, number];

interface DimDef {
  id: string;
  label: string;
  from: V3;
  to: V3;
  /** Líneas de referencia desde la caseta hasta la cota. */
  ext: [V3, V3][];
  labelAt: V3;
  /** Desplazamiento de la etiqueta en px de pantalla y alineación (a la izquierda del punto o centrada). */
  shift?: [number, number];
  align?: 'center' | 'left';
  /**
   * Aire mínimo en px entre la línea de cota y la caja de la etiqueta, que va debajo. Con la cámara
   * baja del hero, la línea del largo sube en perspectiva y su mitad izquierda pisaba la etiqueta.
   */
  below?: number;
  range: [number, number];
}

const OFF = 0.62;
const Y = 0.012;

export const DIMENSIONS: DimDef[] = [
  {
    id: 'largo',
    label: '2,90 m',
    from: [-HALF_L, Y, HALF_W + OFF],
    to: [HALF_L, Y, HALF_W + OFF],
    ext: [
      [
        [-HALF_L, Y, HALF_W + 0.08],
        [-HALF_L, Y, HALF_W + OFF + 0.1],
      ],
      [
        [HALF_L, Y, HALF_W + 0.08],
        [HALF_L, Y, HALF_W + OFF + 0.1],
      ],
    ],
    labelAt: [0, Y, HALF_W + OFF + 0.24],
    below: 2,
    range: [0, 0.5],
  },
  {
    id: 'ancho',
    label: '2,00 m',
    from: [-HALF_L - OFF, Y, HALF_W],
    to: [-HALF_L - OFF, Y, -HALF_W],
    ext: [
      [
        [-HALF_L - 0.08, Y, HALF_W],
        [-HALF_L - OFF - 0.1, Y, HALF_W],
      ],
      [
        [-HALF_L - 0.08, Y, -HALF_W],
        [-HALF_L - OFF - 0.1, Y, -HALF_W],
      ],
    ],
    labelAt: [-HALF_L - OFF - 0.36, Y, 0],
    range: [0.25, 0.75],
  },
  {
    id: 'alto',
    label: '2,47 m',
    from: [-HALF_L - 0.02, 0, -HALF_W - 0.55],
    to: [-HALF_L - 0.02, TOTAL_H, -HALF_W - 0.55],
    ext: [
      [
        [-HALF_L - 0.16, TOTAL_H, -0.12],
        [-HALF_L - 0.16, TOTAL_H, -HALF_W - 0.65],
      ],
      [
        [-HALF_L - 0.02, 0.002, -HALF_W - 0.08],
        [-HALF_L - 0.02, 0.002, -HALF_W - 0.65],
      ],
    ],
    labelAt: [-HALF_L - 0.02, TOTAL_H / 2, -HALF_W - 0.55],
    shift: [-12, 0],
    align: 'left',
    range: [0.5, 1],
  },
];

export interface DimensionsProps {
  stateRef: RefObject<CasetaState>;
  color?: string;
}

const _v = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/**
 * Cotas animadas: la línea se dibuja desde un extremo y la etiqueta aparece al
 * final. Las etiquetas son texto HTML con la fuente de la web, colocado por
 * proyección en cada frame (sin raíces de React adicionales).
 */
export function Dimensions({ stateRef, color = '#F3EDE4' }: DimensionsProps) {
  const gl = useThree((s) => s.gl);
  const labels = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const parent = gl.domElement.parentElement;
    if (!parent) return;
    const layer = document.createElement('div');
    layer.className = 'caseta-dims';
    layer.setAttribute('aria-hidden', 'true');
    labels.current = DIMENSIONS.map((d) => {
      const s = document.createElement('span');
      s.className = 'caseta-dim-label';
      s.textContent = d.label;
      layer.appendChild(s);
      return s;
    });
    parent.appendChild(layer);
    return () => {
      layer.remove();
      labels.current = [];
    };
  }, [gl]);

  useFrame((state) => {
    const v = stateRef.current?.dims ?? 0;
    const { width, height } = state.size;
    DIMENSIONS.forEach((d, i) => {
      const el = labels.current[i];
      if (!el) return;
      const t = segment(v, d.range[0], d.range[1]);
      const lt = easeOut(segment(t, 0.55, 1));
      if (lt <= 0.001) {
        el.style.opacity = '0';
        return;
      }
      _v.set(...d.labelAt).project(state.camera);
      const x = ((_v.x + 1) / 2) * width;
      let y = ((1 - _v.y) / 2) * height;
      if (d.below != null) {
        // Altura de la línea proyectada bajo los dos bordes de la etiqueta: la etiqueta baja lo justo
        _a.set(...d.from).project(state.camera);
        _b.set(...d.to).project(state.camera);
        const ax = ((_a.x + 1) / 2) * width;
        const ay = ((1 - _a.y) / 2) * height;
        const bx = ((_b.x + 1) / 2) * width;
        const by = ((1 - _b.y) / 2) * height;
        const lineY = (px: number) => ay + ((by - ay) * (px - ax)) / (bx - ax || 1);
        const hw = el.offsetWidth / 2;
        const hh = el.offsetHeight / 2;
        y = Math.max(y, Math.max(lineY(x - hw), lineY(x + hw)) + d.below + hh);
      }
      y += (1 - lt) * 8;
      el.style.opacity = String(lt);
      const [sx, sy] = d.shift ?? [0, 0];
      const tx = d.align === 'left' ? '-100%' : '-50%';
      el.style.transform = `translate3d(${(x + sx).toFixed(1)}px, ${(y + sy).toFixed(1)}px, 0) translate(${tx}, -50%)`;
    });
  });

  return (
    <group name="dimensions">
      {DIMENSIONS.map((d) => (
        <Dimension key={d.id} def={d} stateRef={stateRef} color={color} />
      ))}
    </group>
  );
}

/**
 * Dos llamadas de dibujo por cota: las líneas de referencia y las marcas de
 * los extremos (segmentos sueltos, aparecen primero) y la línea de cota, que
 * se dibuja de un extremo al otro.
 */
function Dimension({ def, stateRef, color }: { def: DimDef; stateRef: RefObject<CasetaState>; color: string }) {
  const group = useRef<THREE.Group>(null);
  const line = useRef<THREE.Group>(null);
  const marks = useRef<THREE.Object3D | null>(null);

  const geo = useMemo(() => {
    const from = new THREE.Vector3(...def.from);
    const to = new THREE.Vector3(...def.to);
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    dir.normalize();
    // Marcas oblicuas a 45 grados en los extremos, como en un plano
    const perp = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const tick = new THREE.Vector3().addScaledVector(dir, 0.07).addScaledVector(perp, 0.07);
    const main: V3[] = [
      [0, 0, 0],
      [dir.x * len, dir.y * len, dir.z * len],
    ];
    const segs: V3[] = [];
    for (const [a, b] of def.ext) segs.push(a, b);
    for (const p of [from, to]) {
      segs.push(p.clone().sub(tick).toArray() as V3, p.clone().add(tick).toArray() as V3);
    }
    return { main, segs };
  }, [def]);

  useFrame(() => {
    const v = stateRef.current?.dims ?? 0;
    const t = segment(v, def.range[0], def.range[1]);
    const g = group.current;
    if (g) g.visible = t > 0.001;
    if (t <= 0.001) return;
    const draw = easeOut(segment(t, 0.2, 0.8));
    if (line.current) line.current.scale.setScalar(Math.max(draw, 0.0001));
    const m = (marks.current as THREE.Mesh | null)?.material as THREE.Material | undefined;
    if (m) m.opacity = 0.75 * easeOut(segment(t, 0, 0.3));
  });

  return (
    <group ref={group} visible={false}>
      <Line
        ref={(o) => {
          marks.current = o;
        }}
        points={geo.segs}
        segments
        color={color}
        lineWidth={1.1}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
      <group position={def.from}>
        <group ref={line}>
          <Line
            points={geo.main}
            color={color}
            lineWidth={1.4}
            transparent
            opacity={0.95}
            depthWrite={false}
            toneMapped={false}
          />
        </group>
      </group>
    </group>
  );
}
