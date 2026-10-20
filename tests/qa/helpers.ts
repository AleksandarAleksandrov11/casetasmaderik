import type { Page } from '@playwright/test';

export type Problems = { console: string[]; network: string[]; csp: string[] };

/** Registra errores de consola, peticiones fallidas y violaciones de CSP. */
export function watch(page: Page): Problems {
  const problems: Problems = { console: [], network: [], csp: [] };
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.console.push(`${m.type()}: ${m.text()}`);
    if (/Content Security Policy/i.test(m.text())) problems.csp.push(m.text());
  });
  page.on('pageerror', (e) => problems.console.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const err = r.failure()?.errorText ?? '';
    // Las precargas de Next que se cancelan al cerrar la página no son fallos reales
    if (err.includes('ERR_ABORTED') && /[?&]_rsc=/.test(r.url())) return;
    // La captura a página completa cambia el viewport y el navegador cancela la
    // imagen responsive en curso para pedir otra: no es un fallo del sitio
    if (err.includes('ERR_ABORTED') && r.url().includes('/_next/image')) return;
    problems.network.push(`${r.method()} ${r.url()} ${err}`);
  });
  page.on('response', (r) => {
    const url = r.url();
    if (r.status() >= 400 && !url.includes('/pagina-que-no-existe')) problems.network.push(`${r.status()} ${url}`);
  });
  return problems;
}

/** Salta la intro y prepara el registro de violaciones de CSP. */
export async function prepare(page: Page, { intro = false } = {}): Promise<void> {
  await page.addInitScript((skip) => {
    try {
      if (skip) sessionStorage.setItem('cm:intro', '1');
    } catch {}
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  }, !intro);
}

/** Cierra el aviso de cookies con "Rechazar" si está abierto. */
export async function dismissCookies(page: Page): Promise<void> {
  const reject = page.locator('#cc-main button[data-role="necessary"]').first();
  try {
    await reject.waitFor({ state: 'visible', timeout: 4000 });
    await reject.click({ timeout: 5000 });
    await page.waitForTimeout(300);
  } catch {
    // Sin aviso (ya decidido o bot)
  }
}

/** Recorre la página entera para disparar animaciones y revelados. */
export async function scrollThrough(page: Page): Promise<void> {
  // Espera a que MotionRoot haya montado los revelados (hidratación)
  await page
    .waitForFunction(() => document.documentElement.classList.contains('reveal-ready'), null, { timeout: 20_000 })
    .catch(() => undefined);
  const vh = page.viewportSize()?.height ?? 800;
  let y = 0;
  for (let i = 0; i < 300; i++) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    if (y > height) break;
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(110);
    y += Math.round(vh * 0.6);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(600);
}

/** Elementos que desbordan en horizontal (fuera de contenedores con scroll o recorte). */
export async function horizontalOverflow(
  page: Page,
  expectedWidth: number,
): Promise<{ overflow: boolean; culprits: string[] }> {
  return page.evaluate((expected) => {
    // En móvil, si algo desborda, el navegador ensancha el viewport de diseño:
    // se compara con el ancho del dispositivo, no con innerWidth
    const vw = expected;
    const doc = document.documentElement;
    const overflow = doc.scrollWidth > vw || window.innerWidth > vw;
    const culprits: string[] = [];
    const clipped = (el: Element): boolean => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (['hidden', 'clip', 'auto', 'scroll'].includes(cs.overflowX)) return true;
      }
      return false;
    };
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || clipped(el)) continue;
        culprits.push(
          `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} [${Math.round(r.left)}..${Math.round(r.right)}]`,
        );
        if (culprits.length > 12) break;
      }
    }
    return { overflow, culprits };
  }, expectedWidth);
}

/** Titulares y botones que se salen de su caja. */
export async function clippedText(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const els = document.querySelectorAll<HTMLElement>('h1, h2, h3, button, a[class*="rounded-sm"], .label, summary');
    for (const el of Array.from(els)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (el.closest('[aria-hidden="true"], [inert], #cc-main')) continue;
      const tooWide = el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible';
      const parent = el.parentElement?.getBoundingClientRect();
      const outOfParent = parent
        ? r.right > parent.right + 2 &&
          getComputedStyle(el.parentElement!).overflowX === 'visible' &&
          r.right > window.innerWidth
        : false;
      if (tooWide || outOfParent)
        out.push(`${el.tagName.toLowerCase()}: "${(el.textContent ?? '').trim().slice(0, 50)}"`);
    }
    return out;
  });
}

/** Objetivos táctiles de menos de 44 × 44 px (móvil). */
export async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const sel =
      'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="radio"]';
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if (el.closest('[aria-hidden="true"], [inert], .sr-only, .skip-link, noscript')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue;
      let hidden = false;
      for (let p: HTMLElement | null = el; p; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.opacity === '0' || s.display === 'none') {
          hidden = true;
          break;
        }
      }
      if (hidden) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // Enlaces dentro de un texto corrido: se rigen por la excepción de WCAG 2.5.8
      if (el.tagName === 'A' && el.closest('p, .prose-legal li, td') && !el.className.includes('inline-flex')) continue;
      // Casillas: se mide la etiqueta que las envuelve
      if (el instanceof HTMLInputElement && ['checkbox', 'radio'].includes(el.type)) {
        const label = el.closest('label') ?? document.querySelector(`label[for="${el.id}"]`);
        const lr = label?.getBoundingClientRect();
        if (lr && lr.height >= 44 - 0.5) continue;
      }
      if (r.width < 44 - 0.5 || r.height < 44 - 0.5) {
        out.push(
          `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)}" ${Math.round(r.width)}x${Math.round(r.height)}`,
        );
      }
    }
    return out;
  });
}
