import type { ScreenId } from '../lib/data';
import { useApp } from '../state';

const SHORTCUTS: { id: ScreenId; tone: string; g: string; gClass: string; title: string; m: string; w: string }[] = [
  { id: 'tradutor', tone: 'tone-pink', g: 'Aa', gClass: 'g-pink g-fredoka', title: 'Traduzir receita', m: 'Abreviações e inglês para português', w: 'Cole uma receita em inglês ou com abreviações e leia em português.' },
  { id: 'grafico', tone: 'tone-baby', g: '×', gClass: 'g-blue', title: 'Ler gráfico', m: 'Símbolos viram passo a passo', w: 'Cada carreira do diagrama vira um passo a passo escrito.' },
  { id: 'glossario', tone: 'tone-lilac', g: '≡', gClass: 'g-primary', title: 'Glossário', m: 'O que é cada ponto', w: 'Símbolo, abreviação e explicação de cada ponto.' },
  { id: 'contador', tone: 'tone-sky', g: '+1', gClass: 'g-blue g-fredoka', title: 'Contador', m: 'Pontos e voltas', w: '' },
];

export function Inicio() {
  const a = useApp();
  const { desktop } = a;
  const draftBox = (
    <textarea className="draft" value={a.draft} onChange={e => a.setDraft(e.target.value)}
      placeholder="ex: Rnd 1: 6 sc in magic ring (6)" aria-label="Receita para traduzir" />
  );
  const project = a.project && a.part && a.rowData ? (
    <div className="proj">
      <div className="proj-eyebrow">Projeto atual</div>
      <div className="proj-name">{a.project.name}</div>
      <div className="proj-sub">
        {a.finished ? 'Concluído!' : <>
          {a.project.parts.length > 1 && <>{a.part.name} · </>}
          {a.rowData.label} de {a.part.rows.length}{a.meta !== null && <> · {a.count} de {a.meta} pontos</>}
        </>}
      </div>
      <div className="bar bar-proj"><div style={{ width: a.projPct + '%' }} /></div>
      <div className="row gap-10 wrap">
        <button type="button" className="btn btn-white" onClick={() => a.setScreen('contador')}>Continuar contando</button>
        <button type="button" className="btn btn-ghost-white" onClick={() => a.setProjectsOpen(true)}>Trocar projeto</button>
      </div>
    </div>
  ) : (
    <div className="proj">
      <div className="proj-eyebrow">Projeto atual</div>
      <div className="proj-name">Nenhum projeto ainda</div>
      <div className="proj-sub">Traduza uma receita e toque em “Contar esta receita”.</div>
      <button type="button" className="btn btn-white" onClick={() => a.setScreen('tradutor')}>Traduzir uma receita</button>
    </div>
  );

  const shortcuts = SHORTCUTS.filter(s => !desktop || s.w).map(s => (
    <button key={s.id} type="button" className={'shortcut ' + s.tone} onClick={() => a.setScreen(s.id)}>
      <span className={'shortcut-g ' + s.gClass}>{s.g}</span>
      <span className="shortcut-t">{s.title}</span>
      <span className="shortcut-d">{desktop ? s.w : s.m}</span>
    </button>
  ));

  if (!desktop) return (
    <div className="screen inicio">
      <div className="col gap-4">
        <div className="hello">Olá!</div>
        <h1 className="h-hero">O que vamos crochetar hoje?</h1>
      </div>
      <div className="card translate-card">
        <div className="col gap-2">
          <div className="h-18">Traduzir uma receita</div>
          <div className="small muted">Cole o texto, tire uma foto ou envie um PDF.</div>
        </div>
        {draftBox}
        <div className="row gap-8">
          <button type="button" className="btn btn-primary btn-48 grow" onClick={a.translateDraft}>Traduzir</button>
          <button type="button" className="btn btn-outline btn-48 w-72" onClick={a.homeFoto}>Foto</button>
          <button type="button" className="btn btn-outline btn-48 w-72" onClick={a.homePdf}>PDF</button>
        </div>
      </div>
      {project}
      <div className="shortcuts">{shortcuts}</div>
      <div className="card tip-card">
        <span className="tip-badge">V</span>
        <div className="col gap-4">
          <div className="tip-t">Dica para iniciantes</div>
          <div className="tip-x">Aumento (aum) é fazer 2 pontos no mesmo lugar. É assim que a peça cresce.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="screen inicio">
      <div className="col gap-4">
        <div className="hello">Olá!</div>
        <h1 className="h-hero">O que vamos crochetar hoje?</h1>
      </div>
      <div className="card translate-card">
        <div className="col gap-10">
          <div className="row gap-12 baseline wrap">
            <div className="h-20">Traduzir uma receita</div>
            <div className="body-14 muted">Cole o texto em inglês ou com abreviações.</div>
          </div>
          {draftBox}
        </div>
        <div className="col gap-8 end">
          <button type="button" className="btn btn-primary btn-48" onClick={a.translateDraft}>Traduzir</button>
          <div className="row gap-8">
            <button type="button" className="btn btn-outline btn-44 grow" onClick={a.homeFoto}>Foto</button>
            <button type="button" className="btn btn-outline btn-44 grow" onClick={a.homePdf}>PDF</button>
          </div>
        </div>
      </div>
      <div className="inicio-mid">
        {project}
        <div className="card tip-card">
          <span className="tip-badge">V</span>
          <div className="tip-t">Dica para iniciantes</div>
          <div className="tip-x">Aumento (aum) é fazer 2 pontos no mesmo lugar. É assim que a peça cresce. Diminuição (dim) é o contrário: junta 2 pontos em 1.</div>
        </div>
      </div>
      <div className="shortcuts">{shortcuts}</div>
    </div>
  );
}
