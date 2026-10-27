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
