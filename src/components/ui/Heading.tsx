import type { ReactNode } from 'react';
import { noOrphans } from '@/lib/typography';

type Level = 'h1' | 'h2' | 'h3';

type HeadingProps = {
  as?: Level;
  size?: 'hero' | 'h1' | 'h2' | 'h3';
  split?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
};

const sizeClass = { hero: 'text-hero', h1: 'text-h1', h2: 'text-h2', h3: 'text-h3' };

/**
 * Titular. Con split, el controlador de animaciones lo divide en líneas con
 * máscara al entrar en pantalla (solo con JavaScript y sin movimiento reducido).
 * Las palabras de una letra no se quedan solas al final de línea (noOrphans).
 */
export function Heading({ as: Tag = 'h2', size, split = true, className = '', id, children }: HeadingProps) {
  return (
    <Tag id={id} data-split={split ? '' : undefined} className={`${sizeClass[size ?? Tag]} ${className}`}>
      {typeof children === 'string' ? noOrphans(children) : children}
    </Tag>
  );
}
