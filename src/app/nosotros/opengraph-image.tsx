import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Casetas Maderik: montajes cuidados y fechas cumplidas';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({ title: 'Montajes cuidados y fechas cumplidas' });
}
