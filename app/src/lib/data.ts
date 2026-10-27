export type CatId = 'inicio' | 'basicos' | 'forma' | 'receita';

export interface Term {
  /** Abreviação em português; também serve de id. */
  ab: string;
  en: string;
  pt: string;
  sym: string;
  desc: string;
}

/** Termo reconhecido pelo tradutor. */
export interface TranslatableTerm extends Term {
  keys: string[];
  pl: string;
}

export interface Detail {
  cat: CatId;
  steps: string[];
  use: string;
  tip: string;
  ex: string;
}

export const TERMS: TranslatableTerm[] = [
  { keys: ['corrente', 'corr', 'ch'], pt: 'corrente', pl: 'correntes', ab: 'corr', en: 'ch', sym: '○', desc: 'Faça uma laçada e puxe pela alça que está na agulha. É a base de quase toda receita.' },
  { keys: ['ponto baixíssimo', 'sl st', 'slst', 'pbx'], pt: 'ponto baixíssimo', pl: 'pontos baixíssimos', ab: 'pbx', en: 'sl st', sym: '•', desc: 'Insira a agulha no ponto, faça uma laçada e puxe direto pelo ponto e pela alça da agulha. Usado para fechar voltas.' },
  { keys: ['ponto baixo', 'sc', 'pb'], pt: 'ponto baixo', pl: 'pontos baixos', ab: 'pb', en: 'sc', sym: '×', desc: 'Insira a agulha no ponto e puxe uma laçada (ficam 2 alças). Faça outra laçada e passe pelas 2 alças.' },
  { keys: ['meio ponto alto', 'hdc', 'mpa'], pt: 'meio ponto alto', pl: 'meios pontos altos', ab: 'mpa', en: 'hdc', sym: 'T', desc: 'Faça 1 laçada, insira no ponto e puxe (ficam 3 alças). Faça outra laçada e passe pelas 3 de uma vez.' },
  { keys: ['ponto alto duplo', 'tr', 'pad'], pt: 'ponto alto duplo', pl: 'pontos altos duplos', ab: 'pad', en: 'tr', sym: '‡', desc: 'Faça 2 laçadas, insira no ponto e puxe. Depois feche de 2 em 2 alças, três vezes.' },
  { keys: ['ponto alto', 'dc', 'pa'], pt: 'ponto alto', pl: 'pontos altos', ab: 'pa', en: 'dc', sym: 'Ŧ', desc: 'Faça 1 laçada, insira no ponto e puxe (3 alças). Laçada e passe por 2. Laçada e passe pelas 2 últimas.' },
  { keys: ['aumento', 'inc', 'aum'], pt: 'aumento', pl: 'aumentos', ab: 'aum', en: 'inc', sym: 'V', desc: 'Faça 2 pontos baixos no mesmo ponto. A peça ganha 1 ponto.' },
  { keys: ['diminuição', 'dec', 'dim'], pt: 'diminuição', pl: 'diminuições', ab: 'dim', en: 'dec', sym: 'Λ', desc: 'Junte 2 pontos em 1: puxe uma laçada no 1º ponto, outra no 2º, e feche tudo junto. A peça perde 1 ponto.' },
  { keys: ['anel mágico', 'magic ring', 'mr', 'am'], pt: 'anel mágico', pl: 'anel mágico', ab: 'AM', en: 'MR', sym: '◎', desc: 'Um círculo de fio ajustável onde você faz os primeiros pontos. No final, puxe a ponta e ele fecha sem deixar furo.' },
  { keys: ['laçada', 'yo'], pt: 'laçada', pl: 'laçadas', ab: 'laç', en: 'yo', sym: '', desc: 'Passe o fio por cima da agulha, de trás para a frente.' },
  { keys: ['blo'], pt: 'só na alça de trás', pl: 'só na alça de trás', ab: 'alça tr.', en: 'BLO', sym: '', desc: 'Em vez de pegar as 2 alças do ponto, pegue só a de trás. Cria uma linha marcada na peça.' },
  { keys: ['flo'], pt: 'só na alça da frente', pl: 'só na alça da frente', ab: 'alça fr.', en: 'FLO', sym: '', desc: 'Pegue só a alça da frente do ponto, a que está mais perto de você.' },
];

/** Entradas do glossário que o tradutor não destaca. */
export const EXTRA: Term[] = [
  { pt: 'nó corrediço', ab: 'nó', en: 'slip knot', sym: '∞', desc: 'Um nó com alça ajustável que prende o fio na agulha. Todo trabalho começa com ele.' },
  { pt: 'volta', ab: 'V', en: 'Rnd', sym: '↻', desc: 'Quando o trabalho é em círculo (como amigurumi). Você não vira a peça, só continua girando.' },
  { pt: 'carreira', ab: 'carr', en: 'Row', sym: '⇄', desc: 'Quando o trabalho é reto, de um lado ao outro. No fim de cada carreira, você vira a peça.' },
];

