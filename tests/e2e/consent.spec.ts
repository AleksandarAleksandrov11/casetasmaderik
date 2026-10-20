import { expect, test, type Page, type Request } from '@playwright/test';

/**
 * Consentimiento (sección 13). El build de QA define NEXT_PUBLIC_GA_ID y
 * NEXT_PUBLIC_ANALYTICS_LOCAL=1; las peticiones externas se interceptan.
 */
const THIRD_PARTY =
  /google-analytics\.com|googletagmanager\.com|facebook\.(com|net)|\/_vercel\/(insights|speed-insights)/;

async function track(page: Page): Promise<string[]> {
  const hits: string[] = [];
  await page.route(THIRD_PARTY, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* stub */' }),
  );
  page.on('request', (r: Request) => {
    if (THIRD_PARTY.test(r.url())) hits.push(r.url());
  });
  await page.addInitScript(() => sessionStorage.setItem('cm:intro', '1'));
  return hits;
}

test('sin decidir no sale ninguna petición de terceros', async ({ page }) => {
  const hits = await track(page);
  await page.goto('/');
  await expect(page.locator('#cc-main .cm')).toBeVisible();
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(1500);
  await page.goto('/casetas');
  await page.waitForTimeout(1500);
  expect(hits).toEqual([]);
});

test('el aviso no bloquea la web y los botones tienen el mismo peso', async ({ page }) => {
  await track(page);
  await page.goto('/');
  const accept = page.locator('#cc-main button[data-role="all"]');
  const reject = page.locator('#cc-main button[data-role="necessary"]');
  await expect(accept).toBeVisible();
  const [a, r] = await Promise.all([accept.boundingBox(), reject.boundingBox()]);
  expect(Math.round(a!.height)).toBe(Math.round(r!.height));
  expect(Math.round(a!.width)).toBe(Math.round(r!.width));
  const styles = await Promise.all(
    [accept, reject].map((b) =>
      b.evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color].join()),
    ),
  );
  expect(styles[0]).toBe(styles[1]);
  // Sin muro: se puede navegar sin decidir
  await page.getByRole('link', { name: 'Casetas', exact: true }).first().click();
  await expect(page).toHaveURL(/\/casetas$/);
});

test('rechazar no carga nada', async ({ page }) => {
  const hits = await track(page);
  await page.goto('/');
  await page.locator('#cc-main button[data-role="necessary"]').click();
  await page.waitForTimeout(1500);
  await page.reload();
  await page.waitForTimeout(1500);
  expect(hits).toEqual([]);
  await expect(page.locator('html')).toHaveAttribute('data-consent', 'none');
});

test('aceptar carga la analítica', async ({ page }) => {
  const hits = await track(page);
  await page.goto('/');
  await page.locator('#cc-main button[data-role="all"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-consent', /analytics/);
  await expect.poll(() => hits.some((h) => h.includes('googletagmanager.com/gtag/js')), { timeout: 8000 }).toBe(true);
  await expect.poll(() => hits.some((h) => h.includes('/_vercel/insights/script.js')), { timeout: 8000 }).toBe(true);
});

test('cambiar la configuración se aplica y borra las cookies al retirar', async ({ page, context }) => {
  const hits = await track(page);
  await page.goto('/');
  await page.locator('#cc-main button[data-role="all"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-consent', /analytics/);
  await context.addCookies([{ name: '_ga', value: 'GA1.1.test', url: page.url() }]);

  // Reabrir desde el pie y desactivar las analíticas
  await page.getByRole('button', { name: 'Configurar cookies' }).first().click();
  const pm = page.locator('#cc-main .pm');
  await expect(pm).toBeVisible();
  await pm.getByRole('button', { name: 'Rechazar todas' }).click();
  await page.waitForLoadState('load');
  await expect(page.locator('html')).toHaveAttribute('data-consent', 'none');
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === '_ga')).toBeUndefined();
  const before = hits.length;
  await page.reload();
  await page.waitForTimeout(1500);
  expect(hits.length).toBe(before);
});

test('la política de cookies abre el panel', async ({ page }) => {
  await track(page);
  await page.goto('/politica-de-cookies');
  await page.locator('#cc-main button[data-role="necessary"]').click();
  await page.locator('main').getByRole('button', { name: 'Configurar cookies' }).click();
  await expect(page.locator('#cc-main .pm')).toBeVisible();
});
