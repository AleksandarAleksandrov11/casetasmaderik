import { OG_SIZE, renderOg } from '@/lib/og';

export const alt = 'Aviso legal de Casetas Maderik';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderOg({ title: 'Aviso legal' });
}
