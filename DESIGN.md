---
name: Tem estudo?
description: Guias sobre relacionamentos com a fonte junto, num zine impresso com cuidado.
colors:
  papel: '#f5f8f8'
  folha: '#fcfdfd'
  tinta: '#1a1c1c'
  tinta-2: '#414948'
  amarelo-voce: '#ecd36f'
  rosa-mito: '#e7a3b6'
  agua-fonte: '#95cfc5'
  agua-tinta: '#0d6359'
typography:
  display:
    fontFamily: 'Bricolage Grotesque, Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: 'clamp(33px, 8.6vw, 50px)'
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: '-0.022em'
  headline:
    fontFamily: 'Bricolage Grotesque, Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: '25px'
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '-0.015em'
  title:
    fontFamily: 'Bricolage Grotesque, Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: '19.5px'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: '-0.01em'
  nota-de-margem:
    fontFamily: 'Kalam, Atkinson Hyperlegible, cursive'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.3
  lead:
    fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: '18.5px'
    fontWeight: 400
    lineHeight: 1.58
  body:
    fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Atkinson Hyperlegible, system-ui, sans-serif'
    fontSize: '14.5px'
    fontWeight: 700
    lineHeight: 1.35
rounded:
  mao: '7px 3px 6px 4px / 4px 6px 3px 7px'
  mao-2: '3px 7px 4px 6px / 6px 4px 7px 3px'
  bolota: '50% 47% 52% 48%'
  redondo: '50%'
  pill: '999px'
spacing:
  xs: '6px'
  sm: '14px'
  md: '18px'
  lg: '30px'
  secao: '44px'
  rodape: '56px'
components:
  botao:
    backgroundColor: '{colors.amarelo-voce}'
    textColor: '{colors.tinta}'
    typography: '{typography.label}'
    rounded: '{rounded.mao}'
    padding: '10px 16px'
    height: '44px'
  botao-leve:
    backgroundColor: '{colors.folha}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.mao}'
    padding: '10px 16px'
    height: '44px'
  opcao:
    backgroundColor: '{colors.papel}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.mao}'
    padding: '10px 14px'
    height: '44px'
  opcao-marcada:
    backgroundColor: '{colors.amarelo-voce}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.mao}'
  campo:
    backgroundColor: '{colors.papel}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.mao-2}'
    padding: '6px 10px'
    height: '44px'
  painel:
    backgroundColor: '{colors.folha}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.mao}'
    padding: '18px 18px 16px'
  mito:
    backgroundColor: '{colors.folha}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.mao}'
    padding: '16px 18px'
  ref:
    backgroundColor: '{colors.folha}'
    textColor: '{colors.agua-tinta}'
    rounded: '{rounded.redondo}'
    height: '25px'
    padding: '0 6px'
  ref-hover:
    backgroundColor: '{colors.agua-fonte}'
    textColor: '{colors.tinta}'
  etiqueta-tema:
    backgroundColor: '{colors.folha}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.mao-2}'
    padding: '5px 10px'
---

# Design System: Tem estudo?

## Overview

**Creative North Star: "O zine sério"**

Um amigo leu os estudos e explica o que eles dizem num zine impresso com cuidado: tinta preta, marca-texto onde importa, setas que levam à fonte. A mão aparece nos detalhes (setas, anéis, círculo, régua, duas notas de margem) e não na estrutura. Títulos são tipográficos e firmes; o desenho fica para o que aponta, marca ou mede.

Este mundo substitui o fanzine desenhado, que o usuário escolheu primeiro e depois julgou infantil. Saíram os títulos em Permanent Marker, a carinha da Confiança, os contornos muito tortos e a etiqueta do Tema girada. Ficaram a tinta sobre papel frio, os três marca-textos com papel fixo, a retícula de sombra e a interação da Ficha circulada. Valem para tudo as restrições do usuário: o site não pode parecer blog de autoajuda nem artigo científico, e quem lê deve sair com "alívio com os pés no chão".

Antes da escolha, duas alternativas foram construídas em página inteira e comparadas com esta:

- Prancha de patente: descartada pelo risco de parecer acadêmica demais.
- Padrão da categoria: descartada por não ter identidade.

Celular primeiro, uma coluna. No desktop a coluna vira uma folha com contorno sobre fundo de retícula fina.

**Key Characteristics:**

