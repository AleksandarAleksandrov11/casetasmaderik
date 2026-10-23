'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { nav } from '@/content/site';
import { onFirstIntent } from '@/lib/intent';

// El menú móvil se descarga después de la carga inicial
const loadMenu = () => import('./MobileMenu').then((m) => m.MobileMenu);
const MobileMenu = dynamic(loadMenu, { ssr: false });

type Theme = 'light' | 'dark';

const SCROLL_THRESHOLD = 40;

/**
 * Header fijo arriba y siempre visible: transparente sobre el hero, compacto y
 * con fondo al bajar 40 px, y en su versión clara sobre las secciones con
 * data-header="dark".
 */
export function Header({ logo }: { logo: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Precarga del menú móvil con la primera interacción (no compite con la carga)
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    return onFirstIntent(() => void loadMenu());
  }, []);

  // Hasta hidratar, el CSS decide el tono del header (ver globals.css)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // El menú móvil se cierra si la ventana pasa a escritorio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Scroll: versión compacta a partir de 40 px
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > SCROLL_THRESHOLD));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Tema según la sección que queda bajo el header
  useEffect(() => {
    const main = document.getElementById('contenido');
    if (!main) return;
    const probe = () => {
      const header = headerRef.current;
      // Cambia cuando el borde entre secciones llega al pie del header: mientras lo
      // cruza, el fondo del header ya es el de la sección que entra
      const y = (header?.offsetHeight ?? 68) - 1;
      const sections = document.querySelectorAll<HTMLElement>('[data-header]');
      let next: Theme = 'light';
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) next = el.dataset.header === 'dark' ? 'dark' : 'light';
      }
      setTheme(next);
    };
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(probe);
    };
    probe();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // El hero de Inicio cambia su data-header al caer la noche
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-header'] });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mo.disconnect();
    };
  }, [pathname]);

  // Cerrar el menú al navegar
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const dark = theme === 'dark' && !menuOpen;
  const showBar = scrolled && !menuOpen;

  return (
    <>
      <header
        ref={headerRef}
        data-theme={dark ? 'dark' : 'light'}
        data-scrolled={scrolled ? '' : undefined}
        data-ready={ready ? '' : undefined}
        className={[
          `fixed inset-x-0 top-0 ${menuOpen ? 'z-[80]' : 'z-50'} pt-[var(--safe-top)] [transition:background-color_150ms_linear,border-color_150ms_linear,color_150ms_linear]`,
          menuOpen ? 'text-cream' : dark ? 'text-cream' : 'text-ink',
          showBar
            ? dark
              ? 'border-b border-mist/20 bg-ink/85 backdrop-blur-md [-webkit-backdrop-filter:blur(12px)]'
              : 'border-b border-sand bg-cream/85 backdrop-blur-md [-webkit-backdrop-filter:blur(12px)]'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div
          className={[
            'container-site flex items-center justify-between gap-6 transition-[height] duration-500 ease-brand',
            scrolled ? 'h-[var(--header-h-compact)]' : 'h-[var(--header-h)]',
          ].join(' ')}
        >
          <Link
            href="/"
            aria-label="Casetas Maderik, ir al inicio"
            data-logo-tone={dark || menuOpen ? 'dark' : 'light'}
            className="group/logo relative z-10 -my-2 flex min-h-[44px] items-center py-2"
          >
            {logo}
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {nav.map((item) => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className="group/nav relative inline-flex min-h-[44px] items-center px-3 text-[0.9375rem] font-medium"
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={[
                          'absolute inset-x-3 bottom-[9px] h-px origin-left bg-current transition-transform duration-500 ease-brand',
                          active ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100',
                        ].join(' ')}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              {/* El primario de la web (52 px, texto y flecha). Al cambiar de tono, fondo y texto cambian
                  a la vez y sin transición: con transición se cruzan y el texto se pierde un instante.
                  header-cta: tono previo a hidratar en globals.css */}
              <ButtonLink
                href="/contacto"
                variant={dark ? 'light' : 'primary'}
                className="header-cta transition-[transform]!"
              >
                Pedir presupuesto
              </ButtonLink>
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              className="relative z-10 -mr-[11px] flex size-12 items-center justify-center lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => {
                setMenuMounted(true);
                setMenuOpen((v) => !v);
              }}
            >
              {/* Iconos alineados con el borde derecho del contenido; la X (más estrecha) se desplaza un poco */}
              <span
                className={[
                  'relative block h-[14px] w-[26px] transition-transform duration-500 ease-brand',
                  menuOpen ? 'translate-x-[2px]' : '',
                ].join(' ')}
                aria-hidden="true"
              >
                <span
                  className={[
                    'absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-500 ease-brand',
                    menuOpen ? 'top-[6px] rotate-45' : 'top-0',
                  ].join(' ')}
                />
                <span
                  className={[
                    'absolute left-0 h-[1.5px] w-full bg-current transition-transform duration-500 ease-brand',
                    menuOpen ? 'top-[6px] -rotate-45' : 'top-[12px]',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>
        </div>
      </header>
      {menuMounted ? <MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} /> : null}
    </>
  );
}