export const PHRASES: [string | RegExp, string | ((m: RegExpExecArray) => string), number?][] = [
  ['in each st around', 'em cada ponto da volta'], ['in each stitch around', 'em cada ponto da volta'], ['in each st', 'em cada ponto'],
  ['in next st', 'no próximo ponto'], ['in same st', 'no mesmo ponto'], ['fasten off', 'arremate'], ['leave a long tail', 'deixe uma ponta longa'],
  [/repeat\s+(\d+)\s+times/, r => 'repita ' + r[1] + ' vezes', 14], [/x\s*(\d+)/, r => 'repita ' + r[1] + ' vezes', 2],
  ['repeat', 'repita'], ['times', 'vezes'], ['around', 'na volta toda'], ['stitches', 'pontos'], ['stitch', 'ponto'], ['each', 'cada'], ['turn', 'vire o trabalho'],
  ['stuff', 'encha com fibra'], ['join', 'una'], ['with', 'com'], ['and', 'e'], ['next', 'próximo'], ['into', 'em'], ['in', 'no'], ['sts', 'pontos'], ['st', 'ponto'], ['pts', 'pontos'], ['pt', 'ponto'],
];

export const DETAILS: Record<string, Detail> = {
  'nó': { cat: 'inicio', steps: ['Faça um laço com o fio, deixando a ponta solta por baixo.', 'Puxe o fio que vem do novelo por dentro do laço, formando uma alça.', 'Coloque a alça na agulha e puxe a ponta para ajustar, sem apertar demais.'], use: 'É sempre o primeiro passo, antes da primeira corrente.', tip: 'O nó corrediço não conta como ponto.', ex: 'Normalmente não aparece. A receita já começa nas correntes.' },
  'corr': { cat: 'inicio', steps: ['Comece com um nó corrediço na agulha.', 'Passe o fio por cima da agulha (laçada).', 'Puxe essa laçada por dentro da alça que já está na agulha.', 'Pronto: 1 corrente. Repita para fazer mais.'], use: 'Na base de trabalhos retos e para subir de altura no começo de cada carreira.', tip: 'Correntes muito apertadas dificultam a carreira seguinte. Deixe-as soltinhas.', ex: '12 corr  ·  ch 12' },
  'AM': { cat: 'inicio', steps: ['Enrole o fio em volta de 2 dedos, formando um círculo.', 'Insira a agulha no círculo, pegue o fio e puxe uma alça.', 'Faça 1 corrente para firmar (ela não conta como ponto).', 'Faça os pontos pedidos por dentro do círculo, cobrindo as 2 linhas.', 'Puxe a ponta solta do fio para fechar o círculo.'], use: 'No começo de peças redondas, como amigurumi, gorros e mandalas.', tip: 'Só puxe a ponta para fechar depois de fazer todos os pontos da 1ª volta.', ex: '6 pb no AM  ·  6 sc in magic ring' },
  'laç': { cat: 'inicio', steps: ['Segure a agulha com o gancho virado para baixo.', 'Passe o fio por cima da agulha, de trás para a frente.'], use: 'Faz parte de quase todos os pontos. Quando a receita diz "laçada", é só esse movimento.', tip: 'O fio passa sempre de trás para a frente. Ao contrário, o ponto fica torcido.', ex: 'laç  ·  yo' },
  'pbx': { cat: 'basicos', steps: ['Insira a agulha no ponto.', 'Faça uma laçada.', 'Puxe a laçada pelo ponto e pela alça da agulha, tudo de uma vez.'], use: 'Para fechar uma volta (unir o último ponto ao primeiro) ou para andar sem ganhar altura.', tip: 'É o ponto mais baixo de todos. Não faça laçada antes de inserir a agulha.', ex: 'feche com pbx  ·  join with sl st' },
  'pb': { cat: 'basicos', steps: ['Insira a agulha no ponto, por baixo das 2 alças.', 'Faça uma laçada e puxe. Agora há 2 alças na agulha.', 'Faça outra laçada.', 'Passe pelas 2 alças de uma vez.'], use: 'É o ponto mais usado em amigurumi. Forma um tecido firme e fechado.', tip: 'Conte as alças: depois de puxar a primeira laçada, tem que haver 2.', ex: '6 pb  ·  6 sc' },
  'mpa': { cat: 'basicos', steps: ['Faça 1 laçada antes de inserir a agulha.', 'Insira no ponto, faça laçada e puxe. Agora há 3 alças.', 'Faça uma laçada e passe pelas 3 alças de uma vez.'], use: 'Fica entre o ponto baixo e o ponto alto. Bom para gorros e mantas.', tip: 'A diferença para o ponto alto: aqui você fecha as 3 alças juntas.', ex: '10 mpa  ·  10 hdc' },
  'pa': { cat: 'basicos', steps: ['Faça 1 laçada antes de inserir a agulha.', 'Insira no ponto, faça laçada e puxe. Agora há 3 alças.', 'Laçada e passe por 2 alças (sobram 2).', 'Laçada e passe pelas 2 últimas.'], use: 'Ponto alto e mais aberto, cresce rápido. Comum em mantas, xales e squares.', tip: 'No começo da carreira, 3 correntes costumam contar como o 1º ponto alto.', ex: '11 pa  ·  11 dc' },
  'pad': { cat: 'basicos', steps: ['Faça 2 laçadas antes de inserir a agulha.', 'Insira no ponto, laçada e puxe. Agora há 4 alças.', 'Laçada e passe por 2. Repita mais 2 vezes, até sobrar 1 alça.'], use: 'Ponto bem alto, usado em rendas e acabamentos.', tip: 'Feche sempre de 2 em 2 alças, três vezes.', ex: '5 pad  ·  5 tr' },
  'aum': { cat: 'forma', steps: ['Faça 1 ponto baixo normalmente.', 'No mesmo ponto onde acabou de trabalhar, faça outro ponto baixo.', 'Agora há 2 pontos onde antes havia 1.'], use: 'Para a peça crescer, como no começo de uma bolinha de amigurumi.', tip: 'Cada aumento soma 1 ponto ao total. Confira o número entre parênteses no fim da volta.', ex: '6 aum  ·  inc x6' },
  'dim': { cat: 'forma', steps: ['Insira a agulha no 1º ponto, faça laçada e puxe (2 alças).', 'Insira no 2º ponto, faça laçada e puxe (3 alças).', 'Faça laçada e passe pelas 3 alças de uma vez.'], use: 'Para a peça diminuir, como para fechar o fim de uma bolinha.', tip: 'Cada diminuição tira 1 ponto do total. Em amigurumi, a "diminuição invisível" pega só a alça da frente dos 2 pontos.', ex: '6 dim  ·  dec x6' },
  'alça tr.': { cat: 'receita', steps: ['Olhe o topo do ponto: ele tem 2 alças, uma na frente e uma atrás.', 'Insira a agulha só na alça de trás, a mais longe de você.', 'Faça o ponto pedido normalmente.'], use: 'Cria uma linha em relevo. Muito usado na base de sapatinhos e cestos.', tip: 'Faça a volta inteira desse jeito, a menos que a receita diga outra coisa.', ex: 'pb só na alça de trás  ·  sc in BLO' },
  'alça fr.': { cat: 'receita', steps: ['Olhe o topo do ponto e encontre as 2 alças.', 'Insira a agulha só na alça da frente, a mais perto de você.', 'Faça o ponto pedido normalmente.'], use: 'Deixa a alça de trás livre para trabalhar depois, como em babados.', tip: 'Não confunda com a alça de trás: a da frente é a que fica voltada para você.', ex: 'pb só na alça da frente  ·  sc in FLO' },
  'V': { cat: 'receita', steps: ['Faça os pontos da volta em círculo.', 'No fim, não vire a peça: siga direto para a próxima volta.', 'Coloque um marcador no 1º ponto para saber onde cada volta começa.'], use: 'Em peças redondas: amigurumi, gorros, mandalas.', tip: 'Sem marcador é fácil perder a conta. Um clipe ou fio de outra cor serve.', ex: 'V1, V2…  ·  Rnd 1, Rnd 2…' },
  'carr': { cat: 'receita', steps: ['Faça os pontos de um lado ao outro.', 'No fim, vire a peça.', 'Faça as correntes para subir e comece a próxima carreira.'], use: 'Em peças retas: cachecóis, mantas, panos.', tip: 'Conte os pontos no fim de cada carreira. Se a peça entortar, algum ponto sumiu ou sobrou.', ex: 'Carr 1  ·  Row 1' },
};

