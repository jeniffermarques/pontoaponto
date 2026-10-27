import { DOT_COLOR, PROJECT, TERMS } from '../lib/data';
import { useApp } from '../state';
import { TermText } from '../components/TermText';

const BY_AB = Object.fromEntries(TERMS.map(t => [t.ab.toLowerCase(), t]));
const stitchName = (a: string) => BY_AB[a]?.pt ?? a;

function HelpCard() {
  const { help, setHelp, desktop } = useApp();
  if (!help) return null;
  return (
    <div className="help">
      <div className="row between center">
        <span className="help-t">Como usar o contador</span>
        <button type="button" className="help-ok" onClick={() => setHelp(false)}>Entendi</button>
      </div>
      <ol>
        <li>Leia o que fazer nesta volta.</li>
        <li>{desktop ? 'Faça um ponto e clique no círculo (ou aperte espaço).' : 'Faça um ponto e toque no círculo.'} O app mostra qual é o próximo.</li>
        <li>Quando chegar ao total, a volta está completa. Passe para a próxima.</li>
      </ol>
    </div>
  );
}

function HelpLink() {
  const { help, setHelp } = useApp();
  if (help) return null;
  return <button type="button" className="link-btn" onClick={() => setHelp(true)}>Como funciona o contador?</button>;
}

function RowPicker() {
  const a = useApp();
  return (
    <div className="row between center">
      <button type="button" className="sq-btn" onClick={a.prevRow} disabled={a.row === 0} aria-label="Volta anterior">‹</button>
      <div className="col center">
        <div className="row-proj">{PROJECT.short}</div>
        <div className="row-title">Volta {a.row + 1} <span>de {a.rowTotal}</span></div>
      </div>
      <button type="button" className="sq-btn" onClick={a.nextRow} disabled={a.row === a.rowTotal - 1} aria-label="Próxima volta">›</button>
    </div>
  );
}

function WhatToDo() {
  const { cur, desktop } = useApp();
  return (
    <div className="todo">
      <div className="eyebrow eyebrow-blue">O que fazer nesta volta</div>
      <div className="todo-raw">{cur.raw}</div>
      <TermText segs={cur.segs} className="todo-text" />
      {!desktop && <div className="todo-hint">Toque nas palavras rosa para ver como fazer.</div>}
    </div>
  );
}

function NowNext() {
  const a = useApp();
  const { st, times } = a.seq;
  const k = a.count;
  const stc = st[k];
  const step = stc
    ? {
      now: stitchName(stc.a), part: stc.part,
      next: st[k + 1] ? stitchName(st[k + 1].a) : 'fim da volta',
      repText: times > 1 ? 'repetição ' + (stc.rep + 1) + ' de ' + times : 'ponto ' + (k + 1) + ' de ' + st.length,
    }
    : { now: 'Volta completa!', part: 'Você fez todos os pontos.', next: a.row + 1 < a.rowTotal ? 'Volta ' + (a.row + 2) : 'fim da peça', repText: '' };
  const term = stc && BY_AB[stc.a];
  return (
    <div className="nownext">
      <div className="row between start gap-12">
        <div className="col gap-2">
          <span className="eyebrow">Agora</span>
          {term
            ? <button type="button" className="now-term" onClick={() => a.openTerm(term.ab)}>{step.now}</button>
            : <span className="now-term is-static">{step.now}</span>}
          <span className="nn-sub">{step.part}</span>
        </div>
        <div className="col gap-2 end right">
          <span className="eyebrow">Depois</span>
          <span className="nn-next">{step.next}</span>
          <span className="nn-rep">{step.repText}</span>
        </div>
      </div>
      <div className="dots" aria-label={`${Math.min(k, st.length)} de ${st.length} pontos feitos`}>
        {st.map((d, i) => {
          const c = DOT_COLOR[d.a] || 'var(--ink)';
          return <span key={i} className={'dot' + (i === k ? ' cur' : '')}
            style={{ background: i < k ? c : i === k ? '#fff' : 'var(--line)', borderColor: i <= k ? c : 'var(--line)' }} />;
        })}
      </div>
      <div className="legend-dots">
        <span><i style={{ background: DOT_COLOR.pb }} />ponto baixo</span>
        <span><i style={{ background: DOT_COLOR.aum }} />aumento</span>
        <span><i style={{ background: DOT_COLOR.dim }} />diminuição</span>
      </div>
    </div>
  );
}

function BigButton() {
  const a = useApp();
  return (
    <div className="big-wrap">
      {a.done
        ? (
          <button type="button" className="big big-done" onClick={a.nextRow}>
            <span className="big-n">{a.count}</span>
            <span className="big-l">Volta completa!</span>
            <span className="big-h">{a.desktop ? 'clique' : 'toque'} para a próxima</span>
          </button>
        )
        : (
          <button type="button" className="big" onClick={a.plus} aria-label={`${a.count} de ${a.meta} pontos. Somar 1`}>
            <span className="big-n">{a.count}</span>
            <span className="big-l">de {a.meta} pontos</span>
            <span className="big-h">{a.desktop ? 'clique ou aperte espaço' : 'toque para +1'}</span>
          </button>
        )}
    </div>
  );
}

function Controls() {
  const a = useApp();
  return (
    <>
      <div className="bar bar-8"><div style={{ width: a.pct + '%' }} /></div>
      <div className="row gap-10">
        <button type="button" className="btn btn-outline ctl ctl-minus" onClick={a.minus}>−1</button>
        <button type="button" className="btn btn-outline ctl ctl-reset" onClick={a.reset}>Zerar</button>
        <button type="button" className="btn btn-blue ctl grow" onClick={a.nextRow}>Próxima volta ›</button>
      </div>
    </>
  );
}

export function Contador() {
  const a = useApp();
  if (!a.desktop) return (
    <div className="screen contador">
      <HelpCard />
      <RowPicker />
      <WhatToDo />
      <NowNext />
      <BigButton />
      <Controls />
      <HelpLink />
    </div>
  );

  return (
    <div className="contador-grid">
      <div className="card contador-main">
        <HelpCard />
        <RowPicker />
        <BigButton />
        <Controls />
        <NowNext />
        <HelpLink />
        <WhatToDo />
      </div>
      <div className="card recipe">
        <div className="h-21 recipe-t">Receita completa</div>
        {a.recipe.map((r, i) => (
          <button key={i} type="button" className={'recipe-row' + (i === a.row ? ' on' : '')} onClick={() => a.pickRow(i)}
            aria-current={i === a.row ? 'step' : undefined}>
            <span className="recipe-n">{i + 1}</span>
            <span className="recipe-body">
              <span className="recipe-plain">{r.plain}</span>
              <span className="recipe-raw">{r.raw}</span>
            </span>
            <span className="recipe-tot">{r.total} pts</span>
          </button>
        ))}
      </div>
    </div>
  );
}
