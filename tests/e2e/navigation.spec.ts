import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('cm:intro', '1'));
});

test('enlace "Saltar al contenido" es el primer elemento enfocable', async ({ page }) => {
  await page.goto('/casetas');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveText('Saltar al contenido');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contenido$/);
});

test('header: página activa, compacto al bajar y oculto/visible según el scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/nosotros');
  await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Nosotros' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const header = page.locator('header').first();
  await expect(header).not.toHaveAttribute('data-scrolled', '');
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(header).toHaveAttribute('data-scrolled', '');
  await expect(header).toHaveClass(/-translate-y-full/);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(header).toHaveClass(/translate-y-0/);
});

test('header cambia a la versión clara sobre secciones oscuras', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/nosotros');
  await expect(page.locator('header').first()).toHaveAttribute('data-theme', 'dark');
});

test('menú móvil: abre, atrapa el foco, Esc cierra y devuelve el foco @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Abrir menú' });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Menú' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Inicio' })).toBeFocused();
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(
    () => !!document.activeElement?.closest('#menu-movil') || document.activeElement?.getAttribute('aria-controls') === 'menu-movil',
  );
  expect(inside).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
});

test('menú móvil se cierra al navegar @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('dialog', { name: 'Menú' }).getByRole('link', { name: 'Casetas' }).click();
  await expect(page).toHaveURL(/\/casetas$/);
  await expect(page.getByRole('dialog', { name: 'Menú' })).toBeHidden();
});

test('botón de WhatsApp: aparece tras el hero y se oculta en /contacto', async ({ page }) => {
  await page.goto('/casetas');
  const wa = page.getByRole('link', { name: 'Escribir por WhatsApp' }).last();
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await expect(wa).toHaveClass(/opacity-100/);
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/34656324123\?text=/);
  await page.goto('/contacto');
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await expect(page.locator('a[aria-label="Escribir por WhatsApp"].fixed')).toHaveClass(/opacity-0/);
});

test('FAQ funciona como acordeón', async ({ page }) => {
  await page.goto('/casetas');
  const q = page.getByText('¿Cuáles son las medidas exactas?');
  await q.scrollIntoViewIfNeeded();
  await q.click();
  await expect(page.getByText('Ocupa unos 5,8 m²')).toBeVisible();
});

test('lightbox de la galería: teclado, contador y Esc', async ({ page }) => {
  await page.goto('/casetas');
  const first = page.getByRole('link', { name: /Ampliar imagen 1 de 4/ });
  await first.scrollIntoViewIfNeeded();
  await first.click();
  const dialog = page.getByRole('dialog', { name: 'Galería de imágenes' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Imagen 1 de 4')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('Imagen 2 de 4')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(first).toBeFocused();
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const path of ['/', '/casetas', '/nosotros', '/contacto']) {
    test(`${path} se lee entera y los contactos funcionan`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('h1')).toBeVisible();
      const hidden = await page.evaluate(() =>
        Array.from(document.querySelectorAll('main h2, main p, main li')).filter((el) => {
          const s = getComputedStyle(el);
          return s.opacity === '0' || s.visibility === 'hidden';
        }).length,
      );
      expect(hidden).toBe(0);
      await expect(page.locator('a[href^="tel:+34656324123"]').first()).toBeAttached();
      await expect(page.locator('a[href^="mailto:info@casetasmaderik.es"]').first()).toBeAttached();
      await expect(page.locator('a[href^="https://wa.me/34656324123"]').first()).toBeAttached();
    });
  }
});

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  for (const path of ['/', '/casetas']) {
    test(`${path} sin secciones fijadas ni contenido oculto`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      await page.waitForTimeout(1500);
      expect(await page.locator('.pin-spacer').count()).toBe(0);
      await expect(page.locator('html')).not.toHaveClass(/js-motion/);
      const hidden = await page.evaluate(
        () => Array.from(document.querySelectorAll('[data-reveal]')).filter((e) => getComputedStyle(e).opacity === '0').length,
      );
      expect(hidden).toBe(0);
    });
  }
});
