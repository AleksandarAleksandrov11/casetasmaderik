import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { ROUTES } from './routes';
import { dismissCookies, prepare, scrollThrough } from './helpers';

/*
 * Contraste medido en píxeles para los textos que axe deja "sin determinar"
 * porque están sobre una foto o un degradado (CTA de temporada, tarjetas del
 * carril, Temporada alta de Nosotros). Para cada nodo se captura el fondo con
 * las letras transparentes y se calcula el contraste del color del texto contra
 * cada píxel de su caja. Se exige el AA al percentil 5 (el 5 % de fondo más
 * desfavorable), para que una luz o una lona blanca detrás no lo dejen ilegible.
 */

const lum = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// Letras transparentes sin transiciones; el subrayado de los enlaces, fuera
const HIDE_TEXT =
  '*,*::before,*::after{transition:none!important}*{-webkit-text-fill-color:transparent!important;text-decoration-color:transparent!important;text-shadow:none!important}svg text{fill:transparent!important}.link-underline{background-image:none!important}';

for (const route of ROUTES) {
  // Móvil, tablet y escritorio: por debajo de lg las fotos se dibujan más anchas que la pantalla
  for (const vp of [
    { width: 1440, height: 900, mobile: false },
    { width: 1024, height: 768, mobile: false },
    { width: 768, height: 1024, mobile: true },
    { width: 390, height: 844, mobile: true },
  ]) {
    test(`contraste sobre fotos ${route.name} @ ${vp.width}`, async ({ browser }) => {
      test.setTimeout(300_000);
      const context = await browser.newContext({
        viewport: vp,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        locale: 'es-ES',
      });
      const page = await context.newPage();
      await prepare(page);
      await page.goto(route.path);
      await dismissCookies(page);
      await scrollThrough(page);
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      const targets = results.incomplete
        .flatMap((r) => r.nodes)
        .filter((n) => ['imgNode', 'bgGradient', 'bgImage'].includes(String(n.any[0]?.data?.messageKey ?? '')))
        // Las cotas de los planos son SVG sobre papel: axe las marca por la línea de cota, no por el fondo
        .filter((n) => !n.html.startsWith('<text'))
        .map((n) => String(n.target[0]));

      const failures: string[] = [];
      for (const target of targets) {
        // Lenis (escritorio) suaviza también los saltos programáticos: se mide cuando el scroll
        // ya se ha asentado, si no los rectángulos no coinciden con la captura
        await page.evaluate(
          (sel) => document.querySelector(sel)?.scrollIntoView({ block: 'center', behavior: 'instant' }),
          target,
        );
        await page.waitForTimeout(600);
        let lastY = -1;
        let still = 0;
        for (let k = 0; k < 40 && still < 3; k++) {
          await page.waitForTimeout(80);
          const y = await page.evaluate(() => Math.round(window.scrollY));
          still = y === lastY ? still + 1 : 0;
          lastY = y;
        }
        const info = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const cs = getComputedStyle(el);
          // El color calculado puede venir en oklab o color(srgb): se pasa por un canvas
          const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
          ctx.fillStyle = cs.color;
          ctx.fillRect(0, 0, 1, 1);
          const d = ctx.getImageData(0, 0, 1, 1).data;
          const range = document.createRange();
          range.selectNodeContents(el);
          const rects = Array.from(range.getClientRects()).filter((q) => q.width > 2 && q.height > 2);
          return {
            rgba: [d[0], d[1], d[2], d[3] / 255],
            large: parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700),
            rects: rects.map((q) => [q.left, q.top, q.width, q.height]),
            text: (el.textContent || '').trim().slice(0, 40),
          };
        }, target);
        if (!info || !info.rects.length) continue;
        await page.waitForTimeout(300);
        const style = await page.addStyleTag({ content: HIDE_TEXT });
        await page.waitForTimeout(100);
        const shot = await page.screenshot();
        await style.evaluate((s) => (s as HTMLStyleElement).remove());
        const { data, info: meta } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
        const [tr, tg, tb, ta] = info.rgba;
        const ratios: number[] = [];
        for (const [x, y, w, h] of info.rects) {
          for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(meta.height, y + h); yy += 2) {
            for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(meta.width, x + w); xx += 2) {
              const i = (yy * meta.width + xx) * meta.channels;
              const bg = [data[i], data[i + 1], data[i + 2]];
              ratios.push(
                ratio([tr * ta + bg[0] * (1 - ta), tg * ta + bg[1] * (1 - ta), tb * ta + bg[2] * (1 - ta)], bg),
              );
            }
          }
        }
        if (!ratios.length) continue;
        ratios.sort((a, b) => a - b);
        const p5 = ratios[Math.floor(ratios.length * 0.05)];
        const need = info.large ? 3 : 4.5;
        if (p5 < need) failures.push(`"${info.text}" ${p5.toFixed(2)}:1 (mínimo ${need}:1)`);
      }
      await context.close();
      expect(failures).toEqual([]);
    });
  }
}
