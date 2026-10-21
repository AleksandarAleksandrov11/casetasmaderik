import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page, type Request } from '@playwright/test';

/**
 * Formulario de presupuesto (/contacto). Se ejecuta contra el build de
 * producción con LEADS_MOCK=1: la API responde { ok: true, numero: 0 } sin
 * Apps Script.
 */

const API = '**/api/presupuesto';

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const inDays = (n: number) => iso(new Date(Date.now() + n * 86_400_000));

/** Primera fecha futura (a partir de 7 días) con día igual a mes: se teclea igual en dd/mm y mm/dd. */
function symmetricDate(): { iso: string; typed: string } {
  for (let i = 7; i < 800; i++) {
    const d = new Date(Date.now() + i * 86_400_000);
    if (d.getDate() === d.getMonth() + 1) {
      const dd = String(d.getDate()).padStart(2, '0');
      return { iso: iso(d), typed: `${dd}${dd}${d.getFullYear()}` };
    }
  }
  throw new Error('Sin fecha simétrica');
}

let ipSeed = 0;

/** Cada test con su IP para no chocar con el límite de 5 envíos por IP. */
async function open(page: Page, query = '', { keepBanner = false } = {}) {
  ipSeed += 1;
  await page.setExtraHTTPHeaders({
    'x-forwarded-for': `198.18.${(process.pid + ipSeed) % 250}.${(Date.now() + ipSeed) % 250}`,
  });
  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('cm:intro', '1');
    } catch {
      // Sin almacenamiento
    }
  });
  await page.goto(`/contacto${query}`);
  if (!keepBanner) await page.getByRole('button', { name: 'Rechazar', exact: true }).click();
  await expect(page.locator('[data-quote-form][data-ready="true"]')).toBeVisible();
}

const form = (page: Page) => page.getByRole('form', { name: 'Formulario de presupuesto' });
const next = (page: Page) => page.getByRole('button', { name: 'Continuar' });
const send = (page: Page) => page.getByRole('button', { name: /Enviar solicitud|Enviando/ });
const stepLabel = (page: Page, n: number) =>
  expect(form(page).getByText(`Paso ${n} de 4`, { exact: true })).toBeVisible();

async function pickEvent(page: Page, name: string) {
  await page.locator('[data-quote-form] label').filter({ hasText: name }).click();
}

async function fillWhenWhere(
  page: Page,
  opts: { start?: string; end?: string; oneDay?: boolean; city?: string; province?: string } = {},
) {
  await page.getByLabel('Fecha de inicio').fill(opts.start ?? inDays(30));
  if (opts.oneDay) await page.getByLabel('Es un solo día').check();
  else await page.getByLabel('Fecha de fin').fill(opts.end ?? inDays(38));
  await page.getByLabel('Localidad').fill(opts.city ?? 'Alcalá de Henares');
  await page.getByLabel('Provincia').selectOption(opts.province ?? 'Madrid');
}

async function fillContact(page: Page, name = 'Lucía Martín Ortega') {
  await page.getByLabel('Nombre y apellidos').fill(name);
  await page.getByLabel('Teléfono', { exact: true }).fill('+34 600 123 456');
  await page.getByLabel('Email', { exact: true }).fill('lucia@example.com');
  await page.getByLabel(/He leído y acepto/).check();
}

/** Recorre los pasos 1 a 3 con datos válidos. */
async function reachContact(page: Page) {
  await pickEvent(page, 'Mercado navideño');
  await stepLabel(page, 2);
  await fillWhenWhere(page);
  await next(page).click();
  await stepLabel(page, 3);
  await next(page).click();
  await stepLabel(page, 4);
}

const isLeadPost = (r: Request) => r.url().includes('/api/presupuesto') && r.method() === 'POST';

