// STUB: lo sustituye la ilustración isométrica de la fila de casetas.
type CasetaLineupProps = { count: number; max?: number; className?: string; tone?: 'light' | 'dark' };

export function CasetaLineup({ count, max = 12, className = '' }: CasetaLineupProps) {
  const shown = Math.min(count, max);
  return (
    <div className={className} aria-hidden="true">
      {shown}
      {count > max ? ` +${count - max}` : ''}
    </div>
  );
}
