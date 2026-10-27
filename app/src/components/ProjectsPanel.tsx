import { useEffect } from 'react';
import { useApp } from '../state';

/** Lista "Meus projetos": abrir, apagar ou começar um novo a partir de uma receita. */
export function ProjectsPanel() {
  const a = useApp();
  const close = () => a.setProjectsOpen(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') a.setProjectsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [a]);
  return (
    <>
      <div className="sheet-backdrop" onClick={close} />
      <div className={a.desktop ? 'dialog' : 'sheet'} role="dialog" aria-modal="true" aria-label="Meus projetos">
        {!a.desktop && <div className="sheet-grip" />}
        <div className="row between center">
          <div className="h-23">Meus projetos</div>
          {a.desktop && <button type="button" className="icon-btn" onClick={close} aria-label="Fechar">✕</button>}
        </div>
        {a.projects.length === 0 && <div className="lead">Nenhum projeto ainda.</div>}
        {a.projects.map(p => {
          const prog = a.progressOf(p);
          const part = p.parts[prog.part];
          const pct = a.pctOf(p);
          const on = p.id === a.project?.id;
          return (
            <div key={p.id} className={'proj-item' + (on ? ' on' : '')}>
              <button type="button" className="proj-open" onClick={() => a.pickProject(p.id)} aria-current={on ? 'true' : undefined}>
                <span className="proj-item-name">{p.name}</span>
                <span className="small muted">
                  {prog.finished ? 'Concluído' : `${p.parts.length > 1 ? part.name + ' · ' : ''}${part.rows[prog.spots[prog.part].row].label} de ${part.rows.length}`}
                  {p.parts.length > 1 && ` · ${p.parts.length} partes`}
                </span>
                <span className="bar bar-6"><span style={{ width: pct + '%' }} /></span>
              </button>
              <button type="button" className="chip-btn ghost" aria-label={`Apagar ${p.name}`}
                onClick={() => { if (window.confirm(`Apagar o projeto "${p.name}"? A contagem dele será perdida.`)) a.deleteProject(p.id); }}>Apagar</button>
            </div>
          );
        })}
        <button type="button" className="btn btn-primary btn-48" onClick={() => { close(); a.setScreen('tradutor'); }}>Nova receita</button>
        <div className="small muted center-text">Para criar um projeto, cole a receita em Traduzir e toque em “Contar esta receita”.</div>
      </div>
    </>
  );
}
