/**
 * Estilos del mapa de provincias. En línea con <style precedence> (ver
 * three/styles.ts): una hoja CSS importada generaba un chunk por ruta que el
 * prefetch de los enlaces precargaba en otras páginas sin usarlo.
 */
export const provinceMapCss = /* css */ `
/* Mapa de provincias de Nosotros (ProvinceMap). Cada provincia es un <a> con un
   <use> del sprite /mapa-espana.svg: el relleno y el trazo se heredan del <use>. */
.province-map .province {
  cursor: pointer;
  outline: none;
}

.province-map .province use {
  fill: var(--color-sand, #e6dccf);
  stroke: var(--color-cream, #fbf8f3);
  stroke-width: 1.2;
  stroke-linejoin: round;
  transition: fill 0.25s var(--ease-brand, ease);
}

.province-map .province[data-zone] use {
  fill: var(--color-wood-light, #c49a76);
}

/* La elegida (foco o toque) se ve mientras el ratón no esté sobre el mapa */
.province-map:not(:hover) .province[data-selected] use,
.province-map .province:hover use {
  fill: var(--color-wood, #98603e);
}

/* Foco de teclado: madera oscura con contorno tinta, distinto del hover. La
   segunda regla iguala la especificidad de la de la provincia elegida */
.province-map .province:focus-visible use,
.province-map:not(:hover) .province[data-selected]:focus-visible use {
  fill: var(--color-wood-dark, #6e4329);
  stroke: var(--color-ink, #0e1615);
  stroke-width: 1.6;
}

@keyframes province-name-in {
  from {
    opacity: 0;
    transform: translate3d(0, 0.4em, 0);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .province-name {
    animation: province-name-in 0.5s var(--ease-brand, ease) both;
  }
}

@media (prefers-reduced-motion: reduce) {
  .province-map .province use {
    transition: none;
  }
}
`;
