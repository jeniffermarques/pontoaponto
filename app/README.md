# Ponto a Ponto

Contador de pontos e tradutor de receitas e gráficos de crochê para iniciantes. Implementa o design `project/Ponto a Ponto.dc.html` (opção A · Algodão).

```sh
npm install
npm run dev      # servidor local
npm test         # testes do tradutor e do contador
npm run build
```

- Até 768px de largura: layout de celular (abas embaixo, detalhes dos pontos num painel que sobe).
- Acima disso: layout de computador (barra lateral, cartão flutuante, barra de espaço conta no contador).
- A volta e a contagem ficam salvas no `localStorage`.

## Estrutura

- `src/lib/data.ts`: glossário, receita do projeto, gráfico de exemplo e cores.
- `src/lib/translate.ts`: tradução linha a linha (`translateLine`) e sequência de pontos da volta (`parseSequence`).
- `src/state.tsx`: estado do app.
- `src/screens/`: Início, Contador, Traduzir, Gráfico e Glossário.

## Ainda não implementado

Ler foto ou PDF de receita e reconhecer foto de gráfico precisam de OCR / IA com visão. Por enquanto esses botões carregam o exemplo, como no protótipo (procure os `TODO` em `src/state.tsx`).
