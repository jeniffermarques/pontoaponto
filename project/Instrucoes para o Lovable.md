# Ponto a Ponto: instruções para o Lovable

Crie um app web responsivo (funciona no celular e no computador) chamado **Ponto a Ponto**. É um contador de pontos de crochê e um tradutor de receitas e gráficos, feito para **quem está começando**. Todos os textos do app são em português do Brasil, com tom acolhedor e didático.

## 1. Objetivo

Quem começa no crochê tem dificuldade para:
- entender as abreviações (pb, aum, AM) e as receitas em inglês (sc, inc, MR);
- ler gráficos de símbolos;
- não perder a conta dos pontos de cada volta.

O app resolve isso com 5 telas: **Início, Contador, Traduzir, Gráfico e Glossário**.

## 2. Visual

### Cores (opção A, Algodão)
| Uso | Cor |
|---|---|
| Texto principal | `#2B2350` |
| Texto secundário | `#625C84` |
| Fundo do app | `#F7F8FC` |
| Cartões | `#FFFFFF`, com borda `#E6E4F0` |
| Principal (roxo): botões, contador | `#7A55D3` (roxo escuro para texto: `#5B3BB0`) |
| Roxo clarinho: item ativo, fundos | `#EEE8FB` |
| Azul: "próxima volta", ponto baixo | `#3E6FD8` (texto: `#2F5BB8`) |
| Azul bebê: cartões de instrução e avisos | `#DCEEFB` |
| Rosa: destaques, barra de progresso | `#F4A6C0` |
| Rosa clarinho: termos clicáveis, dicas | `#FDE7EF` (texto: `#B23A6E`) |

Opções alternativas, caso eu escolha outra depois:
- **B, Novelo:** o rosa `#C2457B` é a cor principal e o roxo vai para os termos clicáveis. Fonte de títulos **Baloo 2**, cantos mais redondos.
- **C, Céu:** o azul `#3E6FD8` é a cor principal e o roxo vira cor secundária. Fonte de títulos **Quicksand**, cantos mais retos (10 a 12px).

### Tipografia
- Títulos e números grandes: **Fredoka** (500/600)
- Texto: **Nunito Sans** (400/600/700)
- Receitas originais e abreviações: **JetBrains Mono**

### Formas
- Cantos arredondados: cartões 20 a 24px, botões 14 a 16px, chips 8px.
- Botões com no mínimo 44px de altura (alvos de toque grandes).
- Não use emojis nem gradientes.

### Layout responsivo
- **Celular (até 768px):** barra de abas fixa embaixo, com 5 itens: Início (⌂), Contador (+1), Traduzir (Aa), Gráfico (×), Glossário (≡). O item ativo fica com fundo roxo clarinho.
- **Computador:** barra lateral à esquerda (cerca de 236px) com o logo, os 5 itens e, embaixo, um mini cartão do projeto atual com a barra de progresso. O conteúdo fica à direita, em 2 colunas quando fizer sentido.

## 3. Telas

### 3.1 Início
- Saudação "Olá!" e o título "O que vamos crochetar hoje?".
- **Cartão "Traduzir uma receita":** campo de texto com o exemplo `Rnd 1: 6 sc in magic ring (6)` e três botões:
  - **Traduzir:** leva para a tela Traduzir com o texto digitado.
  - **Foto** e **PDF:** levam para a tela Traduzir com essa opção já selecionada.
- **Cartão do projeto atual** (fundo roxo, texto branco): nome do projeto, "Volta X de Y · N de M pontos", barra de progresso e o botão "Continuar contando".
- Atalhos para Traduzir, Gráfico, Glossário e Contador.
- **Cartão "Dica para iniciantes":** "Aumento (aum) é fazer 2 pontos no mesmo lugar. É assim que a peça cresce."

### 3.2 Contador (ligado à receita)
- Um cartão "Como usar o contador", que pode ser fechado no botão "Entendi" e reaberto pelo link "Como funciona o contador?". Ele traz 3 passos:
  1. Leia o que fazer nesta volta.
  2. Faça um ponto e toque no círculo. O app mostra qual é o próximo.
  3. Quando chegar ao total, a volta está completa. Passe para a próxima.
