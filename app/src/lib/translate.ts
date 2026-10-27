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

const LABEL_RE = /^(rnds?|rounds?|rows?|r|v|vt|voltas?|carr|carreiras?)\.?\s*(\d+)(?:\s*(?:-|–|a|to|até)\s*(?:[a-z]+\.?\s*)?(\d+))?\s*[:.)-]?\s*/i;
// Total no fim da linha: "(18)", "(18 sts)", "[18 sc]", "(18 sts total)", "- 18 sts", "= 18".
const UNIT = '(?:sts?|stitches|pts?|pontos|sc|dc|hdc|tr|ch|pb|pa|mpa|corr)';
const TOTAL_RE = new RegExp(`(?:[([]\\s*(\\d+)\\s*(?:${UNIT}\\.?)?(?:\\s*total)?\\s*[)\\]]|[-–—]\\s*(\\d+)\\s*${UNIT}|=\\s*(\\d+)\\s*${UNIT}?)\\s*\\.?\\s*$`, 'i');

/** Coloca o número antes da corrente ("ch 21" vira "21 ch") para virar "21 correntes". */
const prepare = (s: string) => s
  .replace(/\*([^*]+)\*/g, '($1)').replace(/\[([^\]]+)\]/g, '($1)')
  .replace(/\b(?:the\s+)?(?:beginning|beg)\.?\s+ch(?:ain)?\s*-?\s*(\d+)\b/gi, '$1 ch do início')
  .replace(/\bch(?:ain)?\s*-?\s*(\d+)\s*-?\s*(?:sp|space)\b/gi, 'espaço de $1 correntes')
  .replace(/\bch(?:ain)?\s*-?\s*(\d+)\b(?!(?:st|nd|rd|th)\b)/gi, '$1 ch');

/** Arruma espaços sobrando (de palavras que somem, como "the") e antes da pontuação. */
function tidy(segs: Seg[]) {
  const out = segs.map(g => g.term ? g : { text: g.text.replace(/ {2,}/g, ' ').replace(/ ([,.;:)])/g, '$1').replace(/\( /g, '(') }).filter(g => g.text);
  if (out[0] && !out[0].term) out[0] = { text: out[0].text.trimStart() };
  const last = out.length - 1;
  if (last >= 0 && !out[last].term) out[last] = { text: out[last].text.trimEnd() };
  return out.filter(g => g.text);
}

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
    total = +(tm[1] ?? tm[2] ?? tm[3]);
    s = s.slice(0, tm.index).trim();
  }
  s = prepare(s);

  let segs: Seg[] = [];
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
  segs = tidy(segs);
  // Letra maiúscula no começo da linha e depois de ponto final.
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  segs = segs.map((g, k) => {
    const text = g.term ? g.text : g.text.replace(/([.!?]\s+)([a-zà-ü])/g, (_, p, c: string) => p + c.toUpperCase());
    const startsSentence = k === 0 || /[.!?]\s*$/.test(segs[k - 1].text);
    return { ...g, text: startsSentence ? cap(text) : text };
  });
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
