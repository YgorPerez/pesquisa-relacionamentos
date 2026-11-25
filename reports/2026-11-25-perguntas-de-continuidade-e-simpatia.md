---
ticket: 936
---

# Que tipo de pergunta, quantas e que jeito de escrever andam junto com o outro gostar mais, numa conversa por texto entre desconhecidos?

**Data:** 2026-11-25 · **Ticket:** [#936](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/936)
**Status de verificação:** este relatório é uma **reanálise nossa** dos dados abertos de [Huang et al. 2017](../studies/huang-2017-perguntas-de-continuidade.md) (✅, força moderada). Os números abaixo saíram das nossas contas sobre os arquivos que os autores publicaram, não do artigo, e não foram revisados por ninguém de fora. Onde um número coincide com o que os autores publicaram, eu digo. A Ficha continua sendo a fonte do que o artigo afirma.

O artigo de Huang e colegas mostrou que, em chats de texto de 15 minutos entre desconhecidos, quem foi sorteado para fazer muitas perguntas foi mais querido pelo parceiro, e que a pergunta de continuidade, a que retoma o que o outro acabou de dizer, foi o tipo que andou junto com esse gosto. Os autores publicaram as conversas, a classificação de cada pergunta feita à mão e as notas no OSF. Com esses arquivos dá para olhar o que o artigo não mostra: quanto vale cada tipo de pergunta com os outros na mesma conta, se perguntar demais cansa, o que o tamanho das mensagens, o riso e o ponto de exclamação têm a ver com a nota, e como o outro responde, turno a turno, a cada tipo de pergunta.

Não é namoro. Os chats são entre desconhecidos sem interesse romântico; só a parte de speed dating (o Estudo 3 do artigo) tem um desfecho de paquera, e lá as perguntas foram contadas por um classificador automático, não à mão.

## Resposta curta

- **Refazendo a conta, o resultado principal do artigo se repete.** Entre os que receberam instrução, quem foi mandado perguntar muito recebeu do parceiro uma nota de simpatia 0,31 desvio-padrão acima de quem foi mandado perguntar pouco (intervalo de 95% de 0,14 a 0,49). Os autores relatam d = 0,35 e 0,27 nos dois estudos.
- **Com todos os tipos de pergunta na mesma conta, só a de continuidade e a que puxa um assunto vizinho andaram junto com mais simpatia.** Cada pergunta de continuidade a mais valeu +0,04 desvio-padrão, e cada uma que parte do que o outro disse para um assunto vizinho, +0,11. A pergunta de assunto novo, a que devolve a pergunta recebida ("e você?") e o cumprimento em forma de pergunta não se distinguiram de zero.
- **Contar perguntas não basta; a fração das que retomam o outro pesa mais.** Com o total de perguntas fixo, passar de nenhuma a todas as perguntas de continuidade valeu +0,36 desvio-padrão, e o total, com essa fração na conta, deixou de importar. Mas o efeito apareceu quase só em quem foi mandado perguntar pouco; em quem perguntou do próprio jeito, sem instrução, não apareceu.
- **Perguntar mais ajudou até umas 8 perguntas em 15 minutos, e depois ficou plano, sem cair.** Até 8, cada pergunta a mais valeu +0,07 desvio-padrão; depois, nada que se distinga de zero. Em nenhuma faixa perguntar muito andou junto com nota pior.
- **Escrever mensagens mais longas, rir por escrito e usar ponto de exclamação andaram junto com mais simpatia, e escrever bem menos que o outro, com menos.** São associações: quem está gostando da conversa escreve mais e se anima, e o outro responde a esse clima.
- **Turno a turno, a pergunta de continuidade puxou resposta mais longa e sobre a própria pessoa; a de assunto novo puxou a mesma pergunta de volta.** Depois de um cumprimento em forma de pergunta, a resposta foi a mais curta de todas.
- **No speed dating, quando quem decidia era a mulher, mais perguntas de continuidade do homem andaram junto com mais "quero sair de novo".** De 34% no terço com menos dessas perguntas para 42% no terço com mais. Mas essa conta não leva em conta o quanto cada homem já era desejado, e a análise dos autores que leva isso em conta não achou ligação além do acaso.
- **Quem leu as conversas de fora não viu nada disso.** Os observadores deram a mesma nota a quem foi mandado perguntar muito e a quem foi mandado perguntar pouco, e a nota deles quase não previu a do parceiro.

## Os dados e o método

**Fonte.** O projeto "Question-Asking" no OSF (https://osf.io/8k7rf/), de Huang, Yeomans, Brooks, Minson e Gino, em licença MIT. Usamos: `train_studies.csv` e `train_chats.csv` (os Estudos 1 e 2A juntos, com a classificação das perguntas), `study2B.csv` e `study2Apeople.csv` (os observadores do Estudo 2B) e `study3.csv` (o speed dating). O arquivo do Estudo 1 com os dados brutos tem endereço de IP e localização de cada participante; não foi usado nas contas, e nenhum dado das conversas nem identificador de participante entra neste relatório ou no acervo.

**Quem.** 368 chats de texto de 15 minutos, com 736 pessoas e 11.866 mensagens: as 199 duplas do Estudo 1 (laboratório) e as 169 do Estudo 2A (Amazon Mechanical Turk), os mesmos números do artigo. Mais 612 observadores que leram os chats do Estudo 2A (1.224 notas para 338 pessoas) e 1.961 decisões de 110 pessoas no speed dating, das quais 980 de mulheres.

**O sorteio.** No Estudo 1, uma pessoa de cada dupla foi mandada fazer pelo menos 9 perguntas ou no máximo 4, e a outra não recebeu instrução (199 pessoas). No Estudo 2A, as duas receberam instrução. Toda conta sobre número de perguntas leva em conta a condição (muitas, poucas ou sem instrução).

**Os tipos de pergunta**, como os assistentes de pesquisa classificaram: de continuidade (sobre o que o outro acabou de dizer), troca parcial (parte do que o outro disse para um assunto vizinho), troca total (assunto novo), espelho (devolve a pergunta recebida), introdutória (cumprimento em forma de pergunta) e retórica (não pede resposta; 87 no total, fora das conclusões). No total foram 1.831 de continuidade, 1.247 de troca total, 864 espelhos, 250 introdutórias e 248 trocas parciais; a mediana foi de 5 perguntas por pessoa nos 15 minutos.

**O desfecho.** A nota de simpatia que o parceiro deu (média de quatro itens). Os dois estudos usaram escalas um pouco diferentes, então a nota foi padronizada dentro de cada estudo: os efeitos vêm em desvios-padrão (DP), e toda conta leva o estudo em conta. Perto de um em cada cinco deu a nota máxima.

**As medidas de texto**, contadas por script para cada pessoa: palavras, palavras por mensagem, a fatia das palavras da dupla, pronomes de primeira pessoa por 100 palavras (uma aproximação grossa de falar de si), a fração de mensagens com riso escrito em inglês ("haha", "lol", ":)") e com ponto de exclamação.

**A estatística.** Regressão linear, com intervalo de 95% por reamostragem que sorteia duplas inteiras (2.000 vezes), porque as duas pessoas de uma dupla não são independentes. No speed dating, um modelo de probabilidade linear que compara cada mulher com ela mesma (efeito fixo de quem decide), com reamostragem por pessoa. Turno a turno, 11.498 pares de mensagem e resposta.

**Critério.** Um intervalo que não cruza zero é chamado aqui de diferença além do acaso. São muitas contas sobre os mesmos dados, e nenhuma foi registrada antes, então um ou outro resultado isolado pode ser sorte.

## Resultados

### 1. A instrução de perguntar mais

Entre as 537 pessoas que receberam instrução, quem foi mandado perguntar muito teve nota do parceiro 0,31 DP acima de quem foi mandado perguntar pouco (de 0,14 a 0,49). Os mandados perguntar muito fizeram em média 8,6 perguntas; os mandados perguntar pouco, 3,7; os sem instrução, 6,5. É o mesmo resultado do artigo, por outro caminho.

### 2. O tipo de pergunta

Com as contagens de todos os tipos na mesma conta, mais o estudo e a condição (736 pessoas, 368 duplas), o efeito de uma pergunta a mais de cada tipo:

| Tipo | Efeito por pergunta (DP) | Intervalo de 95% |
|---|---|---|
| Continuidade | +0,041 | +0,008 a +0,075 |
| Troca parcial (assunto vizinho) | +0,111 | +0,021 a +0,205 |
| Troca total (assunto novo) | −0,028 | −0,086 a +0,030 |
| Espelho | +0,028 | −0,030 a +0,080 |
| Introdutória | +0,002 | −0,159 a +0,150 |

O artigo compara os tipos de pergunta na Tabela 3, cujos coeficientes a auditoria de 2024 refez e achou diferentes, mantendo a de continuidade como a única que prevê o gosto do parceiro (ver a [Ficha](../studies/huang-2017-perguntas-de-continuidade.md)). A tabela acima é a nossa conta, não a deles. A troca parcial, com só 248 perguntas no corpus inteiro, tem o intervalo mais largo, e é nela que esta conta se afasta do que o artigo e a auditoria dizem.

**A fração de continuidade.** Entre quem fez 3 perguntas ou mais (646 pessoas), com o total de perguntas fixo, passar de 0% para 100% das perguntas sendo de continuidade valeu +0,36 DP (de +0,03 a +0,70). Com essa fração na conta, o total de perguntas deixou de pesar (+0,005 por pergunta, de −0,023 a +0,030). Por terços da fração: até 29% de continuidade, −0,04 DP (208 pessoas); de 29% a 50%, +0,02 (193); acima de 50%, +0,13 (de +0,03 a +0,24; 245 pessoas).

**Nenhuma pergunta de continuidade foi o pior caso, com o mesmo número de perguntas:**

| Perguntas em 15 minutos | Sem nenhuma de continuidade | Com pelo menos uma |
|---|---|---|
| 0 a 3 | −0,45 DP (98 pessoas) | −0,08 DP (79) |
| 4 a 7 | −0,14 DP (53) | +0,08 DP (273) |
| 8 ou mais | (1 pessoa) | +0,16 DP (232) |

**Onde aparece.** A fração de continuidade pesou sobretudo em quem foi mandado perguntar pouco: +0,74 DP (de +0,20 a +1,32; 215 pessoas). Nos mandados perguntar muito, +0,17 (de −0,45 a +0,83; 250). Em quem não recebeu instrução e perguntou do próprio jeito, nada (−0,02, de −0,59 a +0,51; 181). Uma leitura possível: quando há poucas perguntas, faz diferença que elas sejam sobre o que o outro disse. A falta de efeito em quem perguntou livremente pode ser o grupo pequeno, ou pode ser que quem já está gostando pergunte mais de tudo, o que apaga a diferença entre os tipos.

### 3. Quantas perguntas: o ganho para de crescer

| Perguntas em 15 minutos | Pessoas | Simpatia (DP) | Intervalo de 95% |
|---|---|---|---|
| 0–1 | 51 | −0,29 | −0,59 a −0,01 |
| 2–3 | 126 | −0,28 | −0,51 a −0,08 |
| 4–5 | 200 | +0,01 | −0,12 a +0,14 |
| 6–7 | 126 | +0,10 | −0,07 a +0,26 |
| 8–9 | 106 | +0,15 | −0,02 a +0,31 |
| 10–11 | 65 | +0,18 | −0,08 a +0,39 |
| 12–14 | 35 | +0,14 | −0,11 a +0,40 |
| 15–19 | 26 | +0,09 | −0,32 a +0,46 |

Numa reta com uma dobra em 8 perguntas, até 8 cada pergunta a mais valeu +0,070 DP (de +0,034 a +0,108); depois de 8, −0,007 (de −0,045 a +0,030). Com a dobra em 6, 10 ou 12, o desenho é o mesmo. A mediana foi de 15 mensagens por pessoa, então 8 perguntas são perto de uma a cada duas mensagens. O artigo supõe que perguntar demais possa cansar o outro, e os autores dizem que ninguém testou os extremos; aqui, até 19 perguntas em 15 minutos, não apareceu queda.

### 4. Tamanho, riso, exclamação e quem fala mais

Cada linha é uma conta separada, com estudo, condição e número de perguntas; o efeito é de 1 DP a mais na medida.

| Medida (mediana) | Simpatia do parceiro (DP) | Intervalo de 95% |
|---|---|---|
| Palavras no chat (231) | +0,24 | +0,16 a +0,33 |
| Palavras por mensagem (15) | +0,16 | +0,09 a +0,24 |
| Mensagens seguidas antes de passar a vez (1,5) | −0,03 | −0,09 a +0,04 |
| Fatia das palavras da dupla (50%) | +0,05 | −0,01 a +0,12 |
| Primeira pessoa por 100 palavras (7,1) | +0,05 | −0,03 a +0,14 |
| Fração de mensagens com riso (6%) | +0,12 | +0,06 a +0,18 |
| Fração de mensagens com "!" (11%) | +0,23 | +0,17 a +0,29 |

Com tudo na mesma conta, ficaram as palavras por mensagem (+0,19), o número de mensagens (+0,19) e o ponto de exclamação (+0,18); o riso caiu para +0,03 (de −0,03 a +0,09) e o número de perguntas para +0,01. Parte do que as perguntas parecem fazer anda junto com escrever mais e com entusiasmo.

- **Tamanho.** Quem escreveu em média menos de 12 palavras por mensagem teve −0,24 DP (de −0,41 a −0,09; 222 pessoas); 12 ou mais, +0,11 (de +0,03 a +0,18; 514). A nota sobe até umas 18 a 30 palavras por mensagem (+0,15) e para.
- **Quem fala mais.** Escrever menos de 35% das palavras da dupla: −0,45 DP (de −0,81 a −0,13; 52 pessoas). Entre 35% e 65%: +0,05 (633). Mais de 65%: −0,18 (de −0,47 a +0,09; 51). Falar pouco pesou; falar muito, menos e sem certeza.
- **Tamanho descasado.** Levando em conta o próprio tamanho, cada DP a mais de diferença entre o tamanho médio das mensagens de um e do outro valeu −0,11 (de −0,19 a −0,03). Os tamanhos dos dois da dupla andam juntos (correlação de Spearman de 0,56).
- **Falar de si.** Sem ligação clara; por quintis, a nota sobe até o meio (+0,11) e cai no quintil de cima (−0,07).
- **Riso.** Sem riso nenhum: −0,16 DP (de −0,29 a −0,04; 299 pessoas); com algum: +0,11 (de +0,03 a +0,19; 437). O riso puxa riso: o outro riu na mensagem seguinte a um riso em 24% das vezes (1.267 casos), contra 10% sem riso antes.
- **Exclamação.** Nenhum "!": −0,27 DP (de −0,42 a −0,13; 224 pessoas); em 20% das mensagens ou mais: +0,29 (de +0,20 a +0,36; 266).

Nada nesta seção foi sorteado. Só o número de perguntas teve parte da variação vinda da instrução.

### 5. Turno a turno: o que vem depois de cada tipo de pergunta

Para cada mensagem de A, a resposta seguinte de B: quantas palavras, o tamanho em relação à média da própria B no chat (razão), se B perguntou algo de volta e se B falou de si (primeira pessoa).

| Mensagem de A | Pares | Palavras de B | Tamanho de B / média dela | B pergunta de volta | B fala de si |
|---|---|---|---|---|---|
| Sem pergunta | 6.993 | 12,9 | ×0,74 | 35% | 48% |
| Continuidade | 1.825 | 21,1 | ×1,03 (1,00 a 1,06) | 34% | 64% |
| Troca parcial | 247 | 22,3 | ×1,17 (1,09 a 1,27) | 38% | 81% |
| Troca total | 1.239 | 18,1 | ×0,93 (0,90 a 0,97) | 55% | 73% |
| Espelho | 859 | 18,0 | ×0,92 (0,89 a 0,96) | 46% | 73% |
| Introdutória | 251 | 8,6 | ×0,52 (0,48 a 0,56) | 72% | 62% |

Tirando os primeiros 20% de cada chat, onde estão os cumprimentos, continuidade, troca total e espelho ficam todos perto de ×1,05 no tamanho; a pergunta de volta continua em 32% depois de continuidade e 49% depois de troca total. Assunto novo tende a receber a mesma pergunta de volta; continuidade, uma resposta mais longa sobre a própria pessoa e menos pergunta de volta.

**O tamanho da mensagem de A e o da resposta de B**, em relação à média de B, depois dos 20% iniciais: até 3 palavras, ×0,69 (875 pares); de 4 a 7, ×0,77 (1.624); de 8 a 14, ×0,85 (2.494); de 15 a 29, ×0,94 (2.663); 30 ou mais, ×1,13 (1.253). Mensagem curta recebe resposta curta.

### 6. O speed dating (Estudo 3 do artigo)

Quando quem decidia era a mulher (980 encontros), cada DP a mais na taxa de perguntas de continuidade do homem andou junto com +8,5 pontos percentuais na chance de ela dizer que queria sair de novo (de +3,1 a +13,6), comparando cada mulher com ela mesma e com as perguntas de troca de assunto, espelho e introdutórias e o número de turnos na conta. Troca de assunto: −4,1 pontos (de −10,0 a +1,1); espelho: −1,1 (de −4,3 a +2,4). Por terços da taxa de continuidade dele, o sim dela foi de 34,3% no terço de baixo, 34,7% no do meio e 41,6% no de cima. Quando quem decidia era o homem, a ligação foi menor e pode ser acaso (+2,0 pontos, de −2,8 a +6,9). As mulheres disseram sim em 37% dos encontros, e os homens em 57%.

Este é o resultado mais frágil do relatório:

- A conta compara cada mulher com ela mesma, mas não leva em conta o quanto cada homem já era desejado pelas outras. Nos modelos dos autores que levam isso em conta (Tabela 5, colunas 4 a 6), a ligação de cada medida de pergunta com o segundo encontro pode ser acaso, inclusive a da taxa de continuidade ([Ficha de Huang 2017](../studies/huang-2017-perguntas-de-continuidade.md)). Um homem mais desejado pode tanto perguntar diferente quanto receber mais sim por outros motivos.
- A reanálise de [Kluger & Malloy 2019](../studies/kluger-2019-perguntas-diadico.md), com os mesmos dados e um modelo feito para esse desenho, achou que perguntas de continuidade e de troca de assunto andam muito juntas num mesmo encontro (r = 0,87) e que, com as duas na conta, a de continuidade não previu o segundo encontro melhor que a outra.
- As perguntas foram contadas por um classificador treinado nas anotações dos chats, não à mão.

Por isso o número de +8,5 pontos não deve ser lido como o efeito de perguntar sobre o que o outro disse num encontro. Ele mostra só que, nestes dados, as duas coisas andaram juntas do lado das mulheres.

### 7. Quem lê de fora

No Estudo 2B, os observadores deram quase a mesma nota a quem foi mandado perguntar muito e a quem foi mandado perguntar pouco: 5,43 contra 5,39, d = 0,03 (1.224 notas). Os parceiros das mesmas pessoas deram d = 0,25. A nota média dos observadores para uma pessoa quase não previu a nota que o parceiro deu a ela (Spearman 0,08, p = 0,13, 338 pessoas). O número de palavras andou junto com a nota do parceiro (Spearman 0,31) e quase nada com a dos observadores (0,07). O artigo já diz que os observadores não gostaram mais de quem perguntou muito; a conta aqui mostra que a nota de fora, em geral, diz pouco sobre a de dentro.

## Limites

- **É uma reanálise nossa.** As contas não foram registradas antes e não passaram por revisão; são muitas, sobre os mesmos dados, e uma ou outra pode ter dado certo por sorte. Onde elas batem com o artigo (o efeito da instrução, a contagem das perguntas e das pessoas), o artigo é a fonte.
- **Não é namoro.** Os chats são entre desconhecidos que receberam a tarefa de se conhecer, sem interesse romântico, com hora para acabar e com todo mundo respondendo por obrigação. O desfecho é gostar do outro, não responder no dia seguinte nem marcar encontro.
- **Quem participou.** Gente de laboratório de uma universidade americana e do MTurk, em inglês.
- **O sorteio cobre só o número de perguntas.** O tipo de pergunta, o tamanho das mensagens, o riso e a exclamação não foram sorteados: são associações, e quem já está gostando tende a escrever mais, rir e perguntar sobre o que o outro disse. O efeito do tipo de pergunta apareceu quase só em quem foi mandado perguntar pouco.
- **A nota tem teto.** Perto de 21% deram a nota máxima, o que encolhe as diferenças entre quem foi bem.
- **Medidas grossas.** Falar de si foi contado por pronome de primeira pessoa, e o riso por formas do inglês.
- **O speed dating** é romântico, mas cara a cara, de 4 minutos, com universitários dos EUA e perguntas contadas por máquina, e a nossa conta não leva em conta o quanto cada pessoa já era desejada (seção 6).
- **Integridade.** Uma das autoras teve outros artigos retratados; este não foi, e uma auditoria independente de 2024 refez o caminho dos dados brutos aos números publicados. O que a auditoria mudou está na [Ficha](../studies/huang-2017-perguntas-de-continuidade.md).

## Relatórios que tocam o tema

- [O que faz a primeira mensagem num app de namoro ter resposta?](2026-11-14-primeira-mensagem-e-resposta.md): perguntar na primeira mensagem e o tamanho dela, em dados de app. Este relatório é sobre o meio da conversa, não sobre a abertura.
- [Demorar para responder, o tamanho da mensagem e se fazer de difícil](2026-11-14-ritmo-demora-e-dificil-de-conquistar.md): a seção 7 de lá resume o Huang 2017 como publicado; a seção 4 daqui acrescenta o tamanho das mensagens nos mesmos chats.
- [Espelhar o estilo do outro por texto](2026-11-15-espelhar-o-estilo-por-texto.md): o tamanho descasado e o riso que puxa riso (seções 4 e 5 daqui) são casos do ajuste de estilo que aquele relatório trata.
- [Emoji, risada escrita, figurinha e áudio](2026-11-15-emoji-risada-figurinha-e-audio.md): os estudos sobre risada escrita; aqui o riso é uma contagem simples, em inglês.
- [Do app ao primeiro encontro](2026-11-14-do-app-ao-primeiro-encontro.md): o speed dating e o segundo encontro, com o mesmo cuidado sobre o Estudo 3.

## O que isso muda nos Guias e nas Dicas

Nada, por enquanto. Um Guia cita Fichas, e esta reanálise não é um estudo publicado. A Dica [`perguntas-de-continuidade`](../tips/perguntas-de-continuidade.md) já diz o que a Ficha sustenta: perguntar mais deixou quem pergunta um pouco mais querido em chats entre desconhecidos, e a pergunta sobre o que o outro disse andou junto com gostar mais, sem sorteio. A reanálise vai na mesma direção e não autoriza dizer mais: o ganho para de crescer perto de uma pergunta a cada duas mensagens, e no speed dating a ligação com o segundo encontro não resiste a levar em conta quem já era desejado.
