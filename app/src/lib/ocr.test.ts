import { describe, expect, it } from 'vitest';
import { cleanText, itemsToLines } from './ocr';

const item = (str: string, x: number, y: number, w = str.length * 6, eol = false) => ({ str, x, y, w, h: 12, eol });

describe('itemsToLines', () => {
  it('junta pedaços da mesma linha e quebra quando muda a altura', () => {
    expect(itemsToLines([
      item('Rnd 1:', 0, 700), item('6 sc in magic ring (6)', 40, 700),
      item('Rnd 2: inc in each st around (12)', 0, 680),
    ])).toBe('Rnd 1: 6 sc in magic ring (6)\nRnd 2: inc in each st around (12)');
  });

  it('respeita o fim de linha marcado no PDF', () => {
    expect(itemsToLines([
      item('V1: 6 pb no AM (6)', 0, 700, 100, true),
      item('V2: 6 aum (12)', 0, 700),
    ])).toBe('V1: 6 pb no AM (6)\nV2: 6 aum (12)');
    expect(itemsToLines([item('V1', 0, 700), item('', 0, 700, 0, true), item('V2', 0, 700)])).toBe('V1\nV2');
  });

  it('não põe espaço entre pedaços colados', () => {
    expect(itemsToLines([item('a', 0, 700, 6), item('um', 6, 700)])).toBe('aum');
  });
});

describe('cleanText', () => {
  it('arruma espaços, linhas vazias e o sinal de vezes', () => {
    expect(cleanText('  Rnd 3:  *sc,\tinc* × 6 (18) \r\n\r\n Fasten off ')).toBe('Rnd 3: *sc, inc* x6 (18)\nFasten off');
  });
});