export const CATS: [CatId, string][] = [['inicio', 'Para começar'], ['basicos', 'Pontos básicos'], ['forma', 'Aumentar e diminuir'], ['receita', 'Termos da receita']];
const CAT_LABEL = Object.fromEntries(CATS) as Record<CatId, string>;

export const ALL_TERMS: Term[] = [...TERMS, ...EXTRA];
export const termByAb = (ab: string | null) => (ab ? ALL_TERMS.find(t => t.ab === ab) : undefined);

export interface GlossEntry extends Term, Partial<Detail> {
  symShow: string;
  hasSym: boolean;
  abbrLine: string;
  catLabel: string;
  stepList: { n: number; x: string }[];
}

export function deco(t: Term): GlossEntry {
  const d = DETAILS[t.ab];
  return {
    ...t, ...d,
    symShow: t.sym || t.ab,
    hasSym: !!t.sym,
    abbrLine: 'PT: ' + t.ab + '  ·  EN: ' + t.en,
    catLabel: d ? CAT_LABEL[d.cat] : '',
    stepList: (d?.steps || []).map((x, i) => ({ n: i + 1, x })),
  };
}

export const SAMPLE_EN = 'Rnd 1: 6 sc in magic ring (6)\nRnd 2: inc in each st around (12)\nRnd 3: *sc, inc* repeat 6 times (18)\nRnd 4: *2 sc, inc* x6 (24)\nRnd 5-8: sc in each st around (24)\nRnd 9: *2 sc, dec* x6 (18)\nFasten off, leave a long tail.';
export const SAMPLE_PT = 'V1: 6 pb no AM (6)\nV2: 6 aum (12)\nV3: (1 pb, 1 aum) x6 (18)\nV4: 1 pb em cada pt (18)\nV5: (1 pb, 1 dim) x6 (12)\nFeche com pbx e arremate.';

