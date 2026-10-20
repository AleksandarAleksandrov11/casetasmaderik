'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MEDIA } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

type HorizontalRailProps = { header: ReactNode; children: ReactNode };

/**
 * Escritorio con movimiento: sección fijada y pista que se desplaza en
 * horizontal con el scroll. Móvil o movimiento reducido: carrusel nativo con
 * scroll-snap.
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

    const mm = gsap.matchMedia();
    mm.add(`${MEDIA.desktop} and ${MEDIA.motionOk}`, () => {
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
        window.scrollTo({ top: st.start + target * (st.end - st.start), behavior: 'auto' });
      };
      track.addEventListener('focusin', onFocus);

      return () => {
        track.removeEventListener('focusin', onFocus);
        delete viewport.dataset.pinned;
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={pinRef} className="flex flex-col justify-center py-[var(--section-y)] lg:min-h-[100svh] lg:py-[clamp(96px,10vh,140px)]">
      {header}
      <div
        ref={viewportRef}
        className="mt-12 overflow-x-auto overscroll-x-contain [scrollbar-width:none] data-[pinned]:overflow-visible lg:mt-16 [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-px-[var(--gutter)] data-[pinned]:snap-none"
      >
        <ul
          ref={trackRef}
          className="flex w-max gap-5 px-[var(--gutter)] sm:gap-8 lg:gap-10 lg:pr-[max(var(--gutter),calc((100vw-var(--container))/2+var(--gutter)))] lg:pl-[max(var(--gutter),calc((100vw-var(--container))/2+var(--gutter)))]"
        >
          {children}
        </ul>
      </div>
      <div className="container-site mt-10 hidden lg:block" aria-hidden="true">
        <div className="h-px w-full bg-sand">
          <span ref={progressRef} className="block h-px origin-left scale-x-0 bg-wood" />
        </div>
      </div>
    </div>
  );
}
