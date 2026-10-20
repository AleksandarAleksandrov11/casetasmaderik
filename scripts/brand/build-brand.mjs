// Genera el logo de Casetas Maderik en SVG (isotipo con trazos animables y
// nombre en Outfit convertido a trazados), los datos para los componentes
// React y los favicons. Uso: node scripts/brand/build-brand.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = (p) => {
  const full = join(root, p);
  mkdirSync(dirname(full), { recursive: true });
  return full;
};

const COLORS = {
  wood: '#98603E',
  woodLight: '#C49A76',
  ink: '#0E1615',
  cream: '#FBF8F3',
};

// Isotipo: casa con tres contornos a dos aguas anidados y postes verticales.
// Rejilla de 100 unidades de ancho. Cada trazo es un path independiente para
// poder dibujarlo con stroke-dashoffset.
const ISO = {
  stroke: 5,
  viewBox: { x: 5.5, y: 0.5, w: 89, h: 78.5 },
  paths: {
    outer: 'M10 79V30L50 5.5L90 30V79',
    inner: 'M10 50L50 14L90 50',
    portal: 'M25.5 79V39.5H74.5V79',
  },
};

function isoGroup({ color, transform = '', stroke = ISO.stroke }) {
  const t = transform ? ` transform="${transform}"` : '';
  return `<g${t} fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linejoin="miter" stroke-miterlimit="10">
    <path d="${ISO.paths.outer}"/>
    <path d="${ISO.paths.inner}"/>
    <path d="${ISO.paths.portal}"/>
  </g>`;
}

const fontBuf = readFileSync(join(root, 'node_modules/@fontsource/outfit/files/outfit-latin-500-normal.woff'));
const font = opentype.parse(fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength));

const capHeightUnits = font.tables.os2?.sCapHeight || 700;

const num = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? '0' : String(v);
};

