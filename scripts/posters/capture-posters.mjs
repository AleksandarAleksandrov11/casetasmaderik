#!/usr/bin/env node
/**
 * Genera los posters del 3D a partir del propio lienzo (mismo modelo, misma
 * luz, mismo encuadre que el primer frame) y escribe el manifiesto
 * src/components/three/posters.ts con la posición exacta de cada recorte.
 *
 * Uso (con el servidor de desarrollo arrancado, el modo captura solo existe
 * en desarrollo):
 *   pnpm exec next dev -p 3400
 *   node scripts/posters/capture-posters.mjs [--base http://localhost:3400] [--only hero,viewer]
 *
 * Chromium con WebGL por SwiftShader (sin GPU): ruta en PW_CHROMIUM_PATH o
 * /opt/pw-browsers/chromium.
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'public', 'images', 'posters');
const MANIFEST = join(ROOT, 'src', 'components', 'three', 'posters.ts');
/** Fuente de verdad del manifiesto (el .ts se regenera a partir de ella). */
const MANIFEST_JSON = join(ROOT, 'scripts', 'posters', 'manifest.json');
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const BASE = arg('base', process.env.POSTER_BASE ?? 'http://localhost:3400');
const ONLY = arg('only', '')
  .split(',')
  .filter(Boolean);
const CHROMIUM = process.env.PW_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';
const CREAM = { r: 251, g: 248, b: 243, alpha: 1 };

/**
 * Cada poster: página y clave de captura, ventana, encuadre (ancla y ajuste,
 * iguales a los del plano inicial) y tamaños de salida.
 */
const JOBS = [
  {
    key: 'heroDesktop',
    url: '/?poster=hero',
    file: 'hero-poster-desktop',
    viewport: { width: 1600, height: 1000 },
    dpr: 2,
    selector: '.hero__visual canvas',
    fit: 'h',
    ax: 0.725,
    ay: 0.585,
    maxWidth: 1800,
  },
  {
    key: 'heroMobile',
    url: '/?poster=hero-mobile',
    file: 'hero-poster-mobile',
    viewport: { width: 430, height: 932 },
    dpr: 3,
    mobile: true,
    selector: '.hero__visual canvas',
    fit: 'w',
    ax: 0.5,
    ay: 0.75,
    maxWidth: 1200,
  },
  {
    key: 'viewer',
    url: '/casetas?poster=viewer',
    file: 'caseta-poster',
    viewport: { width: 1600, height: 1000 },
    dpr: 2,
    selector: '.viewer__visual canvas',
    fit: 'h',
    ax: 0.5,
    ay: 0.53,
    maxWidth: 1800,
  },
  {
    key: 'viewerMobile',
    url: '/casetas?poster=viewer-mobile',
    file: 'caseta-poster-mobile',
    viewport: { width: 430, height: 932 },
    dpr: 3,
    mobile: true,
    selector: '.viewer__visual canvas',
    fit: 'w',
    ax: 0.5,
    ay: 0.53,
    maxWidth: 1200,
  },
  {
    key: 'assembly',
    url: '/casetas?poster=assembly',
    file: 'assembly-poster',
    viewport: { width: 1600, height: 1200 },
    dpr: 1.5,
    selector: '.assembly__visual canvas',
    fit: 'h',
    ax: 0.5,
    ay: 0.54,
    maxWidth: 1600,
    pad43: true,
  },
  {
    key: 'og',
    url: '/?poster=og',
    file: 'og-base',
    viewport: { width: 1200, height: 630 },
    dpr: 1,
    selector: '.hero__visual canvas',
    og: true,
  },
];