- Papel frio quase branco, tinta preta, três tintas de risografia com papel fixo.
- Títulos em Bricolage Grotesque, corpo em Atkinson Hyperlegible com algarismos da Source Sans 3, no máximo duas notas de margem em Kalam.
- Contornos de 1,8 a 2px quase retos, com só uma leve irregularidade de mão.
- Sombra de retícula fina deslocada, sem desfoque.
- Confiança e Força em três degraus desenhados à mão, sempre com a palavra.
- Textos em PT-BR. O site se chama "Tem estudo?".

## Colors

Papel e tinta fazem quase todo o trabalho; a cor entra como tinta de risografia, menos saturada, e cada tinta quer dizer uma coisa só.

### Primary

- **Amarelo risografia "vale para você"** (amarelo-voce): o selo "vale para você", o resumo do Perfil, a opção marcada, o botão principal e a única palavra destacada no título. Também a seleção de texto e o halo de foco.

### Secondary

- **Rosa risografia "atenção"** (rosa-mito): só o número-chave, o risco da frase do Mito e a etiqueta "Mito".
- O marca-texto rosa marca o número-chave no texto (a resposta curta) e nas Visualizações (o valor da barra ou do ponto em destaque). Fora dele, o rosa só aparece no Mito: no risco e na etiqueta.

### Tertiary

- **Verde-água risografia "caminho até a fonte"** (agua-fonte): o fundo da referência em hover, o preenchimento do círculo da Ficha (30%) e a linha de um gráfico sob o mouse (32%), porque a marca leva à Ficha. Só o que leva à fonte.
- **Verde-água de tinta** (agua-tinta): o mesmo papel para texto e traço. O anel e o número das referências, a numeração das Fichas, setas, círculo, as notas de margem, o visto de "lido no original", o sublinhado do título da Ficha, a guia da linha do tempo, o contorno do cartão fixado.

### Neutral

- **Papel frio** (papel): fundo da página. Frio de propósito: creme lê como autoajuda.
- **Folha** (folha): painéis, Mitos, caixa do Perfil, cartões relacionados, etiqueta de país, etiqueta do Tema.
- **Tinta** (tinta): texto, contornos, divisórias pontilhadas, régua de seção, retícula, degraus preenchidos, anel vazio de "não há dado", o sublinhado ondulado do Grifo (o reto é do link, e o amarelo é da seleção e do "vale para você").
- **Tinta clara** (tinta-2): texto secundário (rótulo da Confiança, intro, "Vale para:", legenda, Inferência, rodapé).

### Named Rules

**The Three Inks Rule.** Amarelo = vale para você e uma palavra do título; rosa = Mito e o número-chave; verde-água = caminho até a fonte. Nenhuma tinta troca de papel e não entra uma quarta. O que não tem um desses papéis fica em tinta e papel: "não há dado" é um anel vazio em tinta, e a etiqueta do Tema é folha com contorno em tinta.

**The Full Letter Rule.** Marca-texto amarelo e rosa cobre a altura inteira da letra, das ascendentes às descendentes. Nunca uma faixa só na metade de baixo. (Pedido do usuário.) O risco do Mito é outra coisa, mantido de propósito: uma faixa rosa no meio da linha que atravessa a frase e diz "isto não se sustenta".

**The One Yellow Word Rule.** Cada título leva no máximo uma palavra em amarelo.

**The Cool Paper Rule.** O fundo é o papel frio. Creme, bege e papel quente ficam fora.

## Typography

**Display Font:** Bricolage Grotesque, variável 500 a 800 (fallback Atkinson Hyperlegible, system-ui)
**Body Font:** Atkinson Hyperlegible, 400, 400 itálico e 700 (fallback system-ui, sans-serif)
**Notas de margem:** Kalam 400 (fallback Atkinson Hyperlegible, cursive)
**Algarismos:** Source Sans 3, 400, 400 itálico e 700, só para 0 a 9

Todas auto-hospedadas. A Source Sans 3 entra dentro da família da Atkinson por unicode-range (U+0030–0039) e não é usada para mais nada. O zero cortado da Atkinson fazia os números parecerem código.

**Character:** A Bricolage dá aos títulos um peso de impresso, com personalidade e sem fofura. A Atkinson cuida da leitura em qualquer tela. A Kalam é a letra de quem anota na margem, e aparece pouco.

### Hierarchy

