import { CHART, CHART_COLOR } from '../lib/data';
import { translateLine } from '../lib/translate';
import { useApp, type ChartKind } from '../state';
import { SQUARE, roundCounts, roundSteps } from '../lib/square';
import { SquareDiagram } from '../components/SquareDiagram';
import { TermText } from '../components/TermText';

const CHART_SEGS = CHART.map(r => translateLine(r.text)!.segs);

function Diagram() {
  const a = useApp();
  // Num gráfico de verdade a última carreira fica no topo e a base embaixo.
  const rows = CHART.map((r, i) => ({ r, i })).reverse();
  return (
    <div className="diagram">
      {rows.map(({ r, i }) => (
        <button key={i} type="button" className={'d-row' + (i === a.chartRow ? ' on' : '')} onClick={() => a.setChartRow(i)}
          aria-pressed={i === a.chartRow} aria-label={`${r.label}: ${r.text}`}>
          <span className="d-label">{a.desktop ? r.label : r.short}</span>
          <span className="d-cells" style={{ flexDirection: r.dir === '←' ? 'row-reverse' : 'row' }}>
            {r.syms.map((c, k) => (
              <span key={k} className={'d-cell' + (c.length > 1 ? ' multi' : '')} style={{ color: CHART_COLOR[c] || 'var(--ink)' }}>{c}</span>
            ))}
          </span>
          <span className="d-arrow">{r.dir}</span>
        </button>
      ))}
    </div>
  );
}

const Legend = ({ extra }: { extra?: boolean }) => (
  <div className="chart-legend">
    <span><b style={{ color: 'var(--pink-ink)' }}>○</b> corrente</span>
    <span><b style={{ color: 'var(--blue)' }}>×</b> ponto baixo</span>
    <span><b style={{ color: 'var(--primary)' }}>Ŧ</b> ponto alto</span>
    {extra && <span>As setas mostram o sentido de leitura</span>}
  </div>
);

function Selected() {
  const a = useApp();
  const g = CHART[a.chartRow];
  return (
    <div className="chart-sel">
      {a.desktop
        ? <>
          <div className="eyebrow eyebrow-blue">{g.dirText}</div>
          <div className="chart-sel-t">{g.label}</div>
        </>
        : <div className="row between center gap-8">
          <span className="chart-sel-t">{g.label}</span>
          <span className="chart-sel-dir">{g.dirText}</span>
        </div>}
      <TermText segs={CHART_SEGS[a.chartRow]} className="chart-sel-text" />
      <div className="chart-sel-tip">{g.tip}</div>
      <StepNav next="Próxima carreira ›" />
    </div>
  );
}

function StepNav({ next }: { next: string }) {
  const a = useApp();
  return (
    <div className="row gap-10 chart-nav">
      <button type="button" className="btn btn-white-sm" onClick={a.chartPrev} disabled={a.chartStep === 0}>‹ Anterior</button>
      <button type="button" className="btn btn-blue btn-sm" onClick={a.chartNext} disabled={a.chartStep === a.chartLast}>{next}</button>
    </div>
  );
}

const SquareLegend = () => (
  <div className="chart-legend">
    <span><b style={{ color: 'var(--pink-ink)' }}>○</b> corrente</span>
    <span><b style={{ color: 'var(--primary)' }}>Ŧ</b> ponto alto</span>
    <span><b>●</b> fechar com ponto baixíssimo</span>
    <span><b>1ª</b> onde a volta começa</span>
  </div>
);

function SquareRoundCard() {
  const a = useApp();
  const i = a.squareRound;
  const r = SQUARE.rounds[i];
  const c = roundCounts(r);
  const prev = i > 0 ? roundCounts(SQUARE.rounds[i - 1]) : null;
  return (
    <div className="chart-sel">
      <div className="row between center gap-8 wrap">
        <span className="chart-sel-t">Volta {i + 1}</span>
        <span className="chart-sel-dir">{r.start === 'anel' ? 'Comece no anel' : 'Comece num canto'}</span>
      </div>
      <div className="row gap-6 wrap">
        <span className="chip chip-lilac">{c.dc} pontos altos</span>
        <span className="chip chip-lilac">{c.groups} grupos de 3</span>
        {prev && <span className="chip chip-blue">+{c.groups - prev.groups} grupos ({(c.groups - prev.groups) / 4} por lado)</span>}
      </div>
      <ol className="sq-steps">
        {roundSteps(r).map((segs, k) => <li key={k}><TermText segs={segs} className="sq-step" /></li>)}
      </ol>
      <div className="chart-sel-tip">{r.tip}</div>
      <StepNav next="Próxima volta ›" />
    </div>
  );
}

function Square() {
  const a = useApp();
  return (
    <>
      <div className="card chart-card sq-card">
        <SquareDiagram selected={a.squareRound} onSelect={a.setSquareRound} />
        <div className="sq-picker" role="group" aria-label="Escolher volta">
          {SQUARE.rounds.map((_, i) => (
            <button key={i} type="button" className={'chip-btn' + (i === a.squareRound ? ' on' : '')} aria-pressed={i === a.squareRound}
              onClick={() => a.setSquareRound(i)}>Volta {i + 1}</button>
          ))}
        </div>
        {a.desktop && <SquareLegend />}
      </div>
      {!a.desktop && <SquareLegend />}
    </>
  );
}

function KindPicker() {
  const a = useApp();
  const kinds: [ChartKind, string, string][] = [['square', 'Square', 'em voltas'], ['reto', 'Pano reto', 'em carreiras']];
  return (
    <div className="sources kinds">
      {kinds.map(([id, t, sub]) => (
        <button key={id} type="button" className={'source' + (a.chartKind === id ? ' on' : '')} aria-pressed={a.chartKind === id}
          onClick={() => a.setChartKind(id)}>
          <span className="source-g">{t}</span>
          <span className="source-l">{sub}</span>
        </button>
      ))}
    </div>
  );
}

export function Grafico() {
  const a = useApp();
  const square = a.chartKind === 'square';
  const photo = <button type="button" className="photo-btn" onClick={a.chartPhoto}>Enviar foto do gráfico</button>;
  const notice = a.chartNotice && <div className="notice" role="status">{a.chartNotice}</div>;
  const lead = square
    ? `${a.desktop ? 'Clique' : 'Toque'} numa volta do desenho para ver o que fazer, em palavras.`
    : `${a.desktop ? 'Clique' : 'Toque'} em uma carreira para ver o passo a passo.`;

  if (!a.desktop) return (
    <div className="screen grafico">
      <div className="col gap-4">
        <h1 className="h-screen">Ler gráfico</h1>
        <div className="lead">{lead}</div>
      </div>
      {photo}
      {notice}
      <KindPicker />
      {square ? <><Square /><SquareRoundCard /></> : <><div className="card chart-card"><Diagram /></div><Legend /><Selected /></>}
    </div>
  );

  return (
    <div className="screen grafico">
      <div className="col gap-4">
        <h1 className="h-screen">Ler gráfico</h1>
        <div className="lead">{lead}</div>
      </div>
      <div className="row gap-14 center wrap">{photo}{notice}</div>
      <KindPicker />
      <div className="grafico-grid">
        {square
          ? <><div className="col gap-14"><Square /></div><SquareRoundCard /></>
          : <><div className="card chart-card"><Diagram /><Legend extra /></div><Selected /></>}
      </div>
    </div>
  );
}
