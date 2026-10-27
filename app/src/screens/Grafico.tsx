import { CHART, CHART_COLOR } from '../lib/data';
import { translateLine } from '../lib/translate';
import { useApp } from '../state';
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
      <div className="row gap-10 chart-nav">
        <button type="button" className="btn btn-white-sm" onClick={a.chartPrev} disabled={a.chartRow === 0}>‹ Anterior</button>
        <button type="button" className="btn btn-blue btn-sm" onClick={a.chartNext} disabled={a.chartRow === CHART.length - 1}>Próxima carreira ›</button>
      </div>
    </div>
  );
}

export function Grafico() {
  const a = useApp();
  const photo = (
    <button type="button" className="photo-btn" onClick={a.chartPhoto} disabled={a.chartReading}>
      {a.chartReading ? 'Lendo o gráfico…' : 'Enviar foto do gráfico'}
    </button>
  );
  const notice = a.chartNotice && <div className="notice" role="status">{a.chartNotice}</div>;

  if (!a.desktop) return (
    <div className="screen grafico">
      <div className="col gap-4">
        <h1 className="h-screen">Ler gráfico</h1>
        <div className="lead">Toque em uma carreira para ver o passo a passo.</div>
      </div>
      {photo}
      {notice}
      <div className="card chart-card"><Diagram /></div>
      <Legend />
      <Selected />
    </div>
  );

  return (
    <div className="screen grafico">
      <div className="col gap-4">
        <h1 className="h-screen">Ler gráfico</h1>
        <div className="lead">Clique em uma carreira do diagrama para ver o que fazer, em palavras.</div>
      </div>
      <div className="row gap-14 center wrap">{photo}{notice}</div>
      <div className="grafico-grid">
        <div className="card chart-card">
          <Diagram />
          <Legend extra />
        </div>
        <Selected />
      </div>
    </div>
  );
}
