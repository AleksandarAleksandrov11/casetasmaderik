#!/usr/bin/env node
/**
 * Fotogramas de la caseta interactiva para cuando no hay 3D (ahorro de datos,
 * WebGL por software, equipos lentos): 12 vistas alrededor de la caseta para
 * cada combinación de ventanas, puerta y luz. Se capturan del propio lienzo
 * (mismo modelo, luz y encuadre que el 3D) y se escribe el manifiesto
 * src/components/three/interactive/turntable.ts.
 *
 * Uso (con el servidor de desarrollo arrancado, el modo captura solo existe
 * en desarrollo):
 *   pnpm exec next dev -p 3400
 *   node scripts/posters/capture-turntable.mjs [--base http://localhost:3400] [--only 100,110]
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC_DIR = '/images/caseta-360';
const OUT = join(ROOT, 'public', PUBLIC_DIR);
const MANIFEST = join(ROOT, 'src', 'components', 'three', 'interactive', 'turntable.ts');
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const BASE = arg('base', process.env.POSTER_BASE ?? 'http://localhost:3400');
const ONLY = arg('only', '').split(',').filter(Boolean);
const CHROMIUM = process.env.PW_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

// Deben coincidir con START_VIEW en src/components/three/interactive/orbit.ts
const START_AZ = -34;
const EL = 10;
const N = 12;
const ANGLES = Array.from({ length: N }, (_, i) => START_AZ + (360 / N) * i);
// Lienzo 3:2 (FRAME_RATIO) y tamaños de salida
const VIEWPORT = { width: 1800, height: 1200 };
const WIDTH = 1500;
const SM_WIDTH = 750;
const KEYS = ['000', '100', '010', '110', '001', '101', '011', '111'];

const ASSEMBLY = args.includes('--assembly');
// Deben coincidir con ASSEMBLY_FRAMES en src/components/sections/casetas/three/assemblyShots.ts
const ASSEMBLY_P = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1];
const ASSEMBLY_MANIFEST = join(ROOT, 'src', 'components', 'sections', 'casetas', 'three', 'assemblyFrames.ts');

/** Fotogramas del montaje: lienzo 4:3, uno por valor del control. */
async function assembly(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('cm:intro', '1');
      sessionStorage.setItem('cm:3d-forzar', '1');
    } catch {}
  });
  await page.goto(`${BASE}/casetas?poster=assembly-frames&hq`, { waitUntil: 'load' });
  for (let i = 0; i < ASSEMBLY_P.length; i++) {
    await page.waitForFunction(
      () => window.__casetaReady === true && typeof window.__assemblySet === 'function',
      null,
      {
        timeout: 180_000,
      },
    );
    if (i === 0) await page.waitForTimeout(1500);
    const dataUrl = await page.evaluate((p) => {
      window.__assemblySet(p);
      window.__casetaCapture();
      return window.__casetaCapture();
    }, ASSEMBLY_P[i]);
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    const name = `montaje-${String(i).padStart(2, '0')}`;
    await sharp(png)
      .resize({ width: 1200 })
      .webp({ quality: 74, alphaQuality: 80, effort: 6 })
      .toFile(join(OUT, `${name}.webp`));
    await sharp(png)
      .resize({ width: 600 })
      .webp({ quality: 74, alphaQuality: 80, effort: 6 })
      .toFile(join(OUT, `${name}-sm.webp`));
  }
  await ctx.close();
  const ts = `/**
 * Fotogramas del montaje sin 3D (uno por valor de ASSEMBLY_FRAMES). Lo genera
 * \`scripts/posters/capture-turntable.mjs --assembly\`: no editar a mano.
 */
export interface AssemblyFramesManifest {
  width: number;
  height: number;
  smWidth: number;
  /** Carpeta pública; cada archivo es \`\${base}/montaje-\${índice con 2 cifras}[-sm].webp\`. */
  base: string;
}

export const ASSEMBLY_FRAMES_MANIFEST: AssemblyFramesManifest | null = ${JSON.stringify({ width: 1200, height: 900, smWidth: 600, base: PUBLIC_DIR }, null, 2)};
`;
  writeFileSync(ASSEMBLY_MANIFEST, ts);
  execFileSync('pnpm', ['exec', 'prettier', '--write', ASSEMBLY_MANIFEST], { cwd: ROOT, stdio: 'ignore' });
  console.log(`${ASSEMBLY_P.length} fotogramas del montaje; manifiesto en ${ASSEMBLY_MANIFEST}`);
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  if (ASSEMBLY) {
    const b = await chromium.launch({
      executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined,
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    });
    await assembly(b);
    await b.close();
    return;
  }
  const browser = await chromium.launch({
    executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('cm:intro', '1');
      sessionStorage.setItem('cm:3d-forzar', '1');
    } catch {}
  });
  await page.goto(`${BASE}/casetas?poster=turntable&hq`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__casetaReady === true && typeof window.__casetaSet === 'function', null, {
    timeout: 180_000,
  });
  await page.waitForTimeout(1500);

  let total = 0;
  for (const key of KEYS) {
    if (ONLY.length && !ONLY.includes(key)) continue;
    const [w, d, n] = key.split('').map(Number);
    for (let i = 0; i < N; i++) {
      // Una recarga en caliente del servidor de desarrollo vuelve a montar el visor
      await page.waitForFunction(
        () => window.__casetaReady === true && typeof window.__casetaSet === 'function',
        null,
        {
          timeout: 180_000,
        },
      );
      const dataUrl = await page.evaluate(
        ({ az, el, w, d, n }) => {
          window.__casetaSet({ az, el, shutters: w, door: d, night: n, dims: 0 });
          window.__casetaCapture();
          return window.__casetaCapture();
        },
        { az: ANGLES[i], el: EL, w, d, n },
      );
      const png = Buffer.from(dataUrl.split(',')[1], 'base64');
      const name = `${key}-${String(i).padStart(2, '0')}`;
      const img = sharp(png);
      await img
        .clone()
        .resize({ width: WIDTH })
        .webp({ quality: 74, alphaQuality: 80, effort: 6 })
        .toFile(join(OUT, `${name}.webp`));
      await img
        .clone()
        .resize({ width: SM_WIDTH })
        .webp({ quality: 74, alphaQuality: 80, effort: 6 })
        .toFile(join(OUT, `${name}-sm.webp`));
      total++;
    }
    console.log(`  ${key}: ${N} fotogramas`);
  }
  await browser.close();
  if (errors.length) console.warn(`avisos:\n  ${errors.join('\n  ')}`);

  const height = Math.round((WIDTH * VIEWPORT.height) / VIEWPORT.width);
  const manifest = {
    angles: ANGLES,
    el: EL,
    width: WIDTH,
    height,
    smWidth: SM_WIDTH,
    base: PUBLIC_DIR,
    keys: KEYS,
  };
  const ts = `/**
 * Fotogramas de la caseta para girarla y abrirla sin 3D. Lo genera
 * \`scripts/posters/capture-turntable.mjs\`: no editar a mano.
 * Clave del estado: ventanas, puerta y luz (1/0), p. ej. "100" = ventanas abiertas.
 */
export interface Turntable {
  /** Azimut de cada fotograma (grados, el primero es START_VIEW.az). */
  angles: number[];
  el: number;
  width: number;
  height: number;
  smWidth: number;
  /** Carpeta pública; cada archivo es \`\${base}/\${clave}-\${índice con 2 cifras}[-sm].webp\`. */
  base: string;
  keys: string[];
}

export const TURNTABLE: Turntable | null = ${JSON.stringify(manifest, null, 2)};
`;
  writeFileSync(MANIFEST, ts);
  execFileSync('pnpm', ['exec', 'prettier', '--write', MANIFEST], { cwd: ROOT, stdio: 'ignore' });
  console.log(`${total} fotogramas en public${PUBLIC_DIR}; manifiesto en ${MANIFEST}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
