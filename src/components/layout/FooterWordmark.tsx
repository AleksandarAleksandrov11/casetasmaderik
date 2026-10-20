'use client';

import { useEffect, useRef } from 'react';
import { brand } from '@/components/brand/brand-data';

const PAD_TOP = 14;
const PAD_BOTTOM = 8;

/**
 * "CASETAS MADERIK" a todo el ancho: las letras suben desde una máscara de
 * forma escalonada, el isotipo se dibuja con trazo y, con ratón, cada letra se
 * eleva al pasar por encima.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!document.documentElement.classList.contains('js-motion')) {
      el.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [vx, , vw] = brand.wordmark.viewBox;
  const letters = brand.wordmark.letters;
  const [ix, iy, iw, ih] = brand.iso.viewBox;

  return (
    <div ref={ref} className="wordmark container-site mt-[clamp(64px,8vw,120px)] pb-[clamp(16px,2vw,32px)]">
      <svg
        viewBox={`${ix} ${iy} ${iw} ${ih}`}
        className="wordmark__iso mb-[clamp(16px,2.5vw,36px)] h-[clamp(36px,4.5vw,64px)] w-auto text-wood-light"
        fill="none"
        stroke="currentColor"
        strokeWidth={brand.iso.stroke}
        strokeMiterlimit={10}
        aria-hidden="true"
      >
        <path d={brand.iso.paths.outer} pathLength={1} />
        <path d={brand.iso.paths.inner} pathLength={1} />
        <path d={brand.iso.paths.portal} pathLength={1} />
      </svg>
      <svg
        viewBox={`${vx} ${-PAD_TOP} ${vw} ${100 + PAD_TOP + PAD_BOTTOM}`}
        className="block h-auto w-full text-cream"
        role="img"
        aria-label="Casetas Maderik"
      >
        {letters.map((l, i) =>
          l.d ? (
            <g key={i} className="wordmark__letter" style={{ ['--i' as string]: i }}>
              <rect x={l.x1 - 4} y={-PAD_TOP} width={l.x2 - l.x1 + 8} height={100 + PAD_TOP + PAD_BOTTOM} fill="transparent" />
              <path d={l.d} fill="currentColor" />
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}
