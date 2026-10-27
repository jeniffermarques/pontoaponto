// Gráfico em voltas de um square (quadradinho de vovó), descrito como dados.
// A partir dos dados o app escreve o passo a passo, conta os pontos e desenha o gráfico.
// Quando houver leitura de foto por IA, ela só precisa devolver estes mesmos dados.
import { TERMS, type TranslatableTerm } from './data';
import type { Seg } from './translate';

/** Um pedaço da volta: correntes ou um grupo de pontos altos no mesmo lugar. */
export interface Tok {
  k: 'ch' | 'dc';
  n: number;
  /** Onde o grupo entra, ex. "no anel". */
  where?: string;
}

/**
 * Cada volta é feita 4 vezes, uma por lado: o que vai no canto e o que vai no lado.
 * A volta 1 começa no anel, pelo lado; as outras começam num canto.
 */
export interface SquareRound {
  corner: Tok[];
  side: Tok[];
  start: 'anel' | 'canto';
  tip: string;
}

const corner: Tok[] = [{ k: 'dc', n: 3 }, { k: 'ch', n: 2 }, { k: 'dc', n: 3 }];
const gap: Tok = { k: 'ch', n: 1 };
const sideGroup: Tok = { k: 'dc', n: 3, where: 'no espaço de 1 corrente' };

export const SQUARE: { name: string; rounds: SquareRound[] } = {
  name: 'Square (quadradinho de vovó)',
  rounds: [
    { start: 'anel', corner: [{ k: 'ch', n: 2 }], side: [{ k: 'dc', n: 3, where: 'no anel' }],
      tip: 'As 3 correntes do começo contam como o 1º ponto alto. Se usou anel mágico, puxe a ponta para fechar o furo depois de fechar a volta.' },
    { start: 'canto', corner, side: [gap],
      tip: 'Cada canto leva 3 pontos altos, 2 correntes e 3 pontos altos, tudo no mesmo espaço. É isso que faz a peça virar um quadrado.' },
    { start: 'canto', corner, side: [gap, sideGroup, gap],
      tip: 'No meio de cada lado entra um grupo novo, no espaço de 1 corrente da volta anterior.' },
    { start: 'canto', corner, side: [gap, sideGroup, gap, sideGroup, gap],
      tip: 'A cada volta, cada lado ganha 1 grupo. Numa 5ª volta seriam 3 grupos por lado, e assim por diante. Ao terminar, arremate e esconda as pontas.' },
  ],
};

// ---------- contagem ----------

const sum = (toks: Tok[], k: Tok['k']) => toks.filter(t => t.k === k).reduce((a, t) => a + t.n, 0);
const groups = (toks: Tok[]) => toks.filter(t => t.k === 'dc').length;

export function roundCounts(r: SquareRound) {
  const unit = [...r.corner, ...r.side];
  return { dc: 4 * sum(unit, 'dc'), groups: 4 * groups(unit) };
}

// ---------- texto ----------

const term = (ab: string) => TERMS.find(t => t.ab === ab)!;
const T: Record<Tok['k'], TranslatableTerm> = { ch: term('corr'), dc: term('pa') };
const PBX = term('pbx');
const AM = term('AM');

const tokSegs = (t: Tok, replaceFirst = false): Seg[] => {
  const word = (n: number, x: TranslatableTerm): Seg[] => [{ text: n + ' ' }, { term: x, text: n > 1 ? x.pl : x.pt }];
  const where = t.where ? [{ text: ' ' + t.where }] : [];
  if (t.k === 'dc' && replaceFirst) {
    // A primeira coluna da volta é feita com 3 correntes.
    const rest = t.n - 1;
    return [...word(3, T.ch), { text: ' (contam como o 1º ponto alto)' }, ...(rest ? [{ text: ', ' }, ...word(rest, T.dc)] : []), ...where];
  }
  return [...word(t.n, T[t.k]), ...where];
};

/** "a, b e c" com segmentos. */
function list(toks: Tok[], replaceFirst = false): Seg[] {
  const parts = toks.map((t, i) => tokSegs(t, replaceFirst && i === 0));
  return parts.flatMap((p, i) => [...(i === 0 ? [] : [{ text: i === parts.length - 1 ? ' e ' : ', ' }]), ...p]);
}

const text = (s: string): Seg => ({ text: s });
const close: Seg[] = [text('Feche com 1 '), { term: PBX, text: PBX.pt }, text(' no topo das 3 correntes do início.')];

