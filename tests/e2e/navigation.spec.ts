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

/** Borde superior del header en pantalla (0 si está fijo arriba y a la vista). */
const headerTop = (page: import('@playwright/test').Page) =>
  page.evaluate(() => Math.round(document.querySelector('header')!.getBoundingClientRect().top));

test('header: página activa, compacto al bajar y siempre visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/nosotros');
  await expect(
    page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Nosotros' }),
  ).toHaveAttribute('aria-current', 'page');
  const header = page.locator('header').first();
  await expect(header).not.toHaveAttribute('data-scrolled', '');
  // Bajando y subiendo, el header sigue fijo arriba
  for (const y of [900, 1800, 1200, 600]) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await expect(header).toHaveAttribute('data-scrolled', '');
    await expect.poll(() => headerTop(page)).toBe(0);
    await expect(header).toBeInViewport();
  }
});

test.describe('header en móvil', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('fijo y visible al bajar por toda la página @mobile', async ({ page }) => {
    await page.goto('/');
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 400; y < total; y += 900) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
      await expect.poll(() => headerTop(page)).toBe(0);
      await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeInViewport();
    }
  });
});

test('header cambia a la versión clara sobre secciones oscuras', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/nosotros');
  const header = page.locator('header').first();
  // El hero interior es claro; Temporada alta, oscura
  await expect(header).toHaveAttribute('data-theme', 'light');
  await page.waitForFunction(() => document.documentElement.classList.contains('reveal-ready'));
  await page.evaluate(() => {
    const season = document.getElementById('temporada-titulo')!.closest('section')!;
    window.scrollTo({ top: season.getBoundingClientRect().top + window.scrollY + 40, behavior: 'instant' });
  });
  await expect(header).toHaveAttribute('data-theme', 'dark');
});

test.describe('mapa de provincias de Nosotros', () => {
  const MAP = 'Mapa de España por provincias';

  test('cada provincia enlaza al formulario con ella ya elegida', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/nosotros');
    const map = page.getByRole('group', { name: MAP });
    await expect(map.getByRole('link')).toHaveCount(52);
    await expect(map.getByRole('link', { name: 'Madrid', exact: true })).toHaveAttribute(
      'href',
      '/contacto?provincia=Madrid',
    );
    await expect(map.getByRole('link', { name: 'A Coruña', exact: true })).toHaveAttribute(
      'href',
      '/contacto?provincia=A%20Coru%C3%B1a',
    );
  });

  test('ratón y teclado: el rótulo muestra la provincia y Intro lleva al formulario', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/nosotros');
    const map = page.getByRole('group', { name: MAP });
    const madrid = map.getByRole('link', { name: 'Madrid', exact: true });
    await madrid.scrollIntoViewIfNeeded();
    await madrid.hover();
    await expect(page.getByRole('link', { name: 'Pedir presupuesto en Madrid' })).toBeVisible();
    await page.mouse.move(0, 0);
    await map.getByRole('link', { name: 'A Coruña', exact: true }).focus();
    await page.keyboard.press('Tab');
    await expect(map.getByRole('link', { name: 'Álava', exact: true })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Pedir presupuesto en Álava' })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/contacto\?provincia=%C3%81lava$/);
  });

  test('el desplegable del rótulo elige cualquier provincia', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/nosotros');
    await page.getByRole('combobox', { name: 'Provincia del evento' }).selectOption('Gipuzkoa');
    await expect(page.getByRole('link', { name: 'Pedir presupuesto en Gipuzkoa' })).toHaveAttribute(
      'href',
      '/contacto?provincia=Gipuzkoa',
    );
  });

  test.describe('táctil', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

    test('el primer toque elige la provincia y el segundo lleva al formulario @mobile', async ({ page }) => {
      await page.goto('/nosotros');
      const madrid = page.getByRole('group', { name: MAP }).getByRole('link', { name: 'Madrid', exact: true });
      await madrid.scrollIntoViewIfNeeded();
      await madrid.tap();
      await expect(page.getByRole('link', { name: 'Pedir presupuesto en Madrid' })).toBeVisible();
      await expect(page).toHaveURL(/\/nosotros$/);
      await madrid.tap();
      await expect(page).toHaveURL(/\/contacto\?provincia=Madrid$/);
    });
  });
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
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => {
      const el = document.activeElement;
      const inside = !!el?.closest('#menu-movil') || el?.getAttribute('aria-controls') === 'menu-movil';
      return inside ? 'ok' : `${el?.tagName} ${(el?.textContent ?? '').trim().slice(0, 30)}`;
    });
    expect(where, `Tab ${i + 1}`).toBe('ok');
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
});

