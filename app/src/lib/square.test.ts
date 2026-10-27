import { describe, expect, it } from 'vitest';
import { SQUARE, roundCounts, roundMarks, roundSteps } from './square';

const plain = (segs: { text: string }[]) => segs.map(s => s.text).join('');

describe('square', () => {
  it('conta pontos altos e grupos de cada volta', () => {
    expect(SQUARE.rounds.map(roundCounts)).toEqual([
      { dc: 12, groups: 4 }, { dc: 24, groups: 8 }, { dc: 36, groups: 12 }, { dc: 48, groups: 16 },
    ]);
  });

  it('escreve o passo a passo da volta 1', () => {
    expect(roundSteps(SQUARE.rounds[0]).map(plain)).toEqual([
      'Faça um anel: 5 correntes fechadas com 1 ponto baixíssimo (ou um anel mágico).',
      'Comece: 3 correntes (contam como o 1º ponto alto), 2 pontos altos no anel.',
      'Canto: 2 correntes.',
      'Repita mais 3 vezes: 3 pontos altos no anel e 2 correntes.',
      'Feche com 1 ponto baixíssimo no topo das 3 correntes do início.',
    ]);
  });

  it('escreve o passo a passo da volta 3', () => {
    expect(roundSteps(SQUARE.rounds[2]).map(plain)).toEqual([
      'Comece num canto, no espaço de 2 correntes da volta anterior.',
      'No canto: 3 correntes (contam como o 1º ponto alto), 2 pontos altos, 2 correntes e 3 pontos altos, tudo no mesmo espaço.',
      'No lado: 1 corrente, 3 pontos altos no espaço de 1 corrente e 1 corrente.',
      'Repita mais 3 vezes: no próximo canto, 3 pontos altos, 2 correntes e 3 pontos altos; no lado, 1 corrente, 3 pontos altos no espaço de 1 corrente e 1 corrente.',
      'Feche com 1 ponto baixíssimo no topo das 3 correntes do início.',
    ]);
  });

  it('desenha um símbolo por ponto', () => {
    SQUARE.rounds.forEach((r, i) => {
      const m = roundMarks(r, i);
      const c = roundCounts(r);
      expect(m.filter(x => x.kind === 'dc')).toHaveLength(c.dc);
      expect(m.filter(x => x.kind === 'dc' && x.beg)).toHaveLength(1);
      expect(m.filter(x => x.kind === 'start')).toHaveLength(1);
      const chains = 4 * [...r.corner, ...r.side].filter(t => t.k === 'ch').reduce((a, t) => a + t.n, 0);
      expect(m.filter(x => x.kind === 'ch')).toHaveLength(chains);
    });
  });

  it('cada volta fica fora da anterior', () => {
    SQUARE.rounds.forEach((r, i) => {
      const inner = i === 0 ? 0 : Math.max(...roundMarks(SQUARE.rounds[i - 1], i - 1).map(m => Math.max(Math.abs(m.x), Math.abs(m.y))));
      const min = Math.min(...roundMarks(r, i).map(m => Math.max(Math.abs(m.x), Math.abs(m.y))));
      expect(min).toBeGreaterThan(inner);
    });
  });
});
