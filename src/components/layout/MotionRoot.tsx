'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { EVT } from '@/lib/events';
import { MEDIA } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

function motionEnabled(): boolean {
  return document.documentElement.classList.contains('js-motion');
}

const fmt = (value: number, decimals: number) =>
  value.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Animaciones globales: Lenis en escritorio con puntero fino, revelados,
 * titulares con SplitText, cifras que cuentan, parallax y botones magnéticos.
 * Todo se desactiva sin la clase js-motion (movimiento reducido).
 */
export function MotionRoot() {
  const pathname = usePathname();

  // Lenis + ScrollTrigger, una sola vez
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (!motionEnabled() || !window.matchMedia(MEDIA.finePointer).matches) return;
    lenis = new Lenis({ autoRaf: false, lerp: 0.11, smoothWheel: true, anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const onLock = (e: Event) => {
      if ((e as CustomEvent<boolean>).detail) lenis?.stop();
      else lenis?.start();
    };
    window.addEventListener(EVT.scrollLock, onLock);
    return () => {
      window.removeEventListener(EVT.scrollLock, onLock);
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // Al cambiar de página (no en la carga inicial): arriba del todo
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  // Controladores por página
  useEffect(() => {
    const root = document.documentElement;
    const motion = motionEnabled();
    const cleanups: (() => void)[] = [];

    // Revelados con IntersectionObserver
    const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-image]');
    if (motion) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      );
      revealEls.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());

      // Si el scroll salta por encima de un elemento (ancla, scroll muy rápido),
      // IntersectionObserver no avisa: se revela todo lo que ya ha quedado arriba
      let frame = 0;
      const sweep = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const limit = window.innerHeight;
          revealEls.forEach((el) => {
            if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < limit) {
              el.classList.add('is-in');
              io.unobserve(el);
            }
          });
        });
      };
      window.addEventListener('scroll', sweep, { passive: true });
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener('scroll', sweep);
      });
    } else {
      revealEls.forEach((el) => el.classList.add('is-in'));
    }

    const ctx = gsap.context(() => {
      if (!motion) return;
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motionOk, () => {
        // Titulares por líneas con máscara
        document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit(self) {
              el.classList.add('is-split');
              return gsap.from(self.lines, {
                yPercent: 100,
                duration: 1.1,
                stagger: 0.08,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
              });
            },
          });
        });

        // Cifras que cuentan hacia arriba
        document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count);
          const decimals = Number(el.dataset.decimals ?? 0);
          const state = { v: 0 };
          el.textContent = fmt(0, decimals);
          gsap.to(state, {
            v: target,
            duration: 1.6,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => {
              el.textContent = fmt(state.v, decimals);
            },
          });
        });

        // Parallax suave en fondos fotográficos
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -10 },
            {
              yPercent: 10,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        // Líneas que se dibujan con el scroll
        document.querySelectorAll<HTMLElement>('[data-draw-line]').forEach((el) => {
          const vertical = el.dataset.drawLine === 'y';
          gsap.fromTo(
            el,
            vertical ? { scaleY: 0 } : { scaleX: 0 },
            {
              ...(vertical ? { scaleY: 1 } : { scaleX: 1 }),
              ease: 'none',
              transformOrigin: vertical ? 'top center' : 'left center',
              scrollTrigger: {
                trigger: el.closest('[data-draw-scope]') ?? el,
                start: 'top 75%',
                end: 'bottom 60%',
                scrub: 0.6,
              },
            },
          );
        });
      });

      // Botones magnéticos solo con puntero fino
      mm.add(`${MEDIA.motionOk} and ${MEDIA.finePointer}`, () => {
        const handlers: (() => void)[] = [];
        document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
          const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerleave', leave);
          handlers.push(() => {
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerleave', leave);
          });
        });
        return () => handlers.forEach((h) => h());
      });
    });

    root.classList.add('reveal-ready');

    // Recalcular cuando cargan fuentes e imágenes
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => undefined);
    window.addEventListener('load', refresh);
    const t = window.setTimeout(refresh, 600);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('load', refresh);
      cleanups.forEach((c) => c());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
