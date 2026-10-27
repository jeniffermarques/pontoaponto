import { useEffect } from 'react';
import { deco, termByAb } from '../lib/data';
import { useApp } from '../state';

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
}

/** Celular: painel que sobe de baixo com todos os detalhes do ponto. */
export function TermSheet() {
  const { sel, closeTerm } = useApp();
  useEscape(closeTerm);
  const t = termByAb(sel);
  if (!t) return null;
  const d = deco(t);
  return (
    <>
      <div className="sheet-backdrop" onClick={closeTerm} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={d.pt}>
        <div className="sheet-grip" />
        <div className="row gap-14 center">
          <span className="sym-tile sym-60">{d.symShow}</span>
          <div className="col gap-2">
            <div className="h-23">{d.pt}</div>
            <div className="mono-12 muted">{d.abbrLine}</div>
          </div>
        </div>
        <div className="body-16">{d.desc}</div>
        <div className="col gap-10">
          <div className="eyebrow">Passo a passo</div>
          {d.stepList.map(p => (
            <div key={p.n} className="step">
              <span className="step-n step-28">{p.n}</span>
              <span className="step-x">{p.x}</span>
            </div>
          ))}
        </div>
        <div className="note note-blue"><div className="note-t">Quando usar</div><div>{d.use}</div></div>
        <div className="note note-pink"><div className="note-t">Cuidado com</div><div>{d.tip}</div></div>
        <div className="col gap-4">
          <div className="eyebrow">Na receita aparece assim</div>
          <div className="example">{d.ex}</div>
        </div>
        <button type="button" className="btn btn-primary btn-52" onClick={closeTerm}>Entendi</button>
      </div>
    </>
  );
}

/** Computador: cartão flutuante no canto inferior direito. */
export function TermPopover() {
  const { sel, closeTerm, openInGlossary } = useApp();
  useEscape(closeTerm);
  const t = termByAb(sel);
  if (!t) return null;
  const d = deco(t);
  return (
    <div className="popover" role="dialog" aria-label={d.pt}>
      <div className="row gap-14 center">
        <span className="sym-tile sym-54">{d.symShow}</span>
        <div className="col gap-2 grow">
          <div className="h-21">{d.pt}</div>
          <div className="mono-11 muted">{d.abbrLine}</div>
        </div>
        <button type="button" className="icon-btn" onClick={closeTerm} aria-label="Fechar">✕</button>
      </div>
      <div className="body-15">{d.desc}</div>
      <div className="col gap-8">
        {d.stepList.map(p => (
          <div key={p.n} className="step step-sm">
            <span className="step-n step-24">{p.n}</span>
            <span className="step-x">{p.x}</span>
          </div>
        ))}
      </div>
      <div className="popover-tip"><b>Cuidado com: </b>{d.tip}</div>
      <button type="button" className="btn btn-soft btn-40" onClick={openInGlossary}>Ver no glossário</button>
    </div>
  );
}
