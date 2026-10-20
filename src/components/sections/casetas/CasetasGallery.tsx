import Image from 'next/image';
import { blurFor } from '@/content/image-blur';
import { Heading } from '@/components/ui/Heading';
import { Label } from '@/components/ui/Label';
import { Section } from '@/components/ui/Section';
import { Lightbox } from '@/components/ui/Lightbox';
import { casetasGallery } from '@/content/casetas';

const OFFSETS = ['lg:mt-0', 'lg:mt-24', 'lg:mt-10', 'lg:mt-32'];

/** S4. La caseta, en uso: solo fotos reales, en mosaico escalonado y con lightbox. */
export function CasetasGallery() {
  const g = casetasGallery;
  return (
    <Section surface="paper" aria-labelledby="galeria-titulo">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Label>{g.label}</Label>
            <Heading id="galeria-titulo" className="mt-6">
              {g.title}
            </Heading>
          </div>
          <p className="max-w-[32ch] text-stone" data-reveal>
            Fotos de nuestra caseta. Pulsa en cualquiera para verla en grande.
          </p>
        </div>
        <Lightbox
          images={[...g.images]}
          className="mt-14 grid grid-cols-2 items-start gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8"
          itemClassNames={g.images.map((_, i) => OFFSETS[i % OFFSETS.length])}
          thumbs={g.images.map((img, i) => (
            <div
              key={img.src}
              data-reveal-image
              style={{ ['--reveal-delay' as string]: `${i * 0.08}s` }}
              className="relative overflow-hidden rounded-sm bg-sand"
            >
              <Image
                src={img.src}
                {...blurFor(img.src)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 1024px) 320px, 46vw"
                quality={80}
                className="h-auto w-full transition-transform duration-[1200ms] ease-brand group-hover/thumb:scale-[1.03]"
              />
            </div>
          ))}
        />
      </div>
    </Section>
  );
}
