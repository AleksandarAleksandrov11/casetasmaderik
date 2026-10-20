import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

type Variant = 'primary' | 'light' | 'outline' | 'outline-light';
type Size = 'md' | 'lg';

type BaseProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  magnetic?: boolean;
};

const variants: Record<Variant, string> = {
  // Marrón con texto crema; el relleno tinta barre de izquierda a derecha
  primary: 'bg-wood text-cream before:bg-ink',
  // Para fondos oscuros: crema con texto tinta
  light: 'bg-cream text-ink before:bg-wood-light',
  outline: 'border border-ink/25 text-ink before:bg-ink hover:text-cream',
  'outline-light': 'border border-cream/35 text-cream before:bg-cream hover:text-ink',
};

const sizes: Record<Size, string> = {
  md: 'min-h-[52px] px-6 text-[0.9375rem]',
  lg: 'min-h-[56px] px-7 text-base',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className = '',
}: Pick<BaseProps, 'variant' | 'size' | 'className'>) {
  return [
    'group/btn relative isolate inline-flex select-none items-center justify-center gap-3 overflow-hidden rounded-sm font-semibold tracking-[0.01em] whitespace-nowrap',
    'transition-[color,border-color,transform] duration-500 ease-brand',
    "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-brand before:content-['']",
    'hover:before:scale-x-100 focus-visible:before:scale-x-100',
    variants[variant],
    sizes[size],
    className,
  ].join(' ');
}

function Inner({ children, arrow, icon }: Pick<BaseProps, 'children' | 'arrow' | 'icon'>) {
  return (
    <>
      {icon ? (
        <span className="-ml-1 flex size-5 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-[18px] transition-transform duration-500 ease-brand group-hover/btn:translate-x-1"
        />
      ) : null}
    </>
  );
}

type LinkButtonProps = BaseProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>;

/** Botón como enlace interno o externo. */
export function ButtonLink({
  variant,
  size,
  arrow = true,
  icon,
  className,
  children,
  magnetic = true,
  ...rest
}: LinkButtonProps) {
  return (
    <Link {...rest} data-magnetic={magnetic ? '' : undefined} className={buttonClasses({ variant, size, className })}>
      <Inner arrow={arrow} icon={icon}>
        {children}
      </Inner>
    </Link>
  );
}

type AnchorButtonProps = BaseProps & Omit<ComponentProps<'a'>, 'className' | 'children'>;

/** Botón para tel:, mailto: y wa.me. */
export function ButtonAnchor({
  variant,
  size,
  arrow = false,
  icon,
  className,
  children,
  magnetic = true,
  ...rest
}: AnchorButtonProps) {
  return (
    <a {...rest} data-magnetic={magnetic ? '' : undefined} className={buttonClasses({ variant, size, className })}>
      <Inner arrow={arrow} icon={icon}>
        {children}
      </Inner>
    </a>
  );
}

type NativeButtonProps = BaseProps & Omit<ComponentProps<'button'>, 'className' | 'children'>;

export function Button({
  variant,
  size,
  arrow = false,
  icon,
  className,
  children,
  magnetic = false,
  type = 'button',
  ...rest
}: NativeButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      data-magnetic={magnetic ? '' : undefined}
      className={buttonClasses({
        variant,
        size,
        className: `${className ?? ''} disabled:cursor-not-allowed disabled:opacity-60`,
      })}
    >
      <Inner arrow={arrow} icon={icon}>
        {children}
      </Inner>
    </button>
  );
}
