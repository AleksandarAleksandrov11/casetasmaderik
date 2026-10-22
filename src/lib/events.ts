/** Eventos globales entre islas de cliente. */
export const EVT = {
  scrollLock: 'cm:scroll-lock',
  consent: 'cm:consent',
  heroDone: 'cm:hero-done',
} as const;

export function lockScroll(locked: boolean): void {
  window.dispatchEvent(new CustomEvent(EVT.scrollLock, { detail: locked }));
}
