'use client';

import { useRef, type ReactNode } from 'react';

type AccordionItemProps = {
  question: string;
  children: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: 'h3' | 'h4';
};

const DURATION = 600;
const EASING = 'cubic-bezier(.22,1,.36,1)';

/**
 * Acordeón sobre <details>/<summary>: funciona sin JavaScript y, con él, el
 * contenido entra y sale con opacidad y desplazamiento (solo transform y
 * opacity, como el resto de la web; respeta el movimiento reducido).
 */
export function AccordionItem({ question, children, defaultOpen = false, headingLevel = 'h3' }: AccordionItemProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  // Estado al que va el acordeón, para clics durante la animación
  const targetRef = useRef<boolean | null>(null);
  const Heading = headingLevel;

  const onToggleClick = (e: React.MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    const current = targetRef.current ?? details.open;
    const opening = !current;
    animRef.current?.cancel();
    targetRef.current = opening;
    if (opening) details.open = true;
    const hidden = { opacity: 0, transform: 'translateY(-10px)' };
    const shown = { opacity: 1, transform: 'translateY(0)' };
    const anim = content.animate(opening ? [hidden, shown] : [shown, hidden], {
      duration: DURATION,
      easing: EASING,
      fill: 'forwards',
    });
    animRef.current = anim;
    anim.onfinish = () => {
      if (!opening) details.open = false;
      anim.cancel();
      animRef.current = null;
      targetRef.current = null;
    };
  };

  return (
    <details ref={detailsRef} open={defaultOpen} className="group/acc border-t border-sand last:border-b">
      {/* -mx-3 px-3: el anillo de foco va por dentro de la fila, con aire a los lados y sin pisar
          las líneas. En escritorio el "+" deja sitio al botón flotante de WhatsApp (52 px a 16 px
          del borde, más 8 px de aire), que de 1024 a 1440 px se mete en la columna. */}
      <summary
        onClick={onToggleClick}
        className="-mx-3 flex min-h-[64px] items-center justify-between gap-6 px-3 py-5 text-left transition-colors duration-300 hover:text-wood-dark focus-visible:outline-offset-[-2px] lg:pr-[calc(12px_+_max(0px,76px_-_var(--gutter)))]"
      >
        <Heading className="font-display text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-snug tracking-[-0.01em]">
          {question}
        </Heading>
        <span aria-hidden="true" className="relative size-5 flex-none">
          <span className="absolute top-1/2 left-0 h-px w-5 bg-current" />
          <span className="absolute top-0 left-1/2 h-5 w-px bg-current transition-transform duration-500 ease-brand group-open/acc:scale-y-0" />
        </span>
      </summary>
      <div ref={contentRef}>
        <div className="max-w-[62ch] pb-7 text-stone">{children}</div>
      </div>
    </details>
  );
}
