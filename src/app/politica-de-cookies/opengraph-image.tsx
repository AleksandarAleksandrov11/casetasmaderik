import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Política de cookies de Casetas Maderik';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({ title: 'Política de cookies' });
}
