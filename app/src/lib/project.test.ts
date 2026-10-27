import { describe, expect, it } from 'vitest';
import { EXAMPLE, buildParts, emptyProgress, isLast, projectPct, step, type Progress } from './project';
import { bodySequence, stitchSequence } from './sequence';
import { translateLine, translateText } from './translate';

import ARVORE from './fixtures/arvore.txt?raw';
import ALMOFADA from './fixtures/almofada.txt?raw';
import CACHECOL from './fixtures/cachecol.txt?raw';

const kinds = (raw: string) => stitchSequence(raw)!.st.map(s => s.a).join(' ');

describe('stitchSequence', () => {
  it('entende as carreiras da receita brasileira', () => {
    expect(kinds('3ª carr.: *1 pb, 1 aum* = 9 pb')).toBe('pb aum aum pb aum aum pb aum aum');
    expect(stitchSequence('3ª carr.: *1 pb, 1 aum* = 9 pb')!.times).toBe(3);
    expect(stitchSequence('2ª carr.: 6 aum = 12 pb')!.st).toHaveLength(12);
    expect(stitchSequence('9ª carr.: *5 pb, 1 dim* = 18 pb')!.st).toHaveLength(18);
    expect(stitchSequence('8ª carr.: *2 pb, 1 dim* = 21 pb')!.st).toHaveLength(21);
    expect(stitchSequence('7ª a 10ª carr.: 30 pb')!.st).toHaveLength(30);
    expect(stitchSequence('1ª carr.: 6 pb dentro do anel mágico')!.st[0].part).toBe('dentro do anel mágico');
    const blo = stitchSequence('6ª carr.: Pelas alças de trás, fazer 12 pb')!;
    expect(blo.st).toHaveLength(12);
    expect(blo.st[0].part).toBe('no próximo ponto (só na alça de trás)');
    expect(stitchSequence('V4: 1 pb em cada pt (18)')!.st).toHaveLength(18);
  });

  it('entende receitas em inglês', () => {
    expect(stitchSequence('Rnd 2: inc in each st around (12)')!.st).toHaveLength(12);
    expect(stitchSequence('Rnd 3: *sc, inc* repeat 6 times (18)')!.times).toBe(6);
    expect(kinds('Round 11: (sc2tog, 2 sc) 6 times (18)').split(' ').slice(0, 3)).toEqual(['dim', 'pb', 'pb']);
    expect(stitchSequence('R4: (sc in next 2 sts, inc in next st) x 6 (24)')!.st).toHaveLength(24);
  });

  it('com correntes ou contas que não batem, conta só até o total', () => {
    expect(kinds('Round 1: Ch 3, 11 dc in ring (12)')).toBe(Array(12).fill('?').join(' '));
    expect(stitchSequence('2ª carr.: *1 pb, 3 corr, volte com 1 pbx, 1 mpa e 1 pbx na base*')).toBeNull();
    expect(kinds('V9: 5 pb (6)')).toBe('? ? ? ? ? ?');
  });

  it('a sequência de cada volta do exemplo bate com o total', () => {
    for (const r of EXAMPLE.parts[0].rows) expect(stitchSequence(r.raw)!.st).toHaveLength(translateLine(r.raw)!.total!);
    expect(stitchSequence(EXAMPLE.parts[0].rows[2].raw)!.st.slice(0, 3).map(s => s.part))
      .toEqual(['no próximo ponto', '1º ponto do aumento', '2º ponto, no mesmo lugar']);
  });
});

describe('buildParts', () => {
  const parts = buildParts(ARVORE, 'Peça');

  it('divide a receita em partes e ignora a legenda "0ª carr."', () => {
    expect(parts.map(p => [p.name, p.copies, p.rows.length])).toEqual([
      ['Árvore', 1, 5], ['Vaso', 1, 6], ['Bolinhas amarelas', 6, 2], ['Estrela', 2, 2],
    ]);
  });

  it('separa faixas de carreiras e guarda as instruções no lugar certo', () => {
    const vaso = parts[1];
    expect(vaso.rows.map(r => r.label)).toEqual(['Carreira 1', 'Carreira 2', 'Carreira 3', 'Carreira 4', 'Carreira 5', 'Carreira 6']);
    expect(vaso.intro).toEqual(['Com o fio vermelho']);
    expect(vaso.rows[5].after).toEqual(['Dobrar a borda para fora e costurar.']);
    expect(parts[0].rows[4].after).toEqual(['Arrematar.', 'Nas alças livres da 5ª carr. fazer *1 pbx, 1 aum em mpa, 1 pbx*.', 'Arrematar.']);
  });

  it('receita sem títulos vira uma parte só', () => {
    expect(buildParts('V1: 6 pb no AM (6)\nV2: 6 aum (12)', 'Minha peça').map(p => [p.name, p.rows.length])).toEqual([['Minha peça', 2]]);
  });
});