- **Seletor de volta:** botões ‹ e › com "Volta 3 de 8".
- **Cartão "O que fazer nesta volta"** (azul bebê): mostra a linha original da receita em fonte mono e, abaixo, a tradução, com os termos clicáveis em rosa.
- **Cartão "Agora / Depois":**
  - "Agora" mostra o ponto atual (ex.: "aumento") e a explicação (ex.: "2º ponto, no mesmo lugar").
  - "Depois" mostra o próximo ponto e a repetição atual ("repetição 4 de 6").
  - Uma fileira de bolinhas, uma por ponto da volta. Os pontos feitos ficam preenchidos, o atual fica maior e com contorno, e os que faltam ficam cinza. Cores: ponto baixo em azul, aumento em rosa escuro e diminuição em roxo. Mostre uma legenda.
- **Botão grande e redondo** (cerca de 180px no celular e 230px no computador): mostra o número de pontos feitos e "de 18 pontos". Cada toque soma +1 e o celular vibra de leve (`navigator.vibrate(15)`). No computador, a barra de espaço também conta.
  - Quando chegar ao total, o botão fica azul com "Volta completa!", e o toque passa para a próxima volta.
- Barra de progresso da volta (rosa).
- Botões: **−1**, **Zerar** e **Próxima volta ›**.
- No computador, a coluna da direita mostra a "Receita completa": todas as voltas traduzidas, com a atual destacada. Clicar numa volta vai para ela.

**Como montar a sequência de pontos de uma volta:**
- `V3: (1 pb, 1 aum) x6 (18)` vira a unidade [pb, aum] repetida 6 vezes.
- Cada `aum` vira **2 pontos**: "1º ponto do aumento" e depois "2º ponto, no mesmo lugar".
- Cada `dim` vira **1 ponto**: "junte 2 pontos em 1".
- Cada `pb` vira 1 ponto: "no próximo ponto", ou "dentro do anel mágico" quando a linha tem `AM`.
- O total entre parênteses no fim da linha é a meta da volta.

**Receita de exemplo (Ursinho amigurumi, cabeça):**
```
V1: 6 pb no AM (6)
V2: 6 aum (12)
V3: (1 pb, 1 aum) x6 (18)
V4: (2 pb, 1 aum) x6 (24)
V5: (3 pb, 1 aum) x6 (30)
V6: 30 pb (30)
V7: (3 pb, 1 dim) x6 (24)
V8: (2 pb, 1 dim) x6 (18)
```

Salve o projeto, a volta atual e a contagem (localStorage, ou Supabase se houver login). Se a pessoa fechar o app, ela volta exatamente de onde parou.

### 3.3 Traduzir
- Três opções no topo: **Colar texto**, **Foto da receita** e **Enviar PDF**.
  - **Foto e PDF:** a pessoa envia o arquivo e o app extrai o texto com OCR. Sugestão: uma Edge Function do Supabase chamando um modelo de IA com visão. O texto extraído vai para o campo de texto, com o aviso: "Lemos a foto. Confira se o texto está igual à receita."
- **Botões de exemplo:** "Exemplo em inglês", "Com abreviações" e "Limpar".
- A tradução acontece **enquanto a pessoa digita**, linha por linha. Cada linha vira um cartão com:
  - um chip com o rótulo (`Rnd 1` vira "Volta 1", `Row 2` vira "Carreira 2", `Rnd 5-8` vira "Voltas 5 a 8", `V3` vira "Volta 3");
  - um chip com o total, por exemplo "total: 18 pontos", tirado do `(18)` no fim da linha;
  - a frase traduzida, com os termos de crochê destacados em rosa. Tocar num termo abre os detalhes dele (seção 4);
  - a linha original em fonte mono, pequena.
- No computador, use 2 colunas: entrada à esquerda e tradução à direita.

**Regras de tradução:**
1. Troque `*...*` e `[...]` por `(...)`.
2. Percorra o texto procurando primeiro as expressões mais longas. Uma palavra só é reconhecida se não estiver no meio de outra (o "pa" de "para" não conta).
3. Se o termo vier logo depois de um número maior que 1, use o plural. Exemplo: `6 sc` vira "6 pontos baixos".
4. Deixe a primeira letra da frase maiúscula.

