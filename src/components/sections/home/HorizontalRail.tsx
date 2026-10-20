'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { MEDIA } from '@/lib/motion';
import { loadGsap } from '@/lib/gsap-loader';
import { getLenis } from '@/components/layout/MotionRoot';

type HorizontalRailProps = { header: ReactNode; children: ReactNode };

/**
 * Alto mínimo de ventana para fijar la sección. Es el mismo umbral que la variante
 * `lg:[@media(min-height:600px)]` de las clases (aquí y en las tarjetas de HomeEvents):
 * con él, el bloque ocupa justo una pantalla y las fotos ceden alto para que títulos,
 * textos y línea de progreso queden siempre a la vista mientras está fijada. En ventanas
 * más bajas no se fija y queda el carrusel nativo.
 */
const FITS = '(min-height: 600px)';

/**
 * Escritorio con movimiento: sección fijada y pista que se desplaza en
 * horizontal con el scroll. Móvil, ventana baja o movimiento reducido: carrusel
 * nativo con scroll-snap.
 */
export function HorizontalRail({ header, children }: HorizontalRailProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pinEl = pinRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!pinEl || !viewport || !track) return;
    if (!document.documentElement.classList.contains('js-motion')) return;

    let cancelled = false;
    let revert = () => {};
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      revert = () => mm.revert();
      mm.add(`${MEDIA.desktop} and ${FITS} and ${MEDIA.motionOk}`, () => {
        // Red de seguridad (zoom de texto, fuentes enormes): si aun así no cabe, no se fija
        if (pinEl.scrollHeight > window.innerHeight + 1) return;
        viewport.dataset.pinned = '';
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinEl,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        // Con teclado: al enfocar una tarjeta fuera de vista, se lleva el scroll hasta ella
        const onFocus = (e: FocusEvent) => {
          const item = (e.target as HTMLElement).closest<HTMLElement>('[data-rail-item]');
          const st = tween.scrollTrigger;
          if (!item || !st) return;
          const max = distance();
          if (max <= 0) return;
          const target = Math.min(1, Math.max(0, (item.offsetLeft - 40) / max));
          const top = st.start + target * (st.end - st.start);
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo({ top, behavior: 'auto' });
        };
        track.addEventListener('focusin', onFocus);

        return () => {
          track.removeEventListener('focusin', onFocus);
          delete viewport.dataset.pinned;
        };
      });
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  return (
    <div
      ref={pinRef}
      className="flex flex-col justify-center py-[var(--section-y)] lg:min-h-svh lg:pt-[clamp(56px,9svh,128px)] lg:pb-[clamp(32px,6svh,96px)] lg:[@media(min-height:600px)]:h-svh"
    >
      {header}
      <div
        ref={viewportRef}
        className="mt-12 snap-x snap-mandatory scroll-px-[max(var(--gutter),var(--safe-left))] [scrollbar-width:none] overflow-x-auto overscroll-x-contain data-[pinned]:snap-none data-[pinned]:overflow-visible lg:mt-[clamp(28px,5svh,64px)] [&::-webkit-scrollbar]:hidden lg:[@media(min-height:600px)]:flex lg:[@media(min-height:600px)]:min-h-0"
      >
        {/* Una columna por tarjeta y dos filas compartidas (foto y pie) que cada tarjeta hereda con
            subgrid; la de la foto es la única que cede alto. El relleno lateral coincide con el
            borde de contenido de .container-site en cualquier ancho. */}
        <ul
          ref={trackRef}
          className="grid w-max shrink-0 grid-flow-col grid-rows-[minmax(0,1fr)_auto] gap-x-5 pr-[max(var(--gutter),var(--safe-right))] pl-[max(var(--gutter),var(--safe-left))] sm:gap-x-8 lg:gap-x-10 lg:pr-[max(var(--gutter),var(--safe-right),calc((100%-var(--container))/2))] lg:pl-[max(var(--gutter),var(--safe-left),calc((100%-var(--container))/2))]"
        >
          {children}
        </ul>
      </div>
      <div className="container-site mt-[clamp(20px,4svh,40px)] hidden lg:block" aria-hidden="true">
        <div className="h-px w-full bg-sand">
          <span ref={progressRef} className="block h-px origin-left scale-x-0 bg-wood" />
        </div>
      </div>
    </div>
  );
}
