import type { Metadata } from 'next';
import { Isotipo } from '@/components/brand/Isotipo';
import { ButtonLink } from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';

export const metadata: Metadata = {
  title: { absolute: 'Página no encontrada | Casetas Maderik' },
  description:
    'La página que buscas no existe o ha cambiado de dirección. Vuelve al inicio, mira nuestra caseta de madera o pide presupuesto para tu evento.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section data-header="light" className="flex min-h-[86svh] items-center bg-cream pt-[var(--header-h)]">
      <div className="container-site py-24">
        <Isotipo className="h-14 w-auto text-wood" />
        <p className="label mt-10">Error 404</p>
        <h1 className="text-h1 mt-6 max-w-[16ch]">Esta página no está montada</h1>
        <p className="text-lead mt-6 max-w-[44ch] text-stone">
          La dirección no existe o ha cambiado. Te dejamos los caminos más útiles.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonLink href="/contacto">Pedir presupuesto</ButtonLink>
          {/* Los dos enlaces secundarios bajan juntos cuando no caben al lado del botón */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <TextLink href="/casetas">Ver la caseta</TextLink>
            <TextLink href="/">Volver al inicio</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
