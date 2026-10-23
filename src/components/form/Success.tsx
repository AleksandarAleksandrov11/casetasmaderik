'use client';

import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { trackEvent } from '@/components/consent/trackEvent';
import { whatsappHref } from '@/content/site';
import { FORM_COPY } from './copy';

type SuccessProps = {
  nombre: string;
  numero: number;
  headingRef: (el: HTMLHeadingElement | null) => void;
};

/** Pantalla de éxito: check que se dibuja, número de solicitud y siguientes pasos. */
export function Success({ nombre, numero, headingRef }: SuccessProps) {
  return (
    <div className="py-2 sm:py-4">
      <svg viewBox="0 0 64 64" className="size-16 text-wood" fill="none" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r="30"
          stroke="currentColor"
          strokeWidth="1.5"
          pathLength={1}
          className="q-draw"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <path
          d="M20 33.5 28.5 42 45 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="q-draw q-draw--late"
        />
      </svg>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-h2 mt-8 text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] text-ink outline-none"
      >
        {FORM_COPY.successTitle}
      </h2>
      <p className="text-lead mt-5 max-w-[34rem] text-stone">
        {FORM_COPY.successThanks(nombre)}
        {numero > 0 ? <> {FORM_COPY.successNumber(numero)}</> : null}
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonAnchor
          href={whatsappHref(FORM_COPY.successWhatsappMessage(numero))}
          target="_blank"
          rel="noopener noreferrer"
          arrow
          magnetic={false}
          onClick={() => trackEvent('click_whatsapp', { ubicacion: 'formulario_exito' })}
        >
          {FORM_COPY.whatsapp}
        </ButtonAnchor>
        {/* Principal con flecha; el secundario, sin ella (como en el resto de la web) */}
        <ButtonLink href="/" variant="outline" arrow={false} magnetic={false}>
          {FORM_COPY.home}
        </ButtonLink>
      </div>
    </div>
  );
}
