/**
 * Planos acotados de la caseta (alzado frontal, alzado lateral y planta) en
 * SVG. Unidades: centímetros. Las cotas se dibujan al entrar en pantalla.
 * Solo se acotan las medidas confirmadas: 2,90, 2,00 y 2,47 m.
 *
 * Los tres comparten marco (FRAME) y tope de ancho: en tarjetas del mismo
 * ancho se dibujan a la misma escala, con el suelo de los alzados alineado.
 */

const GROUND = 260; // y del suelo en coordenadas SVG
const Y = (h: number) => GROUND - h;

/** Marco común (cm) y ancho máximo en pantalla: escala de 0,85 px por cm como mucho. */
const FRAME = { w: 400, h: 316 };
const PLAN_CLASS = 'plan-svg mx-auto max-w-[340px]';
const viewBox = (x: number, y: number) => `${x} ${y} ${FRAME.w} ${FRAME.h}`;

/**
 * Cotas a 20 unidades del plano (en lugar de los 15 de globals.css): con la
 * escala común miden de 12,5 a 17 px en pantalla. Una sola regla, más
 * específica que la de globals.css; CasetasSpecs la sirve en línea.
 */
export const plansCss = /* css */ `
.plan .plan-svg .plan-dim__label {
  font-size: 20px;
}
`;

const BOARD = 12;

function Boards({
  x,
  w,
  from,
  to,
  skip,
}: {
  x: number;
  w: number;
  from: number;
  to: number;
  skip?: [number, number, number, number];
}) {
  const lines: React.ReactNode[] = [];
  for (let h = from + BOARD; h < to; h += BOARD) {
    const y = Y(h);
    if (skip && h > skip[2] && h < skip[3]) {
      lines.push(<line key={`a${h}`} x1={x} x2={skip[0]} y1={y} y2={y} />);
      lines.push(<line key={`b${h}`} x1={skip[1]} x2={x + w} y1={y} y2={y} />);
    } else {
      lines.push(<line key={h} x1={x} x2={x + w} y1={y} y2={y} />);
    }
  }
  return (
    <g className="plan-boards" stroke="currentColor" strokeWidth={0.6} opacity={0.35}>
      {lines}
    </g>
  );
}

function DimH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g className="plan-dim">
      <line x1={x1} x2={x1} y1={y - 7} y2={y + 7} className="plan-dim__tick" />
      <line x1={x2} x2={x2} y1={y - 7} y2={y + 7} className="plan-dim__tick" />
      <line x1={x1} x2={x2} y1={y} y2={y} pathLength={1} className="plan-dim__line" />
      <text x={(x1 + x2) / 2} y={y + 22} textAnchor="middle" className="plan-dim__label">
        {label}
      </text>
    </g>
  );
}

function DimV({ y1, y2, x, label }: { y1: number; y2: number; x: number; label: string }) {
  return (
    <g className="plan-dim">
      <line x1={x - 7} x2={x + 7} y1={y1} y2={y1} className="plan-dim__tick" />
      <line x1={x - 7} x2={x + 7} y1={y2} y2={y2} className="plan-dim__tick" />
      <line x1={x} x2={x} y1={y1} y2={y2} pathLength={1} className="plan-dim__line" />
      <text
        x={x + 22}
        y={(y1 + y2) / 2}
        textAnchor="middle"
        transform={`rotate(-90 ${x + 22} ${(y1 + y2) / 2})`}
        className="plan-dim__label"
      >
        {label}
      </text>
    </g>
  );
}

export function FrontElevation() {
  const win = { x1: 30, x2: 260, b: 100, t: 192 };
  return (
    <svg viewBox={viewBox(-40, -6)} className={PLAN_CLASS} role="img" aria-labelledby="plano-frontal-t">
      <title id="plano-frontal-t">Alzado frontal: 2,90 m de largo y 2,47 m de alto</title>
      <line x1={-30} x2={330} y1={GROUND} y2={GROUND} className="plan-ground" />
      <rect x={0} y={Y(12)} width={290} height={12} className="plan-base" />
      <rect x={0} y={Y(205)} width={290} height={205 - 12} className="plan-wall" />
      <Boards x={0} w={290} from={12} to={205} skip={[win.x1, win.x2, win.b, win.t]} />
      <rect x={0} y={Y(205)} width={9} height={193} className="plan-wall" />
      <rect x={281} y={Y(205)} width={9} height={193} className="plan-wall" />
      <rect x={win.x1} y={Y(win.t)} width={win.x2 - win.x1} height={win.t - win.b} className="plan-opening" />
      <rect x={win.x1 - 4} y={Y(win.b)} width={win.x2 - win.x1 + 8} height={4} className="plan-solid" />
      {/* Cubierta vista de frente con alero */}
      <rect x={-15} y={Y(247)} width={320} height={42} className="plan-roof" />
      <rect x={-15} y={Y(209)} width={320} height={8} className="plan-wall" />
      <DimH x1={0} x2={290} y={GROUND + 22} label="2,90 m" />
      <DimV y1={GROUND} y2={Y(247)} x={325} label="2,47 m" />
    </svg>
  );
}

