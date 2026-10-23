import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { Lightbox } from '@/components/ui/Lightbox';
import { casetasGallery } from '@/content/casetas';

/**
 * S4. La caseta, en uso: solo fotos reales, las cuatro con el mismo formato
 * y alineadas (una fila en escritorio, 2 × 2 en tablet y móvil). Cada foto
 * se abre en grande en el lightbox.
 */
export function CasetasGallery() {
  const g = casetasGallery;
  return (
    <Section surface="paper" aria-labelledby="galeria-titulo">
      <div className="container-site">
        <Label>{g.label}</Label>
        <Heading id="galeria-titulo" className="mt-6">
          {g.title}
        </Heading>
        <Lightbox
          images={[...g.images]}
          className="mt-[clamp(40px,5vw,72px)] grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
          thumbs={g.images.map((img, i) => (
            <div
              key={img.src}
              data-reveal-image
              style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}
              className="relative aspect-[4/5] overflow-hidden rounded-sm bg-sand"
            >
              <Image
                src={img.src}
                {...blurFor(img.src)}
                alt={img.alt}
                fill
                sizes="(min-width: 1504px) 344px, (min-width: 1024px) 23vw, 46vw"
                quality={80}
                className="object-cover transition-transform duration-[1200ms] ease-brand group-hover/thumb:scale-[1.03]"
                style={'position' in img && img.position ? { objectPosition: img.position } : undefined}
              />
            </div>
          ))}
        />
      </div>
    </Section>
  );
}
