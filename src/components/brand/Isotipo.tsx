import { brand } from './brand-data';

type IsotipoProps = {
  className?: string;
  /** Añade pathLength=1 para poder dibujarlo con stroke-dashoffset. */
  drawable?: boolean;
  title?: string;
  strokeWidth?: number;
};

/** Isotipo de Casetas Maderik: tres trazos animables. Hereda el color con currentColor. */
export function Isotipo({ className, drawable = false, title, strokeWidth }: IsotipoProps) {
  const [x, y, w, h] = brand.iso.viewBox;
  const p = drawable ? { pathLength: 1 } : {};
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? brand.iso.stroke}
      strokeMiterlimit={10}
    >
      <path d={brand.iso.paths.outer} {...p} />
      <path d={brand.iso.paths.inner} {...p} />
      <path d={brand.iso.paths.portal} {...p} />
    </svg>
  );
}
