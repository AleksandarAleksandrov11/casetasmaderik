import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { Lightbox } from '@/components/ui/Lightbox';
import { mesasGallery } from '@/content/mesas';

/** S4. En eventos: fotos reales en 4:3, tres por fila en escritorio y dos en tablet y móvil. */
export function MesasGallery() {
  const g = mesasGallery;
  return (
    <Section surface="cream" aria-labelledby="mesas-galeria-titulo">
      <div className="container-site">
        <Label>{g.label}</Label>
        <Heading id="mesas-galeria-titulo" className="mt-6">
          {g.title}
        </Heading>
        <Lightbox
          images={[...g.images]}
          className="mt-[clamp(40px,5vw,72px)] grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6"
          thumbs={g.images.map((img, i) => (
            <div
              key={img.src}
              data-reveal-image
              style={{ ['--reveal-delay' as string]: `${(i % 3) * 0.08}s` }}
              className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand"
            >
              <Image
                src={img.src}
                {...blurFor(img.src)}
                alt={img.alt}
                fill
                sizes="(min-width: 1504px) 464px, (min-width: 1024px) 31vw, 46vw"
                quality={80}
                className="object-cover transition-transform duration-[1200ms] ease-brand group-hover/thumb:scale-[1.03]"
              />
            </div>
          ))}
        />
      </div>
    </Section>
  );
}
