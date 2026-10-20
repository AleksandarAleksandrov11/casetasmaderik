'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Mide el rendimiento una sola vez al montar: fuerza ~1,2 s de frames
 * seguidos y, si la media baja de `minFps`, avisa para degradar (sin sombras,
 * DPR 1). Con frameloop "demand" un PerformanceMonitor continuo daría falsos
 * positivos, por eso se mide solo al principio.
 */
export function PerfProbe({
  onSlow,
  minFps = 32,
  duration = 1200,
}: {
  onSlow: () => void;
  minFps?: number;
  duration?: number;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const data = useRef({ start: 0, frames: 0, done: false });

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useFrame((state) => {
    const d = data.current;
    if (d.done) return;
    const now = performance.now();
    if (!d.start) {
      d.start = now;
      d.frames = 0;
    }
    d.frames++;
    const elapsed = now - d.start;
    if (elapsed >= duration) {
      d.done = true;
      const fps = (d.frames * 1000) / elapsed;
      if (fps < minFps) onSlow();
      return;
    }
    state.invalidate();
  });
  return null;
}
