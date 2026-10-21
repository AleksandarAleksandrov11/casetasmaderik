// Genera placeholders con desenfoque (base64 muy pequeños) para next/image.
// Uso: node scripts/images/build-blur.mjs
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Los posters del 3D no usan next/image: no necesitan placeholder
const dirs = ['public/images/real', 'public/images/stock'];
const entries = [];
for (const dir of dirs) {
  let files = [];
  try {
    files = readdirSync(join(root, dir));
  } catch {
    continue;
  }
  for (const f of files.sort()) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(f) || /-sm\./.test(f)) continue;
    const buf = await sharp(join(root, dir, f))
      .resize(16, 16, { fit: 'inside' })
      .blur(1.2)
      .jpeg({ quality: 50 })
      .toBuffer();
    entries.push([`/${dir.replace(/^public\//, '')}/${f}`, `data:image/jpeg;base64,${buf.toString('base64')}`]);
  }
}
const body = entries.map(([k, v]) => `  '${k}':\n    '${v}',`).join('\n');
writeFileSync(
  join(root, 'src/content/image-blur.ts'),
  `// Archivo generado por scripts/images/build-blur.mjs. No editar a mano.\nexport const imageBlur: Record<string, string> = {\n${body}\n};\n\nexport function blurFor(src: string): { placeholder: 'blur'; blurDataURL: string } | Record<string, never> {\n  const data = imageBlur[src];\n  return data ? { placeholder: 'blur', blurDataURL: data } : {};\n}\n`,
);
console.log(`Placeholders generados: ${entries.length}`);
