import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

type TextLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & { children: ReactNode; arrow?: boolean };

/** Enlace secundario con subrayado animado y flecha. */
export function TextLink({ children, arrow = true, className = '', ...rest }: TextLinkProps) {
  return (
    <Link {...rest} className={`link-underline group/tl ${className}`}>
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-[18px] transition-transform duration-500 ease-brand group-hover/tl:translate-x-1"
        />
      ) : null}
    </Link>
  );
}
