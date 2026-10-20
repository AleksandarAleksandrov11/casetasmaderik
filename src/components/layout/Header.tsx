'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { nav } from '@/content/site';
import { MobileMenu } from './MobileMenu';

type Theme = 'light' | 'dark';

const SCROLL_THRESHOLD = 40;
const HIDE_AFTER = 160;

/**
 * Header sticky: transparente sobre el hero, compacto y con fondo al bajar
 * 40 px, se oculta al bajar y reaparece al subir, y cambia a su versión clara
 * sobre las secciones con data-header="dark".
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll: estado compacto y ocultar al bajar
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > SCROLL_THRESHOLD);
        const delta = y - lastY.current;
        if (Math.abs(delta) > 6) {
          setHidden(delta > 0 && y > HIDE_AFTER);
          lastY.current = y;
        }
      });
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
      const y = (header?.offsetHeight ?? 68) / 2;
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
        className={[
          `fixed inset-x-0 top-0 ${menuOpen ? 'z-[80]' : 'z-50'} pt-[var(--safe-top)] transition-[transform,background-color,border-color,color] duration-500 ease-brand`,
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
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
            className="relative z-10 -my-2 flex min-h-[44px] items-center py-2"
          >
            <Logo
              className="h-[26px] w-auto sm:h-[30px] lg:h-[32px]"
              markClassName={dark || menuOpen ? 'text-wood-light' : 'text-wood'}
            />
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
              <ButtonLink
                href="/contacto"
                variant={dark ? 'light' : 'primary'}
                arrow={false}
                className="!min-h-[46px] !px-5 !text-[0.875rem]"
              >
                Pedir presupuesto
              </ButtonLink>
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              className="relative z-10 -mr-2 flex size-12 items-center justify-center lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="relative block h-[14px] w-[26px]" aria-hidden="true">
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
      <MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} />
    </>
  );
}
