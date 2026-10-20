import { brand } from '@/components/brand/brand-data';

/**
 * Animación inicial rápida y limpia: el isotipo se dibuja, el nombre sube desde
 * una máscara y la cortina se retira. Solo CSS: se activa con la clase
 * js-intro (una vez por sesión, sin movimiento reducido) y se retira sola.
 */
export function Intro() {
  const [ix, iy, iw, ih] = brand.iso.viewBox;
  const t = brand.horizontal.text;
  const letters = t.letters;
  const first = letters[0];
  const last = letters[letters.length - 1];
  const width = last.x2 - first.x1;
  return (
    <div className="intro" aria-hidden="true">
      <div className="flex flex-col items-center">
        <svg
          viewBox={`${ix} ${iy} ${iw} ${ih}`}
          className="intro__mark h-[clamp(56px,9vw,84px)] w-auto text-wood"
          fill="none"
          stroke="currentColor"
          strokeWidth={brand.iso.stroke}
          strokeMiterlimit={10}
        >
          <path d={brand.iso.paths.outer} pathLength={1} />
          <path d={brand.iso.paths.inner} pathLength={1} />
          <path d={brand.iso.paths.portal} pathLength={1} />
        </svg>
        <svg
          viewBox={`${first.x1} -2 ${width} 32`}
          className="intro__word mt-6 h-[clamp(14px,2vw,18px)] w-auto text-ink"
        >
          <g fill="currentColor">
            {letters.map((l, i) => (l.d ? <path key={i} d={l.d} /> : null))}
          </g>
        </svg>
        <span className="intro__rule mt-6 block h-px w-[clamp(120px,18vw,180px)] bg-sand" />
      </div>
    </div>
  );
}
