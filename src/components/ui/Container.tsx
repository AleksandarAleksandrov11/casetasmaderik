import type { ComponentProps } from 'react';

export function Container({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div {...rest} className={`container-site ${className}`} />;
}
