import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Label } from '@/components/ui/Label';
import { nosotrosHero } from '@/content/nosotros';

/**
 * Ancho al que se dibuja la foto, no el de la caja: la capa del parallax mide
 * 1,2 veces la sección (88svh) y object-cover escala la foto 3:2 hasta cubrirla.
 * En vertical eso son unas 1,6 veces el alto del viewport. En móviles en
 * horizontal manda la altura del texto y la foto llega a 1,35 veces el ancho.
 */
const HERO_SIZES = '(max-aspect-ratio: 8/5) 160vh, (max-height: 500px) 135vw, 100vw';

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
        <div data-parallax className="absolute inset-x-0 -top-[10%] -bottom-[10%]">
          <Image
            src={h.image.src}
            {...blurFor(h.image.src)}
            alt=""
            fill
            preload
            sizes={HERO_SIZES}
            quality={70}
            className="object-cover object-[35%_50%]"
          />
        </div>
        <div className="absolute inset-0 bg-ink/62" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/40" />
      </div>
      <div className="container-site relative pt-[calc(var(--header-h)+48px)] pb-[clamp(56px,8vw,112px)]">
        <Breadcrumbs
          tone="dark"
          items={[
            { name: 'Inicio', path: '/' },
            { name: 'Nosotros', path: '/nosotros' },
          ]}
        />
        <Label className="mt-8">{h.label}</Label>
        <h1 className="text-h1 mt-6 max-w-[18ch]">{h.title}</h1>
        <p className="text-lead mt-6 max-w-[48ch] text-cream/85">{h.text}</p>
      </div>
    </section>
  );
}
