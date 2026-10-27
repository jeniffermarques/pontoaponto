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

## Leitura de foto e PDF (OCR)

Tudo acontece no navegador, sem servidor e sem chave de API (`src/lib/ocr.ts`):

- **Foto:** [tesseract.js](https://github.com/naptha/tesseract.js) com português + inglês (modo LSTM). A imagem é virada conforme a câmera e reduzida para no máximo 2400px.
- **PDF com texto:** o [pdf.js](https://github.com/mozilla/pdf.js) extrai o texto direto, na hora.
- **PDF escaneado:** se o PDF quase não tem texto, cada página (até 10) é desenhada e passa pelo OCR.

O motor do OCR e os idiomas vêm dos pacotes npm e são copiados para `public/ocr/` por `scripts/copy-ocr-assets.mjs` (roda sozinho antes de `dev` e `build`). Assim o app não depende de CDN. A primeira leitura baixa cerca de 8 MB, e o navegador guarda esses arquivos para as próximas.

## Ainda não implementado

Reconhecer os símbolos numa foto de gráfico. O botão "Enviar foto do gráfico" ainda mostra o gráfico de exemplo (`TODO` em `src/state.tsx`).
