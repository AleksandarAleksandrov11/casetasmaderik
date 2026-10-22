import type { ComponentProps } from 'react';

/** Etiqueta de sección en mayúsculas con línea de 24 px. */
export function Label({ className = '', ...rest }: ComponentProps<'p'>) {
  return <p {...rest} className={`label ${className}`} />;
}
