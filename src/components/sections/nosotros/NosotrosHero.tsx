import { ButtonLink } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { PageHero } from '@/components/sections/shared/PageHero';
import { nosotrosHero } from '@/content/nosotros';

/** S1. Hero interior: título junto al header, entradilla, acciones y foto contenida. */
export function NosotrosHero() {
  const h = nosotrosHero;
  return (
    <PageHero title={h.title} text={h.text} image={h.image} focus="35% 50%">
      <ButtonLink href="/contacto" size="lg">
        Pedir presupuesto
      </ButtonLink>
      <TextLink href="/casetas">Ver la caseta</TextLink>
    </PageHero>
  );
}
