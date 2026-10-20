'use client';

import { useRef, type ReactNode } from 'react';

type AccordionItemProps = {
  question: string;
  children: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: 'h3' | 'h4';
};

const DURATION = 420;
const EASING = 'cubic-bezier(.22,1,.36,1)';

/**
 * Acordeón sobre <details>/<summary>: funciona sin JavaScript y, con él, anima
 * la altura con la Web Animations API (respetando el movimiento reducido).
 */
export function AccordionItem({ question, children, defaultOpen = false, headingLevel = 'h3' }: AccordionItemProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const Heading = headingLevel;

  const onToggleClick = (e: React.MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    animRef.current?.cancel();
    const opening = !details.open;
    if (opening) details.open = true;
    const full = content.scrollHeight;
    const from = opening ? 0 : full;
    const to = opening ? full : 0;
    content.style.overflow = 'hidden';
    const anim = content.animate(
      [
        { height: `${from}px`, opacity: opening ? 0 : 1 },
        { height: `${to}px`, opacity: opening ? 1 : 0 },
      ],
      { duration: DURATION, easing: EASING },
    );
    animRef.current = anim;
    anim.onfinish = () => {
      if (!opening) details.open = false;
      content.style.overflow = '';
      animRef.current = null;
    };
  };

  return (
    <details ref={detailsRef} open={defaultOpen} className="group/acc border-t border-sand last:border-b">
      <summary
        onClick={onToggleClick}
        className="flex min-h-[64px] items-center justify-between gap-6 py-5 text-left transition-colors duration-300 hover:text-wood-dark"
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