**Termos de crochê** (ficam destacados e clicáveis):
| Reconhece | Singular | Plural |
|---|---|---|
| `corr`, `ch` | corrente | correntes |
| `sl st`, `slst`, `pbx` | ponto baixíssimo | pontos baixíssimos |
| `sc`, `pb` | ponto baixo | pontos baixos |
| `hdc`, `mpa` | meio ponto alto | meios pontos altos |
| `tr`, `pad` | ponto alto duplo | pontos altos duplos |
| `dc`, `pa` | ponto alto | pontos altos |
| `inc`, `aum` | aumento | aumentos |
| `dec`, `dim` | diminuição | diminuições |
| `magic ring`, `mr`, `am` | anel mágico | anel mágico |
| `yo` | laçada | laçadas |
| `blo` | só na alça de trás | só na alça de trás |
| `flo` | só na alça da frente | só na alça da frente |

**Expressões** (traduzidas como texto normal):
| Original | Tradução |
|---|---|
| `in each st around` | em cada ponto da volta |
| `in each stitch around` | em cada ponto da volta |
| `in each st` | em cada ponto |
| `in next st` | no próximo ponto |
| `in same st` | no mesmo ponto |
| `fasten off` | arremate |
| `leave a long tail` | deixe uma ponta longa |
| `/repeat\s+(\d+)\s+times/` | repita N vezes |
| `/x\s*(\d+)/` | repita N vezes |
| `repeat` | repita |
| `times` | vezes |
| `around` | na volta toda |
| `stitches` | pontos |
| `stitch` | ponto |
| `each` | cada |
| `turn` | vire o trabalho |
| `stuff` | encha com fibra |
| `join` | una |
| `with` | com |
| `and` | e |
| `next` | próximo |
| `into` | em |
| `in` | no |
| `sts` | pontos |
| `st` | ponto |
| `pts` | pontos |
| `pt` | ponto |

**Exemplos para os botões:**
```
Rnd 1: 6 sc in magic ring (6)
Rnd 2: inc in each st around (12)
Rnd 3: *sc, inc* repeat 6 times (18)
Rnd 4: *2 sc, inc* x6 (24)
Rnd 5-8: sc in each st around (24)
Rnd 9: *2 sc, dec* x6 (18)
Fasten off, leave a long tail.
```
```
V1: 6 pb no AM (6)
V2: 6 aum (12)
V3: (1 pb, 1 aum) x6 (18)
V4: 1 pb em cada pt (18)
V5: (1 pb, 1 dim) x6 (12)
Feche com pbx e arremate.
```

### 3.4 Gráfico
- O botão **"Enviar foto do gráfico"** envia uma imagem para reconhecer os símbolos com IA de visão. O resultado é uma lista de carreiras com símbolos, e aparece o aviso "Encontramos N carreiras…". Até isso existir, mostre o gráfico de exemplo abaixo.
- O diagrama mostra uma carreira por linha, com a **última no topo** e a base embaixo, como num gráfico de verdade.
  - Cada linha tem o nome da carreira, os símbolos e uma seta de sentido (→ ou ←). Nas carreiras lidas da direita para a esquerda, os símbolos aparecem invertidos (a corrente de subida fica à direita).
  - Cores dos símbolos: ○ corrente em rosa escuro, × ponto baixo em azul, Ŧ ponto alto em roxo.
  - Coloque uma legenda abaixo.
- Tocar numa carreira a destaca e mostra um cartão com o sentido de leitura, o nome da carreira, a instrução traduzida (termos clicáveis) e uma dica. Inclua os botões "‹ Anterior" e "Próxima carreira ›".
- **Os símbolos precisam caber dentro do cartão** em qualquer largura de tela (use `flex: none` nas células e diminua o tamanho delas em telas pequenas).

**Gráfico de exemplo:**
| Carreira | Instrução | Símbolos | Sentido | Dica |
|---|---|---|---|---|
| Base | `12 corr` | ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ | Comece aqui | Faça 12 correntes. Elas são a base de todo o trabalho. |
| Carreira 1 | `1 corr, 12 pb` | ○ × × × × × × × × × × × × | Leia da direita para a esquerda | A corrente do começo serve só para subir de altura e não conta como ponto. |
| Carreira 2 | `Vire o trabalho, 3 corr, 11 pa` | 3○ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ | Leia da esquerda para a direita | As 3 correntes do começo contam como o 1º ponto alto. Por isso são só mais 11. |
| Carreira 3 | `Vire o trabalho, 1 corr, 12 pb` | ○ × × × × × × × × × × × × | Leia da direita para a esquerda | Igual à carreira 1: 1 corrente para subir e 12 pontos baixos. |
| Carreira 4 | `Vire o trabalho, 3 corr, 11 pa` | 3○ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ Ŧ | Leia da esquerda para a direita | Igual à carreira 2. Ao terminar, arremate o fio. |