export const PROJECT = {
  name: 'Ursinho amigurumi · cabeça',
  short: 'Ursinho · cabeça',
  rows: ['V1: 6 pb no AM (6)', 'V2: 6 aum (12)', 'V3: (1 pb, 1 aum) x6 (18)', 'V4: (2 pb, 1 aum) x6 (24)', 'V5: (3 pb, 1 aum) x6 (30)', 'V6: 30 pb (30)', 'V7: (3 pb, 1 dim) x6 (24)', 'V8: (2 pb, 1 dim) x6 (18)'],
};

export interface ChartRow {
  label: string;
  short: string;
  text: string;
  syms: string[];
  dir: '→' | '←';
  dirText: string;
  tip: string;
}

const rep = (s: string, n: number) => Array<string>(n).fill(s);
export const CHART: ChartRow[] = [
  { label: 'Base', short: 'B', text: '12 corr', syms: rep('○', 12), dir: '→', dirText: 'Comece aqui', tip: 'Faça 12 correntes. Elas são a base de todo o trabalho.' },
  { label: 'Carreira 1', short: '1', text: '1 corr, 12 pb', syms: ['○', ...rep('×', 12)], dir: '←', dirText: 'Leia da direita para a esquerda', tip: 'A corrente do começo serve só para subir de altura e não conta como ponto.' },
  { label: 'Carreira 2', short: '2', text: 'Vire o trabalho, 3 corr, 11 pa', syms: ['3○', ...rep('Ŧ', 11)], dir: '→', dirText: 'Leia da esquerda para a direita', tip: 'As 3 correntes do começo contam como o 1º ponto alto. Por isso são só mais 11.' },
  { label: 'Carreira 3', short: '3', text: 'Vire o trabalho, 1 corr, 12 pb', syms: ['○', ...rep('×', 12)], dir: '←', dirText: 'Leia da direita para a esquerda', tip: 'Igual à carreira 1: 1 corrente para subir e 12 pontos baixos.' },
  { label: 'Carreira 4', short: '4', text: 'Vire o trabalho, 3 corr, 11 pa', syms: ['3○', ...rep('Ŧ', 11)], dir: '→', dirText: 'Leia da esquerda para a direita', tip: 'Igual à carreira 2. Ao terminar, arremate o fio.' },
];
export const CHART_COLOR: Record<string, string> = { '○': 'var(--pink-ink)', '3○': 'var(--pink-ink)', '×': 'var(--blue)', 'Ŧ': 'var(--primary)' };

export type ScreenId = 'inicio' | 'contador' | 'tradutor' | 'grafico' | 'glossario';
export const NAV: { id: ScreenId; label: string; g: string }[] = [
  { id: 'inicio', label: 'Início', g: '⌂' },
  { id: 'contador', label: 'Contador', g: '+1' },
  { id: 'tradutor', label: 'Traduzir', g: 'Aa' },
  { id: 'grafico', label: 'Gráfico', g: '×' },
  { id: 'glossario', label: 'Glossário', g: '≡' },
];

export type SourceId = 'texto' | 'foto' | 'pdf';
export const SOURCES: { id: SourceId; label: string; labelW: string; g: string }[] = [
  { id: 'texto', label: 'Colar texto', labelW: 'Colar texto', g: 'Aa' },
  { id: 'foto', label: 'Foto', labelW: 'Foto da receita', g: '◉' },
  { id: 'pdf', label: 'PDF', labelW: 'Enviar PDF', g: 'PDF' },
];

export const DOT_COLOR: Record<string, string> = { pb: 'var(--blue)', aum: 'var(--pink-ink)', dim: 'var(--primary)' };
