import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Casetas Maderik: alquiler de casetas de madera para ferias y eventos';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({ title: 'Alquiler de casetas de madera para ferias y eventos' });
}
