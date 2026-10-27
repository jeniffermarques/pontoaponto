# Ponto a Ponto

Contador de pontos e tradutor de receitas e gráficos de crochê, feito para **quem está começando**.

Quem começa no crochê costuma travar em três coisas: entender as abreviações (pb, aum, AM), ler receitas em inglês (sc, inc, MR) e não perder a conta dos pontos. O Ponto a Ponto resolve isso numa tela só, em português, com explicações pensadas para iniciantes.

Funciona no celular e no computador, direto no navegador.

## O que o app faz

**Início:** cole uma receita para traduzir na hora e continue o projeto de onde parou.

**Contador ligado à receita**
- Um botão grande soma +1 a cada ponto (no computador, a barra de espaço também conta).
- Mostra o ponto de agora e o próximo, por exemplo "aumento: 2º ponto, no mesmo lugar", e em qual repetição você está.
- Uma fileira de bolinhas, uma por ponto da volta, mostra o caminho: azul é ponto baixo, rosa é aumento e roxo é diminuição.
- Avisa quando a volta está completa e passa para a próxima.
- Guarda a volta e a contagem: se fechar o app, você volta exatamente de onde parou.

**Tradutor de receitas**
- Entende receitas **em inglês** (`Rnd 1: 6 sc in magic ring (6)`) e **com abreviações em português** (`1ª carr.: *1 pb, 1 aum* = 9 pb`).
- Traduz linha por linha enquanto você digita: separa a volta ou carreira, o total de pontos e as repetições, e transforma títulos como "Vaso" ou "Estrela (2)" em títulos.
- As palavras de crochê ficam em rosa: toque nelas para ver como fazer o ponto.
- **Lê foto e PDF** da receita, no próprio aparelho, sem enviar nada para a internet.

**Leitor de gráficos**
- **Square (em voltas):** o gráfico é desenhado pelo app. Toque numa volta para ver o passo a passo, quantos pontos ela tem e quanto cresceu desde a anterior.
- **Pano reto (em carreiras):** cada carreira com o sentido de leitura (→ ou ←) e uma dica.

**Glossário para iniciantes:** cada ponto com símbolo, abreviação em português e inglês, passo a passo numerado, quando usar, o erro mais comum e como aparece na receita. Começa por "nó corrediço, corrente e ponto baixo".

## Como rodar no seu computador

Precisa do [Node.js](https://nodejs.org) (versão LTS) e do [Git](https://git-scm.com).

```sh
git clone https://github.com/jeniffermarques/pontoaponto
cd pontoaponto/app
npm install
npm run dev
```

Abra **http://localhost:5173** no navegador. Para parar, aperte `Ctrl + C` no terminal.

- **No celular:** rode `npm run dev -- --host` e abra no celular o endereço "Network" que aparece no terminal. O celular precisa estar no mesmo Wi-Fi.
- **Para atualizar:** dentro da pasta `pontoaponto`, rode `git pull`.

Outros comandos, dentro de `app/`:

| Comando | O que faz |
|---|---|
| `npm test` | Roda os testes do tradutor, do contador, do OCR e do gráfico |
| `npm run build` | Gera a versão final do site em `app/dist/` |
| `npm run lint` | Procura problemas no código |

## Como funciona por dentro

Feito com **React + TypeScript + Vite**. Não tem servidor: tudo roda no navegador.

| Parte | Onde fica | Como funciona |
|---|---|---|
| Tradutor | `app/src/lib/translate.ts` e `app/src/lib/data.ts` | Um dicionário de crochê (inglês e abreviações brasileiras). Procura primeiro as expressões mais longas e só reconhece palavras inteiras. Entende "Rnd 1", "1ª carr.", "7ª a 10ª carr.", totais como `(18)`, `= 9 pb` e `- 60 sts`, e repetições com `*...*`, `x6` e `repeat 6 times`. Só traduz palavras que não existem em português, para não estragar receitas brasileiras. |
| Contador | `app/src/lib/translate.ts` (`parseSequence`) e `app/src/screens/Contador.tsx` | Transforma `V3: (1 pb, 1 aum) x6 (18)` na sequência de 18 pontos. |
| Foto e PDF | `app/src/lib/ocr.ts` | Fotos passam pelo [tesseract.js](https://github.com/naptha/tesseract.js) (OCR em português e inglês). PDFs com texto são lidos direto pelo [pdf.js](https://github.com/mozilla/pdf.js); PDFs escaneados têm cada página lida por OCR. Os arquivos do OCR vêm do npm e são copiados para `app/public/ocr/` antes de `dev` e `build`, então o app não depende de nenhum CDN. A primeira leitura baixa cerca de 8 MB. |
| Gráfico em voltas | `app/src/lib/square.ts` e `app/src/components/SquareDiagram.tsx` | O square é descrito como dados (o que vai em cada canto e em cada lado). A partir disso o app desenha o gráfico, escreve o passo a passo e conta os pontos. |
| Telas | `app/src/screens/` | Início, Contador, Traduzir, Gráfico e Glossário. Até 768px de largura usa o layout de celular (abas embaixo); acima disso, o de computador (barra lateral). |

## Limitações e próximos passos

- **O tradutor é um dicionário, não um tradutor completo.** As linhas da receita saem bem, mas textos explicativos longos em inglês ficam em parte em inglês.
- **O OCR lê texto impresso**, não letra à mão. Fotos tortas, borradas ou com sombra pioram a leitura, por isso o app pede para conferir o texto.
- **Ler gráficos por foto ainda não funciona.** O botão explica isso. O próximo passo seria usar IA com visão (o Claude), que precisa de um servidor e de uma chave de API com custo por leitura. A IA devolveria os mesmos dados que `app/src/lib/square.ts` já usa.
- **Uma receita só no contador** (o ursinho de exemplo). O próximo passo é poder mandar qualquer receita traduzida ou qualquer gráfico para o contador.

## Origem do design

O visual foi criado no Claude Design. Os arquivos originais estão em:

- `project/`: protótipos em HTML (`Ponto a Ponto.dc.html` é a opção A · Algodão, a usada no app; B e C são alternativas) e `Instrucoes para o Lovable.md`, com a especificação completa de cores, fontes, telas e glossário.
- `chats/`: a conversa em que o design foi criado.

**Cores (opção A · Algodão):** roxo `#7A55D3` como cor principal, azul `#3E6FD8`, azul bebê `#DCEEFB` e rosa `#F4A6C0`. **Fontes:** Fredoka (títulos), Nunito Sans (texto) e JetBrains Mono (receitas).
