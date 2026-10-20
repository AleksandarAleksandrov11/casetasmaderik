import { expect, test, type Page } from '@playwright/test';
import { dismissCookies, prepare } from './helpers';

/**
 * Capturas de estados concretos para la revisión visual (sección 20.2):
 * header compacto, menú móvil, foco, aviso de cookies, lightbox, acordeón,
 * hero de día y de noche, formulario con errores y éxito, y footer.
 */
const OUT = 'tests/qa/output/states';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

test.describe.configure({ mode: 'parallel' });

test('aviso de cookies en escritorio y móvil', async ({ browser }) => {
  for (const vp of [
    { width: 1440, height: 900, mobile: false },
    { width: 390, height: 844, mobile: true },
    { width: 320, height: 640, mobile: true },
  ]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.mobile, hasTouch: vp.mobile });
    const page = await ctx.newPage();
    await prepare(page);
    await page.goto('/contacto');
    await page.locator('#cc-main .cm').waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await shot(page, `cookies-banner-${vp.width}`);
    await page.locator('#cc-main button[data-role="show"]').click();
    await page.locator('#cc-main .pm').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await shot(page, `cookies-preferencias-${vp.width}`);
    await ctx.close();
  }
});

test('header transparente, compacto y sobre oscuro', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepare(page);
  await page.goto('/casetas');
  await dismissCookies(page);
  await shot(page, 'header-inicial-casetas');
  // Lenis suaviza también los saltos programáticos: se espera a que termine
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 650));
  await page.waitForTimeout(900);
  await shot(page, 'header-compacto-casetas');
  await page.goto('/nosotros');
  await page.waitForTimeout(800);
  await shot(page, 'header-sobre-oscuro-nosotros');
});

test('menú móvil abierto', async ({ browser }) => {
  for (const vp of [
    { width: 390, height: 844 },
    { width: 667, height: 375 },
  ]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await prepare(page);
    await page.goto('/');
    await dismissCookies(page);
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('dialog', { name: 'Menú' }).waitFor();
    await page.waitForTimeout(1200);
    await shot(page, `menu-movil-${vp.width}x${vp.height}`);
    await ctx.close();
  }
});

test('foco visible con teclado', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepare(page);
  await page.goto('/contacto');
  await dismissCookies(page);
  await page.keyboard.press('Tab');
  await shot(page, 'foco-saltar-contenido');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  await shot(page, 'foco-navegacion');
  await page.goto('/casetas');
  const faq = page.getByText('¿De qué material está hecha?');
  await faq.scrollIntoViewIfNeeded();
  await faq.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await page.waitForTimeout(400);
  await shot(page, 'foco-acordeon');
});

test('acordeón abierto y lightbox', async ({ browser }) => {
  for (const vp of [
    { width: 1440, height: 900, mobile: false },
    { width: 390, height: 844, mobile: true },
  ]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.mobile, hasTouch: vp.mobile });
    const page = await ctx.newPage();
    await prepare(page);
    await page.goto('/casetas');
    await dismissCookies(page);
    const q = page.getByText('¿Qué espacio necesito?');
    await q.scrollIntoViewIfNeeded();
    await q.click();
    await page.waitForTimeout(800);
    await shot(page, `acordeon-abierto-${vp.width}`);
    const thumb = page.getByRole('link', { name: /Ampliar imagen 2 de 4/ });
    await thumb.scrollIntoViewIfNeeded();
    await thumb.click();
    await page.getByRole('dialog', { name: 'Galería de imágenes' }).waitFor();
    await page.waitForTimeout(900);
    await shot(page, `lightbox-${vp.width}`);
    await ctx.close();
  }
});

test('hero de inicio a lo largo del scroll', async ({ browser }) => {
  for (const vp of [
    { width: 1440, height: 900, mobile: false },
    { width: 390, height: 844, mobile: true },
  ]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.mobile, hasTouch: vp.mobile });
    const page = await ctx.newPage();
    await prepare(page);
    await page.goto('/');
    await dismissCookies(page);
    await page.waitForTimeout(3500);
    const hero = page.locator('main section').first();
    const box = await hero.boundingBox();
    const total = Math.max(1, (box?.height ?? vp.height) - vp.height);
    for (const p of [0, 0.2, 0.4, 0.55, 0.75, 0.95]) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * p));
      await page.waitForTimeout(1600);
      await shot(page, `hero-${vp.width}-${Math.round(p * 100)}`);
    }
    await ctx.close();
  }
});

test('footer con el wordmark animado', async ({ browser }) => {
  for (const vp of [
    { width: 1440, height: 900, mobile: false },
    { width: 390, height: 844, mobile: true },
  ]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.mobile, hasTouch: vp.mobile });
    const page = await ctx.newPage();
    await prepare(page);
    await page.goto('/aviso-legal');
    await dismissCookies(page);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    await shot(page, `footer-entrando-${vp.width}`);
    await page.waitForTimeout(1800);
    await shot(page, `footer-${vp.width}`);
    if (!vp.mobile) {
      const letter = page.locator('.wordmark__letter').nth(3);
      await letter.hover();
      await page.waitForTimeout(600);
      await shot(page, 'footer-hover-letra');
    }
    await expect(page.locator('#footer-wordmark')).toHaveClass(/is-in/);
    await ctx.close();
  }
});
