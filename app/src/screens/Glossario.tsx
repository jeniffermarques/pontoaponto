import { useMemo } from 'react';
import { ALL_TERMS, CATS, TERMS, deco, termByAb } from '../lib/data';
import { useApp } from '../state';

const ENTRIES = ALL_TERMS.map(deco);

function StartHere() {
  return (
    <div className="start-here">
      <div className="start-here-t">Primeira vez? Comece por aqui</div>
      <div className="start-here-x">Aprenda nesta ordem: nó corrediço, corrente e ponto baixo. Com esses três você já faz a primeira peça.</div>
    </div>
  );
}

export function Glossario() {
  const a = useApp();
  const q = a.q.trim().toLowerCase();
  const groups = useMemo(() => {
    const hits = ENTRIES.filter(t => !q || [t.pt, t.ab, t.en, t.desc].join(' ').toLowerCase().includes(q));
    return CATS.map(([id, title]) => ({ title, items: hits.filter(t => t.cat === id) })).filter(g => g.items.length);
  }, [q]);
  const search = (
    <input className="search" type="search" value={a.q} onChange={e => a.setQ(e.target.value)}
      placeholder="Buscar: pb, sc, aumento…" aria-label="Buscar no glossário" />
  );
  const empty = groups.length === 0 && <div className="empty">Nenhum ponto encontrado para “{a.q.trim()}”.</div>;

  if (!a.desktop) return (
    <div className="screen glossario">
      <h1 className="h-screen">Glossário</h1>
      <StartHere />
      {search}
      {empty}
      {groups.map(gr => (
        <div key={gr.title} className="col gap-8">
          <div className="eyebrow group-t">{gr.title}</div>
          {gr.items.map(t => (
            <button key={t.ab} type="button" className="card g-item" onClick={() => a.openTerm(t.ab)}>
              <span className={'g-sym' + (t.hasSym ? '' : ' txt')}>{t.symShow}</span>
              <span className="g-body">
                <span className="g-name">{t.pt}</span>
                <span className="mono-11 muted">{t.abbrLine}</span>
                <span className="g-use">{t.use}</span>
                <span className="g-more">Ver passo a passo ›</span>
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  const gsel = deco(termByAb(a.glossSel) ?? TERMS[2]);
  return (
    <div className="screen glossario">
      <h1 className="h-screen">Glossário</h1>
      <StartHere />
      <div className="glossario-grid">
        <div className="col gap-14">
          {search}
          {empty}
          {groups.map(gr => (
            <div key={gr.title} className="col gap-8">
              <div className="eyebrow group-t">{gr.title}</div>
              {gr.items.map(t => (
                <button key={t.ab} type="button" className={'gw-item' + (a.glossSel === t.ab ? ' on' : '')}
                  aria-current={a.glossSel === t.ab ? 'true' : undefined} onClick={() => a.setGlossSel(t.ab)}>
                  <span className={'gw-sym' + (t.hasSym ? '' : ' txt')}>{t.symShow}</span>
                  <span className="gw-body">
                    <span className="gw-name">{t.pt}</span>
                    <span className="mono-11 muted">{t.ab} · {t.en}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="card g-detail">
          <div className="row gap-18 center">
            <span className={'gd-sym' + (gsel.hasSym ? '' : ' txt')}>{gsel.symShow}</span>
            <div className="col gap-4">
              <div className="eyebrow">{gsel.catLabel}</div>
              <div className="gd-name">{gsel.pt}</div>
              <div className="mono-12 muted">{gsel.abbrLine}</div>
            </div>
          </div>
          <div className="body-17">{gsel.desc}</div>
          <div className="col gap-12">
            <h2 className="gd-h">Passo a passo</h2>
            {gsel.stepList.map(p => (
              <div key={p.n} className="step">
                <span className="step-n step-30">{p.n}</span>
                <span className="step-x">{p.x}</span>
              </div>
            ))}
          </div>
          <div className="gd-notes">
            <div className="note note-blue"><div className="note-t">Quando usar</div><div>{gsel.use}</div></div>
            <div className="note note-pink"><div className="note-t">Cuidado com</div><div>{gsel.tip}</div></div>
            <div className="note note-lilac"><div className="note-t">Na receita aparece assim</div><div className="mono-13">{gsel.ex}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
