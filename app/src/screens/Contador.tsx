import { DOT_COLOR, TERMS } from '../lib/data';
import { translateLine } from '../lib/translate';
import { useApp } from '../state';
import { TermText } from '../components/TermText';

const BY_AB = Object.fromEntries(TERMS.map(t => [t.ab.toLowerCase(), t]));
const stitchName = (a: string) => a === '?' ? 'ponto' : BY_AB[a]?.pt ?? a;
const DOT_LABEL: Record<string, string> = { pb: 'ponto baixo', aum: 'aumento', dim: 'diminuição', pa: 'ponto alto', mpa: 'meio ponto alto', pad: 'ponto alto duplo', pbx: 'ponto baixíssimo', '?': 'ponto' };
const dotColor = (a: string) => DOT_COLOR[a] ?? 'var(--primary)';

/** "carreira" ou "volta", do jeito que a receita chama. */
function useNoun() {
  const { rowData } = useApp();
  return rowData?.label.startsWith('Volta') ? 'volta' : 'carreira';
}

/** Instruções da receita, traduzidas, uma por linha. */
function Lines({ lines, className }: { lines: string[]; className: string }) {
  return <>{lines.map((l, i) => { const t = translateLine(l); return t && <TermText key={i} segs={t.segs} className={className} />; })}</>;
}

function HelpCard() {
  const { help, setHelp, desktop } = useApp();
  const noun = useNoun();
  if (!help) return null;
  return (
    <div className="help">
      <div className="row between center">
        <span className="help-t">Como usar o contador</span>
        <button type="button" className="help-ok" onClick={() => setHelp(false)}>Entendi</button>
      </div>
      <ol>
        <li>Leia o que fazer nesta {noun}.</li>
        <li>{desktop ? 'Faça um ponto e clique no círculo (ou aperte espaço).' : 'Faça um ponto e toque no círculo.'} O app mostra qual é o próximo.</li>
        <li>Quando chegar ao total, a {noun} está completa. Passe para a próxima.</li>
      </ol>
    </div>
  );
}

function HelpLink() {
  const { help, setHelp } = useApp();
  if (help) return null;
  return <button type="button" className="link-btn" onClick={() => setHelp(true)}>Como funciona o contador?</button>;
}

