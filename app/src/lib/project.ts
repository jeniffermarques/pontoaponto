// Projetos do contador: uma receita dividida em partes ("Árvore", "Vaso"), cada parte com suas carreiras.
import { splitRecipe, translateLine } from './translate';

export interface Row {
  /** Linha original da receita. Numa faixa ("7ª a 10ª carr."), todas as carreiras usam a mesma linha. */
  raw: string;
  /** "Carreira 7", "Volta 3". */
  label: string;
  /** Instruções que vêm depois desta carreira, como "Arrematar." */
  after: string[];
  /** Quando a receita escreve "1ª carr." sozinho e explica a carreira nas linhas seguintes. */
  body?: string[];
}

export interface Part {
  name: string;
  /** Quantas peças iguais: "Bolinhas amarelas (6)" são 6. */
  copies: number;
  /** Instruções antes da 1ª carreira, como "Com o fio Amigurumi 5089 (Selva)". */
  intro: string[];
  rows: Row[];
}

export interface Project {
  id: string;
  name: string;
  parts: Part[];
}

/** Onde a pessoa parou em cada parte. */
export interface Spot {
  copy: number;
  row: number;
  count: number;
}

export interface Progress {
  part: number;
  spots: Spot[];
  /** Passou da última carreira da última parte. */
  finished?: boolean;
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** "Carreiras 7 a 10" vira Carreira 7, 8, 9 e 10; "Carreiras 2 e 3" vira 2 e 3. */
function expandLabel(label: string): string[] {
  const m = label.match(/^(\S+?)s (\d+) (a|e) (\d+)$/);
  if (!m) return [label];
  const [, noun, a, sep, b] = m;
  if (sep === 'e') return [`${noun} ${a}`, `${noun} ${b}`];
  const out: string[] = [];
  for (let n = +a; n <= +b && out.length < 200; n++) out.push(`${noun} ${n}`);
  return out;
}

const COPIES_RE = /(?:fazer|faça|faca|make)\s+(\d+)\s+(?:peças|pecas|squares?|partes|unidades|motivos|flores|pieces)\s+(?:iguais|idênticas|identical)?/i;

/**
 * Divide a receita em partes pelos títulos e junta as instruções soltas à carreira de antes
 * (ou ao começo da parte). Carreira 0 é ignorada: costuma ser a legenda de como ler a receita.
 * "Faça 8 squares iguais" vale para a parte seguinte (ou para a atual, se ela ainda não começou).
 */
export function buildParts(text: string, fallbackName: string): Part[] {
  const parts: Part[] = [];
  let part = null as Part | null;
  /** Carreira escrita em várias linhas: as próximas linhas explicam a carreira. */
  let open = null as Row | null;
  let pendingCopies = 0;
  const start = (name: string): Part => {
    const copies = name.match(/\((\d+)\)\s*$/);
    const p: Part = { name: name.replace(/\s*\(\d+\)\s*$/, '').trim(), copies: copies ? Math.max(1, +copies[1]) : 1, intro: [], rows: [] };
    open = null;
    parts.push(p);
    part = p;
    return p;
  };
  for (const raw of splitRecipe(text)) {
    const line = translateLine(raw);
    if (!line) continue;
    if (line.heading) { start(raw); continue; }
    if (line.label) {
      const labels = expandLabel(line.label).filter(l => !/ 0$/.test(l));
      if (!labels.length) continue;
      const p = part ?? start(fallbackName);
      if (!p.rows.length && p.copies === 1 && pendingCopies) { p.copies = pendingCopies; pendingCopies = 0; }
      const onlyLabel = !line.segs.length;
      labels.forEach(label => p.rows.push({ raw, label, after: [], ...(onlyLabel ? { body: [] } : {}) }));
      open = onlyLabel ? p.rows[p.rows.length - 1] : null;
      continue;
    }
    const copies = raw.match(COPIES_RE);
    if (copies) pendingCopies = +copies[1];
    if (open?.body) { open.body.push(raw); continue; }
    const p = part ?? start(fallbackName);
    const last = p.rows[p.rows.length - 1];
    (last ? last.after : p.intro).push(raw);
  }
  // Uma parte sem carreiras (só instruções, como "Montagem") vira instrução da parte anterior.
  const out: Part[] = [];
  for (const p of parts) {
    if (p.rows.length) { out.push(p); continue; }
    const prev = out[out.length - 1];
    if (prev) prev.rows[prev.rows.length - 1].after.push(p.name, ...p.intro);
  }
  return out;
}

export const EXAMPLE: Project = {
  id: 'exemplo-ursinho',
  name: 'Ursinho amigurumi',
  parts: buildParts('Cabeça\nV1: 6 pb no AM (6)\nV2: 6 aum (12)\nV3: (1 pb, 1 aum) x6 (18)\nV4: (2 pb, 1 aum) x6 (24)\nV5: (3 pb, 1 aum) x6 (30)\nV6: 30 pb (30)\nV7: (3 pb, 1 dim) x6 (24)\nV8: (2 pb, 1 dim) x6 (18)', 'Cabeça'),
};

export const emptyProgress = (p: Project): Progress => ({ part: 0, spots: p.parts.map(() => ({ copy: 0, row: 0, count: 0 })) });

/** Carreiras feitas sobre o total do projeto, contando as peças repetidas. */
export function projectPct(p: Project, prog: Progress, meta: number | null) {
  let total = 0, done = 0;
  p.parts.forEach((part, i) => {
    const s = prog.spots[i] ?? { copy: 0, row: 0, count: 0 };
    total += part.rows.length * part.copies;
    done += s.copy * part.rows.length + s.row + (i === prog.part && meta ? Math.min(1, s.count / meta) : 0);
  });
  if (prog.finished) return 100;
  return total ? Math.round((done / total) * 100) : 0;
}

/** Próxima carreira: a próxima da parte, a mesma parte na próxima peça, ou a próxima parte. */
export function step(p: Project, prog: Progress, dir: 1 | -1): Progress {
  const spots = prog.spots.map(s => ({ ...s }));
  let i = prog.part;
  const s = spots[i];
  const rows = p.parts[i].rows.length;
  const copies = p.parts[i].copies;
  if (dir === 1 && isLast(p, prog)) return { ...prog, spots, finished: true };
  if (dir === -1 && prog.finished) return { ...prog, spots, finished: false };
  if (dir === 1) {
    if (s.row < rows - 1) Object.assign(s, { row: s.row + 1, count: 0 });
    else if (s.copy < copies - 1) Object.assign(s, { copy: s.copy + 1, row: 0, count: 0 });
    else if (i < p.parts.length - 1) i++;
  } else {
    if (s.row > 0) Object.assign(s, { row: s.row - 1, count: 0 });
    else if (s.copy > 0) Object.assign(s, { copy: s.copy - 1, row: rows - 1, count: 0 });
    else if (i > 0) i--;
  }
  return { part: i, spots, finished: false };
}

export const isFirst = (prog: Progress) => prog.part === 0 && prog.spots[0].row === 0 && prog.spots[0].copy === 0;
export function isLast(p: Project, prog: Progress) {
  const i = prog.part, s = prog.spots[i], part = p.parts[i];
  return i === p.parts.length - 1 && s.row === part.rows.length - 1 && s.copy === part.copies - 1;
}
