import type { Seg } from '../lib/translate';
import { useApp } from '../state';

/** Frase traduzida com os termos de crochê destacados em rosa e clicáveis. */
export function TermText({ segs, className }: { segs: Seg[]; className?: string }) {
  const { openTerm } = useApp();
  return (
    <div className={className}>
      {segs.map((g, i) => g.term
        ? <button key={i} type="button" className="term" onClick={() => openTerm(g.term!.ab)}>{g.text}</button>
        : <span key={i}>{g.text}</span>)}
    </div>
  );
}
