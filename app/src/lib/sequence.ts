// Transforma uma carreira da receita na sequência de pontos que o contador acompanha.
// "3ª carr.: *1 pb, 1 aum* = 9 pb" vira pb, aum, aum, pb, aum, aum, pb, aum, aum.
import { parseLabel, TOTAL_RE } from './translate';

export interface Stitch {
  /** pb, aum, dim, pa, mpa, pad, pbx, ou "?" quando a receita não diz qual ponto. */
  a: string;
  /** Repetição (0, 1, …) a que o ponto pertence, ou -1 fora de repetição. */
  rep: number;
  part: string;
}

export interface Sequence {
  st: Stitch[];
  /** Quantas vezes a repetição principal acontece (1 se não houver). */
  times: number;
}

type Node =
  | { k: 'st'; a: string; n: number; fill: boolean }
  | { k: 'grp'; items: Node[]; times: number | null };

const KINDS: Record<string, string> = {
  pb: 'pb', sc: 'pb', 'single crochet': 'pb',
  aum: 'aum', inc: 'aum', increase: 'aum',
  dim: 'dim', dec: 'dim', decrease: 'dim', sc2tog: 'dim', invdec: 'dim', 'inv dec': 'dim',
  pa: 'pa', dc: 'pa', mpa: 'mpa', hdc: 'mpa', pad: 'pad', tr: 'pad',
  pbx: 'pbx', 'sl st': 'pbx', slst: 'pbx',
  corr: 'corr', ch: 'corr', chain: 'corr',
};
const STITCH_RE = /(?<![a-zà-ü])(?:(\d+)\s*)?(single crochets?|sc2tog|invdec|inv\s+dec|sl\s*st|slst|increases?|decreases?|chains?|pbx|pb|sc|aum|inc|dim|dec|mpa|hdc|pad|tr|pa|dc|corr|ch)(?![a-zà-ü0-9])/i;
const EACH_RE = /\b(cada|each|around|todos|todas)\b/i;
const NEXT_N_RE = /\b(?:next|próximos)\s+(\d+)/i;
const REP_RE = /^\s*(?:[x×]\s*(\d+)|(\d+)\s*[x×](?![a-z])|(?:repita|repeat|rep|repetir)?\s*(\d+)\s*(?:vezes|times))/i;

const kindOf = (w: string) => KINDS[w.toLowerCase().replace(/\s+/g, ' ').replace(/s$/, '')] ?? KINDS[w.toLowerCase()];

/** Separa por vírgula (e por " e "/" and ") fora dos parênteses, entendendo grupos com repetição. */
function parse(s: string): Node[] | null {
  const nodes: Node[] = [];
  let buf = '';
  const flush = () => {
    const item = buf.trim();
    buf = '';
    if (!item) return true;
    const m = item.match(STITCH_RE);
    if (!m) return !/\d/.test(item); // "Pelas alças de trás", "fazer": só modificam
    const a = kindOf(m[2]);
    if (!a) return false;
    const next = item.match(NEXT_N_RE);
    const n = m[1] ? +m[1] : next ? +next[1] : 1;
    nodes.push({ k: 'st', a, n, fill: EACH_RE.test(item) });
    return true;
  };
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '(') {
      let depth = 1, j = i + 1;
      while (j < s.length && depth) { if (s[j] === '(') depth++; if (s[j] === ')') depth--; j++; }
      if (depth) return null;
      if (!flush()) return null;
      const items = parse(s.slice(i + 1, j - 1));
      if (!items) return null;
      const r = s.slice(j).match(REP_RE);
      nodes.push({ k: 'grp', items, times: r ? +(r[1] ?? r[2] ?? r[3]) : null });
      i = j + (r ? r[0].length : 0);
      // Sobra depois do grupo ("repita por toda a carreira") não muda a contagem.
      const rest = s.slice(i).match(/^[^,(]*/)![0];
      if (!STITCH_RE.test(rest)) i += rest.length;
      continue;
    }
    if (c === ',' || c === ';') { if (!flush()) return null; i++; continue; }
    const and = s.slice(i).match(/^\s+(?:e|and)\s+/i);
    if (and && buf.trim()) { if (!flush()) return null; i += and[0].length; continue; }
    buf += c;
    i++;
  }
  return flush() ? nodes : null;
}

/** Quantos passos no contador: o aumento são 2 pontos no mesmo lugar. */
const size = (n: Node): number => n.k === 'st' ? n.n * (n.a === 'aum' ? 2 : 1) : n.items.reduce((t, x) => t + size(x), 0) * (n.times ?? 1);
const hasChain = (n: Node): boolean => n.k === 'st' ? n.a === 'corr' : n.items.some(hasChain);
/** Grupo sem número de vezes, ou "pb em cada ponto": repete até completar o total. */
const isFill = (n: Node) => (n.k === 'grp' && n.times === null) || (n.k === 'st' && n.fill);

