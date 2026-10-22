import type { CSSProperties } from 'react';
import type { PosterEntry } from './posters';

/** Deben coincidir con las consultas de styles.ts (WIDE y LG). */
const WIDE = '(min-width: 1024px) and (min-aspect-ratio: 1/1), (min-width: 600px) and (min-aspect-ratio: 5/4)';
const LG = '(min-width: 1024px)';

/** Margen y contenedor de la web en unidades de contenedor (igual que frameMetrics en state.ts). */
const G = 'clamp(20px, 4cqw, 56px)';
const CONTAINER = `min(100cqw, calc(1440px + 2 * ${G}))`;
const CONTENT = `(${CONTAINER} - 2 * ${G})`;

/** Expresiones CSS de la unidad de escala (u) y del ancla horizontal. */
function frame(p: PosterEntry): { u: string; ax: string } {
  if (p.fit === 'h') return { u: '100cqh', ax: `${(p.ax * 100).toFixed(3)}cqw` };
  if (p.fit === 'w') return { u: '100cqw', ax: `${(p.ax * 100).toFixed(3)}cqw` };
  return {
    u: `min(calc(100cqh * ${p.fit.hk}), calc(${CONTENT} * ${p.fit.wk}))`,
    ax: `calc((100cqw - ${CONTAINER}) / 2 + ${G} + ${p.ax} * ${CONTENT})`,
  };
}

/**
 * Poster del 3D: captura recortada del primer frame del lienzo, colocada con
 * unidades de contenedor para coincidir exactamente con el lienzo en
 * cualquier tamaño. El contenedor necesita `container-type: size`.
 * Si se pasan dos entradas, la de escritorio se usa según `media`.
 */
export function Poster({
  desktop,
  mobile,
  media = 'lg',
  className = '',
  sizes,
  eager = false,
}: {
  desktop: PosterEntry | null;
  mobile?: PosterEntry | null;
  /** Cuándo se usa el poster de escritorio: 'wide' (hero: escritorio y apaisado) o 'lg' (desde 1024 px). */
  media?: 'wide' | 'lg';
  className?: string;
  sizes?: { desktop: string; mobile: string };
  eager?: boolean;
}) {
  const main = mobile ?? desktop;
  if (!main) return null;
  const vars: Record<string, string> = {};
  const put = (p: PosterEntry, suffix: string) => {
    const { u, ax } = frame(p);
    vars[`--pl-${suffix}`] = `calc(${ax} + ${p.x} * ${u})`;
    vars[`--pt-${suffix}`] = `calc(${(p.ay * 100).toFixed(3)}cqh + ${p.y} * ${u})`;
    vars[`--pw-${suffix}`] = `calc(${p.w} * ${u})`;
    vars[`--ph-${suffix}`] = `calc(${p.h} * ${u})`;
  };
  if (desktop) put(desktop, 'd');
  if (mobile) put(mobile, 'm');
  const both = Boolean(desktop && mobile);
  const mq = media === 'wide' ? WIDE : LG;
  const set = (p: PosterEntry, type: 'avif' | 'webp') =>
    type === 'avif'
      ? `${p.srcSm} ${p.smWidth}w, ${p.src} ${p.width}w`
      : `${p.webpSm} ${p.smWidth}w, ${p.webp} ${p.width}w`;
  return (
    <picture
      className={`caseta-poster ${both ? `caseta-poster--split-${media}` : mobile ? 'caseta-poster--m' : 'caseta-poster--d'} ${className}`}
      style={vars as CSSProperties}
    >
      {both && desktop ? (
        <>
          <source media={mq} type="image/avif" srcSet={set(desktop, 'avif')} sizes={sizes?.desktop} />
          <source media={mq} type="image/webp" srcSet={set(desktop, 'webp')} sizes={sizes?.desktop} />
        </>
      ) : null}
      <source type="image/avif" srcSet={set(main, 'avif')} sizes={mobile ? sizes?.mobile : sizes?.desktop} />
      <img
        src={main.webp}
        srcSet={set(main, 'webp')}
        sizes={mobile ? sizes?.mobile : sizes?.desktop}
        width={main.width}
        height={main.height}
        alt=""
        decoding="async"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        draggable={false}
      />
    </picture>
  );
}
