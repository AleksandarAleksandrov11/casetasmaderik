// Mide el JavaScript inicial (gzip) que carga cada página en el build actual.
// Uso: node scripts/bundle-size.mjs [baseUrl]  (requiere `next start` en marcha)
import { gzipSync } from 'node:zlib';

const base = process.argv[2] ?? 'http://localhost:3300';
const pages = ['/', '/casetas', '/nosotros', '/contacto'];
let fail = false;
for (const p of pages) {
  const html = await (await fetch(base + p)).text();
  // Los scripts noModule (polyfills) solo los descargan navegadores antiguos
  const srcs = [
    ...new Set(
      [...html.matchAll(/<script([^>]*)>/g)]
        .map((m) => m[1])
        .filter((attrs) => !/nomodule/i.test(attrs))
        .map((attrs) => attrs.match(/src="([^"]+\.js[^"]*)"/)?.[1])
        .filter(Boolean),
    ),
  ];
  let total = 0;
  const rows = [];
  for (const src of srcs) {
    const buf = Buffer.from(await (await fetch(new URL(src, base))).arrayBuffer());
    const gz = gzipSync(buf, { level: 9 }).length;
    total += gz;
    rows.push([gz, src.split('/').pop()]);
  }
  rows.sort((a, b) => b[0] - a[0]);
  console.log(`${p}: ${(total / 1024).toFixed(1)} KB gzip en ${srcs.length} scripts`);
  for (const [gz, name] of rows.slice(0, 6)) console.log(`   ${(gz / 1024).toFixed(1).padStart(6)} KB  ${name}`);
  if (total > 170 * 1024) fail = true;
}
if (fail) {
  console.error('El JavaScript inicial supera los 170 KB gzip.');
  process.exitCode = 1;
}
