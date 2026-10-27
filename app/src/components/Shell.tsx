import type { ReactNode } from 'react';
import { NAV, PROJECT } from '../lib/data';
import { useApp } from '../state';
import { TermPopover, TermSheet } from './TermDetail';

export function MobileShell({ children }: { children: ReactNode }) {
  const { screen, setScreen, sel } = useApp();
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
    </div>
  );
}

export function DesktopShell({ children }: { children: ReactNode }) {
  const { screen, setScreen, sel, row, rowTotal, projPct } = useApp();
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
        <div className="side-proj">
          <div className="side-proj-t">Projeto atual</div>
          <div className="side-proj-n">{PROJECT.short}</div>
          <div className="side-proj-r">Volta {row + 1} de {rowTotal}</div>
          <div className="bar bar-6 bar-white"><div style={{ width: projPct + '%' }} /></div>
        </div>
      </aside>
      <main className="w-main" key={screen}><div className="w-inner">{children}</div></main>
      {sel && <TermPopover />}
    </div>
  );
}
