/**
 * Menú móvil: entrada y salida solo con CSS (opacidad y un desplazamiento
 * corto), sin librería de animación. Solo con html.js-motion: con movimiento
 * reducido el menú aparece y desaparece sin animación. Ningún transform queda
 * fijado al terminar (las animaciones no tienen fotograma final).
 */
export const menuCss = /* css */ `
html.js-motion .mm {
  animation: mm-fade 0.35s var(--ease-brand) both;
}

html.js-motion .mm[data-state='closing'] {
  animation: mm-fade-out 0.25s var(--ease-brand) both;
}

html.js-motion .mm-item {
  animation: mm-rise 0.5s var(--ease-brand) both;
  animation-delay: calc(60ms + var(--i, 0) * 50ms);
}

html.js-motion .mm-cta {
  animation: mm-rise 0.5s var(--ease-brand) 0.28s both;
}

html.js-motion .mm-contact {
  animation: mm-fade 0.5s var(--ease-brand) 0.34s both;
}

@keyframes mm-fade {
  from {
    opacity: 0;
  }
}

@keyframes mm-fade-out {
  to {
    opacity: 0;
  }
}

@keyframes mm-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 14px, 0);
  }
}
`;
