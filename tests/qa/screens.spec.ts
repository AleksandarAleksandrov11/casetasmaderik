import { expect, test } from '@playwright/test';
import { ROUTES, VIEWPORTS, CROSS_BROWSER_WIDTHS, heightFor } from './routes';
import { clippedText, dismissCookies, horizontalOverflow, prepare, scrollThrough, smallTargets, watch } from './helpers';

const OUT = 'tests/qa/output/screens';

test.describe.configure({ mode: 'parallel' });

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`${route.name} @ ${vp.label}`, async ({ browser, browserName }) => {
      // WebKit y Firefox solo en 390, 820 y 1440
      if (browserName !== 'chromium' && !(CROSS_BROWSER_WIDTHS as readonly number[]).includes(vp.width)) test.skip();
      test.setTimeout(120_000);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: browserName === 'firefox' ? undefined : vp.mobile,
        hasTouch: vp.mobile,
        deviceScaleFactor: 1,
        locale: 'es-ES',
        timezoneId: 'Europe/Madrid',
      });
      const page = await context.newPage();
      const problems = watch(page);
      await prepare(page);
      const res = await page.goto(route.path, { waitUntil: 'load' });
      expect(res?.status()).toBe('status' in route ? route.status : 200);
      await dismissCookies(page);
      await scrollThrough(page);

      const pending = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-reveal], [data-reveal-image], [data-split]'))
          .filter((e) => !e.classList.contains('is-in') && !e.classList.contains('is-split'))
          .map((e) => `${e.tagName.toLowerCase()} "${(e.textContent ?? '').trim().slice(0, 30)}"`),
      );
      const overflow = await horizontalOverflow(page, vp.width);
      const clipped = await clippedText(page);
      const small = vp.mobile && vp.width <= 430 ? await smallTargets(page) : [];
      const csp = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp ?? []);

      await page.screenshot({ path: `${OUT}/${browserName}/${route.name}-${vp.label}.png`, fullPage: true });
      await context.close();

      expect.soft(overflow.culprits, `Desbordamiento horizontal en ${route.path} @ ${vp.label}`).toEqual([]);
      expect.soft(overflow.overflow, 'scrollWidth > innerWidth').toBe(false);
      expect.soft(clipped, 'Texto cortado').toEqual([]);
      expect.soft(small, 'Objetivos táctiles < 44 px').toEqual([]);
      expect.soft(pending, 'Revelados pendientes tras recorrer la página').toEqual([]);
      expect.soft([...problems.csp, ...csp], 'Violaciones de CSP').toEqual([]);
      // En la 404 el propio documento responde 404 y Chromium lo anota en consola
      const consoleErrors =
        'status' in route ? problems.console.filter((m) => !m.includes('status of 404')) : problems.console;
      expect.soft(consoleErrors, 'Errores de consola').toEqual([]);
      expect.soft(problems.network, 'Peticiones fallidas').toEqual([]);
    });
  }
}

test('altura de referencia coherente', () => {
  expect(heightFor(390)).toBeGreaterThan(800);
});
