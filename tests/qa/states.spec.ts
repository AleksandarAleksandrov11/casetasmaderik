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
    // WebGL por software va a pocos fps: se fuerza el 3D para ver la coreografía
    await page.addInitScript(() => sessionStorage.setItem('cm:3d-forzar', '1'));
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

test('formulario: pasos, errores, éxito y fallo de red', async ({ browser }) => {
  test.setTimeout(180_000);
  const day = (n: number) => {
    const d = new Date(Date.now() + n * 86_400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  for (const vp of [
    { width: 1440, height: 900, mobile: false },
    { width: 390, height: 844, mobile: true },
  ]) {
    for (const outcome of ['exito', 'error'] as const) {
      const ctx = await browser.newContext({ viewport: vp, isMobile: vp.mobile, hasTouch: vp.mobile });
      const page = await ctx.newPage();
      // Una IP por contexto para no chocar con el límite de envíos
      await page.setExtraHTTPHeaders({
        'x-forwarded-for': `198.19.${vp.width % 250}.${outcome === 'exito' ? 11 : 12}`,
      });
      await prepare(page);
      if (outcome === 'error') {
        await page.route('**/api/presupuesto', (route) =>
          route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false }) }),
        );
      }
      await page.goto('/contacto');
      await dismissCookies(page);
      await page.locator('[data-quote-form][data-ready="true"]').waitFor();
      const panel = page.locator('#formulario');
      const shotForm = async (name: string) => {
        await page.waitForTimeout(800);
        await panel.screenshot({ path: `${OUT}/formulario-${name}-${vp.width}.png` });
      };
      const next = page.getByRole('button', { name: 'Continuar' });

      if (outcome === 'exito') {
        await shotForm('paso1');
        await next.click();
        await shotForm('paso1-error');
        await page.locator('[data-quote-form] label').filter({ hasText: 'Otro' }).click();
        await page.getByLabel('¿Qué evento es?').fill('Feria de artesanía');
        await shotForm('paso1-otro');
        await next.click();
        await page.getByLabel('Fecha de inicio').waitFor();
        await next.click();
        await shotForm('paso2-error');
      } else {
        await page.locator('[data-quote-form] label').filter({ hasText: 'Mercado navideño' }).click();
        await page.getByLabel('Fecha de inicio').waitFor();
      }
      await page.getByLabel('Fecha de inicio').fill(day(30));
      await page.getByLabel('Fecha de fin').fill(day(38));
      await page.getByLabel('Localidad').fill('Alcalá de Henares');
      await page.getByLabel('Provincia').selectOption('Madrid');
      if (outcome === 'exito') await shotForm('paso2');
      await next.click();
      await page.getByRole('button', { name: 'Añadir una caseta' }).waitFor();
      for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Añadir una caseta' }).click();
      if (outcome === 'exito') await shotForm('paso3');
      await next.click();
      const send = page.getByRole('button', { name: /Enviar solicitud|Enviando/ });
      await send.waitFor();
      if (outcome === 'exito') {
        await send.click();
        await shotForm('paso4-error');
      }
      await page.getByLabel('Nombre y apellidos').fill('Lucía Martín Ortega');
      await page.getByLabel('Teléfono').fill('+34 600 123 456');
      await page.getByLabel('Email').fill('lucia@example.com');
      await page.getByLabel(/He leído y acepto/).check();
      if (outcome === 'exito') await shotForm('paso4');
      await send.click();
      if (outcome === 'exito') {
        await page.getByRole('heading', { name: 'Solicitud enviada' }).waitFor({ timeout: 20_000 });
        await shotForm('exito');
      } else {
        await page.getByRole('alert').first().waitFor({ timeout: 20_000 });
        await shotForm('error-red');
      }
      await ctx.close();
    }
  }
});
