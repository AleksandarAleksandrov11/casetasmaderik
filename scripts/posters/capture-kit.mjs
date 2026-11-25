#!/usr/bin/env node
/**
 * Fotogramas del kit de mesa y dos bancos para cuando no hay 3D (ahorro de
 * datos, WebGL por software, equipos lentos): 12 vistas alrededor del kit,
 * desplegado y plegado. Se capturan del propio lienzo (mismo modelo, luz y
 * encuadre que el 3D) y se escribe el manifiesto src/components/three/kit/frames.ts.
 *
 * Uso (con el servidor de desarrollo arrancado, el modo captura solo existe
 * en desarrollo):
 *   pnpm exec next dev -p 3400
 *   node scripts/posters/capture-kit.mjs [--base http://localhost:3400]
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC_DIR = '/images/kit-360';
const OUT = join(ROOT, 'public', PUBLIC_DIR);
const MANIFEST = join(ROOT, 'src', 'components', 'three', 'kit', 'frames.ts');
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const BASE = arg('base', process.env.POSTER_BASE ?? 'http://localhost:3400');
const CHROMIUM = process.env.PW_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

// Deben coincidir con KIT_START en src/components/three/kit/spec.ts
const START_AZ = -32;
const EL = 16;
const N = 12;
const ANGLES = Array.from({ length: N }, (_, i) => START_AZ + (360 / N) * i);
const VIEWPORT = { width: 1800, height: 1200 };
const WIDTH = 1500;
const SM_WIDTH = 750;
const KEYS = ['0', '1'];

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
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
  await page.goto(`${BASE}/mesas-y-bancos?poster=kit&hq`, { waitUntil: 'load' });
  const ready = () =>
    page.waitForFunction(() => window.__casetaReady === true && typeof window.__kitSet === 'function', null, {
      timeout: 180_000,
    });
  await ready();
  await page.waitForTimeout(1500);

  let total = 0;
  for (const key of KEYS) {
    for (let i = 0; i < N; i++) {
      await ready();
      const dataUrl = await page.evaluate(
        ({ az, el, fold }) => {
          window.__kitSet({ az, el, fold, dims: 0 });
          window.__casetaCapture();
          return window.__casetaCapture();
        },
        { az: ANGLES[i], el: EL, fold: Number(key) },
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
  const manifest = { angles: ANGLES, el: EL, width: WIDTH, height, smWidth: SM_WIDTH, base: PUBLIC_DIR, keys: KEYS };
  const ts = `/**
 * Fotogramas del kit para girarlo y plegarlo sin 3D. Lo genera
 * \`scripts/posters/capture-kit.mjs\`: no editar a mano.
 * Clave del estado: "0" desplegado, "1" plegado.
 */
export interface KitFrames {
  /** Azimut de cada fotograma (grados, el primero es KIT_START.az). */
  angles: number[];
  el: number;
  width: number;
  height: number;
  smWidth: number;
  /** Carpeta pública; cada archivo es \`\${base}/\${clave}-\${índice con 2 cifras}[-sm].webp\`. */
  base: string;
  keys: string[];
}

export const KIT_FRAMES: KitFrames | null = ${JSON.stringify(manifest, null, 2)};
`;
  writeFileSync(MANIFEST, ts);
  execFileSync('pnpm', ['exec', 'prettier', '--write', MANIFEST], { cwd: ROOT, stdio: 'ignore' });
  console.log(`${total} fotogramas en public${PUBLIC_DIR}; manifiesto en ${MANIFEST}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
