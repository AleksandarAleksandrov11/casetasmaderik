import type { ComponentProps } from 'react';

export type Surface = 'cream' | 'paper' | 'dark' | 'photo';

const surfaces: Record<Surface, string> = {
  cream: 'bg-cream text-ink',
  paper: 'surface-paper bg-paper text-ink',
  dark: 'surface-dark bg-ink text-cream',
  photo: 'surface-dark bg-ink text-cream',
};

type SectionProps = ComponentProps<'section'> & {
  surface?: Surface;
  spacing?: boolean;
};

/**
 * Sección de página. Declara data-header para que el header cambie a su
 * versión clara sobre fondos oscuros.
 */
export function Section({ surface = 'cream', spacing = true, className = '', ...rest }: SectionProps) {
  const dark = surface === 'dark' || surface === 'photo';
  return (
    <section
      data-header={dark ? 'dark' : 'light'}
      data-surface={dark ? 'dark' : 'light'}
      {...rest}
      className={`relative ${surfaces[surface]} ${spacing ? 'section-y' : ''} ${className}`}
    />
  );
}
