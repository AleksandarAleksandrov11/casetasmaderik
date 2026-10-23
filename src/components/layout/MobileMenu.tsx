'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { emailHref, nav, phoneHref, site, whatsappHref } from '@/content/site';
import { lockScroll } from '@/lib/events';
import { trackEvent } from '@/components/consent/trackEvent';
import { InlineStyle } from '@/components/three/InlineStyle';
import { ButtonLink } from '@/components/ui/Button';
import { menuCss } from './menuStyles';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Duración de la salida (menuStyles.ts). */
const EXIT_MS = 250;

/**
 * Menú a pantalla completa en tinta con enlaces grandes que entran escalonados
 * con un fundido corto (solo CSS, ver menuStyles.ts). Sin máscaras ni
 * recorridos largos: el primer enlace recibe el foco al abrir y, dentro de una
 * máscara con overflow, el navegador desplazaba la máscara para enseñarlo a
 * mitad de animación (Inicio subía y desaparecía).
 */
export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Montado mientras está abierto y durante el fundido de salida
  const [shown, setShown] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open && (!shown || closing)) {
    setShown(true);
    setClosing(false);
  } else if (!open && shown && !closing) {
    setClosing(true);
  }

  useEffect(() => {
    if (!closing) return;
    const animated = document.documentElement.classList.contains('js-motion');
    const t = window.setTimeout(
      () => {
        setShown(false);
        setClosing(false);
      },
      animated ? EXIT_MS : 0,
    );
    return () => window.clearTimeout(t);
  }, [closing]);

  // Bloqueo de scroll, contenido inerte, Esc y trampa de foco
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevGutter = root.style.scrollbarGutter;
    // Con barra de desplazamiento (tablet con ratón), su hueco se conserva: nada se mueve al abrir
    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    lockScroll(true);
    // Todo lo que queda fuera del menú, incluido el aviso de cookies, queda inerte
    const outside = [
      document.getElementById('contenido'),
      document.getElementById('pie'),
      document.getElementById('cc-main'),
      document.getElementById('whatsapp-flotante'),
      document.querySelector('.skip-link'),
    ].filter(Boolean) as HTMLElement[];
    outside.forEach((el) => el.setAttribute('inert', ''));

    const toggle = document.querySelector<HTMLButtonElement>('[aria-controls="menu-movil"]');
    const focusables = () => [
      ...(toggle ? [toggle] : []),
      ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    ];
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });
    }, 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      root.style.overflow = prevOverflow;
      root.style.scrollbarGutter = prevGutter;
      lockScroll(false);
      outside.forEach((el) => el.removeAttribute('inert'));
    };
  }, [open, onClose]);

  if (!shown) return null;

  return (
    <>
      <InlineStyle id="menu-movil" css={menuCss} />
      <div
        id="menu-movil"
        ref={panelRef}
        role="dialog"
        aria-label="Menú"
        data-lenis-prevent
        data-state={closing ? 'closing' : 'open'}
        inert={closing}
        className="mm surface-dark fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-ink text-cream lg:hidden"
        style={{
          paddingTop: 'calc(var(--header-h) + var(--safe-top))',
          paddingBottom: 'max(28px, var(--safe-bottom))',
        }}
      >
        {/* En horizontal (poca altura) enlaces a la izquierda y CTA y contacto a la derecha */}
        <div className="container-site flex flex-1 flex-col pt-6 short-landscape:grid short-landscape:grid-cols-2 short-landscape:items-start short-landscape:gap-x-12 short-landscape:pt-2">
          <nav aria-label="Menú móvil">
            <ul className="flex flex-col">
              {nav.map((item, i) => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <li key={item.href} className="border-b border-mist/20">
                    <div className="mm-item" style={{ '--i': i } as CSSProperties}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        // El tamaño depende también del alto: en horizontal caben los cuatro
                        className="flex min-h-[64px] items-center justify-between py-3 font-display text-[clamp(1.75rem,min(10vw,8svh),3.5rem)] leading-none tracking-[-0.02em] short-landscape:min-h-[48px] short-landscape:py-2"
                      >
                        <span>{item.label}</span>
                        {active ? <span className="size-2 rounded-full bg-wood-light" aria-hidden="true" /> : null}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-1 flex-col short-landscape:flex-none">
            <div className="mm-cta mt-8 short-landscape:mt-1">
              <ButtonLink
                href="/contacto"
                onClick={onClose}
                variant="light"
                size="lg"
                magnetic={false}
                className="w-full"
              >
                Pedir presupuesto
              </ButtonLink>
            </div>

            <div className="mm-contact mt-auto grid gap-1 pt-10 text-[0.9375rem] short-landscape:mt-3 short-landscape:pt-0">
              <a
                href={emailHref}
                onClick={() => trackEvent('click_email', { ubicacion: 'menu' })}
                className="flex min-h-[44px] items-center text-cream"
              >
                {site.email}
              </a>
              <a
                href={phoneHref}
                onClick={() => trackEvent('click_phone', { ubicacion: 'menu' })}
                className="flex min-h-[44px] items-center text-cream"
              >
                {site.phone.display}
              </a>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('click_whatsapp', { ubicacion: 'menu' })}
                className="flex min-h-[44px] items-center text-cream"
              >
                WhatsApp
              </a>
              <p className="mt-2 text-mist">{site.hours}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
