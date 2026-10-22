'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Mide el rendimiento una sola vez al montar: fuerza ~1,2 s de frames
 * seguidos (sin contar los primeros, que compilan shaders). Si la media baja
 * de `minFps`, avisa para degradar (sin sombras, DPR 1); si baja de
 * `floorFps`, el dispositivo no puede con el 3D y se queda el poster. Con
 * frameloop "demand" un PerformanceMonitor continuo daría falsos positivos,
 * por eso se mide solo al principio (y otra vez tras degradar, con otra key).
 */
export function PerfProbe({
  onSlow,
  onTooSlow,
  minFps = 32,
  floorFps = 15,
  duration = 1200,
}: {
  onSlow?: () => void;
  onTooSlow?: () => void;
  minFps?: number;
  floorFps?: number;
  duration?: number;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const data = useRef({ warm: 0, start: 0, frames: 0, done: false });

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useFrame((state) => {
    const d = data.current;
    if (d.done) return;
    // El primer frame compila shaders: no cuenta
    if (d.warm < 1) {
      d.warm++;
      state.invalidate();
      return;
    }
    const now = performance.now();
    if (!d.start) {
      d.start = now;
      d.frames = 0;
    }
    d.frames++;
    const elapsed = now - d.start;
    // Muy por debajo del mínimo (frames de cientos de ms): se decide ya, sin
    // esperar a completar la medición
    if (onTooSlow && elapsed >= 400 && (d.frames * 1000) / elapsed < floorFps / 2) {
      d.done = true;
      onTooSlow();
      return;
    }
    if (elapsed >= duration) {
      d.done = true;
      const fps = (d.frames * 1000) / elapsed;
      if (fps < floorFps && onTooSlow) onTooSlow();
      else if (fps < minFps) onSlow?.();
      return;
    }
    state.invalidate();
  });
  return null;
}