- **Display** (700, clamp(33px, 8.6vw, 50px), 1.06, -0.022em): o título da página (o Tema do Guia, a calculadora), text-wrap balance. Uma palavra em amarelo que se pinta da esquerda para a direita ao carregar.
- **Headline** (700, 25px, 1.15, -0.015em): títulos de seção, sem ícone.
- **Title** (600 a 700, 19 a 21px, -0.01em): frase do Mito, título das perguntas relacionadas, nível de Confiança, nome do site (21px).
- **Nota de margem** (400, 17px, 1.3, verde-água de tinta): "quer conferir? as Fichas estão lá no fim" e "repara: só o último é do Brasil".
- **Lead** (400, 18.5px, 1.58): a resposta curta.
- **Body** (400, 17px, 1.6): texto corrido, coluna de até min(38rem, 66ch).
- **Label** (700, 14.5 a 15.5px): selos, metadados da Ficha, opções, botões, "voltar ao texto", a linha "Para o seu Perfil".

### Named Rules

**The Two Margin Notes Rule.** No máximo duas notas em Kalam por página. Uma terceira anotação usa a mesma seta com Atkinson itálico de 15px.

**The Plain Digits Rule.** Algarismos vêm da Source Sans 3, dentro da família da Atkinson. Nunca o zero cortado.

**The Glued Ref Rule.** Um número de referência nunca fica sozinho no começo de uma linha: gruda na palavra anterior e na pontuação seguinte, com cerca de 0,3em de espaço antes dele.

## Layout

Uma coluna, celular primeiro. A página tem até 46rem com respiro lateral de 18px; o texto fica em até min(38rem, 66ch). Cada seção abre com uma régua desenhada à mão de 1,6px no topo, 20px acima do título, e fica a 44px da anterior. Achados em lista com coluna de 58px para país e ano e divisória pontilhada de 1,5px. Rodapé a 56px.

A partir de 900px, o fundo ganha retícula fina (6px) e a coluna principal vira folha com contorno de 2px, sem borda no topo, padding de 12px 64px 56px. O cabeçalho é uma barra de papel com linha inferior de 2px; nome, etiqueta e a lupa da busca, no canto direito, têm 44px de altura de toque.

Rolagem suave com scroll-padding de 16px, desligada em prefers-reduced-motion.

## Elevation & Depth

A profundidade é impressa. Painéis, Mitos, caixa do Perfil, cartões relacionados e o botão principal têm atrás uma cópia da forma em retícula fina de pontos (4px, tinta a 62%), deslocada 5px para a direita e 6px para baixo. Sem desfoque e sem bloco sólido.

### Shadow Vocabulary

- **Retícula fina** (pseudo-elemento com `background: radial-gradient(circle, rgba(26,28,28,.62) .8px, transparent 1.2px) 0 0/4px 4px; transform: translate(5px, 6px); inset: -2px`): única elevação. Herda o contorno da forma.

### Named Rules

**The Halftone Rule.** Sombra é retícula deslocada atrás do contorno. Nunca box-shadow com desfoque, nunca bloco sólido.

## Shapes

Contornos quase retos: dois raios irregulares pequenos (mao, mao-2), de 3 a 7px, dão só um tremor de mão. As referências no texto ficam num anel desenhado à mão em SVG, com o traço que se sobrepõe um pouco onde começa e termina. A numeração das Fichas e o anel vazio de "não há dado" usam a bolota quase redonda em contorno CSS. Contorno de 2px em painéis e cartões, 1,8px em controles, 1,5px na etiqueta do Tema. A caixa de aviso usa contorno tracejado de 2px. Nada é girado, exceto o marca-texto do título (-0,5°).

Desenhos são SVG de traço único com ponta arredondada, 1,8 a 2,4px: setas curvas, régua, traço curto como marcador das limitações, anel das referências, caixa com visto, caixa hachurada, os três degraus e o círculo da Ficha.

## Components

### Botões

- **Shape:** contorno mao de 1,8px, altura mínima de 44px.
- **Principal:** amarelo com texto em tinta, peso 700, com retícula atrás.
- **Hover / Active:** sobe 1px no hover, desce 1px no active; parado em prefers-reduced-motion.
- **Leve:** fundo folha, sem retícula. Para "mudar".
- **Voltar:** texto em negrito com seta desenhada à esquerda, sem caixa, 44px de altura.

### Opções do Perfil (chips)