### 3.5 Glossário
- Cartão "Primeira vez? Comece por aqui": "Aprenda nesta ordem: nó corrediço, corrente e ponto baixo. Com esses três você já faz a primeira peça."
- Campo de busca, que procura no nome, na abreviação em português, na abreviação em inglês e na descrição.
- Pontos agrupados por categoria (ver a seção 4).
- **Celular:** a lista mostra símbolo, nome, abreviações, "quando usar" e "Ver passo a passo ›". Tocar abre um painel de baixo para cima (com rolagem) com todos os detalhes e o botão "Entendi".
- **Computador:** a lista fica à esquerda e o painel de detalhes à direita, com símbolo grande, categoria, nome, descrição, passo a passo numerado e três cartões: "Quando usar", "Cuidado com" e "Na receita aparece assim".
- Ao tocar em termos destacados em outras telas: no celular, abre o mesmo painel; no computador, abre um cartão flutuante no canto inferior direito com o passo a passo, "Cuidado com" e o botão "Ver no glossário".

## 4. Conteúdo do glossário

### Para começar

**corrente** · PT: `corr` · EN: `ch` · símbolo: ○
- O que é: Faça uma laçada e puxe pela alça que está na agulha. É a base de quase toda receita.
- Passo a passo:
  1. Comece com um nó corrediço na agulha.
  2. Passe o fio por cima da agulha (laçada).
  3. Puxe essa laçada por dentro da alça que já está na agulha.
  4. Pronto: 1 corrente. Repita para fazer mais.
- Quando usar: Na base de trabalhos retos e para subir de altura no começo de cada carreira.
- Cuidado com: Correntes muito apertadas dificultam a carreira seguinte. Deixe-as soltinhas.
- Na receita aparece assim: `12 corr  ·  ch 12`

**anel mágico** · PT: `AM` · EN: `MR` · símbolo: ◎
- O que é: Um círculo de fio ajustável onde você faz os primeiros pontos. No final, puxe a ponta e ele fecha sem deixar furo.
- Passo a passo:
  1. Enrole o fio em volta de 2 dedos, formando um círculo.
  2. Insira a agulha no círculo, pegue o fio e puxe uma alça.
  3. Faça 1 corrente para firmar (ela não conta como ponto).
  4. Faça os pontos pedidos por dentro do círculo, cobrindo as 2 linhas.
  5. Puxe a ponta solta do fio para fechar o círculo.
- Quando usar: No começo de peças redondas, como amigurumi, gorros e mandalas.
- Cuidado com: Só puxe a ponta para fechar depois de fazer todos os pontos da 1ª volta.
- Na receita aparece assim: `6 pb no AM  ·  6 sc in magic ring`

**laçada** · PT: `laç` · EN: `yo`
- O que é: Passe o fio por cima da agulha, de trás para a frente.
- Passo a passo:
  1. Segure a agulha com o gancho virado para baixo.
  2. Passe o fio por cima da agulha, de trás para a frente.
- Quando usar: Faz parte de quase todos os pontos. Quando a receita diz "laçada", é só esse movimento.
- Cuidado com: O fio passa sempre de trás para a frente. Ao contrário, o ponto fica torcido.
- Na receita aparece assim: `laç  ·  yo`

**nó corrediço** · PT: `nó` · EN: `slip knot` · símbolo: ∞
- O que é: Um nó com alça ajustável que prende o fio na agulha. Todo trabalho começa com ele.
- Passo a passo:
  1. Faça um laço com o fio, deixando a ponta solta por baixo.
  2. Puxe o fio que vem do novelo por dentro do laço, formando uma alça.
  3. Coloque a alça na agulha e puxe a ponta para ajustar, sem apertar demais.
