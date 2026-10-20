'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { MEDIA } from '@/lib/motion';
import { loadGsap } from '@/lib/gsap-loader';
import { getLenis } from '@/components/layout/MotionRoot';

type HorizontalRailProps = { header: ReactNode; children: ReactNode };

/**
 * Escritorio "encajado": ancho lg y al menos 37,5rem de alto (600 px con la fuente por defecto). En
 * rem, como el breakpoint lg de Tailwind, para que el umbral siga a la fuente que elija el usuario.
 * Debe coincidir con la variante de las clases de aquí y de las tarjetas de HomeEvents:
 * `lg:[@media(min-height:37.5rem)]:[html.js-motion_[data-rail]:not([data-unfit])_&]:`.
 * Con ella (solo con JS y sin movimiento reducido, porque js-motion lo pone el script de arranque
 * en ese caso), el bloque mide justo una pantalla y las fotos son lo único que cede alto: títulos,
 * textos y línea de progreso quedan siempre a la vista mientras la sección está fijada.
 */
const FIT = '(min-width: 64rem) and (min-height: 37.5rem)';

/**
 * Por debajo de este alto de foto (o si la foto queda más apaisada que MAX_RATIO) el carril fijado no
 * compensa: pasa con zoom de texto o fuentes muy grandes. Entonces no se fija, se marca data-unfit y
 * la sección recupera su alto natural con el carrusel nativo.
 */
const MIN_PHOTO = 140;
const MAX_RATIO = 1.6;

/** Mide con el layout encajado (quita data-unfit un instante si estaba puesto) si las fotos caben. */
function fits(pinEl: HTMLElement): boolean {
  const unfit = pinEl.hasAttribute('data-unfit');
  if (unfit) pinEl.removeAttribute('data-unfit');
  const media = pinEl.querySelector<HTMLElement>('[data-rail-media]');
  const box = media?.getBoundingClientRect();
  const ok =
    !!box &&
    box.height >= MIN_PHOTO &&
    box.width <= box.height * MAX_RATIO &&
    pinEl.scrollHeight <= window.innerHeight + 1;
  if (unfit) pinEl.setAttribute('data-unfit', '');
  return ok;
}

/**
 * Escritorio con movimiento: sección fijada y pista que se desplaza en horizontal con el scroll.
 * Móvil, ventana baja, texto muy grande, movimiento reducido o sin JS: carrusel nativo con scroll-snap.
 */
