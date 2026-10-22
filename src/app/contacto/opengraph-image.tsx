import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Pide presupuesto para alquilar casetas de madera';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({ title: 'Pide presupuesto para tu evento' });
}