- Quando usar: É sempre o primeiro passo, antes da primeira corrente.
- Cuidado com: O nó corrediço não conta como ponto.
- Na receita aparece assim: `Normalmente não aparece. A receita já começa nas correntes.`

### Pontos básicos

**ponto baixíssimo** · PT: `pbx` · EN: `sl st` · símbolo: •
- O que é: Insira a agulha no ponto, faça uma laçada e puxe direto pelo ponto e pela alça da agulha. Usado para fechar voltas.
- Passo a passo:
  1. Insira a agulha no ponto.
  2. Faça uma laçada.
  3. Puxe a laçada pelo ponto e pela alça da agulha, tudo de uma vez.
- Quando usar: Para fechar uma volta (unir o último ponto ao primeiro) ou para andar sem ganhar altura.
- Cuidado com: É o ponto mais baixo de todos. Não faça laçada antes de inserir a agulha.
- Na receita aparece assim: `feche com pbx  ·  join with sl st`

**ponto baixo** · PT: `pb` · EN: `sc` · símbolo: ×
- O que é: Insira a agulha no ponto e puxe uma laçada (ficam 2 alças). Faça outra laçada e passe pelas 2 alças.
- Passo a passo:
  1. Insira a agulha no ponto, por baixo das 2 alças.
  2. Faça uma laçada e puxe. Agora há 2 alças na agulha.
  3. Faça outra laçada.
  4. Passe pelas 2 alças de uma vez.
- Quando usar: É o ponto mais usado em amigurumi. Forma um tecido firme e fechado.
- Cuidado com: Conte as alças: depois de puxar a primeira laçada, tem que haver 2.
- Na receita aparece assim: `6 pb  ·  6 sc`

**meio ponto alto** · PT: `mpa` · EN: `hdc` · símbolo: T
- O que é: Faça 1 laçada, insira no ponto e puxe (ficam 3 alças). Faça outra laçada e passe pelas 3 de uma vez.
- Passo a passo:
  1. Faça 1 laçada antes de inserir a agulha.
  2. Insira no ponto, faça laçada e puxe. Agora há 3 alças.
  3. Faça uma laçada e passe pelas 3 alças de uma vez.
- Quando usar: Fica entre o ponto baixo e o ponto alto. Bom para gorros e mantas.
- Cuidado com: A diferença para o ponto alto: aqui você fecha as 3 alças juntas.
- Na receita aparece assim: `10 mpa  ·  10 hdc`

**ponto alto duplo** · PT: `pad` · EN: `tr` · símbolo: ‡
- O que é: Faça 2 laçadas, insira no ponto e puxe. Depois feche de 2 em 2 alças, três vezes.
- Passo a passo:
  1. Faça 2 laçadas antes de inserir a agulha.
  2. Insira no ponto, laçada e puxe. Agora há 4 alças.
  3. Laçada e passe por 2. Repita mais 2 vezes, até sobrar 1 alça.
- Quando usar: Ponto bem alto, usado em rendas e acabamentos.
- Cuidado com: Feche sempre de 2 em 2 alças, três vezes.
- Na receita aparece assim: `5 pad  ·  5 tr`

**ponto alto** · PT: `pa` · EN: `dc` · símbolo: Ŧ
- O que é: Faça 1 laçada, insira no ponto e puxe (3 alças). Laçada e passe por 2. Laçada e passe pelas 2 últimas.
- Passo a passo:
  1. Faça 1 laçada antes de inserir a agulha.
  2. Insira no ponto, faça laçada e puxe. Agora há 3 alças.
  3. Laçada e passe por 2 alças (sobram 2).
  4. Laçada e passe pelas 2 últimas.
- Quando usar: Ponto alto e mais aberto, cresce rápido. Comum em mantas, xales e squares.
- Cuidado com: No começo da carreira, 3 correntes costumam contar como o 1º ponto alto.
- Na receita aparece assim: `11 pa  ·  11 dc`

### Aumentar e diminuir

**aumento** · PT: `aum` · EN: `inc` · símbolo: V
- O que é: Faça 2 pontos baixos no mesmo ponto. A peça ganha 1 ponto.
- Passo a passo:
  1. Faça 1 ponto baixo normalmente.
  2. No mesmo ponto onde acabou de trabalhar, faça outro ponto baixo.
  3. Agora há 2 pontos onde antes havia 1.
