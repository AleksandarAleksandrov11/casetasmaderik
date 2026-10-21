// Comprueba enlaces rotos recorriendo la web servida (QA). Uso: node tests/qa/links.mjs [url]
import { LinkChecker } from 'linkinator';

const base = process.argv[2] ?? process.env.E2E_BASE_URL ?? 'http://localhost:3300';
const checker = new LinkChecker();
const broken = [];
const external = new Set();

checker.on('link', (r) => {
  if (!r.url.startsWith(base)) external.add(r.url);
  if (r.state === 'BROKEN') broken.push(`${r.status} ${r.url} (desde ${r.parent})`);
});

const result = await checker.check({
  path: base,
  recurse: true,
  // Los enlaces externos (WhatsApp, Instagram, AEPD) se listan pero no se comprueban desde el sandbox
  linksToSkip: [`^(?!${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`],
  timeout: 20000,
  concurrency: 8,
});

console.log(`Enlaces internos comprobados: ${result.links.filter((l) => l.url.startsWith(base)).length}`);
console.log(
  `Enlaces externos (no comprobados): ${[...external].filter((u) => !u.startsWith('mailto:') && !u.startsWith('tel:')).length}`,
);
if (broken.length) {
  console.error('Enlaces rotos:\n' + broken.join('\n'));
  process.exit(1);
}
console.log('Sin enlaces rotos.');
