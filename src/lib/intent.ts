/**
 * Primera señal de uso de la página: scroll, rueda, toque, clic, tecla o
 * movimiento del ratón. Lo que no hace falta para el primer pantallazo (GSAP,
 * Lenis, el carril fijado, el menú móvil, el formulario interactivo) espera a
 * ella: la carga inicial queda libre y la página responde antes. Si la página
 * ya arranca desplazada (recarga a mitad, ancla), cuenta como uso.
 */
const EVENTS = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'pointermove', 'keydown'] as const;

let fired = false;
const waiting = new Set<() => void>();

function fire() {
  if (fired) return;
  fired = true;
  for (const e of EVENTS) window.removeEventListener(e, fire, true);
  const list = [...waiting];
  waiting.clear();
  list.forEach((cb) => cb());
}

let listening = false;

/** Ejecuta cb en la primera interacción (o enseguida si ya la hubo). Devuelve la cancelación. */
export function onFirstIntent(cb: () => void): () => void {
  if (fired || window.scrollY > 0) {
    fire();
    cb();
    return () => undefined;
  }
  waiting.add(cb);
  if (!listening) {
    listening = true;
    for (const e of EVENTS) window.addEventListener(e, fire, { capture: true, passive: true });
  }
  return () => waiting.delete(cb);
}
