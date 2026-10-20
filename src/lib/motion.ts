/** Curva y duraciones comunes de toda la web. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_CSS = 'cubic-bezier(.22,1,.36,1)';
export const GSAP_EASE = 'expo.out';

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 0.9,
  reveal: 1.1,
} as const;

export const MEDIA = {
  desktop: '(min-width: 1024px)',
  mobile: '(max-width: 1023.98px)',
  finePointer: '(hover: hover) and (pointer: fine)',
  reduced: '(prefers-reduced-motion: reduce)',
  motionOk: '(prefers-reduced-motion: no-preference)',
} as const;
