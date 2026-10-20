'use client';

import Link from 'next/link';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react';
import { useEffect, useRef } from 'react';
import { emailHref, nav, phoneHref, site, whatsappHref } from '@/content/site';
import { lockScroll } from '@/lib/events';
import { EASE } from '@/lib/motion';
import { trackEvent } from '@/components/consent/trackEvent';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Menú a pantalla completa en tinta con enlaces grandes escalonados. */
export function MobileMenu({ open, onClose, pathname }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Bloqueo de scroll, contenido inerte, Esc y trampa de foco
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    lockScroll(true);
    // Todo lo que queda fuera del menú, incluido el aviso de cookies, queda inerte
    const outside = [
      document.getElementById('contenido'),
      document.querySelector('footer'),
      document.getElementById('cc-main'),
      document.querySelector('.skip-link'),
    ].filter(Boolean) as HTMLElement[];
    outside.forEach((el) => el.setAttribute('inert', ''));

    const toggle = document.querySelector<HTMLButtonElement>('[aria-controls="menu-movil"]');
    const focusables = () => [
      ...(toggle ? [toggle] : []),
      ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    ];
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
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
      lockScroll(false);
      outside.forEach((el) => el.removeAttribute('inert'));
    };
  }, [open, onClose]);

  return (
    <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {open ? (
          <m.div
            key="menu"
            id="menu-movil"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="surface-dark fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink text-cream lg:hidden"
            style={{
              paddingTop: 'calc(var(--header-h) + var(--safe-top))',
              paddingBottom: 'max(28px, var(--safe-bottom))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.35, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE, delay: 0.1 } }}
          >
            <nav aria-label="Menú móvil" className="container-site flex-1 pt-6">
              <ul className="flex flex-col">
                {nav.map((item, i) => {
                  const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                  return (
                    <li key={item.href} className="overflow-hidden border-b border-mist/20">
                      <m.div
                        initial={{ y: '105%' }}
                        animate={{ y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.08 + i * 0.07 } }}
                        exit={{ y: '-105%', transition: { duration: 0.35, ease: EASE } }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className="flex min-h-[64px] items-center justify-between py-3 font-display text-[clamp(2.25rem,10vw,3.5rem)] leading-none tracking-[-0.02em]"
                        >
                          <span>{item.label}</span>
                          {active ? <span className="size-2 rounded-full bg-wood-light" aria-hidden="true" /> : null}
                        </Link>
                      </m.div>
                    </li>
                  );
                })}
              </ul>
              <m.div
                className="mt-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.4 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <Link
                  href="/contacto"
                  onClick={onClose}
                  className="flex min-h-[56px] w-full items-center justify-center rounded-sm bg-cream px-6 font-semibold text-ink"
                >
                  Pedir presupuesto
                </Link>
              </m.div>
            </nav>

            <m.div
              className="container-site mt-10 grid gap-1 text-[0.9375rem]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6, ease: EASE, delay: 0.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
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
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}