export function SideElevation() {
  const win = { x1: 30, x2: 170, b: 100, t: 192 };
  const eave = 205;
  const ridge = 247;
  return (
    <svg viewBox={viewBox(-85, -6)} className={PLAN_CLASS} role="img" aria-labelledby="plano-lateral-t">
      <title id="plano-lateral-t">Alzado lateral: 2,00 m de ancho y 2,47 m de alto</title>
      <line x1={-30} x2={240} y1={GROUND} y2={GROUND} className="plan-ground" />
      <rect x={0} y={Y(12)} width={200} height={12} className="plan-base" />
      <path d={`M0 ${Y(12)}V${Y(eave)}L100 ${Y(ridge - 8)}L200 ${Y(eave)}V${Y(12)}Z`} className="plan-wall" />
      <Boards x={0} w={200} from={12} to={eave} skip={[win.x1, win.x2, win.b, win.t]} />
      <rect x={win.x1} y={Y(win.t)} width={win.x2 - win.x1} height={win.t - win.b} className="plan-opening" />
      <rect x={win.x1 - 4} y={Y(win.b)} width={win.x2 - win.x1 + 8} height={4} className="plan-solid" />
      {/* Hastial con alero */}
      <path
        d={`M-15 ${Y(eave - 6)}L100 ${Y(ridge)}L215 ${Y(eave - 6)}L215 ${Y(eave - 14)}L100 ${Y(ridge - 8)}L-15 ${Y(eave - 14)}Z`}
        className="plan-roof"
      />
      <DimH x1={0} x2={200} y={GROUND + 22} label="2,00 m" />
      <DimV y1={GROUND} y2={Y(ridge)} x={235} label="2,47 m" />
    </svg>
  );
}

export function FloorPlan() {
  return (
    <svg viewBox={viewBox(-30, -36)} className={PLAN_CLASS} role="img" aria-labelledby="plano-planta-t">
      <title id="plano-planta-t">Planta: 2,90 por 2,00 m, unos 5,8 metros cuadrados</title>
      {/* Vuelo de la cubierta y cumbrera */}
      <rect x={-15} y={-15} width={320} height={230} className="plan-dashed" />
      <line x1={-15} x2={305} y1={100} y2={100} className="plan-dashed" />
      {/* Muros con huecos: frente (abajo), testero derecho, trasera (arriba) y puerta (izquierda) */}
      <path d="M0 0H75M215 0H290V30M290 170V200H260M30 200H0V137.5M0 62.5V0" className="plan-walls" />
      <line x1={75} x2={215} y1={0} y2={0} className="plan-window" />
      <line x1={290} x2={290} y1={30} y2={170} className="plan-window" />
      <line x1={30} x2={260} y1={200} y2={200} className="plan-window" />
      {/* Mostradores */}
      <rect x={30} y={200} width={230} height={14} className="plan-counter" />
      <rect x={290} y={30} width={14} height={140} className="plan-counter" />
      <rect x={75} y={-14} width={140} height={14} className="plan-counter" />
      {/* Puerta con giro */}
      <line x1={0} x2={75} y1={62.5} y2={62.5} className="plan-door" />
      <path d="M75 62.5A75 75 0 0 1 0 137.5" className="plan-door-arc" />
      <text x={145} y={152} textAnchor="middle" className="plan-area">
        5,8 m²
      </text>
      <DimH x1={0} x2={290} y={238} label="2,90 m" />
      <DimV y1={200} y2={0} x={330} label="2,00 m" />
    </svg>
  );
}
