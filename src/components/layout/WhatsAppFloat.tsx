'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { whatsappHref } from '@/content/site';
import { trackEvent } from '@/components/consent/trackEvent';

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01Zm-7.01 15.24h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z"
      />
    </svg>
  );
}

/** Margen alrededor del botón: empieza a apartarse antes de tocar la lista */
const AIR = 24;

/**
 * Botón flotante de WhatsApp. Aparece tras el hero (o el primer pantallazo), se oculta en /contacto,
 * cuando el footer está a la vista y mientras pasa sobre elementos marcados con data-wa-avoid (los "+"
 * del acordeón de preguntas), y sube por encima del aviso de cookies: --consent-lift es la franja
 * inferior que ocupa el aviso mientras se ve (0 si no hay aviso).
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);
  const [pastHero, setPastHero] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [overContent, setOverContent] = useState(false);

  // Con hero ([data-hero], Inicio): visible cuando el hero ha salido por
  // arriba. En el resto de páginas, tras el primer pantallazo.
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    if (hero) {
      const io = new IntersectionObserver((entries) => {
        const e = entries[0];
        if (e) setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0);
      });
      io.observe(hero);
      return () => io.disconnect();
    }
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    const footer = document.getElementById('pie');
    if (!footer) return;
    const io = new IntersectionObserver((entries) => setFooterVisible(entries[0]?.isIntersecting ?? false));
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  // Caja del botón en reposo (sin el desplazamiento de entrada y salida, que va en translate, pero con
  // la subida sobre el aviso, que va en transform): así ocultarlo no cambia el resultado y no parpadea.
  useEffect(() => {
    const el = ref.current;
    const items = [...document.querySelectorAll<HTMLElement>('[data-wa-avoid]')];
    if (!el || items.length === 0) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const shift = parseFloat(getComputedStyle(el).translate.split(' ')[1] ?? '') || 0;
      const top = box.top - shift - AIR;
      const bottom = box.bottom - shift + AIR;
      const left = box.left - AIR;
      const right = box.right + AIR;
      setOverContent(
        items.some((item) => {
          const r = item.getBoundingClientRect();
          return r.top < bottom && r.bottom > top && r.left < right && r.right > left;
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      setOverContent(false);
    };
  }, [pathname]);

  const visible = pastHero && !footerVisible && !overContent && pathname !== '/contacto';

  return (
    <a
      ref={ref}
      id="whatsapp-flotante"
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      tabIndex={visible ? undefined : -1}
      aria-hidden={visible ? undefined : true}
      onClick={() => trackEvent('click_whatsapp', { ubicacion: 'flotante' })}
      className={[
        'fixed right-[max(16px,var(--safe-right))] bottom-[max(20px,calc(var(--safe-bottom)+12px))] z-30 flex size-[52px] items-center justify-center rounded-full bg-wood text-cream',
        '[transform:translateY(calc(var(--consent-lift)*-1))]',
        'transition-[opacity,transform,translate,background-color] duration-500 ease-brand hover:bg-wood-dark',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      ].join(' ')}
    >
      <WhatsAppIcon className="size-6" />
    </a>
  );
}