/** Passo a passo da volta, uma linha por passo. */
export function roundSteps(r: SquareRound): Seg[][] {
  if (r.start === 'anel') {
    return [
      [text('Faça um anel: 5 correntes fechadas com 1 '), { term: PBX, text: PBX.pt }, text(' (ou um '), { term: AM, text: AM.pt }, text(').')],
      [text('Comece: '), ...list(r.side, true), text('.')],
      [text('Canto: '), ...list(r.corner), text('.')],
      [text('Repita mais 3 vezes: '), ...list([...r.side, ...r.corner]), text('.')],
      close,
    ];
  }
  return [
    [text('Comece num canto, no espaço de 2 correntes da volta anterior.')],
    [text('No canto: '), ...list(r.corner, true), text(', tudo no mesmo espaço.')],
    [text('No lado: '), ...list(r.side), text('.')],
    [text('Repita mais 3 vezes: no próximo canto, '), ...list(r.corner), text('; no lado, '), ...list(r.side), text('.')],
    close,
  ];
}

// ---------- desenho ----------

export type Mark =
  | { kind: 'dc'; x: number; y: number; angle: number; beg: boolean }
  | { kind: 'ch'; x: number; y: number; angle: number }
  | { kind: 'start'; x: number; y: number; angle: number };

/** Metade do lado do quadrado de cada volta, em unidades do desenho. */
export const roundSize = (r: number) => 14 + (r + 1) * 19;
const GAP = 9;
const FAN = 18;
const LINK = 5.5;

/** Ponto do contorno: t vai de 0 a 4; t = 0, 1, 2, 3 são os cantos (começando em cima à esquerda). */
function at(t: number, h: number) {
  const c = ((Math.floor(t) % 4) + 4) % 4;
  const f = t - Math.floor(t);
  const corners = [[-h, -h], [h, -h], [h, h], [-h, h]];
  const [x0, y0] = corners[c];
  const [x1, y1] = corners[(c + 1) % 4];
  const normals = [-90, 0, 90, 180];
  return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f, side: normals[c] };
}

const rad = (d: number) => (d * Math.PI) / 180;

/** Posições de todos os símbolos de uma volta. */
export function roundMarks(r: SquareRound, index: number): Mark[] {
  const h = roundSize(index);
  const d = GAP / (2 * h);
  const marks: Mark[] = [];
  let first = true;

  const put = (tok: Tok, t: number, cornerAngle?: number) => {
    const p = at(t, h);
    const angle = cornerAngle ?? p.side;
    if (tok.k === 'dc') {
      for (let i = 0; i < tok.n; i++) {
        const fan = (i - (tok.n - 1) / 2) * FAN;
        marks.push({ kind: 'dc', x: p.x, y: p.y, angle: angle + fan, beg: first && i === 0 });
      }
      if (first) marks.push({ kind: 'start', x: p.x, y: p.y, angle });
      first = false;
    } else {
      // Correntes em fila, ao longo do contorno.
      const along = angle + 90;
      for (let i = 0; i < tok.n; i++) {
        const o = (i - (tok.n - 1) / 2) * LINK;
        marks.push({ kind: 'ch', x: p.x + Math.cos(rad(along)) * o, y: p.y + Math.sin(rad(along)) * o, angle: along });
      }
    }
  };

  const cornerHasGroups = r.corner.some(t => t.k === 'dc');
  const startCorner = 1;
  for (let k = 0; k < 4; k++) {
    const c = (startCorner + k) % 4;
    const diag = at(c, h).side - 45;
    if (r.start === 'anel') {
      // Volta 1: grupo no meio do lado, correntes no canto.
      r.side.forEach(t => put(t, c - 0.5));
      r.corner.forEach(t => put(t, c, diag));
      continue;
    }
    // Canto: grupo antes do canto, correntes no canto, grupo depois.
    const [g1, ch, g2] = r.corner;
    put(g1, c - d);
    put(ch, c, diag);
    put(g2, c + d);
    // Lado: espalhado entre os grupos dos cantos.
    const a = c + (cornerHasGroups ? 2 * d : d);
    const b = c + 1 - (cornerHasGroups ? 2 * d : d);
    r.side.forEach((t, i) => put(t, a + ((i + 1) * (b - a)) / (r.side.length + 1)));
  }
  return marks;
}
