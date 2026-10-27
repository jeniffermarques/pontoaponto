import type { ReactNode } from 'react';
import { NAV } from '../lib/data';
import { useApp } from '../state';
import { ProjectsPanel } from './ProjectsPanel';
import { TermPopover, TermSheet } from './TermDetail';

export function MobileShell({ children }: { children: ReactNode }) {
  const { screen, setScreen, sel, projectsOpen } = useApp();
  return (
    <div className="app is-mobile">
      <main className="m-scroll" key={screen}>{children}</main>
      <nav className="m-tabs" aria-label="Navegação">
        {NAV.map(n => (
          <button key={n.id} type="button" className={'m-tab' + (screen === n.id ? ' on' : '')}
            aria-current={screen === n.id ? 'page' : undefined} onClick={() => setScreen(n.id)}>
            <span className="m-tab-g">{n.g}</span>
            <span className="m-tab-l">{n.label}</span>
          </button>
        ))}
      </nav>
      {sel && <TermSheet />}
      {projectsOpen && <ProjectsPanel />}
    </div>
  );
}

export function DesktopShell({ children }: { children: ReactNode }) {
  const { screen, setScreen, sel, project, part, rowData, finished, projPct, projectsOpen, setProjectsOpen } = useApp();
  return (
    <div className="app is-desktop">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-mark" />
          <span className="logo-name">Ponto a Ponto</span>
        </div>
        <nav className="col gap-6" aria-label="Navegação">
          {NAV.map(n => (
            <button key={n.id} type="button" className={'w-nav' + (screen === n.id ? ' on' : '')}
              aria-current={screen === n.id ? 'page' : undefined} onClick={() => setScreen(n.id)}>
              <span className="w-nav-g">{n.g}</span>{n.label}
            </button>
          ))}
        </nav>
        <button type="button" className="side-proj" onClick={() => setProjectsOpen(true)} aria-label="Projeto atual. Trocar projeto">
          <span className="side-proj-t">Projeto atual</span>
          {project && part && rowData ? <>
            <span className="side-proj-n">{project.name}</span>
            <span className="side-proj-r">{finished ? 'Concluído' : `${project.parts.length > 1 ? part.name + ' · ' : ''}${rowData.label} de ${part.rows.length}`}</span>
            <span className="bar bar-6 bar-white"><span style={{ width: projPct + '%' }} /></span>
          </> : <span className="side-proj-r">Nenhum projeto</span>}
          <span className="side-proj-link">Trocar projeto ›</span>
        </button>
      </aside>
      <main className="w-main" key={screen}><div className="w-inner">{children}</div></main>
      {sel && <TermPopover />}
      {projectsOpen && <ProjectsPanel />}
    </div>
  );
}