- **Style:** papel frio, contorno mao de 1,8px, texto 700 de 15px, 44px de altura. O rádio fica invisível por cima da opção inteira.
- **State:** marcada vira amarelo. Foco por teclado ganha contorno de 3px em tinta.

### Painéis e cartões

- **Corner Style:** mao (painel, Mito) ou mao-2 (caixa do Perfil, cartões relacionados).
- **Background:** folha sobre papel.
- **Shadow Strategy:** retícula fina (ver Elevation & Depth).
- **Border:** 2px em tinta.
- **Internal Padding:** 16 a 18px.
- **Cartão de pergunta relacionada:** título em Bricolage 19px, resumo em tinta clara, seta desenhada à direita; no hover o cartão inteiro vira amarelo.

### Campo

- **Style:** papel frio, contorno mao-2 de 1,8px, texto 700 de 18px, 44px de altura.
- **Focus:** o foco global: contorno de 3px em tinta com halo amarelo de 7px.

### Navegação

Barra do topo: nome em Bricolage 700 de 21px à esquerda, sempre numa linha; à direita, a etiqueta do Tema, reta, em folha com contorno de 1,5px em tinta. Um Tema de nome longo quebra a etiqueta em duas linhas, nunca o nome do site. Links do texto com sublinhado de 1,5px afastado 4px. O link do Perfil usa sublinhado tracejado de 2px. Sem Perfil, diz "Diga seu Perfil e veja o que vale para você", com "opcional" em tinta clara; com Perfil, vira "Seu Perfil: … · mudar".

Índice dos Temas, na página inicial: um painel só, com uma dobra por Tema na ordem do `position` de cada `_topic.md`, separadas pela divisória pontilhada de 1,5px. Fechada, a dobra mostra a seta pequena que gira, o nome do Tema em title e "N Perguntas" em tinta clara; aberta, as Perguntas numeradas e "Abrir o Tema" com a seta desenhada. A dobra é o `<details>` do navegador: abre sem JS e volta aberta quando o leitor sai de um Guia pelo voltar. Fechados, os seis Temas cabem numa tela de celular; uma lista com todas as Perguntas não caberia. O Tema cujo Guia o leitor terminou neste navegador ganha, ao lado do nome, a etiqueta "lido" em folha com contorno de 1,5px em tinta, 14px em negrito.

Continuar lendo, na página inicial, entre o lead e os Temas: só aparece no navegador que tem uma leitura em curso. Um painel com um item por Guia começado e não terminado, o mais recente primeiro. Cada item mostra o nome do Guia em title com a seta desenhada, "Capítulo 2 de 5 · <título>" em tinta clara, a régua de leitura e "27% lido". À direita, um × desenhado à mão, em tinta clara, com 44px de toque, esquece aquele Guia.

### Três degraus: Confiança e Força

Três retângulos desenhados à mão, levemente tortos, contorno em tinta. Preenchidos conforme o nível: um para fraca, dois para moderada, três para forte. No bloco "Do Guia" das calculadoras, os degraus têm 72px e ficam ao lado de "Confiança da resposta" e do nível em Bricolage, separados do texto por uma linha pontilhada. Na resposta dentro do Guia e em "Em resumo", têm 36px, ao lado de "confiança moderada". Nos metadados da Ficha, a Força usa o mesmo desenho a 36px. A palavra sempre aparece.

### Status de verificação

Ícone de 18px antes da palavra: caixa com visto verde-água = "lido no original"; caixa hachurada = "parcial". Uma legenda no fim da lista explica Status e Força.

### Referência numerada e o trecho que ela cita (assinatura)

O número da referência fica dentro de um anel desenhado à mão (SVG, traço de 1,8px em verde-água de tinta) de 26 por 25px sobre folha, com o número em verde-água de tinta, cerca de 0,3em de espaço antes e área de toque ampliada; no hover o fundo vira verde-água. Ao tocar, o texto que o número cita ganha esse mesmo fundo verde-água claro, do anel anterior do parágrafo (ou do começo dele) até o anel, e abre ao lado do anel um popover com o cartão da Ficha da lista do fim e "abrir Ficha". Anéis lado a lado marcam o mesmo trecho. Num Visual, a figura inteira ganha contorno e fundo verde-água claro. No desktop, o hover ou o foco do teclado marcam o trecho sem abrir o popover. A marca sai quando o popover fecha ou o ponteiro sai. Sem JS, o número leva à Ficha na lista do fim.