- Quando usar: Para a peça crescer, como no começo de uma bolinha de amigurumi.
- Cuidado com: Cada aumento soma 1 ponto ao total. Confira o número entre parênteses no fim da volta.
- Na receita aparece assim: `6 aum  ·  inc x6`

**diminuição** · PT: `dim` · EN: `dec` · símbolo: Λ
- O que é: Junte 2 pontos em 1: puxe uma laçada no 1º ponto, outra no 2º, e feche tudo junto. A peça perde 1 ponto.
- Passo a passo:
  1. Insira a agulha no 1º ponto, faça laçada e puxe (2 alças).
  2. Insira no 2º ponto, faça laçada e puxe (3 alças).
  3. Faça laçada e passe pelas 3 alças de uma vez.
- Quando usar: Para a peça diminuir, como para fechar o fim de uma bolinha.
- Cuidado com: Cada diminuição tira 1 ponto do total. Em amigurumi, a "diminuição invisível" pega só a alça da frente dos 2 pontos.
- Na receita aparece assim: `6 dim  ·  dec x6`

### Termos da receita

**só na alça de trás** · PT: `alça tr.` · EN: `BLO`
- O que é: Em vez de pegar as 2 alças do ponto, pegue só a de trás. Cria uma linha marcada na peça.
- Passo a passo:
  1. Olhe o topo do ponto: ele tem 2 alças, uma na frente e uma atrás.
  2. Insira a agulha só na alça de trás, a mais longe de você.
  3. Faça o ponto pedido normalmente.
- Quando usar: Cria uma linha em relevo. Muito usado na base de sapatinhos e cestos.
- Cuidado com: Faça a volta inteira desse jeito, a menos que a receita diga outra coisa.
- Na receita aparece assim: `pb só na alça de trás  ·  sc in BLO`

**só na alça da frente** · PT: `alça fr.` · EN: `FLO`
- O que é: Pegue só a alça da frente do ponto, a que está mais perto de você.
- Passo a passo:
  1. Olhe o topo do ponto e encontre as 2 alças.
  2. Insira a agulha só na alça da frente, a mais perto de você.
  3. Faça o ponto pedido normalmente.
- Quando usar: Deixa a alça de trás livre para trabalhar depois, como em babados.
- Cuidado com: Não confunda com a alça de trás: a da frente é a que fica voltada para você.
- Na receita aparece assim: `pb só na alça da frente  ·  sc in FLO`

**volta** · PT: `V` · EN: `Rnd` · símbolo: ↻
- O que é: Quando o trabalho é em círculo (como amigurumi). Você não vira a peça, só continua girando.
- Passo a passo:
  1. Faça os pontos da volta em círculo.
  2. No fim, não vire a peça: siga direto para a próxima volta.
  3. Coloque um marcador no 1º ponto para saber onde cada volta começa.
- Quando usar: Em peças redondas: amigurumi, gorros, mandalas.
- Cuidado com: Sem marcador é fácil perder a conta. Um clipe ou fio de outra cor serve.
- Na receita aparece assim: `V1, V2…  ·  Rnd 1, Rnd 2…`

**carreira** · PT: `carr` · EN: `Row` · símbolo: ⇄
- O que é: Quando o trabalho é reto, de um lado ao outro. No fim de cada carreira, você vira a peça.
- Passo a passo:
  1. Faça os pontos de um lado ao outro.
  2. No fim, vire a peça.
  3. Faça as correntes para subir e comece a próxima carreira.
- Quando usar: Em peças retas: cachecóis, mantas, panos.
- Cuidado com: Conte os pontos no fim de cada carreira. Se a peça entortar, algum ponto sumiu ou sobrou.
- Na receita aparece assim: `Carr 1  ·  Row 1`


## 5. Critérios de aceite
- Tudo funciona no celular (390px) e no computador (1280px), sem nada saindo do lugar.
- Contador: +1, −1, Zerar, Próxima e Anterior funcionam, e a sequência "Agora / Depois" e as bolinhas acompanham a contagem.
- Os dois exemplos de receita são traduzidos exatamente como descrito.
- Todo termo destacado abre os detalhes do glossário.
- O progresso fica salvo entre as sessões.
- Os textos têm contraste mínimo de 4.5:1.
