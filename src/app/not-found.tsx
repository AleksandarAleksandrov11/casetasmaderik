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
    <section
      data-header="light"
      className="flex min-h-[calc(86svh-var(--consent-h,0px))] items-center bg-cream pt-[var(--header-h)]"
    >
      {/*
       * Con el aviso de cookies abierto, el bloque deja libre su franja
       * (--consent-h). En móvil horizontal, menos aire, sin isotipo (ya está en
       * la cabecera) y el texto fuera de la columna de la tarjeta del aviso.
       */}
      <div className="container-site py-[clamp(40px,6svh,96px)] short-landscape:py-6">
        <Isotipo className="h-14 w-auto text-wood short-landscape:hidden" />
        <p className="label mt-10 short-landscape:mt-0">Error 404</p>
        <h1 className="text-h1 mt-6 max-w-[16ch]">Esta página no está montada</h1>
        <p className="text-lead mt-6 max-w-[44ch] text-stone short-landscape:max-w-[calc(100vw-3*var(--gutter)-min(320px,max(264px,46vw-var(--gutter))))]">
          La dirección no existe o ha cambiado. Te dejamos los caminos más útiles.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 short-landscape:mt-6 short-landscape:max-w-[calc(100vw-3*var(--gutter)-min(320px,max(264px,46vw-var(--gutter))))]">
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
