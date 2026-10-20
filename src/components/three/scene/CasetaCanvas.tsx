'use client';

import { Component, Suspense, useEffect, useRef, type ErrorInfo, type ReactNode, type RefObject } from 'react';
import * as THREE from 'three';
import { Canvas, addAfterEffect, addEffect, useFrame, useThree, type RootState } from '@react-three/fiber';
import type { Quality } from '../state';

/*
 * R3F 9.8 crea un THREE.Clock, que three r186 marca como obsoleto y avisa en
 * consola en cada montaje. Se filtra solo ese aviso.
 */
let consolePatched = false;
function patchConsole() {
  if (consolePatched) return;
  consolePatched = true;
  THREE.setConsoleFunction((type, message, ...params) => {
    if (typeof message === 'string' && message.startsWith('THREE.Clock:')) return;
    console[type](message, ...params);
  });
}
patchConsole();

declare global {
  interface Window {
    /** Métricas de depuración (?debug3d): llamadas de dibujo y triángulos por frame. */
    __caseta3d?: { calls: number; triangles: number; frames: number; fps: number; renderer: string };
    /** Captura de posters (solo en desarrollo con ?poster=...). */
    __casetaCapture?: () => string;
    __casetaReady?: boolean;
  }
}

export interface CasetaCanvasProps {
  quality: Quality;
  /** false = lienzo pausado (fuera de pantalla). */
  active: boolean;
  dpr: number | [number, number];
  /** Recibe la función que pide un frame (o null al desmontar). */
  onInvalidate?: (fn: (() => void) | null) => void;
  onFirstFrame?: () => void;
  onError?: () => void;
  /** Modo captura de posters: búfer preservado y puente de captura. */
  capture?: boolean;
  /** Bucle continuo (autorrotación del visor). */
  continuous?: boolean;
  eventSource?: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}

class GLBoundary extends Component<{ onError?: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Lienzo compartido por el hero, el visor y el montaje. */
export default function CasetaCanvas({
  quality,
  active,
  dpr,
  onInvalidate,
  onFirstFrame,
  onError,
  capture = false,
  continuous = false,
  eventSource,
  className,
  children,
}: CasetaCanvasProps) {
  const high = quality === 'high';
  const frameloop = !active ? 'never' : continuous ? 'always' : 'demand';
  return (
    <GLBoundary onError={onError}>
      <Canvas
        className={className}
        frameloop={frameloop}
        dpr={dpr}
        shadows={high ? 'percentage' : false}
        // offsetSize: mide sin transformaciones (la entrada del hero escala el contenedor)
        resize={{ scroll: false, offsetSize: true, debounce: { scroll: 0, resize: 60 } }}
        eventSource={eventSource as RefObject<HTMLElement> | undefined}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: capture,
          toneMapping: THREE.NeutralToneMapping,
          toneMappingExposure: 1,
        }}
        camera={{ fov: 30, near: 0.1, far: 80, position: [5, 2, 8] }}
        onCreated={(state) => {
          state.gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            onError?.();
          });
        }}
      >
        <Suspense fallback={null}>
          {children}
          <Bridge onInvalidate={onInvalidate} onFirstFrame={onFirstFrame} capture={capture} />
        </Suspense>
      </Canvas>
    </GLBoundary>
  );
}

function Bridge({
  onInvalidate,
  onFirstFrame,
  capture,
}: {
  onInvalidate?: (fn: (() => void) | null) => void;
  onFirstFrame?: () => void;
  capture: boolean;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const get = useThree((s) => s.get);
  const fired = useRef(false);

  useEffect(() => {
    if (!onInvalidate) return;
    onInvalidate(() => invalidate());
    invalidate();
    return () => onInvalidate(null);
  }, [onInvalidate, invalidate]);

  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    // Avisa cuando el primer frame ya está en pantalla
    requestAnimationFrame(() => requestAnimationFrame(() => onFirstFrame?.()));
  });

  // Métricas de depuración con ?debug3d
  useEffect(() => {
    if (!/[?&]debug3d/.test(window.location.search)) return;
    const { gl } = get();
    gl.info.autoReset = false;
    const ctx = gl.getContext();
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER));
    let frames = 0;
    let t0 = performance.now();
    const stats = { calls: 0, triangles: 0, frames: 0, fps: 0, renderer };
    window.__caseta3d = stats;
    const before = addEffect(() => gl.info.reset());
    const after = addAfterEffect(() => {
      frames++;
      stats.frames++;
      stats.calls = gl.info.render.calls;
      stats.triangles = gl.info.render.triangles;
      const now = performance.now();
      if (now - t0 > 1000) {
        stats.fps = (frames * 1000) / (now - t0);
        frames = 0;
        t0 = now;
      }
    });
    return () => {
      before();
      after();
      gl.info.autoReset = true;
    };
  }, [get]);

  // Puente de captura para generar los posters
  useEffect(() => {
    if (!capture) return;
    window.__casetaCapture = () => {
      const s: RootState = get();
      s.advance(performance.now());
      return s.gl.domElement.toDataURL('image/png');
    };
    const t = window.setTimeout(() => {
      window.__casetaReady = true;
    }, 400);
    return () => {
      window.clearTimeout(t);
      window.__casetaCapture = undefined;
      window.__casetaReady = false;
    };
  }, [capture, get]);

  return null;
}
