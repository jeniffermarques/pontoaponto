import { SOURCES } from '../lib/data';
import { useApp } from '../state';
import { TermText } from '../components/TermText';

function Sources() {
  const a = useApp();
  return (
    <div className="sources">
      {SOURCES.map(o => (
        <button key={o.id} type="button" className={'source' + (a.src === o.id ? ' on' : '')} aria-pressed={a.src === o.id}
          onClick={() => a.pickSource(o.id)}>
          <span className="source-g">{o.g}</span>
          <span className="source-l">{a.desktop ? o.labelW : o.label}</span>
        </button>
      ))}
    </div>
  );
}

function FileDrop() {
  const a = useApp();
  if (a.src === 'texto') return null;
  const pdf = a.src === 'pdf';
  const label = a.reading ? 'Lendo a receita…'
    : pdf ? (a.desktop ? 'Escolher arquivo PDF' : 'Escolher PDF')
      : (a.desktop ? 'Enviar foto' : 'Tirar foto');
  return (
    <div className="filedrop">
      <span className="mono-12 muted">{pdf ? 'arquivo PDF da receita' : 'foto da receita'}</span>
      <button type="button" className="btn btn-primary btn-44 px-18" onClick={a.readSrc} disabled={a.reading}>{label}</button>
      <span className="tiny muted">No protótipo, usamos uma receita de exemplo.</span>
    </div>
  );
}

function Examples() {
  const a = useApp();
  return (
    <div className="row gap-8 wrap">
      <button type="button" className="chip-btn" onClick={a.loadEN}>Exemplo em inglês</button>
      <button type="button" className="chip-btn" onClick={a.loadPT}>Com abreviações</button>
      <button type="button" className="chip-btn ghost" onClick={a.clear}>Limpar</button>
    </div>
  );
}

const Notice = ({ text }: { text: string }) => text ? <div className="notice" role="status">{text}</div> : null;

function Chips({ label, total }: { label: string; total: number | null }) {
  return (
    <>
      {label && <span className="chip chip-lilac">{label}</span>}
      {total !== null && <span className="chip chip-blue">total: {total} pontos</span>}
    </>
  );
}

export function Tradutor() {
  const a = useApp();
  const editor = (
    <textarea className="recipe-input" value={a.input} onChange={e => a.setInput(e.target.value)}
      placeholder="Cole sua receita aqui…" aria-label="Receita" />
  );
  const heading = <div className="eyebrow">Tradução · {a.lines.length} linhas</div>;

  if (!a.desktop) return (
    <div className="screen tradutor">
      <div className="col gap-4">
        <h1 className="h-screen">Traduzir receita</h1>
        <div className="lead">Cole a receita, tire uma foto ou envie um PDF. Ela aparece em português, linha por linha.</div>
      </div>
      <Sources />
      <FileDrop />
      <Notice text={a.notice} />
      <Examples />
      {editor}
      {heading}
      {a.lines.length === 0 && <div className="empty">Cole uma receita acima ou toque em um exemplo.</div>}
      {a.lines.map((l, i) => (
        <div key={i} className="card line">
          {(l.label || l.total !== null) && <div className="row gap-6 wrap center"><Chips label={l.label} total={l.total} /></div>}
          <div className="line-raw">{l.raw}</div>
          <TermText segs={l.segs} className="line-text" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="screen tradutor">
      <div className="col gap-4">
        <h1 className="h-screen">Traduzir receita</h1>
        <div className="lead">Cole a receita em inglês ou com abreviações. A tradução aparece ao lado, linha por linha. Clique nas palavras rosa para aprender o ponto.</div>
      </div>
      <div className="tradutor-grid">
        <div className="card tradutor-in">
          <Sources />
          <FileDrop />
          <Notice text={a.notice} />
          <Examples />
          {editor}
        </div>
        <div className="col gap-12">
          {heading}
          {a.lines.length === 0 && <div className="empty">Cole uma receita ao lado ou escolha um exemplo.</div>}
          {a.lines.map((l, i) => (
            <div key={i} className="card line">
              <div className="col gap-6 start"><Chips label={l.label} total={l.total} /></div>
              <div className="col gap-4">
                <TermText segs={l.segs} className="line-text" />
                <div className="line-raw">{l.raw}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