/** Serializa los comandos de opentype a un atributo d válido. */
function toD(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${num(c.x)} ${num(c.y)}`;
        case 'Q':
          return `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`;
        case 'C':
          return `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`;
        case 'Z':
          return 'Z';
        default:
          throw new Error(`Comando desconocido ${c.type}`);
      }
    })
    .join('');
}

/**
 * Convierte un texto en letras con trazado. Devuelve coordenadas con la línea
 * base en y = capHeight (la parte superior de las mayúsculas queda en y = 0).
 */
function layout(text, { capHeight, tracking }) {
  const fontSize = (capHeight / capHeightUnits) * font.unitsPerEm;
  const scale = fontSize / font.unitsPerEm;
  const glyphs = [...text].map((c) => font.charToGlyph(c));
  const letters = [];
  let x = 0;
  glyphs.forEach((g, i) => {
    const char = text[i];
    const path = g.getPath(x, capHeight, fontSize);
    const d = toD(path.commands);
    const bb = path.getBoundingBox();
    letters.push({ char, d, x: +x.toFixed(2), x1: +bb.x1.toFixed(2), x2: +bb.x2.toFixed(2) });
    let adv = g.advanceWidth * scale + tracking * fontSize;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale;
    x += adv;
  });
  // Ancho visible: del borde de la primera letra al borde de la última.
  const left = letters[0].x1;
  const right = Math.max(...letters.map((l) => l.x2));
  return { letters, left, right, width: right - left, capHeight, fontSize };
}

function textGroup(lay, { color, dx = 0, dy = 0 }) {
  const paths = lay.letters
    .filter((l) => l.d)
    .map((l) => `<path d="${l.d}"/>`)
    .join('');
  return `<g fill="${color}" transform="translate(${(dx - lay.left).toFixed(2)} ${dy.toFixed(2)})">${paths}</g>`;
}

const svgDoc = (vb, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-labelledby="t"><title id="t">${title}</title>${body}</svg>\n`;

// Isotipo solo
const isoVB = `${ISO.viewBox.x} ${ISO.viewBox.y} ${ISO.viewBox.w} ${ISO.viewBox.h}`;
writeFileSync(out('public/brand/isotipo.svg'), svgDoc(isoVB, isoGroup({ color: COLORS.wood }), 'Casetas Maderik'));

// Horizontal: isotipo + nombre en una línea
const H_CAP = 27;
const hLay = layout('CASETAS MADERIK', { capHeight: H_CAP, tracking: 0.12 });
const gapH = 22;
const isoW = ISO.viewBox.w;
const isoH = ISO.viewBox.h;
const hTextX = ISO.viewBox.x + isoW + gapH;
const hTextY = ISO.viewBox.y + (isoH - H_CAP) / 2 + 4; // ópticamente centrado con la casa
const hWidth = isoW + gapH + hLay.width;
const hVB = `${ISO.viewBox.x} ${ISO.viewBox.y} ${hWidth.toFixed(2)} ${isoH}`;
const horizontal = (isoColor, textColor) =>
  isoGroup({ color: isoColor }) + textGroup(hLay, { color: textColor, dx: hTextX, dy: hTextY });
writeFileSync(out('public/brand/logo-horizontal.svg'), svgDoc(hVB, horizontal(COLORS.wood, COLORS.ink), 'Casetas Maderik'));
writeFileSync(out('public/brand/logo-cream.svg'), svgDoc(hVB, horizontal(COLORS.woodLight, COLORS.cream), 'Casetas Maderik'));

// Apilado: isotipo arriba y nombre en dos líneas centradas
const S_CAP = 30;
const sTop = layout('CASETAS', { capHeight: S_CAP, tracking: 0.2 });
const sBottom = layout('MADERIK', { capHeight: S_CAP, tracking: 0.2 });
const sW = Math.max(isoW, sTop.width, sBottom.width) + 8;
const sIsoScale = 1.15;
const sIsoW = isoW * sIsoScale;
const sIsoH = isoH * sIsoScale;
const sIsoX = (sW - sIsoW) / 2 - ISO.viewBox.x * sIsoScale;
const sIsoY = -ISO.viewBox.y * sIsoScale;
const sLine1Y = sIsoH + 26;
const sLine2Y = sLine1Y + S_CAP + 16;
const sH = sLine2Y + S_CAP + 2;
const stacked =
  isoGroup({ color: COLORS.wood, transform: `translate(${sIsoX.toFixed(2)} ${sIsoY.toFixed(2)}) scale(${sIsoScale})` }) +
  textGroup(sTop, { color: COLORS.ink, dx: (sW - sTop.width) / 2, dy: sLine1Y }) +
  textGroup(sBottom, { color: COLORS.ink, dx: (sW - sBottom.width) / 2, dy: sLine2Y });
writeFileSync(out('public/brand/logo-stacked.svg'), svgDoc(`0 0 ${sW.toFixed(2)} ${sH.toFixed(2)}`, stacked, 'Casetas Maderik'));

// Datos para los componentes React (isotipo, logo horizontal y wordmark del footer)
const footerLay = layout('CASETAS MADERIK', { capHeight: 100, tracking: 0.015 });
const pick = (lay) => lay.letters.map((l) => ({ char: l.char, d: l.d, x: l.x, x1: l.x1, x2: l.x2 }));
const data = {
  iso: { stroke: ISO.stroke, viewBox: [ISO.viewBox.x, ISO.viewBox.y, ISO.viewBox.w, ISO.viewBox.h], paths: ISO.paths },
  horizontal: {
    viewBox: [ISO.viewBox.x, ISO.viewBox.y, +hWidth.toFixed(2), isoH],
    text: { x: +(hTextX - hLay.left).toFixed(2), y: +hTextY.toFixed(2), letters: pick(hLay) },
  },
  wordmark: {
    viewBox: [+footerLay.left.toFixed(2), 0, +footerLay.width.toFixed(2), 100],
    letters: pick(footerLay),
  },
};
writeFileSync(
  out('src/components/brand/brand-data.ts'),
  `// Archivo generado por scripts/brand/build-brand.mjs. No editar a mano.\n` +
    `export const brand = ${JSON.stringify(data, null, 2)} as const;\n`,
);

// Iconos: isotipo sobre crema con margen de seguridad
function iconSvg(size, { padding, background, radius = 0, stroke = 6.5 }) {
  const inner = size * (1 - padding * 2);
  const scale = inner / Math.max(isoW, isoH);
  const tx = (size - isoW * scale) / 2 - ISO.viewBox.x * scale;
  const ty = (size - isoH * scale) / 2 - ISO.viewBox.y * scale;
  const bg = background ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}${isoGroup({
    color: COLORS.wood,
    stroke,
    transform: `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})`,
  })}</svg>`;
}

writeFileSync(out('src/app/icon.svg'), iconSvg(64, { padding: 0.1, background: COLORS.cream, radius: 12, stroke: 8 }) + '\n');

const png = (svg) => sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(out('src/app/apple-icon.png'), await png(iconSvg(180, { padding: 0.16, background: COLORS.cream })));
writeFileSync(out('public/icons/icon-192.png'), await png(iconSvg(192, { padding: 0.14, background: COLORS.cream })));
writeFileSync(out('public/icons/icon-512.png'), await png(iconSvg(512, { padding: 0.14, background: COLORS.cream })));
// Maskable: el contenido debe caber en el círculo central del 80 %
writeFileSync(out('public/icons/icon-maskable-512.png'), await png(iconSvg(512, { padding: 0.24, background: COLORS.cream })));

// favicon.ico con entradas PNG de 16 y 32 px
const ico16 = await png(iconSvg(16, { padding: 0.04, background: COLORS.cream, radius: 3, stroke: 9 }));
const ico32 = await png(iconSvg(32, { padding: 0.06, background: COLORS.cream, radius: 6, stroke: 8 }));
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, data: buf } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}
writeFileSync(out('src/app/favicon.ico'), buildIco([{ size: 16, data: ico16 }, { size: 32, data: ico32 }]));

// Vista previa para revisión visual (no se publica)
if (process.argv.includes('--preview')) {
  const prev = process.argv[process.argv.indexOf('--preview') + 1];
  const read = (p) => readFileSync(join(root, p));
  const items = ['public/brand/logo-horizontal.svg', 'public/brand/logo-stacked.svg', 'public/brand/isotipo.svg'];
  const comps = [];
  let y = 20;
  for (const p of items) {
    const img = await sharp(read(p), { density: 300 }).resize({ height: p.includes('stacked') ? 360 : 140 }).png().toBuffer();
    const meta = await sharp(img).metadata();
    comps.push({ input: img, left: 30, top: y });
    y += meta.height + 30;
  }
  const dark = await sharp(read('public/brand/logo-cream.svg'), { density: 300 }).resize({ height: 140 }).png().toBuffer();
  const darkMeta = await sharp(dark).metadata();
  const darkBox = await sharp({ create: { width: darkMeta.width + 60, height: 200, channels: 4, background: COLORS.ink } })
    .composite([{ input: dark, left: 30, top: 30 }])
    .png()
    .toBuffer();
  comps.push({ input: darkBox, left: 0, top: y });
  y += 230;
  const ap = await sharp(read('src/app/apple-icon.png')).toBuffer();
  comps.push({ input: ap, left: 30, top: y });
  comps.push({ input: await sharp(read('public/icons/icon-maskable-512.png')).resize(180).toBuffer(), left: 240, top: y });
  comps.push({ input: await sharp(ico32).resize(64, 64, { kernel: 'nearest' }).toBuffer(), left: 450, top: y });
  y += 200;
  await sharp({ create: { width: 1400, height: y, channels: 4, background: COLORS.cream } })
    .composite(comps)
    .png()
    .toFile(prev);
}

console.log('Marca generada.', { horizontal: hVB, stacked: `0 0 ${sW.toFixed(1)} ${sH.toFixed(1)}`, wordmark: data.wordmark.viewBox });
