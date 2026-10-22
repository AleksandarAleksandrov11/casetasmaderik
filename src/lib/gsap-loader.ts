/**
 * Carga GSAP y sus plugins bajo demanda, fuera del JavaScript inicial, y los
 * registra una sola vez.
 */
import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextType } from 'gsap/SplitText';

export type GsapModules = {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  SplitText: typeof SplitTextType;
};

let promise: Promise<GsapModules> | null = null;

export function loadGsap(): Promise<GsapModules> {
  promise ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')]).then(
    ([g, st, sp]) => {
      g.gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
      st.ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText };
    },
  );
  return promise;
}
