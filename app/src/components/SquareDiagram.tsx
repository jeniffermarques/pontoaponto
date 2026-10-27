import { SQUARE, roundMarks, roundSize, type Mark } from '../lib/square';

const rad = (d: number) => (d * Math.PI) / 180;
const DC_IN = 6;
const DC_OUT = 8;

function Dc({ m }: { m: Extract<Mark, { kind: 'dc' }> }) {
  const ux = Math.cos(rad(m.angle));
  const uy = Math.sin(rad(m.angle));
  const bx = m.x - ux * DC_IN, by = m.y - uy * DC_IN;
  const tx = m.x + ux * DC_OUT, ty = m.y + uy * DC_OUT;
  if (m.beg) {
    // A 1ª coluna da volta é feita com 3 correntes, desenhadas em pé.
    return (
      <g className="sq-ch">
        {[0, 1, 2].map(i => {
          const f = (i + 0.5) / 3;
          return <ellipse key={i} cx={bx + (tx - bx) * f} cy={by + (ty - by) * f} rx={2.6} ry={1.5} transform={`rotate(${m.angle} ${bx + (tx - bx) * f} ${by + (ty - by) * f})`} />;
        })}
      </g>
    );
  }
  const px = -uy, py = ux;
  const mx = (bx + tx) / 2, my = (by + ty) / 2;
  return (
    <g className="sq-dc">
      <line x1={bx} y1={by} x2={tx} y2={ty} />
      <line x1={tx - px * 2.6} y1={ty - py * 2.6} x2={tx + px * 2.6} y2={ty + py * 2.6} />
      <line x1={mx - px * 2 - ux * 1.2} y1={my - py * 2 - uy * 1.2} x2={mx + px * 2 + ux * 1.2} y2={my + py * 2 + uy * 1.2} />
    </g>
  );
}

/** Faixa invisível em volta de cada volta, para dar para tocar em qualquer lugar dela. */
function band(i: number) {
  const outer = roundSize(i) + 10;
  const inner = i === 0 ? 0 : roundSize(i) - 9;
  const sq = (h: number) => `M${-h},${-h}H${h}V${h}H${-h}Z`;
  return inner ? sq(outer) + sq(inner) : sq(outer);
}

export function SquareDiagram({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  return (
    <svg className="square" viewBox="-120 -120 240 240" role="img"
      aria-label={`Gráfico do square com ${SQUARE.rounds.length} voltas. Volta ${selected + 1} destacada.`}>
      {SQUARE.rounds.map((r, i) => {
        const marks = roundMarks(r, i);
        const start = marks.find(m => m.kind === 'start')!;
        const lx = start.x + Math.cos(rad(start.angle)) * 15;
        const ly = start.y + Math.sin(rad(start.angle)) * 15;
        return (
          <g key={i} className={'sq-round' + (i === selected ? ' on' : '')} onClick={() => onSelect(i)}>
            <path d={band(i)} fillRule="evenodd" className="sq-hit" />
            {r.start === 'anel' && (
              <g className="sq-ch">
                {[0, 1, 2, 3, 4].map(k => {
                  const a = k * 72 - 90;
                  const x = Math.cos(rad(a)) * 6, y = Math.sin(rad(a)) * 6;
                  return <ellipse key={k} cx={x} cy={y} rx={2.6} ry={1.6} transform={`rotate(${a + 90} ${x} ${y})`} />;
                })}
              </g>
            )}
            {marks.map((m, k) => m.kind === 'dc' ? <Dc key={k} m={m} />
              : m.kind === 'ch' ? <ellipse key={k} className="sq-ch" cx={m.x} cy={m.y} rx={2.6} ry={1.5} transform={`rotate(${m.angle} ${m.x} ${m.y})`} />
                : null)}
            <circle className="sq-start" cx={start.x - Math.cos(rad(start.angle)) * DC_IN} cy={start.y - Math.sin(rad(start.angle)) * DC_IN} r={1.6} />
            <text className="sq-num" x={lx} y={ly} textAnchor="middle" dominantBaseline="central">{i + 1}ª</text>
          </g>
        );
      })}
    </svg>
  );
}
