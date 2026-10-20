import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Caseta de madera de pino de 2,90 por 2,00 por 2,47 metros';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({ title: 'Caseta de madera de 2,90 × 2,00 × 2,47 m' });
}