test.describe('Formulario de presupuesto', () => {
  test('camino feliz: envía la solicitud completa y muestra el éxito', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      // Los fallos de red se comprueban aparte con su URL
      if ((m.type() === 'error' || m.type() === 'warning') && !m.text().startsWith('Failed to load resource'))
        errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      // Las precargas (?_rsc=) de páginas que aún no existen en esta rama no cuentan
      if (r.status() >= 400 && !r.url().includes('_rsc=')) errors.push(`${r.status()} ${r.url()}`);
    });
    await open(page);

    await pickEvent(page, 'Festival gastronómico');
    // Avanza solo a los 250 ms y enfoca el primer campo del paso
    await stepLabel(page, 2);
    await expect(page.getByLabel('Fecha de inicio')).toBeFocused();
    await fillWhenWhere(page, { start: inDays(20), end: inDays(27), city: 'Sevilla', province: 'Sevilla' });
    await expect(form(page).getByText('8 días')).toBeVisible();
    await next(page).click();

    await stepLabel(page, 3);
    await expect(page.getByLabel('Número de casetas', { exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Añadir una caseta' }).click();
    await page.getByRole('button', { name: 'Añadir una caseta' }).click();
    await expect(page.getByLabel('Número de casetas', { exact: true })).toHaveValue('3');
    await page.getByRole('button', { name: '10 casetas' }).click();
    await expect(page.getByLabel('Número de casetas', { exact: true })).toHaveValue('10');
    await expect(page.getByRole('button', { name: '10 casetas' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('¿Algo más que debamos saber?').fill('Necesitamos electricidad.');
    await next(page).click();

    await stepLabel(page, 4);
    const summary = form(page).getByText('Tu solicitud', { exact: true }).locator('..');
    await expect(summary).toContainText('Festival gastronómico');
    await expect(summary).toContainText('Sevilla');
    await expect(summary).toContainText('10 casetas');
    await expect(page.getByLabel(/He leído y acepto/)).not.toBeChecked();
    await fillContact(page);

    const [request] = await Promise.all([page.waitForRequest(isLeadPost), send(page).click()]);
    const body = request.postDataJSON();
    expect(request.headers()['content-type']).toContain('application/json');
    expect(body).toMatchObject({
      tipoEvento: 'Festival gastronómico',
      fechaInicio: inDays(20),
      fechaFin: inDays(27),
      unDia: false,
      localidad: 'Sevilla',
      provincia: 'Sevilla',
      casetas: 10,
      comentarios: 'Necesitamos electricidad.',
      nombre: 'Lucía Martín Ortega',
      email: 'lucia@example.com',
      consentimiento: true,
      pagina: '/contacto',
      dispositivo: 'escritorio',
      website: '',
    });
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.sentAt - body.startedAt).toBeGreaterThanOrEqual(4000);

    const heading = page.getByRole('heading', { name: 'Solicitud enviada' });
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(heading).toBeFocused();
    await expect(page.getByText('Gracias, Lucía. Te respondemos en')).toBeVisible();
    // El borrador se borra al terminar
    expect(await page.evaluate(() => sessionStorage.getItem('cm:presupuesto'))).toBeNull();
    expect(errors).toEqual([]);
  });

  test('pantalla de éxito con número de solicitud, WhatsApp y volver al inicio', async ({ page }) => {
    await page.route(API, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"numero":42}' }),
    );
    await open(page);
    await reachContact(page);
    await fillContact(page, 'Ana Ruiz');
    await send(page).click();
    await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Tu número de solicitud es el 42.')).toBeVisible();
    const whatsapp = page.locator('#formulario').getByRole('link', { name: 'Escribir por WhatsApp' });
    await expect(whatsapp).toHaveAttribute('href', /wa\.me\/34656324123\?text=.*solicitud%2042/);
    await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });

  test('errores en cada paso, con mensajes, aria-invalid y foco en el primer error', async ({ page }) => {
    await open(page);

    // Paso 1
    await next(page).click();
    await expect(form(page).getByText('Elige el tipo de evento.')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Mercado navideño' })).toBeFocused();
    await stepLabel(page, 1);
    await pickEvent(page, 'Feria o bazar');

    // Paso 2
    await stepLabel(page, 2);
    await next(page).click();
    for (const message of [
      'Indica la fecha de inicio.',
      'Indica la fecha de fin o marca “Es un solo día”.',
      'Indica la localidad.',
      'Elige una provincia.',
    ]) {
      await expect(form(page).getByText(message)).toBeVisible();
    }
    await expect(page.getByLabel('Fecha de inicio')).toBeFocused();
    await expect(page.getByLabel('Localidad')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Localidad')).toHaveAttribute('aria-describedby', /-error/);
    await fillWhenWhere(page, { start: inDays(30), end: inDays(25) });
    await expect(form(page).getByText('La fecha de fin debe ser igual o posterior a la de inicio.')).toBeVisible();
    await page.getByLabel('Fecha de fin').fill(inDays(31));
    await expect(form(page).getByText('La fecha de fin debe ser igual o posterior a la de inicio.')).toBeHidden();
    await next(page).click();

    // Paso 3
    await stepLabel(page, 3);
    await page.getByLabel('Número de casetas', { exact: true }).fill('');
    await next(page).click();
    await expect(form(page).getByText('Indica cuántas casetas necesitas.')).toBeVisible();
    await page.getByLabel('Número de casetas', { exact: true }).fill('250');
    await expect(form(page).getByText('Para más de 200 casetas, llámanos.')).toBeVisible();
    await page.getByLabel('Número de casetas', { exact: true }).fill('12');
    await next(page).click();

    // Paso 4
    await stepLabel(page, 4);
    await send(page).click();
    for (const message of [
      'Indica tu nombre.',
      'Indica tu teléfono.',
      'Indica tu email.',
      'Debes aceptar la política de privacidad.',
    ]) {
      await expect(form(page).getByText(message)).toBeVisible();
    }
    await expect(page.getByLabel('Nombre y apellidos')).toBeFocused();
    await expect(page.getByLabel('Nombre y apellidos')).toHaveAttribute('aria-invalid', 'true');
    await page.getByLabel('Teléfono', { exact: true }).fill('123');
    await expect(form(page).getByText('Indica un teléfono válido, de 9 a 15 dígitos.')).toBeVisible();
    await page.getByLabel('Email', { exact: true }).fill('lucia@');
    await expect(form(page).getByText('Indica un email válido.')).toBeVisible();
    await stepLabel(page, 4);
  });

  test('accesibilidad (axe): sin incidencias graves en los pasos y con errores', async ({ page }) => {
    const audit = async (label: string) => {
      const results = await new AxeBuilder({ page })
        .include('[data-quote-form]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${label}: ${v.id} (${v.nodes.length})`)).toEqual([]);
    };
    await open(page);
    await audit('paso 1');
    await next(page).click();
    await page.waitForTimeout(800);
    await audit('paso 1 con error');
    await pickEvent(page, 'Mercado navideño');
    await stepLabel(page, 2);
    await next(page).click();
    // Los mensajes de error entran con un fundido: axe mide el contraste del color final
    await page.waitForTimeout(800);
    await audit('paso 2 con errores');
    await fillWhenWhere(page);
    await next(page).click();
    await stepLabel(page, 3);
    await page.waitForTimeout(900);
    await audit('paso 3');
    await next(page).click();
    await stepLabel(page, 4);
    await send(page).click();
    await audit('paso 4 con errores');
  });

  test('"Otro" no avanza solo y pide el detalle', async ({ page }) => {
    await open(page);
    await pickEvent(page, 'Otro');
    const detail = page.getByLabel('¿Qué evento es?');
    await expect(detail).toBeVisible();
    await expect(detail).toBeFocused();
    await page.waitForTimeout(600);
    await stepLabel(page, 1);
    await next(page).click();
    await expect(form(page).getByText('Cuéntanos qué evento es.')).toBeVisible();
    await detail.fill('Feria medieval');
    await detail.press('Enter');
    await stepLabel(page, 2);
    await fillWhenWhere(page, { oneDay: true });
    await next(page).click();
    await next(page).click();
    await stepLabel(page, 4);
    await expect(form(page).getByText('Tu solicitud', { exact: true }).locator('..')).toContainText('Feria medieval');
    await fillContact(page);
    const [request] = await Promise.all([page.waitForRequest(isLeadPost), send(page).click()]);
    expect(request.postDataJSON()).toMatchObject({ tipoEvento: 'Otro', tipoEventoOtro: 'Feria medieval', unDia: true });
    await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeVisible({ timeout: 15_000 });
  });

  test('precarga por URL: ?evento= marca el paso 1 y ?casetas= el paso 3', async ({ page }) => {
    await open(page, '?evento=feria-bazar&casetas=7');
    await expect(page.getByRole('radio', { name: 'Feria o bazar' })).toBeChecked();
    await stepLabel(page, 1);
    await next(page).click();
    await stepLabel(page, 2);
    await fillWhenWhere(page);
    await next(page).click();
    await stepLabel(page, 3);
    await expect(page.getByLabel('Número de casetas', { exact: true })).toHaveValue('7');
  });

  test('precarga por URL con valores no válidos: se ignoran', async ({ page }) => {
    await open(page, '?evento=boda-real&casetas=abc');
    for (const name of ['Mercado navideño', 'Feria o bazar', 'Otro']) {
      await expect(page.getByRole('radio', { name })).not.toBeChecked();
    }
  });

  test('volver atrás conserva los datos y el resumen permite editar cada parte', async ({ page }) => {
    await open(page);
    await pickEvent(page, 'Evento corporativo');
    await fillWhenWhere(page, { city: 'Valencia', province: 'Valencia' });
    await next(page).click();
    await stepLabel(page, 3);
    await page.getByLabel('Número de casetas', { exact: true }).fill('5');
    await page.getByRole('button', { name: 'Atrás' }).click();
    await stepLabel(page, 2);
    await expect(page.getByLabel('Localidad')).toHaveValue('Valencia');
    await expect(page.getByLabel('Provincia')).toHaveValue('Valencia');
    await page.getByRole('button', { name: 'Atrás' }).click();
    await stepLabel(page, 1);
    await expect(page.getByRole('radio', { name: 'Evento corporativo' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Evento corporativo' })).toBeFocused();
    await next(page).click();
    await next(page).click();
    await stepLabel(page, 3);
    await expect(page.getByLabel('Número de casetas', { exact: true })).toHaveValue('5');
    await next(page).click();
    await stepLabel(page, 4);
    await page.getByRole('button', { name: /Cambiar el lugar/ }).click();
    await stepLabel(page, 2);
    await expect(page.getByLabel('Localidad')).toHaveValue('Valencia');
  });

  test('doble clic en enviar manda una sola solicitud', async ({ page }) => {
    const posts: Request[] = [];
    page.on('request', (r) => {
      if (isLeadPost(r)) posts.push(r);
    });
    await open(page);
    await reachContact(page);
    await fillContact(page);
    await send(page).dblclick();
    await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(500);
    expect(posts).toHaveLength(1);
  });

  test('fallo de red: muestra el error y el reintento conserva los datos y el mismo id', async ({ page }) => {
    const bodies: { id: string; nombre: string }[] = [];
    await open(page);
    await reachContact(page);
    await fillContact(page, 'Pedro Gómez');

    await page.route(API, async (route) => {
      bodies.push(route.request().postDataJSON());
      await route.abort('failed');
    });
    await send(page).click();
    const alert = form(page).getByRole('alert');
    await expect(alert).toContainText(
      'No hemos podido enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.',
      {
        timeout: 15_000,
      },
    );
    await expect(alert.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /wa\.me\/34656324123/);
    await expect(page.getByLabel('Nombre y apellidos')).toHaveValue('Pedro Gómez');
    await expect(page.getByLabel(/He leído y acepto/)).toBeChecked();

    await page.unroute(API);
    page.on('request', (r) => {
      if (isLeadPost(r)) bodies.push(r.postDataJSON());
    });
    await alert.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeVisible({ timeout: 15_000 });
    expect(bodies).toHaveLength(2);
    expect(bodies[1].id).toBe(bodies[0].id);
    expect(bodies[1].nombre).toBe('Pedro Gómez');
  });

  test('error del servidor (429) muestra el aviso sin perder datos', async ({ page }) => {
    await page.route(API, (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: '{"ok":false,"error":"x","code":"rate_limited"}',
      }),
    );
    await open(page);
    await reachContact(page);
    await fillContact(page);
    await send(page).click();
    await expect(form(page).getByRole('alert')).toContainText('Has enviado varias solicitudes en poco tiempo.', {
      timeout: 15_000,
    });
    await expect(page.getByLabel('Email', { exact: true })).toHaveValue('lucia@example.com');
  });

  test('flujo completo solo con teclado', async ({ page }) => {
    await open(page);
    const date = symmetricDate();
    const firstRadio = page.getByRole('radio', { name: 'Mercado navideño' });

    async function tabTo(target: Locator, max = 40) {
      for (let i = 0; i < max; i++) {
        if (await target.evaluate((el) => el === document.activeElement)) return;
        await page.keyboard.press('Tab');
      }
      throw new Error('No se llegó al elemento con el tabulador');
    }

    // Como el enlace "Saltar al contenido": el foco pasa al main
    await page.locator('#contenido').focus();
    await tabTo(firstRadio);
    // Las flechas eligen sin avanzar solas
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Feria o bazar' })).toBeChecked();
    await page.waitForTimeout(600);
    await stepLabel(page, 1);
    await page.keyboard.press('Enter');

    await stepLabel(page, 2);
    await expect(page.getByLabel('Fecha de inicio')).toBeFocused();
    await page.keyboard.type(date.typed);
    await expect(page.getByLabel('Fecha de inicio')).toHaveValue(date.iso);
    await tabTo(page.getByLabel('Es un solo día'));
    await page.keyboard.press('Space');
    await expect(page.getByLabel('Es un solo día')).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Localidad')).toBeFocused();
    await page.keyboard.type('Zaragoza');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Provincia')).toBeFocused();
    await page.keyboard.type('Zaragoza');
    await expect(page.getByLabel('Provincia')).toHaveValue('Zaragoza');
    await tabTo(next(page));
    await page.keyboard.press('Enter');

    await stepLabel(page, 3);
    await expect(page.getByLabel('Número de casetas', { exact: true })).toBeFocused();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('6');
    await page.keyboard.press('Enter');

    await stepLabel(page, 4);
    await expect(page.getByLabel('Nombre y apellidos')).toBeFocused();
    await page.keyboard.type('Marta Gil');
    await page.keyboard.press('Tab');
    await page.keyboard.type('976 000 111');
    await page.keyboard.press('Tab');
    await page.keyboard.type('marta@example.com');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Empresa u organización')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/He leído y acepto/)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByLabel(/He leído y acepto/)).toBeChecked();

    const [request] = await Promise.all([page.waitForRequest(isLeadPost), page.keyboard.press('Enter')]);
    expect(request.postDataJSON()).toMatchObject({
      tipoEvento: 'Feria o bazar',
      fechaInicio: date.iso,
      unDia: true,
      localidad: 'Zaragoza',
      provincia: 'Zaragoza',
      casetas: 6,
      nombre: 'Marta Gil',
    });
    await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeFocused({ timeout: 15_000 });
  });

  test('restaura el borrador de sessionStorage al recargar (sin la casilla de privacidad)', async ({ page }) => {
    await open(page);
    await pickEvent(page, 'Evento privado');
    await fillWhenWhere(page, { city: 'Toledo', province: 'Toledo' });
    await next(page).click();
    await stepLabel(page, 3);
    await page.getByLabel('Número de casetas', { exact: true }).fill('9');
    await page.getByLabel('¿Algo más que debamos saber?').fill('Jardín con césped.');
    await next(page).click();
    await stepLabel(page, 4);
    await page.getByLabel('Nombre y apellidos').fill('Elena Sanz');
    await page.getByLabel(/He leído y acepto/).check();
    const before = await page.evaluate(() => JSON.parse(sessionStorage.getItem('cm:presupuesto') ?? '{}').id);

    await page.reload();
    await expect(page.locator('[data-quote-form][data-ready="true"]')).toBeVisible();
    await stepLabel(page, 4);
    await expect(page.getByLabel('Nombre y apellidos')).toHaveValue('Elena Sanz');
    await expect(page.getByLabel(/He leído y acepto/)).not.toBeChecked();
    await expect(form(page).getByText('Tu solicitud', { exact: true }).locator('..')).toContainText('9 casetas');
    await page.getByRole('button', { name: 'Atrás' }).click();
    await stepLabel(page, 3);
    await expect(page.getByLabel('Número de casetas', { exact: true })).toHaveValue('9');
    await expect(page.getByLabel('¿Algo más que debamos saber?')).toHaveValue('Jardín con césped.');
    const after = await page.evaluate(() => JSON.parse(sessionStorage.getItem('cm:presupuesto') ?? '{}').id);
    expect(after).toBe(before);
  });
});

test.describe('Formulario sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('se ofrecen email, teléfono y WhatsApp', async ({ page }) => {
    await page.goto('/contacto');
    // El formulario interactivo se oculta sin la clase .js en <html>
    await expect(page.locator('[data-quote-form]')).toBeHidden();
    // Chromium con JavaScript desactivado por CDP no pinta <noscript>: se comprueba su contenido
    const noscript = await page.locator('noscript').evaluateAll((els) => els.map((el) => el.innerHTML).join('\n'));
    expect(noscript).toContain('Para usar el formulario necesitas JavaScript.');
    expect(noscript).toContain('href="mailto:info@casetasmaderik.es"');
    expect(noscript).toContain('href="tel:+34656324123"');
    expect(noscript).toMatch(/href="https:\/\/wa\.me\/34656324123/);
  });
});

test.describe('Formulario en móvil @mobile', () => {
  test('el botón de enviar nunca queda debajo del aviso de cookies', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Solo en el proyecto móvil');
    await open(page, '?evento=mercado-navideno&casetas=3', { keepBanner: true });
    const banner = page.locator('#cc-main .cm');
    await expect(banner).toBeVisible();
    await next(page).click();
    await fillWhenWhere(page, { oneDay: true });
    await next(page).click();
    await next(page).click();
    await stepLabel(page, 4);
    await page.getByLabel('Nombre y apellidos').fill('Pedro Ruiz');
    await page.getByLabel('Teléfono', { exact: true }).fill('600123456');
    await page.getByLabel('Email', { exact: true }).fill('pedro@example.com');
    await page.getByLabel(/He leído y acepto/).check();
    // Tras marcar la casilla, el botón queda por encima del aviso
    await expect
      .poll(async () => {
        const button = await send(page).boundingBox();
        const sheet = await banner.boundingBox();
        return button && sheet ? sheet.y - (button.y + button.height) : -1;
      })
      .toBeGreaterThanOrEqual(0);
    await send(page).tap();
    await expect(page.getByRole('heading', { name: 'Solicitud enviada' })).toBeVisible({ timeout: 15_000 });
  });
});
