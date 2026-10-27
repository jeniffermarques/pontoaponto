import { useRef, useState } from 'react';
import { SOURCES } from '../lib/data';
import { useApp, type Notice as NoticeData } from '../state';
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  if (a.src === 'texto') return null;
  const pdf = a.src === 'pdf';
  const busy = a.readStatus !== null;
  const label = busy ? a.readStatus
    : pdf ? (a.desktop ? 'Escolher arquivo PDF' : 'Escolher PDF')
      : (a.desktop ? 'Escolher foto' : 'Tirar ou escolher foto');
  const read = (file?: File) => { if (file) void a.readFile(file); };
  return (
    <div className={'filedrop' + (over ? ' over' : '')}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); read(e.dataTransfer.files[0]); }}>
      <span className="mono-12 muted">
        {a.desktop ? `arraste ${pdf ? 'o PDF' : 'a foto'} da receita para cá` : pdf ? 'arquivo PDF da receita' : 'foto da receita'}
      </span>
      <input ref={fileRef} type="file" hidden accept={pdf ? 'application/pdf,.pdf' : 'image/*'}
        onChange={e => { read(e.target.files?.[0]); e.target.value = ''; }} />
      <button type="button" className="btn btn-primary btn-44 px-18" onClick={() => fileRef.current?.click()} disabled={busy}
        aria-live="polite">{label}</button>
      <span className="tiny muted">
        {pdf ? 'PDFs com texto são lidos na hora. PDFs escaneados demoram um pouco mais.'
          : 'A leitura é feita no seu aparelho. Fotos retas, nítidas e com boa luz funcionam melhor.'}
      </span>
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

const SECTION_RE = /pontos utilizados|abreviaturas|execução|medidas|materia(l|is)|montagem|acabamento|observaç|legenda|amostra|instruções|dicas?\b/i;

/** "Contar esta receita": vira um projeto no contador, separado em partes e carreiras. */
function CountThis() {
  const a = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  if (!a.lines.some(l => l.label)) return null;
  // Títulos de seção ("Execução", "Montagem") não servem de nome para o projeto.
  const firstTitle = a.lines.find(l => l.heading && !SECTION_RE.test(l.raw))?.raw.trim().replace(/\s*\(\d+\)$/, '') ?? '';
  const go = () => { if (!a.createProject(name || firstTitle, a.input)) setError('Não achamos carreiras nesta receita para contar.'); };
  return (
    <form className="count-this" onSubmit={e => { e.preventDefault(); go(); }}>
      <div className="count-this-t">Vai fazer esta receita?</div>
      <div className="small muted">O contador acompanha cada carreira, parte por parte.</div>
      <div className="row gap-8 wrap">
        <input className="search grow" value={name} onChange={e => setName(e.target.value)} placeholder={firstTitle || 'Nome do projeto (ex: Almofada)'} aria-label="Nome do projeto" />
        <button type="submit" className="btn btn-primary btn-44 px-18">Contar esta receita</button>
      </div>
      {error && <div className="notice error" role="alert">{error}</div>}
    </form>
  );
}

const Notice = ({ notice }: { notice: NoticeData | null }) => notice
  ? <div className={'notice' + (notice.error ? ' error' : '')} role={notice.error ? 'alert' : 'status'}>{notice.text}</div>
  : null;

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
      <Notice notice={a.notice} />
      <Examples />
      {editor}
      {heading}
      <CountThis />
      {a.lines.length === 0 && <div className="empty">Cole uma receita acima ou toque em um exemplo.</div>}
      {a.lines.map((l, i) => l.heading ? <h2 key={i} className="line-heading">{l.raw.trim()}</h2> : (
        <div key={i} className="card line">
          {(l.label || l.total !== null) && <div className="row gap-6 wrap center"><Chips label={l.label} total={l.total} /></div>}
          {l.raw.trim() !== l.plain && <div className="line-raw">{l.raw}</div>}
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
          <Notice notice={a.notice} />
          <Examples />
          {editor}
        </div>
        <div className="col gap-12">
          {heading}
          <CountThis />
          {a.lines.length === 0 && <div className="empty">Cole uma receita ao lado ou escolha um exemplo.</div>}
          {a.lines.map((l, i) => l.heading ? <h2 key={i} className="line-heading">{l.raw.trim()}</h2> : (
            <div key={i} className="card line">
              <div className="col gap-6 start"><Chips label={l.label} total={l.total} /></div>
              <div className="col gap-4">
                <TermText segs={l.segs} className="line-text" />
                {l.raw.trim() !== l.plain && <div className="line-raw">{l.raw}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
