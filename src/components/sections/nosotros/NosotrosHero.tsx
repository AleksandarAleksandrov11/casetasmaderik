import { Label } from '@/components/ui/Label';
import { nosotrosHero } from '@/content/nosotros';
import { CoverPhoto, photoSizes } from './CoverPhoto';

/**
 * Ancho al que se dibuja la foto: la capa del parallax mide 1,2 veces la sección
 * y la foto 3:2 la cubre, así que gana el mayor de tres. En vertical, el alto
 * mínimo de 88svh (158,4vh); en móviles en horizontal y ventanas bajas, el alto
 * del texto (de 490 a 630 px según el ancho); en escritorio, el ancho. Tope de
 * 1x: es un fondo bajo un overlay del 62 % y la imagen del LCP en móvil.
 */
const HERO_SIZES = photoSizes([[null, 'max(100vw, 158.4vh, 960px, calc(684px + 30.6vw))']], 1);

/** S1. Foto a pantalla completa con parallax y overlay. */
export function NosotrosHero() {
  const h = nosotrosHero;
  return (
    <section
      data-header="dark"
      data-surface="dark"
      className="surface-dark relative flex min-h-[88svh] items-end overflow-hidden bg-ink text-cream"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div data-parallax className="@container-size absolute inset-x-0 -top-[10%] -bottom-[10%]">
          <CoverPhoto image={h.image} sizes={HERO_SIZES} quality={70} focus={[35, 50]} lcp />
        </div>
        {/* 74 % por debajo de lg: con la foto ampliada, la etiqueta no llegaba al AA en móvil y tablet */}
        <div className="absolute inset-0 bg-ink/74 lg:bg-ink/62" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/40" />
      </div>
      <div className="container-site relative pt-[calc(var(--header-h)+48px)] pb-[clamp(56px,8vw,112px)]">
        <Label>{h.label}</Label>
        <h1 className="text-h1 mt-6 max-w-[18ch]">{h.title}</h1>
        <p className="text-lead mt-6 max-w-[48ch] text-cream/85">{h.text}</p>
      </div>
    </section>
  );
}