test('menú móvil tras bajar: se abre con todos los enlaces a la vista, Inicio el primero @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }));
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  const dialog = page.getByRole('dialog', { name: 'Menú' });
  await expect(dialog.getByRole('link', { name: 'Inicio' })).toBeFocused();
  // Terminada la entrada, cada enlace queda dentro de su fila y en orden (sin desplazamientos internos)
  await page.waitForTimeout(900);
  const rows = await dialog.locator('nav li').evaluateAll((lis) =>
    lis.map((li) => {
      const a = li.querySelector('a')!.getBoundingClientRect();
      const r = li.getBoundingClientRect();
      return {
        text: li.textContent!.trim(),
        scroll: li.scrollTop,
        inside: a.top >= r.top - 1 && a.bottom <= r.bottom + 1,
      };
    }),
  );
  expect(rows.map((r) => r.text)).toEqual(['Inicio', 'Casetas', 'Nosotros', 'Contacto']);
  for (const r of rows) expect(r, r.text).toMatchObject({ scroll: 0, inside: true });
  for (const name of ['Inicio', 'Casetas', 'Nosotros', 'Contacto']) {
    await expect(dialog.getByRole('link', { name, exact: true })).toBeInViewport();
  }
  // El fondo no se mueve con el menú abierto y vuelve a su sitio al cerrar
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
});

test('menú móvil se cierra al navegar @mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('dialog', { name: 'Menú' }).getByRole('link', { name: 'Casetas', exact: true }).click();
  await expect(page).toHaveURL(/\/casetas$/);
  await expect(page.getByRole('dialog', { name: 'Menú' })).toBeHidden();
});

test('botón de WhatsApp: aparece tras el hero y se oculta en /contacto', async ({ page }) => {
  // Sin la intro y con el scroll instantáneo (Lenis y scroll-behavior lo animarían)
  await page.addInitScript(() => sessionStorage.setItem('cm:intro', '1'));
  const scrollDown = async () => {
    await page.waitForFunction(() => document.documentElement.classList.contains('reveal-ready'));
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'instant' }));
    await expect.poll(() => page.evaluate(() => window.scrollY > window.innerHeight)).toBe(true);
  };
  const wa = page.locator('#whatsapp-flotante');
  await page.goto('/casetas');
  await scrollDown();
  await expect(wa).toHaveClass(/opacity-100/);
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/34656324123\?text=/);
  await expect(wa).toHaveAttribute('aria-label', 'Escribir por WhatsApp');
  await page.goto('/contacto');
  await scrollDown();
  await expect(wa).toHaveClass(/opacity-0/);
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
      const hidden = await page.evaluate(
        () =>
          Array.from(document.querySelectorAll('main h2, main p, main li')).filter((el) => {
            const s = getComputedStyle(el);
            return s.opacity === '0' || s.visibility === 'hidden';
          }).length,
      );
      expect(hidden).toBe(0);
      await expect(page.locator('a[href^="tel:+34656324123"]').first()).toBeAttached();
      await expect(page.locator('a[href^="mailto:info@casetasmaderik.com"]').first()).toBeAttached();
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
        () =>
          Array.from(document.querySelectorAll('[data-reveal]')).filter((e) => getComputedStyle(e).opacity === '0')
            .length,
      );
      expect(hidden).toBe(0);
    });
  }
});