/** Projeto atual (com botão para trocar) e as partes dele. */
function ProjectBar() {
  const a = useApp();
  if (!a.project) return null;
  return (
    <div className="pbar">
      <div className="row between center gap-10">
        <div className="col gap-2 grow">
          <span className="eyebrow">Projeto</span>
          <span className="pbar-name">{a.project.name}</span>
        </div>
        <button type="button" className="chip-btn" onClick={() => a.setProjectsOpen(true)}>Trocar projeto</button>
      </div>
      {a.project.parts.length > 1 && (
        <div className="parts" role="group" aria-label="Partes do projeto">
          {a.project.parts.map((p, i) => {
            const s = a.progressOf(a.project!).spots[i];
            const started = s.row > 0 || s.copy > 0 || s.count > 0;
            return (
              <button key={i} type="button" className={'part-chip' + (i === a.partIndex ? ' on' : '')} aria-pressed={i === a.partIndex} onClick={() => a.pickPart(i)}>
                {p.name}{p.copies > 1 && <small> ×{p.copies}</small>}
                {started && i !== a.partIndex && <small> · {s.row + 1}/{p.rows.length}</small>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RowPicker() {
  const a = useApp();
  const noun = useNoun();
  if (!a.part || !a.rowData) return null;
  return (
    <div className="row between center">
      <button type="button" className="sq-btn" onClick={a.prevRow} disabled={a.atStart} aria-label={`${noun} anterior`}>‹</button>
      <div className="col center">
        <div className="row-proj">{a.part.name}{a.part.copies > 1 && ` · peça ${a.spot.copy + 1} de ${a.part.copies}`}</div>
        <div className="row-title">{a.rowData.label} <span>de {a.part.rows.length}</span></div>
      </div>
      <button type="button" className="sq-btn" onClick={a.nextRow} aria-label={`Próxima ${noun}`}>›</button>
    </div>
  );
}

function Intro() {
  const a = useApp();
  if (!a.part?.intro.length || a.spot.row !== 0 || a.spot.copy !== 0) return null;
  return (
    <div className="note note-pink">
      <div className="note-t">Antes de começar</div>
      <Lines lines={a.part.intro} className="note-line" />
    </div>
  );
}

function WhatToDo() {
  const { cur, rowData, desktop } = useApp();
  const noun = useNoun();
  if (!cur || !rowData) return null;
  return (
    <div className="todo">
      <div className="eyebrow eyebrow-blue">O que fazer nesta {noun}</div>
      <div className="todo-raw">{rowData.raw}</div>
      {cur.segs.length > 0 && <TermText segs={cur.segs} className="todo-text" />}
      {rowData.body && <Lines lines={rowData.body} className="todo-text todo-body" />}
      {!desktop && <div className="todo-hint">Toque nas palavras rosa para ver como fazer.</div>}
    </div>
  );
}

function After() {
  const a = useApp();
  const noun = useNoun();
  if (!a.rowData?.after.length) return null;
  return (
    <div className={'note note-lilac' + (a.done ? ' pulse' : '')}>
      <div className="note-t">Depois desta {noun}</div>
      <Lines lines={a.rowData.after} className="note-line" />
    </div>
  );
}

function NowNext() {
  const a = useApp();
  const noun = useNoun();
  if (!a.seq) {
    return (
      <div className="nownext">
        <span className="nn-sub">Esta {noun} não diz quantos pontos tem. Conte à vontade e toque em “Próxima {noun}” quando terminar.</span>
      </div>
    );
  }
  const { st, times } = a.seq;
  const k = a.count;
  const stc = st[k];
  const generic = st.every(s => s.a === '?');
  const step = stc
    ? {
      now: generic ? `${k + 1}º ponto` : stitchName(stc.a), part: stc.part,
      next: st[k + 1] ? (generic ? `${k + 2}º ponto` : stitchName(st[k + 1].a)) : `fim da ${noun}`,
      repText: times > 1 && stc.rep >= 0 ? 'repetição ' + (stc.rep + 1) + ' de ' + times : 'ponto ' + (k + 1) + ' de ' + st.length,
    }
    : { now: `${noun[0].toUpperCase() + noun.slice(1)} completa!`, part: 'Você fez todos os pontos.', next: a.atEnd ? 'fim do projeto' : `próxima ${noun}`, repText: '' };
  const term = stc && !generic && BY_AB[stc.a];
  const kinds = [...new Set(st.map(s => s.a))];
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
          const c = dotColor(d.a);
          return <span key={i} className={'dot' + (i === k ? ' cur' : '')}
            style={{ background: i < k ? c : i === k ? '#fff' : 'var(--line)', borderColor: i <= k ? c : 'var(--line)' }} />;
        })}
      </div>
      {!generic && (
        <div className="legend-dots">
          {kinds.map(kd => <span key={kd}><i style={{ background: dotColor(kd) }} />{DOT_LABEL[kd] ?? kd}</span>)}
        </div>
      )}
    </div>
  );
}

function BigButton() {
  const a = useApp();
  const noun = useNoun();
  return (
    <div className="big-wrap">
      {a.done
        ? (
          <button type="button" className="big big-done" onClick={a.nextRow}>
            <span className="big-n">{a.count}</span>
            <span className="big-l">{noun === 'volta' ? 'Volta completa!' : 'Carreira completa!'}</span>
            <span className="big-h">{a.desktop ? 'clique' : 'toque'} para {a.atEnd ? 'concluir' : 'a próxima'}</span>
          </button>
        )
        : (
          <button type="button" className="big" onClick={a.plus} aria-label={a.meta ? `${a.count} de ${a.meta} pontos. Somar 1` : `${a.count} pontos. Somar 1`}>
            <span className="big-n">{a.count}</span>
            <span className="big-l">{a.meta ? `de ${a.meta} pontos` : a.count === 1 ? 'ponto' : 'pontos'}</span>
            <span className="big-h">{a.desktop ? 'clique ou aperte espaço' : 'toque para +1'}</span>
          </button>
        )}
    </div>
  );
}

function Controls() {
  const a = useApp();
  const noun = useNoun();
  return (
    <>
      {a.meta !== null && <div className="bar bar-8"><div style={{ width: a.pct + '%' }} /></div>}
      <div className="row gap-10">
        <button type="button" className="btn btn-outline ctl ctl-minus" onClick={a.minus}>−1</button>
        <button type="button" className="btn btn-outline ctl ctl-reset" onClick={a.reset}>Zerar</button>
        <button type="button" className="btn btn-blue ctl grow" onClick={a.nextRow}>{a.atEnd ? 'Concluir projeto' : `Próxima ${noun} ›`}</button>
      </div>
    </>
  );
}

function Flash() {
  const { flash } = useApp();
  return flash ? <div className="notice" role="status">{flash}</div> : null;
}

function Finished() {
  const a = useApp();
  if (!a.project) return null;
  const lastPart = a.project.parts[a.project.parts.length - 1];
  const lastRow = lastPart.rows[lastPart.rows.length - 1];
  return (
    <div className="card finished">
      <span className="finished-badge" aria-hidden="true">✓</span>
      <div className="h-screen">Projeto concluído!</div>
      <div className="lead">Você terminou {a.project.name}. Parabéns!</div>
      {lastRow.after.length > 0 && (
        <div className="note note-lilac finished-notes">
          <div className="note-t">Para terminar</div>
          <Lines lines={lastRow.after} className="note-line" />
        </div>
      )}
      <div className="row gap-10 wrap center">
        <button type="button" className="btn btn-primary btn-48 px-18" onClick={() => a.setProjectsOpen(true)}>Meus projetos</button>
        <button type="button" className="btn btn-outline btn-48 px-18" onClick={a.prevRow}>Voltar à última carreira</button>
        <button type="button" className="btn btn-outline btn-48 px-18" onClick={a.restart}>Recomeçar</button>
      </div>
    </div>
  );
}

function Empty() {
  const a = useApp();
  return (
    <div className="card finished">
      <div className="h-screen">Nenhum projeto ainda</div>
      <div className="lead">Cole uma receita em Traduzir e toque em “Contar esta receita”. Ela aparece aqui, separada em partes e carreiras.</div>
      <div className="row gap-10 wrap center">
        <button type="button" className="btn btn-primary btn-48 px-18" onClick={() => a.setScreen('tradutor')}>Traduzir uma receita</button>
        <button type="button" className="btn btn-outline btn-48 px-18" onClick={a.addExample}>Usar o exemplo do ursinho</button>
      </div>
    </div>
  );
}

function RecipeList() {
  const a = useApp();
  if (!a.part) return null;
  return (
    <div className="card recipe">
      <div className="h-21 recipe-t">{a.part.name}{a.part.copies > 1 && <span className="recipe-copies"> · {a.part.copies} peças</span>}</div>
      {a.partRows.map((r, i) => (
        <button key={i} type="button" className={'recipe-row' + (i === a.spot.row ? ' on' : '')} onClick={() => a.pickRow(i)}
          aria-current={i === a.spot.row ? 'step' : undefined}>
          <span className="recipe-n">{r.label.replace(/\D+/g, '')}</span>
          <span className="recipe-body">
            <span className="recipe-plain">{r.body ? r.label : r.line.plain}</span>
            <span className="recipe-raw">{r.body ? r.body.join(' ') : r.raw}</span>
          </span>
          {r.line.total !== null && <span className="recipe-tot">{r.line.total} pts</span>}
        </button>
      ))}
    </div>
  );
}

export function Contador() {
  const a = useApp();
  if (!a.project) return <div className="screen contador"><Empty /></div>;
  if (a.finished) return <div className="screen contador"><ProjectBar /><Finished /></div>;

  if (!a.desktop) return (
    <div className="screen contador">
      <ProjectBar />
      <Flash />
      <HelpCard />
      <RowPicker />
      <Intro />
      <WhatToDo />
      <NowNext />
      <BigButton />
      <Controls />
      <After />
      <HelpLink />
    </div>
  );

  return (
    <div className="screen contador">
      <ProjectBar />
      <div className="contador-grid">
        <div className="card contador-main">
          <Flash />
          <HelpCard />
          <RowPicker />
          <Intro />
          <BigButton />
          <Controls />
          <NowNext />
          <After />
          <HelpLink />
          <WhatToDo />
        </div>
        <RecipeList />
      </div>
    </div>
  );
}
