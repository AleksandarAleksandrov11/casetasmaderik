import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ROUTES } from './routes';
import { dismissCookies, prepare, scrollThrough } from './helpers';

for (const route of ROUTES) {
  for (const vp of [
    { width: 1440, height: 900, mobile: false },
    { width: 390, height: 844, mobile: true },
  ]) {
    test(`axe ${route.name} @ ${vp.width}`, async ({ browser }) => {
      test.setTimeout(90_000);
      const context = await browser.newContext({ viewport: vp, isMobile: vp.mobile, hasTouch: vp.mobile, locale: 'es-ES' });
      const page = await context.newPage();
      await prepare(page);
      await page.goto(route.path);
      await dismissCookies(page);
      await scrollThrough(page);
      // Que terminen las transiciones de revelado antes de medir contrastes
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      await context.close();
      expect(
        serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`),
      ).toEqual([]);
    });
  }
}

test('axe con el aviso de cookies abierto @ 390', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await prepare(page);
  await page.goto('/');
  await page.locator('#cc-main .cm').waitFor({ state: 'visible' });
  const results = await new AxeBuilder({ page }).include('#cc-main').analyze();
  await context.close();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});