describe('step', () => {
  const project = { id: 'x', name: 'Árvore', parts: buildParts(ARVORE, 'Peça') };

  it('passa pelas carreiras, pelas peças repetidas e pelas partes', () => {
    let prog = { ...emptyProgress(project), part: 2 };
    prog = step(project, prog, 1);
    expect(prog.spots[2]).toEqual({ copy: 0, row: 1, count: 0 });
    prog = step(project, prog, 1);
    expect(prog.spots[2]).toEqual({ copy: 1, row: 0, count: 0 });
    prog = step(project, prog, -1);
    expect(prog.spots[2]).toEqual({ copy: 0, row: 1, count: 0 });
    prog = { part: 2, spots: prog.spots.map((s, i) => i === 2 ? { copy: 5, row: 1, count: 5 } : s) };
    prog = step(project, prog, 1);
    expect(prog.part).toBe(3);
  });

  it('sabe quando acabou e calcula o progresso', () => {
    const prog = { part: 3, spots: project.parts.map(p => ({ copy: p.copies - 1, row: p.rows.length - 1, count: 0 })) };
    expect(isLast(project, prog)).toBe(true);
    expect(projectPct(project, emptyProgress(project), 6)).toBe(0);
  });
});

describe('receita da almofada (carreiras num parágrafo só)', () => {
  const parts = buildParts(ALMOFADA, 'Almofada');

  it('acha a parte, as 2 peças e as 4 carreiras', () => {
    expect(parts.map(p => [p.name, p.copies, p.rows.map(r => r.label)])).toEqual([
      ['Frente e costas', 2, ['Carreira 1', 'Carreira 2', 'Carreira 3', 'Carreira 4']],
    ]);
    expect(parts[0].intro).toEqual(['com o fio verde, fazer um a.m. Fechar todas as carr. com 1 pbx.']);
    expect(parts[0].rows[3].after[0]).toMatch(/^Cont\. aumentando 6 p\. por carr\./);
  });

  it('conta os pontos de cada carreira sem contar a corrente de subida', () => {
    const rows = parts[0].rows.map(r => stitchSequence(r.raw)!);
    expect(rows.map(r => r.st.length)).toEqual([6, 12, 18, 24]);
    expect(rows[0].st[0].part).toBe('dentro do anel mágico');
    expect(rows[2].st.slice(0, 3).map(x => x.a)).toEqual(['pb', 'aum', 'aum']);
  });

  it('o tradutor mostra cada carreira separada, com as abreviações por extenso', () => {
    const lines = translateText(ALMOFADA).filter(l => l.label);
    expect(lines.map(l => l.plain)).toEqual([
      'Carreira 1: 1 corrente, 6 pontos baixos no anel mágico.',
      'Carreira 2: 1 corrente, 6 aumentos.',
      'Carreira 3: Trocar para a cor bege e fazer: 1 corrente, (1 ponto baixo, 1 aumento) repita por toda a carreira',
      'Carreira 4: Trocar para a cor branca e fazer: 1 corrente (2 pontos baixos, 1 aumento) repita por toda a carreira',
    ]);
  });
});

describe('receita do cachecol (carreira explicada em várias linhas)', () => {
  const parts = buildParts(CACHECOL, 'Cachecol');

  it('acha o square, as 6 peças e as 4 carreiras', () => {
    expect(parts.map(p => [p.name, p.copies, p.rows.length])).toEqual([['Square', 6, 4]]);
  });

  it('guarda as linhas de cada carreira e a montagem no fim', () => {
    const [r1, , r3] = parts[0].rows;
    expect(r1.body).toEqual([
      'Com o fio azul, faça um AM.',
      'Suba 3 corr. (valem como o primeiro pa.) e trab. mais 11 pa. dentro do anel.',
      'Total de 12 pa..',
      'Feche a carr. com 1 p.bx.',
    ]);
    expect(r3.body!.at(-1)).toBe('Rem. o fio.');
    const last = parts[0].rows[3];
    expect(last.body).toEqual([
      'Com o fio branco, suba 1 corr. e faça 1 pb. no mesmo p.',
      'Siga com 1 pb. em cada p., fazendo 3 pb. no mesmo p. nos quatro cantos.',
      'Feche com 1 p.bx.',
    ]);
    expect(last.after.slice(0, 2)).toEqual(['Montagem', 'Coloque os 6 squares lado a lado, formando uma faixa.']);
    expect(last.after).toContain('Acabamento');
  });

  it('usa o total escrito na receita', () => {
    expect(bodySequence(parts[0].rows[0].body!)!.st).toHaveLength(12);
    expect(bodySequence(parts[0].rows[1].body!)).toBeNull();
  });

  it('expande as abreviações com ponto', () => {
    expect(translateLine('Suba 3 corr. (valem como o primeiro pa.) e trab. mais 11 pa. dentro do anel.')!.plain)
      .toBe('Suba 3 correntes (valem como o primeiro ponto alto) e trabalhe mais 11 pontos altos dentro do anel.');
    expect(translateLine('Feche a carr. com 1 p.bx.')!.plain).toBe('Feche a carreira com 1 ponto baixíssimo.');
  });
});

describe('fim do projeto', () => {
  it('passa para a próxima parte e, no fim, marca como concluído', () => {
    const project = { id: 'a', name: 'Árvore', parts: buildParts(ARVORE, 'Peça') };
    let prog: Progress = { part: 3, spots: project.parts.map(p => ({ copy: p.copies - 1, row: p.rows.length - 1, count: 0 })) };
    prog = step(project, prog, 1);
    expect(prog.finished).toBe(true);
    expect(projectPct(project, prog, null)).toBe(100);
    prog = step(project, prog, -1);
    expect(prog.finished).toBe(false);
    expect(prog.part).toBe(3);
  });
});
