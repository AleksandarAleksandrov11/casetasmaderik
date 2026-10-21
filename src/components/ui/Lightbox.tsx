'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { lockScroll } from '@/lib/events';

export type LightboxImage = { src: string; width: number; height: number; alt: string };

type LightboxProps = {
  images: LightboxImage[];
  /** Miniaturas ya renderizadas: se envuelven en enlaces a la imagen (funciona sin JS). */
  thumbs: ReactNode[];
  className?: string;
  itemClassNames?: string[];
};

/**
 * Galería con lightbox accesible: <dialog> nativo (trampa de foco y Esc),
 * flechas del teclado, gesto de deslizar y contador de imágenes.
 */
export function Lightbox({ images, thumbs, className, itemClassNames }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const open = (i: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setIndex(i);
  };

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
  }, [index]);

  // Con la galería abierta la página no se desplaza por detrás
  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    lockScroll(true);
    return () => {
      root.style.overflow = prev;
      lockScroll(false);
    };
  }, [isOpen]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      setIndex(null);
      triggerRef.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    d.addEventListener('close', onClose);
    d.addEventListener('keydown', onKey);
    return () => {
      d.removeEventListener('close', onClose);
      d.removeEventListener('keydown', onKey);
    };
  }, [go]);

  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul className={className}>
        {images.map((img, i) => (
          <li key={img.src} className={itemClassNames?.[i]}>
            <a
              href={img.src}
              className="group/thumb block rounded-sm"
              onClick={(e) => {
                e.preventDefault();
                open(i, e.currentTarget);
              }}
              aria-label={`Ampliar imagen ${i + 1} de ${images.length}: ${img.alt}`}
            >
              {thumbs[i]}
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Galería de imágenes"
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-ink/95 p-0 text-cream backdrop:bg-ink/80"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current ? (
          <div className="flex h-full flex-col">
            {/* Alineada con el contenedor de la web, como el header: el contador empieza en el
                margen y la X (12 px de aire dentro de su botón de 48 px) acaba en él */}
            <div className="container-site flex items-center justify-between pt-[max(12px,var(--safe-top))] pr-[max(calc(var(--gutter)_-_12px),var(--safe-right))]">
              <p className="tabular text-[0.9375rem] text-mist" aria-live="polite">
                Imagen {index! + 1} de {images.length}
              </p>
              <button
                type="button"
                onClick={close}
                className="flex size-12 items-center justify-center rounded-sm text-cream hover:bg-cream/10"
                aria-label="Cerrar galería"
              >
                <X strokeWidth={1.5} className="size-6" aria-hidden="true" />
              </button>
            </div>
            {/* La figura mide su hueco (container-type: size): la caja de la foto toma la
                proporción de la foto y el pie queda siempre 16 px por debajo de la imagen */}
            <figure className="[container-type:size] relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 pr-[max(var(--gutter),var(--safe-right))] pb-4 pl-[max(var(--gutter),var(--safe-left))]">
              {/* Sin ampliar más de 1,5 veces el tamaño original. Sitio para el pie: dos líneas
                  (5rem), o una en pantallas bajas (20 % del alto) */}
              <div
                className="relative shrink-0"
                style={{
                  aspectRatio: `${current.width} / ${current.height}`,
                  width: `min(100cqw, 1000px, ${Math.round(current.width * 1.5)}px, calc((100cqh - min(5rem, 20cqh)) * ${(
                    current.width / current.height
                  ).toFixed(4)}))`,
                }}
              >
                <Image
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 1000px, 92vw"
                  quality={85}
                  className="object-contain"
                />
              </div>
              <figcaption className="max-w-[60ch] text-center text-[0.9375rem] text-cream/85">{current.alt}</figcaption>
            </figure>
            <div className="flex items-center justify-center gap-4 pb-[max(20px,var(--safe-bottom))]">
              <button
                type="button"
                onClick={() => go(-1)}
                className="flex size-12 items-center justify-center rounded-sm border border-cream/30 hover:bg-cream/10"
                aria-label="Imagen anterior"
              >
                <ChevronLeft strokeWidth={1.5} className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="flex size-12 items-center justify-center rounded-sm border border-cream/30 hover:bg-cream/10"
                aria-label="Imagen siguiente"
              >
                <ChevronRight strokeWidth={1.5} className="size-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