A primeira proposta era uma seta traçada do número até a Ficha. Ela foi trocada por círculo e seta curta porque uma seta do tamanho da página não se lê num celular.

### Cartão do gráfico

Um cartão só por página, para todo gráfico e tabela de Estudos; o diagrama fica de fora. Com o mouse, em qualquer ponto da linha (título e medida inclusive): cursor de mão, verde-água claro atrás da linha, as outras apagadas, e o cartão ao lado da marca, sem botões, dizendo como fixar. Na linha do tempo o cursor é a mira, e uma guia tracejada em verde-água de tinta e o cartão pulam para o ano mais próximo, em qualquer ponto do desenho. Um clique, um toque ou Enter fixa o cartão, com contorno em verde-água de tinta, o link "Abrir Ficha" e "Fechar". Ele fecha com Esc, um clique fora, o botão ou a mesma marca de novo. Fica ao lado da marca quando a tela tem lugar e, no celular, embaixo dela, e cabe em 360px. Contorno de 2px, sem sombra (The Halftone Rule). As setas levam o cartão de marca em marca, sem fixar, e Tab entra no cartão fixado. Sem JS, o SVG fica como está: sem cursor de mão e sem dica.

Cada ponta de uma faixa de países tem o seu cartão, e o traço dela engrossa em verde-água de tinta. A legenda são chips: o mouse sobre um acende as marcas dele, e um toque o deixa aceso (amarelo, como os chips de país, porque filtra e não leva à Ficha). Vale só naquele gráfico e combina com o país: fica aceso o que atende aos dois, e um par sem resultado diz isso em negrito sob o gráfico. O que um filtro deixa de fora continua apagado sob o cartão, mesmo sendo a linha do cartão, e mais apagado que as linhas que o cartão apaga. Sem JS, a legenda é só texto.

Sob cada gráfico e tabela de Estudos, uma etiqueta de raio pill com o ícone de toque, em negrito verde-água de tinta sobre verde-água claro, porque leva à Ficha. O texto depende do aparelho: "Passe o mouse ou clique para ver o número e a Ficha" com mouse, "Toque para ver o número e a Ficha" no toque. O primeiro gráfico visto numa visita chama uma vez: um anel verde-água se espalha duas vezes em volta da marca do número-chave (sem ele, da primeira), em 2 segundos. Em prefers-reduced-motion o anel não aparece e a etiqueta fica.

### Perfil: destacar sem esconder

Nada some quando o leitor informa o Perfil, e a nota "Vale para:" de cada achado fica sempre.

- **Achado que cobre:** ganha o selo "vale para você" em amarelo junto da nota "Vale para:", que continua lá.
- **Achado que não cobre:** a nota "Vale para:" ganha um anel vazio em tinta antes e termina com "Não há dado deste estudo para o seu Perfil." em negrito. Sem rosa.
- **Resposta curta:** abaixo da resposta, depois de uma linha pontilhada, a frase "Para o seu Perfil: …" (15.5px) diz se o número-chave vale para o Perfil e, se não vale, qual achado tem dado para ele, com referência, ou que nenhum número da Pergunta vem de uma amostra como a dele. Quando vale, a frase abre com o selo amarelo "vale para você".
- **No meio do texto:** a frase que fala de uma amostra ganha, antes dela, o selo amarelo "vale para você" em 14px quando o Perfil está nessa amostra. Sem Perfil, ou sem JS, o selo não aparece; o texto diz a amostra de qualquer jeito.
- **Caixa do Perfil:** uma só, logo depois de "Em resumo". Com Perfil, mostra "Seu Perfil: …" em amarelo e "mudar".

### Guia em Capítulos

O Guia é um texto corrido, não uma pilha de seções iguais (ADR 0042).