async function capture(browser, job) {
  const ctx = await browser.newContext({
    viewport: job.viewport,
    deviceScaleFactor: job.dpr,
    isMobile: Boolean(job.mobile),
    hasTouch: Boolean(job.mobile),
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('cm:intro', '1');
    } catch {}
  });
  await page.goto(BASE + job.url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__casetaReady === true && typeof window.__casetaCapture === 'function', null, {
    timeout: 120_000,
  });
  // Un par de frames más para que todo (sombras, entorno) esté asentado
  await page.waitForTimeout(800);
  const dataUrl = await page.evaluate(() => {
    window.__casetaCapture();
    return window.__casetaCapture();
  });
  if (errors.length) console.warn(`  avisos en ${job.url}:\n   ${errors.join('\n   ')}`);
  await ctx.close();
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function encode(img, name, width, maxWidth) {
  const w = Math.min(width, maxWidth);
  const big = img.clone().resize({ width: w });
  const sm = img.clone().resize({ width: Math.round(w / 2) });
  await big.clone().avif({ quality: 58, effort: 6 }).toFile(join(OUT, `${name}.avif`));
  await sm.clone().avif({ quality: 58, effort: 6 }).toFile(join(OUT, `${name}-sm.avif`));
  await big.clone().webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(join(OUT, `${name}.webp`));
  await sm.clone().webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(join(OUT, `${name}-sm.webp`));
  return { width: w, smWidth: Math.round(w / 2) };
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: existsSync(CHROMIUM) ? CHROMIUM : undefined,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const manifest = {};
  try {
    for (const job of JOBS) {
      if (ONLY.length && !ONLY.some((o) => job.key.toLowerCase().includes(o.toLowerCase()))) continue;
      console.log(`capturando ${job.key} (${BASE}${job.url})`);
      const png = await capture(browser, job);
      const meta = await sharp(png).metadata();
      const W = meta.width;
      const H = meta.height;

      if (job.og) {
        // Base de Open Graph: caseta de tres cuartos sobre crema, aire a la izquierda
        await sharp({ create: { width: W, height: H, channels: 4, background: CREAM } })
          .composite([{ input: png }])
          .png({ compressionLevel: 9 })
          .toFile(join(OUT, `${job.file}.png`));
        console.log(`  ${job.file}.png ${W}x${H}`);
        continue;
      }

      // Recorte ajustado al canal alfa, con un margen
      const { info } = await sharp(png).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
      const m = Math.round(Math.max(W, H) * 0.012);
      const left = Math.max(0, -(info.trimOffsetLeft ?? 0) - m);
      const top = Math.max(0, -(info.trimOffsetTop ?? 0) - m);
      const right = Math.min(W, -(info.trimOffsetLeft ?? 0) + info.width + m);
      const bottom = Math.min(H, -(info.trimOffsetTop ?? 0) + info.height + m);
      const cw = right - left;
      const ch = bottom - top;
      let img = sharp(png).extract({ left, top, width: cw, height: ch });

      if (job.pad43) {
        // Poster de montaje: centrado en un lienzo 4:3 transparente
        const tw = Math.max(cw, Math.round((ch * 4) / 3));
        const th = Math.round((tw * 3) / 4);
        const buf = await img.png().toBuffer();
        img = sharp({ create: { width: tw, height: th, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([
          { input: buf, left: Math.round((tw - cw) / 2), top: Math.round((th - ch) / 2) },
        ]);
        const out = await encode(sharp(await img.png().toBuffer()), job.file, tw, job.maxWidth);
        manifest[job.key] = {
          src: `/images/posters/${job.file}.avif`,
          srcSm: `/images/posters/${job.file}-sm.avif`,
          webp: `/images/posters/${job.file}.webp`,
          webpSm: `/images/posters/${job.file}-sm.webp`,
          width: out.width,
          height: Math.round((out.width * 3) / 4),
          smWidth: out.smWidth,
          fit: 'h',
          ax: 0.5,
          ay: 0.5,
          x: -0.5 * (4 / 3),
          y: -0.5,
          w: 4 / 3,
          h: 1,
        };
        console.log(`  ${job.file} ${tw}x${th}`);
        continue;
      }

      const unit = job.fit === 'h' ? H : W;
      const ax = job.ax * W;
      const ay = job.ay * H;
      const out = await encode(img, job.file, cw, job.maxWidth);
      manifest[job.key] = {
        src: `/images/posters/${job.file}.avif`,
        srcSm: `/images/posters/${job.file}-sm.avif`,
        webp: `/images/posters/${job.file}.webp`,
        webpSm: `/images/posters/${job.file}-sm.webp`,
        width: out.width,
        height: Math.round((out.width * ch) / cw),
        smWidth: out.smWidth,
        fit: job.fit,
        ax: job.ax,
        ay: job.ay,
        x: +((left - ax) / unit).toFixed(5),
        y: +((top - ay) / unit).toFixed(5),
        w: +(cw / unit).toFixed(5),
        h: +(ch / unit).toFixed(5),
      };
      console.log(`  ${job.file} recorte ${cw}x${ch} de ${W}x${H}`);
    }
  } finally {
    await browser.close();
  }

  // Manifiesto: conserva las entradas que no se han regenerado
  const keys = ['heroDesktop', 'heroMobile', 'viewer', 'viewerMobile', 'assembly'];
  let previous = {};
  try {
    previous = JSON.parse(readFileSync(MANIFEST_JSON, 'utf8'));
  } catch {}
  const merged = Object.fromEntries(keys.map((k) => [k, manifest[k] ?? previous[k] ?? null]));
  writeFileSync(MANIFEST_JSON, JSON.stringify(merged, null, 2) + '\n');
  const entries = keys.map((k) => {
    const v = merged[k];
    return `  ${k}: ${v ? JSON.stringify(v, null, 2).replace(/\n/g, '\n  ') : 'null'},`;
  });
  const src = `/**
 * Manifiesto de posters. Lo genera \`scripts/posters/capture-posters.mjs\`:
 * no editar a mano. Coordenadas del recorte relativas al ancla del plano, en
 * fracciones de la dimensión de ajuste (alto con fit 'h', ancho con fit 'w').
 */
export interface PosterEntry {
  src: string;
  srcSm: string;
  webp: string;
  webpSm: string;
  width: number;
  height: number;
  smWidth: number;
  fit: 'h' | 'w';
  ax: number;
  ay: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const posters: Record<
  'heroDesktop' | 'heroMobile' | 'viewer' | 'viewerMobile' | 'assembly',
  PosterEntry | null
> = {
${entries.join('\n')}
};
`;
  writeFileSync(MANIFEST, src);
  try {
    execFileSync('pnpm', ['exec', 'prettier', '--write', MANIFEST, MANIFEST_JSON], { cwd: ROOT, stdio: 'ignore' });
  } catch {
    // prettier es opcional aquí
  }
  console.log('manifiesto escrito en', MANIFEST);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
