'use client';

import { useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { MAP_SPRITE, provinceHref, provinceSlug } from './province-link';
import './province-map.css';

type ProvinceMapProps = {
  /** Nombres exactos de PROVINCIAS (src/lib/quote-data.ts), en orden alfabético */
  provinces: readonly string[];
  /** Provincias destacadas como zona de servicio; vacío: toda España */
  zone: readonly string[];
  viewBox: string;
  canarias: { x: number; y: number; w: number; h: number };
  /** Rótulo cuando no hay ninguna provincia elegida */
  idle: string;
};

/** Nombre con la flecha del desplegable pegada a la última palabra (nunca sola en una línea). */
function Label({ text }: { text: string }) {
  const cut = text.lastIndexOf(' ') + 1;
  return (
    <>
      {text.slice(0, cut)}
      <span className="whitespace-nowrap">
        {text.slice(cut)}
        <ChevronDown strokeWidth={1.5} className="ml-[0.2em] inline-block size-[0.55em] align-[0.05em] text-wood" />
      </span>
    </>
  );
}

/**
 * Mapa de España por provincias. Cada provincia es un enlace al formulario con
 * la provincia ya puesta (/contacto?provincia=...). Al pasar el ratón o el foco
 * de teclado se resalta y su nombre aparece en el rótulo junto al mapa.
 *
 * Con ratón y teclado, el clic (o Intro) lleva directo al formulario. En
 * táctil, el primer toque solo elige la provincia y muestra su nombre con el
 * botón para pedir presupuesto; un segundo toque sobre ella, o el botón, lleva
 * al formulario. Así un toque impreciso sobre una provincia pequeña no saca de
 * la página.
 *
 * El rótulo es también un desplegable nativo con todas las provincias: el
 * control equivalente (WCAG 2.5.8) para las provincias pequeñas, que en un
 * móvil no llegan a 44 px, y un atajo de teclado frente a 52 tabulaciones.
 *
 * La geometría no viaja en el HTML ni en el JS: cada <use> apunta al sprite
 * estático /mapa-espana.svg, que el navegador descarga una sola vez.
 */
export function ProvinceMap({ provinces, zone, viewBox, canarias, idle }: ProvinceMapProps) {
  const router = useRouter();
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const pointer = useRef<string>('mouse');
  // Provincia elegida con el último toque: el siguiente toque sobre ella navega
  const tapped = useRef<string | null>(null);
  const current = hover ?? selected;

  const onPointerDown = (e: PointerEvent) => {
    pointer.current = e.pointerType;
  };

  const onClick = (e: MouseEvent, name: string) => {
    // Con teclas modificadoras o botón central, el navegador abre la pestaña nueva
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    // detail 0: clic desde el teclado (Intro)
    const touch = e.detail !== 0 && pointer.current !== 'mouse';
    if (touch && tapped.current !== name) {
      tapped.current = name;
      setSelected(name);
      return;
    }
    router.push(provinceHref(name));
  };

  return (
    <>
      <div className="col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:self-center">
        <svg
          data-equivalent-control=""
          viewBox={viewBox}
          className="province-map h-auto w-full max-lg:landscape:mx-auto max-lg:landscape:max-w-[calc(80svh*1000/740)]"
          role="group"
          aria-label="Mapa de España por provincias"
          onPointerLeave={() => setHover(null)}
        >
          {provinces.map((name) => {
            const slug = provinceSlug(name);
            return (
              <a
                key={name}
                href={provinceHref(name)}
                aria-label={name}
                className="province"
                data-zone={zone.includes(name) ? '' : undefined}
                data-selected={selected === name ? '' : undefined}
                onPointerDown={onPointerDown}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setHover(name);
                }}
                onFocus={() => setSelected(name)}
                onClick={(e) => onClick(e, name)}
              >
                <use href={`${MAP_SPRITE}#p-${slug}`} />
              </a>
            );
          })}
          <rect
            x={canarias.x}
            y={canarias.y}
            width={canarias.w}
            height={canarias.h}
            fill="none"
            className="stroke-sand"
            strokeWidth={1}
            aria-hidden="true"
          />
        </svg>
      </div>
      <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:row-start-2 lg:self-end">
        <div>
          {/*
           * Dos líneas reservadas y el nombre abajo: "Santa Cruz de Tenerife" no
           * mueve el botón. Encima, el desplegable nativo transparente: tocar el
           * rótulo abre la lista de provincias del sistema.
           */}
          <div className="relative rounded-xs outline-offset-4 has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-wood">
            <p
              aria-hidden="true"
              className="flex min-h-[2em] items-end overflow-hidden font-display text-[clamp(2rem,1.55rem+1.6vw,3.25rem)] leading-none tracking-[-0.025em] text-ink"
            >
              <span key={current ?? ''} className={`block pb-[0.08em] ${current ? 'province-name' : ''}`}>
                <Label text={current ?? idle} />
              </span>
            </p>
            <select
              id="provincia-mapa"
              aria-label="Provincia del evento"
              value={selected ?? ''}
              onChange={(e) => {
                const name = e.target.value || null;
                tapped.current = name;
                setSelected(name);
              }}
              className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
            >
              <option value="">{idle}</option>
              {provinces.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <ButtonLink
            href={current ? provinceHref(current) : '/contacto'}
            prefetch={false}
            magnetic={false}
            className="mt-6 max-w-full py-3 text-left whitespace-normal!"
          >
            {current ? `Pedir presupuesto en ${current}` : 'Pedir presupuesto'}
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