export function HorizontalRail({ header, children }: HorizontalRailProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pinEl = pinRef.current;
    const headerEl = headerRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!pinEl || !headerEl || !viewport || !track) return;
    if (!document.documentElement.classList.contains('js-motion')) return;

    let cancelled = false;
    let revert = () => {};
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      revert = () => mm.revert();
      mm.add(`${FIT} and ${MEDIA.motionOk}`, () => {
        let tween: gsap.core.Tween | null = null;
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

        // Con teclado: al enfocar una tarjeta fuera de vista, se lleva el scroll hasta ella
        const onFocus = (e: FocusEvent) => {
          const item = (e.target as HTMLElement).closest<HTMLElement>('[data-rail-item]');
          const st = tween?.scrollTrigger;
          if (!item || !st) return;
          const max = distance();
          if (max <= 0) return;
          const target = Math.min(1, Math.max(0, (item.offsetLeft - 40) / max));
          const top = st.start + target * (st.end - st.start);
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo({ top, behavior: 'auto' });
        };

        const pin = () => {
          viewport.dataset.pinned = '';
          tween = gsap.to(track, {
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
          track.addEventListener('focusin', onFocus);
        };

        const unpin = () => {
          track.removeEventListener('focusin', onFocus);
          tween?.scrollTrigger?.kill(true);
          tween?.kill();
          tween = null;
          gsap.set(track, { clearProps: 'transform' });
          if (progressRef.current) progressRef.current.style.transform = '';
          delete viewport.dataset.pinned;
        };

        // Decide si se fija; devuelve true si cambia la decisión
        const update = () => {
          const ok = fits(pinEl);
          pinEl.toggleAttribute('data-unfit', !ok);
          if (ok === !!tween) return false;
          if (ok) pin();
          else unpin();
          return true;
        };
        update();

        // Se repite tras cada refresco de ScrollTrigger (redimensionado, carga de fuentes) y cuando
        // cambia el alto del encabezado sin redimensionar la ventana (tamaño de letra del navegador,
        // zoom solo de texto). En ese segundo caso también se refresca si sigue fijada, porque cambia
        // el ancho de las tarjetas y con él el recorrido. Con espera corta para que el layout se asiente.
        let timer = 0;
        let relayout = false;
        const recheck = (layoutChanged: boolean) => {
          relayout ||= layoutChanged;
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            const refresh = update() || (relayout && !!tween);
            relayout = false;
            if (refresh) ScrollTrigger.refresh();
          }, 120);
        };
        const onRefresh = () => recheck(false);
        ScrollTrigger.addEventListener('refresh', onRefresh);
        let observed = false;
        const ro = new ResizeObserver(() => {
          // La primera notificación llega al observar: no es un cambio
          if (observed) recheck(true);
          observed = true;
        });
        ro.observe(headerEl);

        return () => {
          window.clearTimeout(timer);
          ScrollTrigger.removeEventListener('refresh', onRefresh);
          ro.disconnect();
          unpin();
          pinEl.removeAttribute('data-unfit');
        };
      });
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  // Clases del modo encajado (ver FIT): solo se aplican con html.js-motion, en escritorio con alto
  // suficiente y mientras la comprobación de fits() no marque data-unfit. Sin JS, con movimiento
  // reducido o sin espacio, la sección crece con su contenido y no se recorta nada.
  return (
    <div
      ref={pinRef}
      data-rail
      className="flex flex-col justify-center py-[var(--section-y)] lg:min-h-svh lg:pt-[clamp(56px,9svh,128px)] lg:pb-[clamp(32px,6svh,96px)] lg:[@media(min-height:37.5rem)]:[html.js-motion_&:not([data-unfit])]:h-svh"
    >
      <div ref={headerRef}>{header}</div>
      {/* Encajado: la ventana del carril ocupa el alto que deja el resto (como mucho, el de una tarjeta
          4:5 con su pie) y es contenedor de tamaño, para que las tarjetas calculen su ancho con cqh. */}
      <div
        ref={viewportRef}
        className="mt-12 snap-x snap-mandatory scroll-px-[max(var(--gutter),var(--safe-left))] [scrollbar-width:none] overflow-x-auto overscroll-x-contain data-[pinned]:snap-none data-[pinned]:overflow-visible lg:mt-[clamp(28px,5svh,64px)] [&::-webkit-scrollbar]:hidden lg:[@media(min-height:37.5rem)]:[html.js-motion_[data-rail]:not([data-unfit])_&]:[container-type:size] lg:[@media(min-height:37.5rem)]:[html.js-motion_[data-rail]:not([data-unfit])_&]:flex lg:[@media(min-height:37.5rem)]:[html.js-motion_[data-rail]:not([data-unfit])_&]:h-[calc(min(28vw,420px)*1.25+8rem)] lg:[@media(min-height:37.5rem)]:[html.js-motion_[data-rail]:not([data-unfit])_&]:min-h-0 lg:[@media(min-height:37.5rem)]:[html.js-motion_[data-rail]:not([data-unfit])_&]:flex-col lg:[@media(min-height:37.5rem)]:[html.js-motion_[data-rail]:not([data-unfit])_&]:justify-center"
      >
        {/* Una columna por tarjeta y dos filas compartidas (foto y pie) que cada tarjeta hereda con
            subgrid; la de la foto es la única que cede alto. El relleno lateral coincide con el
            borde de contenido de .container-site en cualquier ancho. */}
        <ul
          ref={trackRef}
          className="grid min-h-0 w-max grid-flow-col grid-rows-[minmax(0,1fr)_auto] gap-x-5 pr-[max(var(--gutter),var(--safe-right))] pl-[max(var(--gutter),var(--safe-left))] sm:gap-x-8 lg:gap-x-10 lg:pr-[max(var(--gutter),var(--safe-right),calc((100%-var(--container))/2))] lg:pl-[max(var(--gutter),var(--safe-left),calc((100%-var(--container))/2))]"
        >
          {children}
        </ul>
      </div>
      <div className="container-site mt-[clamp(20px,4svh,40px)] hidden lg:block" aria-hidden="true">
        <div className="h-px w-full bg-sand">
          {/* Escala inicial con transform (no con scale-x-0, que fija la propiedad `scale` y anularía el
              scaleX que escribe onUpdate) */}
          <span ref={progressRef} className="block h-px origin-left [transform:scaleX(0)] bg-wood" />
        </div>
      </div>
    </div>
  );
}
