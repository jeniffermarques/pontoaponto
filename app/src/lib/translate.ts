import { PHRASES, TERMS, type TranslatableTerm } from './data';

export interface Seg {
  text: string;
  term?: TranslatableTerm;
}

export interface Line {
  raw: string;
  label: string;
  total: number | null;
  segs: Seg[];
  plain: string;
}

interface Matcher {
  re: RegExp;
  len: number;
  term?: TranslatableTerm;
  out?: string | ((m: RegExpExecArray) => string);
}

const LETTER = /[a-zà-ü]/i;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');

// Expressões mais longas primeiro, para "ponto baixíssimo" ganhar de "ponto baixo".
const MATCHERS: Matcher[] = [];
TERMS.forEach(t => t.keys.forEach(k => MATCHERS.push({ re: new RegExp(esc(k), 'iy'), len: k.length, term: t })));
PHRASES.forEach(([p, out, len]) => MATCHERS.push(typeof p === 'string'
  ? { re: new RegExp(esc(p), 'iy'), len: p.length, out }
  : { re: new RegExp(p.source, 'iy'), len: len ?? 0, out }));
MATCHERS.sort((a, b) => b.len - a.len);

const LABEL_RE = /^(rnds?|rounds?|rows?|r|v|vt|voltas?|carr|carreiras?)\.?\s*(\d+)(?:\s*(?:-|–|a|to)\s*(\d+))?\s*[:.)-]?\s*/i;
const TOTAL_RE = /\(\s*(\d+)\s*(?:sts?|pts?|pontos)?\s*\)\s*\.?\s*$/i;

/** Traduz uma linha de receita. Devolve null para linhas vazias. */
export function translateLine(raw: string): Line | null {
  let s = raw.trim();
  if (!s) return null;
  let label = '';
  let total: number | null = null;

  const lm = s.match(LABEL_RE);
  if (lm) {
    const noun = /^(rows?|carr|carreiras?)$/i.test(lm[1]) ? 'Carreira' : 'Volta';
    label = lm[3] ? noun + 's ' + lm[2] + ' a ' + lm[3] : noun + ' ' + lm[2];
    s = s.slice(lm[0].length);
  }
  const tm = s.match(TOTAL_RE);
  if (tm) {
    total = +tm[1];
    s = s.slice(0, tm.index).trim();
  }
  s = s.replace(/\*([^*]+)\*/g, '($1)').replace(/\[([^\]]+)\]/g, '($1)');

  const segs: Seg[] = [];
  let buf = '';
  let i = 0;
  while (i < s.length) {
    let hit: { m: Matcher; r: RegExpExecArray } | null = null;
    if (!LETTER.test(i > 0 ? s[i - 1] : ' ')) {
      for (const m of MATCHERS) {
        m.re.lastIndex = i;
        const r = m.re.exec(s);
        if (r && !LETTER.test(s[i + r[0].length] || ' ')) { hit = { m, r }; break; }
      }
    }
    if (hit) {
      const { m, r } = hit;
      if (m.term) {
        const n = (buf.match(/(\d+)\s*$/) || [])[1];
        if (buf) segs.push({ text: buf });
        buf = '';
        segs.push({ term: m.term, text: n && +n > 1 ? m.term.pl : m.term.pt });
      } else {
        buf += typeof m.out === 'function' ? m.out(r) : m.out;
      }
      i += r[0].length;
    } else {
      buf += s[i];
      i++;
    }
  }
  if (buf) segs.push({ text: buf });
  if (segs[0]) segs[0] = { ...segs[0], text: segs[0].text.charAt(0).toUpperCase() + segs[0].text.slice(1) };
  return { raw, label, total, segs, plain: (label ? label + ': ' : '') + segs.map(g => g.text).join('') };
}

export const translateText = (text: string) =>
  text.split('\n').map(translateLine).filter((l): l is Line => l !== null);

export interface Stitch {
  /** Abreviação do ponto: pb, aum, dim. */
  a: string;
  /** Índice da repetição (0, 1, …). */
  rep: number;
  part: string;
}

/** Monta a sequência de pontos de uma volta, ex. "V3: (1 pb, 1 aum) x6 (18)". */
export function parseSequence(raw: string): { st: Stitch[]; times: number } {
  const s = raw.replace(/^V\d+:\s*/, '').replace(/\(\d+\)\s*$/, '').trim();
  const g = s.match(/^\((.+)\)\s*x(\d+)/);
  const times = g ? +g[2] : 1;
  const unit: string[] = [];
  (g ? g[1] : s).split(',').forEach(p => {
    const m = p.trim().match(/^(\d+)\s+(\w+)/);
    if (m) for (let k = 0; k < +m[1]; k++) unit.push(m[2].toLowerCase());
  });
  const am = /\bAM\b/.test(s);
  const st: Stitch[] = [];
  for (let r = 0; r < times; r++) unit.forEach(a => {
    if (a === 'aum') {
      st.push({ a, rep: r, part: '1º ponto do aumento' });
      st.push({ a, rep: r, part: '2º ponto, no mesmo lugar' });
    } else {
      st.push({ a, rep: r, part: a === 'dim' ? 'junte 2 pontos em 1' : am ? 'dentro do anel mágico' : 'no próximo ponto' });
    }
  });
  return { st, times };
}