function partOf(a: string, k: number, ring: boolean) {
  if (a === 'aum') return k === 0 ? '1º ponto do aumento' : '2º ponto, no mesmo lugar';
  if (a === 'dim') return 'junte 2 pontos em 1';
  if (a === '?') return 'siga a instrução da carreira';
  return ring ? 'dentro do anel mágico' : 'no próximo ponto';
}

/**
 * Sequência de pontos da carreira. Se a receita é complicada demais (correntes no meio, pontos
 * que não batem com o total), devolve só o total, sem dizer qual ponto. Sem total e sem como
 * calcular, devolve null: o contador conta livre.
 */
export function stitchSequence(raw: string): Sequence | null {
  let s = raw.trim();
  const lm = parseLabel(s);
  if (lm) s = lm.rest;
  const tm = s.match(TOTAL_RE);
  let total: number | null = null;
  if (tm) { total = +(tm[1] ?? tm[2] ?? tm[3]); s = s.slice(0, tm.index); }
  s = s.replace(/\*([^*]+)\*/g, '($1)').replace(/\[([^\]]+)\]/g, '($1)')
    // Abreviações com ponto: "p.b." vira pb, "p.b.x"/"p.bx." vira pbx, "a.m." vira AM.
    .replace(/(?<![a-zà-ü])p\.\s?b\.?\s?x\.?|(?<![a-zà-ü])p\.\s?bx\.?/gi, 'pbx ').replace(/(?<![a-zà-ü])p\.\s?b\./gi, 'pb ')
    .replace(/(?<![a-zà-ü])a\.\s?m\./gi, 'AM ');

  const ring = /anel mágico|magic ring|\bAM\b|\bMR\b|a\.\s?m\./i.test(raw);
  const loop = /alças? de trás|\bblo\b|back loops?/i.test(raw) ? ' (só na alça de trás)'
    : /alças? da frente|\bflo\b|front loops?/i.test(raw) ? ' (só na alça da frente)' : '';
  const generic = (n: number): Sequence => ({ st: Array.from({ length: n }, () => ({ a: '?', rep: -1, part: partOf('?', 0, false) })), times: 1 });

  const nodes = parse(s);
  // "1 corr." no começo é a corrente de subida: não conta como ponto.
  while (nodes?.[0]?.k === 'st' && nodes[0].a === 'corr') nodes.shift();
  if (!nodes || !nodes.length || nodes.some(hasChain)) return total ? generic(total) : null;

  // Completa a repetição sem número de vezes até chegar ao total.
  const fills = nodes.filter(isFill);
  if (fills.length > 1) return total ? generic(total) : null;
  if (fills.length === 1) {
    const f = fills[0];
    const unit = f.k === 'grp' ? f.items.reduce((t, x) => t + size(x), 0) : size({ ...f, n: 1 });
    const others = nodes.filter(n => n !== f).reduce((t, n) => t + size(n), 0);
    if (!total || unit === 0 || (total - others) % unit !== 0 || total - others <= 0) return total ? generic(total) : null;
    const times = (total - others) / unit;
    nodes[nodes.indexOf(f)] = f.k === 'grp' ? { ...f, times } : { k: 'grp', items: [{ ...f, n: 1, fill: false }], times };
  }

  const st: Stitch[] = [];
  let times = 1;
  const main = nodes.find((n): n is Extract<Node, { k: 'grp' }> => n.k === 'grp');
  const walk = (list: Node[], rep: number) => list.forEach(n => {
    if (n.k === 'grp') {
      for (let r = 0; r < (n.times ?? 1); r++) walk(n.items, n === main ? r : rep);
      return;
    }
    for (let k = 0; k < n.n; k++) {
      const steps = n.a === 'aum' ? 2 : 1;
      for (let j = 0; j < steps; j++) st.push({ a: n.a, rep, part: partOf(n.a, j, ring && n.a === 'pb') + loop });
    }
  });
  walk(nodes, -1);
  if (main) times = main.times ?? 1;

  if (total !== null && st.length !== total) return generic(total);
  return { st, times };
}

/** Carreira explicada em texto corrido: só dá para saber o total quando a receita diz ("Total de 10 pa."). */
export function bodySequence(body: string[]): Sequence | null {
  const m = body.join(' ').match(/total\s+de\s+(\d+)/i);
  if (!m) return null;
  return { st: Array.from({ length: +m[1] }, () => ({ a: '?', rep: -1, part: partOf('?', 0, false) })), times: 1 };
}
