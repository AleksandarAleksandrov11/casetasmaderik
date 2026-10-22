import { brand } from './brand-data';

type LogoProps = {
  className?: string;
  /** Color del isotipo (por defecto marrón de marca). */
  markClassName?: string;
  /** Color del nombre (por defecto hereda currentColor). */
  textClassName?: string;
};

/** Logo horizontal en línea: isotipo y nombre convertido a trazados. */
export function Logo({ className, markClassName = 'text-wood', textClassName = '' }: LogoProps) {
  const [x, y, w, h] = brand.horizontal.viewBox;
  const t = brand.horizontal.text;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} className={className} aria-hidden="true" focusable="false">
      <g
        className={markClassName}
        fill="none"
        stroke="currentColor"
        strokeWidth={brand.iso.stroke}
        strokeMiterlimit={10}
      >
        <path d={brand.iso.paths.outer} />
        <path d={brand.iso.paths.inner} />
        <path d={brand.iso.paths.portal} />
      </g>
      <g className={textClassName} fill="currentColor" transform={`translate(${t.x} ${t.y})`}>
        {t.letters.map((l, i) => (l.d ? <path key={i} d={l.d} /> : null))}
      </g>
    </svg>
  );
}
