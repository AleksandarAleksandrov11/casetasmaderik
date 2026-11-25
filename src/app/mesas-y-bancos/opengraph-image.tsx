import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Kit de una mesa y dos bancos plegables de madera de 2,20 metros para 8 personas';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({
    title: 'Mesas y bancos para eventos',
    photo: readFile(join(process.cwd(), 'public/images/mesas/kit-mesa-dos-bancos-madera-abeto.webp')),
  });
}
