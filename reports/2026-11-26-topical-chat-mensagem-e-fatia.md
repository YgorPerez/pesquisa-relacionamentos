---
ticket: 942
---

# Quando um fala demais, o outro gosta menos: notas do Topical-Chat

**Data:** 2026-11-26 · **Ticket:** [#942](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/942)
**Status de verificação:** este relatório é uma **reanálise nossa** do Topical-Chat, listado no [catálogo de bases de conversa e encontros](2026-11-26-bases-de-conversa-e-encontros.md). Os autores não publicaram estas contas, e a base não tem Ficha.

O Topical-Chat tem 10.784 conversas por texto entre pares de trabalhadores do Mechanical Turk, que conversam sobre um assunto a partir de textos que cada um recebeu para ler. Ele traz duas notas. A outra pessoa dá uma nota a cada mensagem, e cada um dá uma nota à conversa no fim. As perguntas deste relatório são duas. Na mensagem, o que acompanha a nota que a outra pessoa dá a ela? Na conversa, o que no jeito de um acompanha a nota que o outro dá à conversa? Não é namoro: é conversa de tarefa entre desconhecidos, sem rosto e por texto.

## Resposta curta

- **Quando a outra pessoa fica com a maior parte das palavras, a nota que se dá à conversa cai.** Com o outro escrevendo menos de 35% das palavras da dupla, a nota média foi 4,62. Com o outro escrevendo mais de 65%, foi 4,09, numa escala de 1 a 5 em que quase todos dão 4 ou 5. O efeito aparece com qualquer tamanho das próprias mensagens.
- **Mensagens longas do outro acompanham uma nota pior à conversa.** Com o outro escrevendo até 12 palavras por mensagem, a nota foi 4,73, e com mais de 35, 4,34. O tamanho das próprias mensagens quase não mudou a nota que cada um deu.
- **Na mensagem, a mais curta leva nota pior.** Uma mensagem de até 5 palavras ficou 0,19 ponto abaixo da média do mesmo autor na mesma conversa, e uma de mais de 60 palavras ficou 0,11 acima. Quem dá essa nota é o outro, e a nota é de "qualidade da mensagem", numa tarefa sobre um assunto.
- **Perguntar pouco mudou a nota da mensagem, e devolver a pergunta ("e você?") foi a marca pior avaliada** (−0,08 ponto). Retomar uma palavra do que o outro disse, rir e reagir ("wow", "interesting") subiram um pouco, de +0,02 a +0,04. São efeitos pequenos numa base enorme.

## Os dados

O [Topical-Chat](https://github.com/alexa/Topical-Chat) (Gopalakrishnan et al. 2019, Interspeech, doi 10.21437/Interspeech.2019-3079) tem licença CDLA-Sharing 1.0. Usamos as cinco partes (treino, validação e teste, "freq" e "rare"):

- **10.784 conversas**, com cerca de 22 mensagens cada;
- **233.073 mensagens com a nota da outra pessoa** (`turn_rating`, de Poor a Excellent, que lemos de 1 a 5). A distribuição é 696, 1.824, 13.365, 103.983 e 113.205, ou seja, 93% são 4 ou 5;
- **21.344 notas à conversa** (`conversation_rating`, uma de cada pessoa, mesma escala), das quais 95% são 4 ou 5.

Cada mensagem traz também a parte do texto de leitura que a pessoa usou para escrevê-la, ou "Personal Knowledge" quando não usou nenhuma.

## Método

**Marcas de cada mensagem**, contadas por script:

- **tamanho** em palavras;
- **pergunta**, separada em três tipos. **Devolver** é "what about you?", "and you?" e parecidas. **Acompanhamento** é a pergunta que repete uma palavra de conteúdo da última mensagem do outro. **Pergunta nova** é o resto. Perguntas retóricas e de uma palavra ficam fora;
- **exclamação**, **riso** escrito ("haha", "lol"), **emoji**;
- **concordar** ("me too", "exactly", "so true") e **reagir** ("wow", "cool", "interesting");
- **retomar o outro**, que é repetir ao menos uma palavra de conteúdo da última mensagem dele;
- **fato lido**, quando a pessoa marcou que usou o texto de leitura.

**Mensagem.** A nota do outro depende muito de quem dá a nota e da conversa. Por isso a comparação é dentro do mesmo par (conversa, autor): a nota média das mensagens com a marca menos a das mensagens sem ela, só nos pares que têm os dois tipos. Calculamos a média dessas diferenças e um intervalo de 95% por bootstrap, com mil sorteios. Para o tamanho, entra a nota de cada mensagem menos a média do par, por faixa de palavras.

**Conversa.** Para cada nota que uma pessoa deu à conversa, medimos o jeito da outra: a fatia das palavras da dupla que ela escreveu, as palavras por mensagem e a fração de mensagens com cada marca. Para cada medida, damos o Spearman com a nota e a nota média no terço de baixo e no terço de cima. Para a fatia, damos também a nota por faixa e por faixa do tamanho das próprias mensagens.

## Resultados: a nota de cada mensagem

| Marca | Fatia das mensagens | Diferença na nota (1 a 5) | IC 95% | Pares com e sem |
|---|---|---|---|---|
| Fato lido | 86% | +0,104 | +0,095 a +0,113 | 10.921 |
| Retoma o outro | 43% | +0,044 | +0,040 a +0,047 | 21.011 |
| Risada | 7% | +0,023 | +0,015 a +0,029 | 7.858 |
| Reage ("wow", "cool") | 18% | +0,023 | +0,018 a +0,027 | 17.529 |
| Acompanhamento | 6% | +0,014 | +0,007 a +0,021 | 9.763 |
| Exclamação | 22% | +0,014 | +0,009 a +0,019 | 14.245 |
| Concorda | 4% | +0,012 | +0,004 a +0,019 | 6.883 |
| Emoji | 0,5% | +0,014 | −0,025 a +0,051 | 507 |
| Pergunta, qualquer | 30% | −0,026 | −0,030 a −0,022 | 19.817 |
| Pergunta nova | 21% | −0,026 | −0,030 a −0,021 | 18.399 |
| Devolver a pergunta | 2,5% | −0,078 | −0,090 a −0,066 | 5.032 |

| Tamanho da mensagem | Nota menos a média do par | Mensagens |
|---|---|---|
| 1 a 5 palavras | −0,193 | 10.425 |
| 6 a 10 | −0,076 | 32.199 |
| 11 a 20 | +0,004 | 98.238 |
| 21 a 35 | +0,039 | 76.133 |
| 36 a 60 | +0,067 | 15.231 |
| mais de 60 | +0,105 | 820 |

Todas as diferenças são pequenas: a maior marca, fora o tamanho, move um décimo de ponto numa escala em que quase tudo é 4 ou 5. O sentido é coerente com a tarefa. A nota é de qualidade da mensagem numa conversa sobre um assunto, e a mensagem que traz conteúdo (longa, com fato lido, retomando o outro) é mais bem avaliada que a que só passa a vez ("e você?").

## Resultados: a nota à conversa e o jeito do outro

| Jeito do outro | Spearman com a nota | Nota no terço de baixo | No terço de cima |
|---|---|---|---|
| Palavras por mensagem | −0,205 | 4,64 | 4,37 |
| Fatia das palavras da dupla | −0,175 | 4,59 | 4,35 |
| Mensagens com fato lido | −0,091 | 4,53 | 4,45 |
| Mensagens que retomam o outro | −0,093 | 4,56 | 4,46 |
| Mensagens com riso | −0,081 | 4,52 | 4,45 |
| Diferença de tamanho entre os dois | −0,077 | 4,54 | 4,44 |
| Mensagens com acompanhamento | −0,051 | 4,52 | 4,46 |
| Mensagens com pergunta | +0,052 | 4,45 | 4,52 |
| Mensagens que devolvem a pergunta | +0,075 | 4,47 | 4,55 |
| Mensagens com exclamação | +0,073 | 4,44 | 4,54 |

Com 21 mil notas, todo Spearman acima de uns 0,02 em módulo fica longe do acaso. O que pesa é o tamanho. A nota que cada um deu à conversa caiu quando o outro escrevia mais:

| Fatia das palavras escritas pelo outro | Nota média | Notas |
|---|---|---|
| até 35% | 4,62 | 804 |
| 35% a 45% | 4,59 | 5.119 |
| 45% a 55% | 4,53 | 9.711 |
| 55% a 65% | 4,37 | 5.096 |
| mais de 65% | 4,09 | 801 |

| Tamanho médio das mensagens do outro | Nota média |
|---|---|
| até 12 palavras | 4,73 |
| 12 a 18 | 4,57 |
| 18 a 25 | 4,42 |
| 25 a 35 | 4,36 |
| mais de 35 | 4,34 |

Isso não vem de quem escreve pouco ser mais crítico. O tamanho das próprias mensagens quase não mudou a nota que a pessoa deu (de 4,48 a 4,57 entre as faixas). Dentro de cada faixa do próprio tamanho, a nota caiu quando o outro passou de 55% das palavras. Com mensagens próprias de até 15 palavras, a nota foi de 4,64 para 4,32. De 15 a 22, de 4,61 para 4,33. Acima de 22, de 4,58 para 4,39.

Aqui aparece uma diferença com o que a mesma mensagem recebe. A mensagem longa leva nota melhor do outro, mas quem escreve mensagens longas sempre leva a conversa a uma nota pior do outro. A mensagem é avaliada como conteúdo, e a conversa como experiência.

## Comparação com o Huang et al. 2017

No chat entre desconhecidos de Huang et al. 2017 ([relatório](2026-11-25-perguntas-de-continuidade-e-simpatia.md)), quem escreveu menos de 35% das palavras da dupla foi menos apreciado pelo parceiro. Aqui, quem deixa o outro escrever mais de 65% gosta menos da conversa. Os dois resultados vão no mesmo sentido: a conversa desequilibrada é pior para quem fica com a parte pequena. O Huang mostra que essa pessoa agrada menos, e o Topical-Chat que ela também aproveita menos.

As perguntas se comportam de outro jeito. No Huang, perguntar mais e fazer acompanhamento subiram o quanto o parceiro gostou. Aqui, a pergunta não mudou a nota da mensagem, e devolver a pergunta baixou um pouco. As notas medem coisas diferentes: lá, quanto se gostou da pessoa; aqui, a qualidade de uma mensagem numa conversa sobre um assunto.

## Limites

- **É conversa de tarefa.** Os pares foram instruídos a conversar sobre um assunto, usando textos de leitura. Mensagem longa e com fato pode ser exatamente o que a tarefa pedia.
- **As notas estão no teto.** 93% das notas de mensagem e 95% das de conversa são 4 ou 5. Diferenças de décimos são o que sobra para medir.
- **Ninguém sabe se o outro gostou da pessoa.** A base não pergunta quanto um gostou do outro, só da conversa e das mensagens.
- **As marcas são palavras-chave.** O acompanhamento escrito com outras palavras escapa, e "cool" conta como reação mesmo numa frase neutra.
- **É correlação.** Conversas em que um fala muito podem ser conversas em que o outro já estava desinteressado e respondia curto.
