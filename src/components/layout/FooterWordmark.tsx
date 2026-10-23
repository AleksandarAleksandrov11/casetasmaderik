import { brand } from '@/components/brand/brand-data';
import { InView } from '@/components/ui/InView';

const PAD_TOP = 14;
const PAD_BOTTOM = 8;

/**
 * "CASETAS MADERIK" a todo el ancho: las letras suben desde una máscara de
 * forma escalonada y, con ratón, cada letra se eleva al pasar por encima. Sin
 * isotipo encima: el del bloque de la marca ya identifica la web.
 */
export function FooterWordmark() {
  const [vx, , vw] = brand.wordmark.viewBox;
  const letters = brand.wordmark.letters;

  return (
    <div id="footer-wordmark" className="wordmark container-site mt-[clamp(64px,8vw,120px)] pb-[clamp(16px,2vw,32px)]">
      <InView targetId="footer-wordmark" threshold={0.35} />
      <svg
        viewBox={`${vx} ${-PAD_TOP} ${vw} ${100 + PAD_TOP + PAD_BOTTOM}`}
        className="block h-auto w-full text-cream"
        role="img"
        aria-label="Casetas Maderik"
      >
        {letters.map((l, i) =>
          l.d ? (
            <g key={i} className="wordmark__letter" style={{ ['--i' as string]: i }}>
              <rect
                x={l.x1 - 4}
                y={-PAD_TOP}
                width={l.x2 - l.x1 + 8}
                height={100 + PAD_TOP + PAD_BOTTOM}
                fill="transparent"
              />
              <path d={l.d} fill="currentColor" />
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}
