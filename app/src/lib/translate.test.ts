import { describe, expect, it } from 'vitest';
import { PROJECT, SAMPLE_EN, SAMPLE_PT } from './data';
import { parseSequence, translateLine, translateText } from './translate';

const plain = (s: string) => translateLine(s)!.plain;

describe('translateLine', () => {
  it('traduz o exemplo em inglês', () => {
    expect(translateText(SAMPLE_EN).map(l => [l.label, l.total, l.plain])).toEqual([
      ['Volta 1', 6, 'Volta 1: 6 pontos baixos no anel mágico'],
      ['Volta 2', 12, 'Volta 2: Aumento em cada ponto da volta'],
      ['Volta 3', 18, 'Volta 3: (ponto baixo, aumento) repita 6 vezes'],
      ['Volta 4', 24, 'Volta 4: (2 pontos baixos, aumento) repita 6 vezes'],
      ['Voltas 5 a 8', 24, 'Voltas 5 a 8: Ponto baixo em cada ponto da volta'],
      ['Volta 9', 18, 'Volta 9: (2 pontos baixos, diminuição) repita 6 vezes'],
      ['', null, 'Arremate, deixe uma ponta longa.'],
    ]);
  });

  it('traduz o exemplo com abreviações', () => {
    expect(translateText(SAMPLE_PT).map(l => l.plain)).toEqual([
      'Volta 1: 6 pontos baixos no anel mágico',
      'Volta 2: 6 aumentos',
      'Volta 3: (1 ponto baixo, 1 aumento) repita 6 vezes',
      'Volta 4: 1 ponto baixo em cada ponto',
      'Volta 5: (1 ponto baixo, 1 diminuição) repita 6 vezes',
      'Feche com ponto baixíssimo e arremate.',
    ]);
  });

  it('traduz receitas reais em inglês', () => {
    const cases: [string, string, number | null][] = [
      ['Materials: worsted weight yarn, 3.5mm hook, stitch marker, polyfill stuffing.', 'Materiais: fio médio (worsted), agulha de 3.5 mm, marcador de ponto, fibra para enchimento.', null],
      ['Round 1: Make a magic ring, 6 sc into the ring. (6 sts)', 'Volta 1: Faça um anel mágico, 6 pontos baixos dentro do anel.', 6],
      ['R4: (sc in next 2 sts, inc in next st) x 6 (24)', 'Volta 4: (ponto baixo nos próximos 2 pontos, aumento no próximo ponto) repita 6 vezes', 24],
      ['Round 11: (sc2tog, 2 sc) 6 times (18)', 'Volta 11: (diminuição, 2 pontos baixos) 6 vezes', 18],
      ['Rnd 12: *sc in next st, invdec* around (12)', 'Volta 12: (ponto baixo no próximo ponto, diminuição) na volta toda', 12],
      ['Start stuffing the head.', 'Comece a encher a cabeça.', null],
      ['Fasten off and weave in ends.', 'Arremate e esconda as pontas.', null],
      ['Ch 21.', '21 correntes.', null],
      ['Row 1: Sc in 2nd ch from hook and in each ch across, turn. (20 sc)', 'Carreira 1: Ponto baixo na 2ª corrente a partir da agulha e em cada corrente até o fim da carreira, vire o trabalho.', 20],
      ['Row 2: Ch 1, sc in BLO of each st across, turn.', 'Carreira 2: 1 corrente, ponto baixo só na alça de trás de cada ponto até o fim da carreira, vire o trabalho.', null],
      ['Row 3: Ch 3 (counts as first dc), dc in each st across, turn. (20 dc)', 'Carreira 3: 3 correntes (conta como primeiro ponto alto), ponto alto em cada ponto até o fim da carreira, vire o trabalho.', 20],
      ['Rows 4-20: Repeat rows 2 and 3.', 'Carreiras 4 a 20: Repita as carreiras 2 e 3.', null],
      ['Join with a sl st to the top of the beginning ch-3.', 'Una com um ponto baixíssimo no topo de 3 correntes do início.', null],
      ['Skip next st, 5 dc in next st, skip next st, sl st in next st.', 'Pule o próximo ponto, 5 pontos altos no próximo ponto, pule o próximo ponto, ponto baixíssimo no próximo ponto.', null],
      ['Do not turn. Work in the round.', 'Não vire o trabalho. Trabalhe em voltas.', null],
      ['Ch 4, join with sl st to form a ring.', '4 correntes, una com ponto baixíssimo para formar um anel.', null],
      ['Sl st into next ch-2 space, (ch 3, 2 dc, ch 2, 3 dc) in same space, ch 1.', 'Ponto baixíssimo no próximo espaço de 2 correntes, (3 correntes, 2 pontos altos, 2 correntes, 3 pontos altos) no mesmo espaço, 1 corrente.', null],
      ['Rnds 2-15: Ch 2, hdc in BLO around, join. - 60 sts', 'Voltas 2 a 15: 2 correntes, meio ponto alto só na alça de trás na volta toda, una.', 60],
      ['Rnd 16: (hdc in next 4 sts, hdc2tog) around = 50', 'Volta 16: (meio ponto alto nos próximos 4 pontos, 2 meios pontos altos fechados juntos) na volta toda', 50],
      ['Cut yarn leaving a 10 inch tail.', 'Corte o fio deixando uma ponta de 25 cm.', null],
    ];
    for (const [en, pt, total] of cases) {
      const l = translateLine(en)!;
      expect(l.plain).toBe(pt);
      expect(l.total).toBe(total);
    }
  });

  it('mantém receitas em português e entende "V4 a V10"', () => {
    expect(plain('Encha a peça com fibra e feche com pbx. Arremate deixando uma ponta para costurar.'))
      .toBe('Encha a peça com fibra e feche com ponto baixíssimo. Arremate deixando uma ponta para costurar.');
    expect(translateLine('V4 a V10: 1 pb em cada ponto (18)')!.label).toBe('Voltas 4 a 10');
    expect(plain('Carr 1: 20 corr, volte e faça 19 pb (19)')).toBe('Carreira 1: 20 correntes, volte e faça 19 pontos baixos');
  });

  it('não reconhece termos no meio de palavras', () => {
    expect(translateLine('para')!.segs.some(s => s.term)).toBe(false);
  });

  it('reconhece carreiras', () => {
    expect(translateLine('Row 2: ch 3, 11 dc')!.label).toBe('Carreira 2');
  });

  it('ignora linhas vazias', () => {
    expect(translateLine('   ')).toBeNull();
    expect(plain('6 sc')).toBe('6 pontos baixos');
  });
});

describe('parseSequence', () => {
  it('expande repetições e aumentos', () => {
    const { st, times } = parseSequence(PROJECT.rows[2]);
    expect(times).toBe(6);
    expect(st).toHaveLength(18);
    expect(st.slice(0, 3).map(s => s.part)).toEqual(['no próximo ponto', '1º ponto do aumento', '2º ponto, no mesmo lugar']);
  });

  it('a sequência de cada volta bate com o total', () => {
    for (const row of PROJECT.rows) expect(parseSequence(row).st).toHaveLength(translateLine(row)!.total!);
  });

  it('usa o anel mágico na primeira volta', () => {
    expect(parseSequence(PROJECT.rows[0]).st[0].part).toBe('dentro do anel mágico');
  });
});