- **Capítulos sob o título:** uma lista numerada, um link por Capítulo, com o número na bolota em contorno de tinta (30px) e o título em negrito sublinhado, entre divisórias pontilhadas de 1,5px; cada linha tem 44px de toque. O mesmo número abre o título do Capítulo.
- **Barra de leitura:** quando o leitor entra no primeiro Capítulo, desce do topo uma linha em papel, presa ao alto da tela, com "2 de 5 · <título do Capítulo>" em label e a seta pequena, que abre a lista dos Capítulos com o atual na bolota cheia de tinta. Embaixo dela, a régua de leitura: um fio pontilhado de 2px que vira traço cheio de tinta conforme o leitor avança até "O que levar". No celular a linha sobe e some enquanto o leitor desce e volta quando ele sobe; a régua fica. Sem JS, não existe: basta a lista de Capítulos sob o título.
- **Em resumo:** cada Pergunta em title, com os degraus da Confiança e a primeira frase da resposta curta, sem números de referência.
- **A resposta no texto:** onde o raciocínio chega a uma Pergunta, uma nota sobre folha com contorno pontilhado de 1,5px em tinta e raio mao-2, sem retícula: é uma anotação do texto, não um painel. Traz a Pergunta em title (sem a palavra amarela, que é só do título da página), os degraus da Confiança e a resposta curta em corpo, com o número-chave em rosa. Um link antigo da Pergunta cai nela.
- **"no Brasil":** uma etiqueta em folha com contorno de 1,5px em tinta, 14px em negrito, raio mao-2, antes da frase com dado brasileiro. Tinta e papel, sem cor: "Brasil" não é um dos três papéis das tintas.

### Leituras de Sites vizinhos

Em `/sites-vizinhos`, um grupo por Tema, e no fim de cada Guia, depois de "O que não se sabe", o bloco "Para ler além daqui" (some quando o Tema não tem Leitura). Cada Leitura, entre divisórias pontilhadas de 1,5px: o nome do site em label (e "em inglês" em tinta clara, quando for), o título em title com sublinhado e a seta curta de saída, a linha para o leitor em corpo e, embaixo, cada aviso com a etiqueta em folha ("vende algo", "defende uma causa") e a frase em nota, tinta clara. Tudo em tinta e papel: a Leitura não é Fonte, então nada de verde-água, e não leva nota, degraus nem selo. O hover do título é amarelo, como os outros links de navegação. Abre em outra aba.

### Mito

Painel que abre com a etiqueta "Mito" (rosa com contorno de 1,5px em tinta, 14px em negrito, raio mao-2) e, ao lado, "circula por aí, mas não se sustenta" em nota, tinta clara. O leitor de tela ouve os dois antes da frase, porque o risco (`<s>`) não é anunciado. Depois, a frase que circula em Bricolage 600, atravessada por uma faixa rosa de cerca de 30% da altura no meio da linha, e o porquê embaixo em corpo normal com referência. A faixa é um risco, mantido de propósito: diz "isto não se sustenta". Não é marca-texto, por isso não segue a regra da letra inteira.

## Do's and Don'ts

### Do:

- **Do** usar o papel frio como fundo e folha nas caixas.
- **Do** manter cada tinta no seu papel: amarelo para "vale para você", rosa para Mito e número-chave, verde-água para o caminho até a fonte.
- **Do** cobrir a altura inteira da letra com o marca-texto amarelo e rosa.
- **Do** pôr a palavra ao lado dos três degraus e dos ícones de Status.
- **Do** dar elevação só com a retícula fina deslocada 5px e 6px.
- **Do** manter alvos de toque com pelo menos 44px.
- **Do** desligar animações de traço e de marca-texto em prefers-reduced-motion, mostrando o desenho pronto.
- **Do** grudar o número de referência na palavra anterior, com cerca de 0,3em de espaço.

### Don't:

- **Don't** voltar ao desenho infantil: letra de marcador em títulos, carinhas, contornos muito tortos, etiquetas giradas.
- **Don't** mostrar Confiança, Status ou Força só por cor.
- **Don't** usar marca-texto que cubra só a metade de baixo da letra.
- **Don't** pôr mais de uma palavra em amarelo num título.
- **Don't** usar uma tinta fora do seu papel: nada de rosa em "não há dado", nada de verde-água na etiqueta do Tema.
- **Don't** usar mais de duas notas de margem em Kalam por página.
- **Don't** esconder conteúdo por causa do Perfil, nem tirar a nota "Vale para:" de um achado que cobre.
- **Don't** usar o zero cortado da Atkinson em números.
- **Don't** usar fundo creme ou bege; lê como blog de autoajuda.
- **Don't** usar sombra com desfoque nem bloco sólido deslocado.
- **Don't** compor como artigo científico: caixa azul de resumo, selo de nota, lista de referências em letra miúda.
- **Don't** traçar setas do comprimento da página; no celular elas não se leem.
