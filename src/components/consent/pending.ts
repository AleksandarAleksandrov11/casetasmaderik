import { CONSENT_COOKIE, CONSENT_REVISION } from '@/content/cookies';

/**
 * Clase de <html> mientras el aviso de cookies está pendiente. Con ella la
 * página reserva la franja del aviso (--consent-h, ver globals.css).
 */
export const CONSENT_PENDING_CLASS = 'cc-pending';

/** Agentes a los que no se muestra el aviso (buscadores y rastreadores). */
export const BOT_UA = /bot|crawl|spider|slurp|teoma/i;

/**
 * Fragmento del script de arranque (layout.tsx): antes del primer pintado
 * marca el aviso como pendiente si no hay un consentimiento de la revisión
 * actual. Así la reserva de sitio existe desde el principio y el aviso no
 * desplaza nada al aparecer. ConsentProvider corrige la marca si se equivoca.
 */
export const consentBootSnippet = `try{var m=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/),v=null;if(m){try{v=JSON.parse(decodeURIComponent(m[1]))}catch(e){}}if(!(v&&v.consentId&&v.revision===${CONSENT_REVISION})&&!${BOT_UA}.test(navigator.userAgent))d.classList.add('${CONSENT_PENDING_CLASS}')}catch(e){}`;
