import type { CSSProperties } from 'react';
import type { PosterEntry } from './posters';

/** Deben coincidir con las consultas de three.css. */
const WIDE = '(min-width: 1024px), (min-width: 600px) and (min-aspect-ratio: 5/4)';
const LG = '(min-width: 1024px)';

/**
 * Poster del 3D: captura recortada del primer frame del lienzo, colocada con
 * unidades de contenedor (cqh / cqw) para coincidir exactamente con el lienzo
 * en cualquier tamaño. El contenedor necesita `container-type: size`.
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
    const u = p.fit === 'h' ? 'cqh' : 'cqw';
    vars[`--pl-${suffix}`] = `calc(${(p.ax * 100).toFixed(3)}cqw + ${(p.x * 100).toFixed(3)}${u})`;
    vars[`--pt-${suffix}`] = `calc(${(p.ay * 100).toFixed(3)}cqh + ${(p.y * 100).toFixed(3)}${u})`;
    vars[`--pw-${suffix}`] = `${(p.w * 100).toFixed(3)}${u}`;
    vars[`--ph-${suffix}`] = `${(p.h * 100).toFixed(3)}${u}`;
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
