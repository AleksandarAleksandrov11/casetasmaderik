import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Regla de redacción: prohibidos el guion largo y el guion medio. */
const ROOT = join(__dirname, '..', '..');
const DIRS = ['src', 'public', 'apps-script'];
const TEXT_EXT = /\.(tsx?|mjs|cjs|js|gs|json|md|txt|css|svg|html|xml|webmanifest)$/i;
const FORBIDDEN = /[—–]/;

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (TEXT_EXT.test(name)) out.push(full);
  }
  return out;
}

describe('sin guiones largos ni medios', () => {
  it.each(DIRS)('%s no contiene "—" ni "–"', (dir) => {
    const offenders: string[] = [];
    for (const file of walk(join(ROOT, dir))) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (FORBIDDEN.test(line)) offenders.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
