import { STALL, computeLayout, computeStage } from './lineup-geometry';

type CasetaLineupProps = {
  count: number;
  /** Casetas dibujadas como máximo; el resto se indica con "+N". */
  max?: number;
  className?: string;
  /** light: sobre crema o papel. dark: sobre tinta. */
  tone?: 'light' | 'dark';
  /** Si se indica, la ilustración se anuncia como imagen con este texto. */
  label?: string;
  /**
   * Escenario con zoom: lienzo apaisado fijo (2:1) y las casetas a la mayor
   * escala que cabe; al cambiar el número la vista se aleja o se acerca. Sin
   * zoom, cada caseta mantiene su tamaño en un lienzo calculado para `max`.
   */
  zoom?: boolean;
};

function Stall() {
  return (
    <>
      <polygon className="cl-shadow" points={STALL.shadow} />
      <polygon className="cl-roof-back" points={STALL.roofBack} />
      <polygon className="cl-side" points={STALL.side} />
      <path className="cl-plank" d={STALL.sidePlanks.join('')} />
      <polygon className="cl-door" points={STALL.door} />
      <polygon className="cl-front" points={STALL.front} />
      <path className="cl-plank" d={STALL.frontPlanks.join('')} />
      {STALL.windows.map((points) => (
        <polygon key={points} className="cl-window" points={points} />
      ))}
      <polygon className="cl-counter" points={STALL.counterTop} />
      <polygon className="cl-counter-edge" points={STALL.counterEdge} />
      {STALL.visors.map((points) => (
        <polygon key={points} className="cl-visor" points={points} />
      ))}
      <polygon className="cl-roof" points={STALL.roofFront} />
      <polygon className="cl-roof-end" points={STALL.roofEnd} />
      <path className="cl-ridge" d={STALL.ridge} />
    </>
  );
}

/**
 * Fila isométrica de casetas de madera (hasta `max` dibujadas y "+N").
 * Componente de servidor: las casetas nuevas entran con una animación CSS
 * (solo transform y opacidad, solo con html.js-motion) y los huecos se
 * recolocan con una transición de transform. Con `zoom`, el grupo escala con
 * la misma transición.
 */
export function CasetaLineup({
  count,
  max = 12,
  className = '',
  tone = 'light',
  label,
  zoom = false,
}: CasetaLineupProps) {
  const safeCount = Number.isFinite(count) ? count : 0;
  const stage = zoom ? computeStage(safeCount, max) : null;
  const layout = stage ?? computeLayout(safeCount, max);
  // Orden de pintado: fila trasera primero y, en cada fila, de derecha a izquierda
  const ordered = [...layout.slots].sort((a, b) => a.row - b.row || b.x - a.x);
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };

  const content = (
    <>
      {ordered.map((slot) => (
        <g key={slot.index} className="cm-lineup__slot" style={{ transform: `translate(${slot.x}px, ${slot.y}px)` }}>
          <g className="cm-lineup__stall" style={{ animationDelay: `${(slot.index % 6) * 45}ms` }}>
            <Stall />
          </g>
        </g>
      ))}
      {layout.plus ? (
        <text key="plus" className="cm-lineup__plus" x={layout.plus.x} y={layout.plus.y} dominantBaseline="middle">
          +{layout.extra.toLocaleString('es-ES')}
        </text>
      ) : null}
    </>
  );

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={['cm-lineup', `cm-lineup--${tone}`, stage ? 'cm-lineup--zoom' : '', className]
        .filter(Boolean)
        .join(' ')}
      focusable="false"
      {...a11y}
    >
      {stage ? (
        <g
          className="cm-lineup__stage"
          style={{ transform: `translate(${stage.width / 2}px, ${stage.height / 2}px) scale(${stage.scale})` }}
        >
          {content}
        </g>
      ) : (
        content
      )}
    </svg>
  );
}
