import { PHRASES, TERMS, type TranslatableTerm } from './data';

export interface Seg {
  text: string;
  term?: TranslatableTerm;
}

export interface Line {
  raw: string;
  label: string;
  total: number | null;
  /** Linha que só dá nome a uma parte, como "Vaso". */
  heading: boolean;
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

const NOUN = '(rnds?|rounds?|rows?|r|v|vt|voltas?|carr|carreiras?)';
const RANGE = '(?:\\s*(-|–|a|e|and|to|até|through)\\s*';
// "Rnd 1:", "V4 a V10:", "Rows 4-20:"
const LABEL_RE = new RegExp(`^${NOUN}\\.?\\s*(\\d+)${RANGE}(?:[a-z]+\\.?\\s*)?(\\d+))?\\s*[:.)-]?\\s*`, 'i');
// Jeito brasileiro, com o número antes: "1ª carr.:", "7ª a 10ª carr.:", "2ª e 3ª voltas:"
const ORD = '\\s*[ªº°]?';
const LABEL_PT_RE = new RegExp(`^(\\d+)${ORD}${RANGE}(\\d+)${ORD})?\\s*${NOUN}\\.?\\s*[:.)-]?\\s*`, 'i');

export function parseLabel(s: string) {
  let noun: string, a: string, sep: string | undefined, b: string | undefined;
  let m = s.match(LABEL_RE);
  if (m) [, noun, a, sep, b] = m;
  else if ((m = s.match(LABEL_PT_RE))) [, a, sep, b, noun] = m;
  else return null;
  const word = /^(rows?|carr|carreiras?)$/i.test(noun) ? 'Carreira' : 'Volta';
  const label = b ? `${word}s ${a} ${/^(e|and)$/i.test(sep!) ? 'e' : 'a'} ${b}` : `${word} ${a}`;
  return { label, rest: s.slice(m[0].length) };
}

/** Linha que só dá nome a uma parte da receita, como "Vaso" ou "Estrela (2)". */
const isHeading = (s: string) => s.length <= 40 && !/[.:;,!?]$/.test(s) && !s.includes(':') && !/^\d/.test(s) && !/^(com|with|usando|using|use)\b/i.test(s);

// Asteriscos sem dizer quantas vezes: repetir até o fim da volta/carreira.
const REPEAT_HINT = /^\s*(?:[x×]\s*\d|\d+\s*[x×]|rep\b|repeat|repita|repetir|around|across|\d+\s*(?:more\s+)?(?:times|vezes))/i;
const REP_MARK = '\u0001';
const STITCH = /\b(pb|pa|mpa|pbx|pad|corr|aum|dim|am|sc|dc|hdc|tr|ch|inc|dec|sl\s*st|sts?|pts?|mr)\b/i;
// Abreviações que terminam com ponto mas não terminam a frase.
const ABBR_END = /\b(carr|corr|pts?|aum|dim|rnds?|sts?|ch|sc|dc|hdc|tr|nº|ex|aprox)\.\s*$/i;
// Total no fim da linha: "(18)", "(18 sts)", "[18 sc]", "(18 sts total)", "- 18 sts", "= 18".
const UNIT = '(?:sts?|stitches|pts?|pontos|sc|dc|hdc|tr|ch|pb|pa|mpa|corr)';
export const TOTAL_RE = new RegExp(`(?:[([]\\s*(\\d+)\\s*(?:${UNIT}\\.?)?(?:\\s*total)?\\s*[)\\]]|[-–—]\\s*(\\d+)\\s*${UNIT}|=\\s*(\\d+)\\s*${UNIT}?)\\s*\\.?\\s*$`, 'i');

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

  const lm = parseLabel(s);
  if (lm) ({ label, rest: s } = lm);
  const tm = s.match(TOTAL_RE);
  // "(6)" sozinho só é total de pontos numa carreira; em "Bolinhas (6)" é a quantidade de peças.
  if (tm && (label || tm[1] === undefined || STITCH.test(s.slice(0, tm.index)) || /[a-z]/i.test(tm[0].replace(/total/i, '')))) {
    total = +(tm[1] ?? tm[2] ?? tm[3]);
    s = s.slice(0, tm.index).trim();
  }
  s = s.replace(/\*([^*]+)\*/g, (all, _g, at: number, str: string) => REPEAT_HINT.test(str.slice(at + all.length)) ? all : all + REP_MARK);
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
      // "pbx." no fim da frase: o ponto da abreviação também fecha a frase.
      if (r[0].endsWith('.') && /^\s*(?:$|[A-ZÀ-Ú])/.test(s.slice(i))) buf += '.';
    } else {
      buf += s[i];
      i++;
    }
  }
  if (buf) segs.push({ text: buf });
  const whole = label.startsWith('Volta') ? 'por toda a volta' : label ? 'por toda a carreira' : 'até o fim';
  segs = segs.map(g => g.term ? g : { text: g.text.split(REP_MARK).join(' repita ' + whole) });
  segs = tidy(segs);
  // Letra maiúscula no começo da linha e depois de ponto final (mas não depois de "carr.", "pts.").
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  segs = segs.map((g, k) => {
    const text = g.term ? g.text : g.text.replace(/([.!?]\s+)([a-zà-ü])/g, (m, p: string, c: string, at: number, str: string) =>
      ABBR_END.test(str.slice(0, at + 1)) ? m : p + c.toUpperCase());
    const prev = k > 0 ? segs[k - 1].text : '';
    const startsSentence = k === 0 || (/[.!?]\s*$/.test(prev) && !ABBR_END.test(prev));
    return { ...g, text: startsSentence ? cap(text) : text };
  });
  const heading = !label && total === null && !segs.some(g => g.term) && isHeading(s);
  return { raw, label, total, heading, segs, plain: (label ? label + ': ' : '') + segs.map(g => g.text).join('') };
}

const ROW_START = '(?:\\d+\\s*[ªº°]\\s*(?:a\\s+\\d+\\s*[ªº°]\\s*)?(?:carr|carreira|volta|v)\\b\\.?\\s*:|(?:rnd|round|row)s?\\s*\\d+[^:]{0,8}:)';

/**
 * Separa carreiras escritas no mesmo parágrafo ("1ª carr.: … 2ª carr.: …") em linhas próprias.
 * "Frente e costas: com o fio … 1ª carr.: …" vira o título "Frente e costas" e o resto.
 * Depois do total de uma carreira ("(24).") o texto que sobra vai para outra linha.
 */
export function splitRecipe(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    let rest = line.trim();
    const titled = rest.match(new RegExp(`^([^:.\\d]{3,40}):\\s+(.*${ROW_START}.*)$`, 'i'));
    if (titled) { out.push(titled[1].trim()); rest = titled[2]; }
    rest.split(new RegExp(`(?<=[.!?)])\\s+(?=${ROW_START})`, 'i'))
      .flatMap(piece => piece.split(/(?<=\(\d+\)\.?)\s+(?=[A-ZÀ-Ú])/))
      .forEach(piece => out.push(piece));
  }
  return out;
}

export const translateText = (text: string) =>
  splitRecipe(text).map(translateLine).filter((l): l is Line => l !== null);
