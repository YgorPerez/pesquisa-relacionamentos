---
ticket: 940
---

# O que separa o primeiro encontro que vira segundo: Blink Date, First Dates e Kings and Kweens

**Data:** 2026-11-26 · **Ticket:** [#940](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/940)
**Status de verificação:** este relatório é uma **reanálise nossa** de três bases abertas e pequenas de encontros reais, e dos diálogos escritos pelo Claude que vêm no mesmo projeto do OSF, listadas no [catálogo de bases de conversa e encontros](2026-11-26-bases-de-conversa-e-encontros.md). Os autores não publicaram nenhuma destas contas. O Blink Date e os diálogos do Claude têm a Ficha do artigo de [O'Nell, Sanchez e Finn 2026](../studies/onell-2026-ruido-rosa-conversa.md), e o First Dates a de [Kinch 2022](../studies/kinch-2022-first-dates.md). O Kings and Kweens não tem Ficha.

A pergunta: numa conversa de primeiro encontro entre desconhecidos, o que se mede no que foi dito separa os encontros que viram segundo encontro dos que não viram? As medidas são de perguntas, de equilíbrio entre os dois, de tamanho de turno, de elogio e de flerte e brincadeira. São 21 encontros por telefone, 12 encontros à mesa gravados para a TV e 52 episódios de um programa ao vivo em que uma pessoa tem 3 ou 4 encontros seguidos e escolhe um para o segundo. É pouco, e o relatório trata tudo como exploração.

## Resposta curta

- **No Blink Date, quase nada se separa do acaso.** Das 15 medidas de texto, duas deram p < 0,05, e com 15 testes se esperam umas 0,75 por puro acaso. Nenhuma sobrevive à correção para comparações múltiplas.
- **Perguntar mais, e de que tipo, não separou os encontros.** Quem foi ao segundo encontro fez 33 perguntas a cada 100 turnos; quem não foi, 31. As perguntas de acompanhamento, sobre o que o outro acabou de dizer, foram 7 contra 8 a cada 100 turnos. Devolver a pergunta ("e você?") foi quase igual nos dois grupos.
- **Os encontros que deram certo tiveram mais vaivém** (mediana de 59 turnos contra 45), com a mesma duração. Foi a única tendência que aparece também na coluna `turn_count` dos 31 encontros da base (62 contra 47,5; p = 0,07). Ela não chega a ser significativa.
- **No First Dates, o que mais separou foi ela flertar de volta.** Nos 4 encontros que deram certo, a mulher teve de 3 a 5 falas anotadas como flerte. Nos 8 que não deram, teve de 0 a 3. Flerte só dele não bastou: o encontro em que ele mais flertou (15 falas) não deu certo, e ela flertou uma vez.
- **No Kings and Kweens, ser o último encontro da noite ajudou.** Nos 47 episódios de 3 encontros, o escolhido foi o último em 23 (49%), quando o acaso daria 33% (p = 0,02). Foi o primeiro em só 10.
- **As medidas de conversa do Kings and Kweens não são confiáveis.** A transcrição é um texto corrido por episódio, com apresentador e plateia, e os falantes não têm nome. Só 12 episódios deram para recortar encontro por encontro. Neles, nenhuma medida passa da correção para comparações múltiplas.
- **Nos diálogos escritos pelo Claude, o que os leitores gostaram é o que o Claude escreveu como "bom".** Os 50 diálogos pedidos como bons tiveram nota 4,6 de 5, e os 49 pedidos como ruins, 2,4. Os bons têm turnos três vezes mais longos, mais perguntas de acompanhamento, mais "nós" e mais exclamação. Dentro de cada grupo, perguntar não mudou a nota. O que acompanhou a nota foi menos "eu" e menos "você" por palavra, e, nos ruins, mais exclamação. Quem deu a nota leu o diálogo de fora, sem participar dele.
- **As anotações do First Dates são do autor da base, que via o programa e sabia o desfecho.** Não dá para separar o que aconteceu no encontro do olhar de quem anotou. O resultado é uma pista, não uma medida.

## Os dados

**Blink Date** (podcast). Encontros só por telefone, de 11 a 13 minutos, entre desconhecidos, com uma pergunta de partida por episódio. O desfecho é `matched`: os dois responderam "sim" ou "talvez" a um segundo encontro. A base vem do projeto [OSF 7ju2s](https://osf.io/7ju2s/) de [O'Nell, Sanchez e Finn (2026)](../studies/onell-2026-ruido-rosa-conversa.md), que dão 10 minutos por encontro. O CSV de desfecho tem 31 encontros (19 sim e 12 não), e a pasta de transcrições tem 24 arquivos. Pelo nome do arquivo, 21 transcrições casam com uma linha do CSV: 14 encontros com match e 7 sem. Os outros 3 arquivos não têm linha. A transcrição é dos apresentadores do podcast (uma saiu do WhisperX, segundo o artigo), com o falante em cada fala, e não marca riso. O OSF não declara licença. Usamos só contagens, sem citar trecho.

**First Dates** (TV, Channel 4). São 12 encontros à mesa, com 1.928 falas transcritas em minúsculas e sem pontuação. Cada fala traz o sexo de quem fala, a emoção de quem fala e de quem ouve (neutra, alegre, triste, surpresa, nojo, raiva, medo), a entonação (neutra, brincadeira, confiante, flerte, nervosa, hesitante, sarcasmo) e o alvo: o par, a cabine onde a pessoa fala com a câmera, a entrevista final ou outro. O desfecho `label` diz se o encontro deu certo, e foram 4 sim e 8 não. A base é de [Kinch (2022)](../studies/kinch-2022-first-dates.md) ([figshare 20219411](https://figshare.com/articles/dataset/First_Dates_Dataset/20219411)), em CC BY 4.0, e os direitos do programa são do Channel 4. Só as 1.277 falas dirigidas ao par entram nas medidas de conversa. Um dos encontros que deram certo tem só falas femininas dirigidas ao par, e deve ser um encontro entre duas mulheres. Ele entra nas medidas gerais, e nas medidas por sexo conta só a parte feminina.

**Kings and Kweens** (YouTube). É um programa gravado ao vivo, num bar com plateia. Uma pessoa (o "king" ou a "kween") tem 3 ou 4 encontros às cegas de 10 a 12 minutos, um depois do outro, e no fim escolhe um para um segundo encontro. A base é do mesmo projeto [OSF 7ju2s](https://osf.io/7ju2s/), mas o artigo não a analisa nem a cita. O CSV tem 161 encontros em 52 episódios (47 de 3 encontros e 5 de 4), cada um com o nome do participante, a ordem na noite e `winner`, que marca quem foi escolhido. Episódios sem escolhido ou com mais de um ficaram de fora da base. Há transcrições em txt para 35 episódios: uma por episódio, com rótulos de falante ("Speaker 0", "Speaker 1") que não dizem quem é quem. Sem licença declarada.

**Diálogos do Claude.** No mesmo projeto do OSF (pasta `claude-dialogues`), os autores pediram ao Claude 3.7 Sonnet 50 conversas "boas" e 50 "ruins" entre duas pessoas que acabam de se conhecer. No artigo, a nota média dos leitores foi 4,8 nas boas e 2,4 nas ruins. Todas têm 100 turnos, e a maioria se passa num café. Cada leitor, recrutado no Prolific, leu um diálogo, respondeu três perguntas de atenção sobre o conteúdo e três de agrado em escala de 5 pontos. A planilha bruta tem 675 respostas, e o arquivo pronto dos autores com a nota de cada diálogo não está mais no OSF. Montamos a nota a partir da planilha: são 605 leitores com um diálogo só, 516 deles acertaram as três perguntas de atenção e responderam as três de agrado, e o resultado são 99 diálogos com nota (5 leitores na mediana). A nota do leitor é a média das três perguntas, e a do diálogo é a média dos leitores. A resposta certa das perguntas de atenção é a primeira opção, o que conferimos no texto de alguns diálogos.

## Método

**Blink Date.** As falas seguidas do mesmo falante viram um turno só. Para cada encontro, um script conta:

- turnos, palavras e palavras por turno;
- o desequilíbrio entre os dois na fatia de palavras e no tamanho médio do turno;
- as perguntas, separadas em três tipos. **Devolver** é "e você?", "what about you?" e parecidas. **Acompanhamento** é a pergunta que repete uma palavra de conteúdo dos dois últimos turnos do outro. **Outras** é o resto. Perguntas retóricas ("right?", "you know?") e de uma palavra ficam fora;
- backchannel, que é o turno só de "yeah", "mm hmm", "right" ou "wow";
- elogio ("that's so cool", "I love that"), papo de futuro juntos ("we should", "next time") e as taxas de "eu", "você" e "nós".

O classificador de perguntas é grosso. Ele erra o acompanhamento escrito com outras palavras, e uma amostra lida à mão mostrou acertos e erros nos três tipos.

**First Dates.** Para cada encontro, conta a fatia das falas ao par anotadas como flerte, brincadeira, nervosismo ou hesitação e confiança, e a fatia com emoção alegre ou negativa, de quem fala e de quem ouve. Separa também por sexo e conta as perguntas, que são as falas que começam com palavra interrogativa ou verbo auxiliar, já que não há pontuação.

**Kings and Kweens, ordem.** Para cada episódio, a posição do escolhido na noite. A chance de o último ser escolhido é testada contra 1/3 (ou 1/4) com a binomial, unicaudal.

**Kings and Kweens, conversa.** Os autores não publicaram onde cada encontro começa, então o recorte é nosso. O início de cada encontro é a primeira apresentação do participante depois do início do anterior ("I'm X", "my name is X", "give it up for X", "welcome X"), com os nomes e a ordem do CSV. O encontro vai até a apresentação do seguinte. Para não pegar a escolha do fim da noite nem dar mais peso a encontros mais longos, cada encontro fica com as primeiras 1.500 palavras, uns 10 minutos de fala. Dos 52 episódios, 17 não têm txt e 19 não deram para recortar (um nome não aparece numa apresentação). Dos 16 recortados, 4 têm um encontro com menos de 1.500 palavras até o seguinte, sinal de recorte errado, e saem. Sobram 12 episódios e 36 encontros. As medidas são as do Blink Date, contadas no trecho inteiro, porque os rótulos de falante não dizem quem é o participante, quem é o king ou a kween e quem é o apresentador. A comparação é dentro do episódio: a posição do escolhido entre os do mesmo episódio em cada medida (1 = o maior valor, 0 = o menor), com média entre os episódios e um teste de permutação que sorteia o escolhido dentro de cada episódio (20 mil sorteios).

**Diálogos do Claude.** As mesmas medidas do Blink Date, mais a fatia de turnos com riso escrito e com exclamação. A diferença entre bons e ruins vem do pedido feito ao Claude, então a comparação que interessa é **dentro** de cada grupo: o Spearman entre a medida e a nota em cada grupo, com média ponderada, e um teste de permutação que embaralha a nota dentro de cada grupo (5 mil sorteios).

**Comparação.** Para cada medida, a mediana nos encontros que deram certo e nos que não deram, a AUC e um teste de permutação bicaudal da diferença de medianas, com 20 mil permutações. A AUC é a chance de um encontro que deu certo ter valor maior que um que não deu, e vale 0,5 quando não há diferença. Não há correção para comparações múltiplas nas tabelas. O texto diz quando um resultado não aguentaria a correção.

## Resultados: Blink Date

21 encontros, com 1.801 palavras e 54 turnos na mediana.

| Medida | Match (14) | Sem match (7) | AUC | p |
|---|---|---|---|---|
| Turnos | 59 | 45 | 0,71 | 0,13 |
| Palavras | 1.848 | 1.654 | 0,78 | 0,11 |
| Palavras por turno | 30,6 | 33,1 | 0,41 | 0,63 |
| Desequilíbrio na fatia de palavras (0 = metade cada) | 0,14 | 0,04 | 0,74 | 0,08 |
| Desequilíbrio no tamanho do turno (razão maior/menor) | 1,34 | 1,04 | 0,79 | 0,02 |
| Perguntas por 100 turnos | 32,8 | 30,5 | 0,46 | 0,91 |
| Acompanhamento por 100 turnos | 7,1 | 7,7 | 0,47 | 0,85 |
| Devolver a pergunta por 100 turnos | 3,8 | 3,2 | 0,51 | 0,67 |
| Backchannel por 100 turnos | 8,2 | 11,9 | 0,38 | 0,38 |
| Futuro juntos por 1.000 palavras | 0,57 | 0,63 | 0,55 | 0,81 |
| Elogio por 1.000 palavras | 2,9 | 2,7 | 0,65 | 0,74 |
| "Nós" por 1.000 palavras | 4,6 | 5,4 | 0,52 | 0,66 |
| "Eu" por 1.000 palavras | 80,0 | 70,8 | 0,55 | 0,24 |
| "Você" por 1.000 palavras | 28,8 | 35,1 | 0,30 | 0,04 |

Para comparar, a medida dos próprios autores, a do "ruído rosa" na trajetória de semelhança entre os turnos (`pnr`), separa os 31 encontros com AUC 0,71 e p = 0,04 no mesmo teste. Com 21 a 31 encontros, uma diferença precisa ser desse tamanho para aparecer. As medidas de pergunta ficaram longe disso: AUC entre 0,46 e 0,51, ou seja, nada.

Dois resultados deram p < 0,05 e vão contra o que se esperaria. Os encontros com match tiveram turnos de tamanho **mais** desigual entre os dois, e usaram **menos** "você". Com 15 testes, são o que o acaso produz. Não os tratamos como achado.

## Resultados: First Dates

12 encontros e 1.277 falas ao par.

| Medida (fatia das falas ao par) | Deu certo (4) | Não (8) | AUC | p |
|---|---|---|---|---|
| Flerte, os dois | 0,128 | 0,044 | 0,84 | 0,02 |
| Flerte dela | 0,089 | 0,006 | 1,00 | 0,008 |
| Flerte dele | 0,179 | 0,078 | 0,70 | 0,12 |
| Brincadeira, os dois | 0,111 | 0,037 | 0,75 | 0,33 |
| Brincadeira dela | 0,121 | 0,052 | 0,80 | 0,11 |
| Fala alegre | 0,373 | 0,217 | 0,84 | 0,11 |
| Ouvinte alegre | 0,351 | 0,220 | 0,78 | 0,16 |
| Fala negativa (triste, raiva, nojo, medo) | 0,051 | 0,116 | 0,25 | 0,25 |
| Nervoso ou hesitante | 0,044 | 0,031 | 0,53 | 0,63 |
| Perguntas | 0,144 | 0,125 | 0,66 | 0,45 |
| Fatia das palavras dele | 0,51 | 0,59 | 0,34 | 0,43 |

Em contagem, a mulher flertou 4, 3, 5 e 5 vezes nos encontros que deram certo, e 1, 3, 1, 0, 1, 0, 0 e 0 vezes nos que não deram. Os grupos se encostam: há um 3 nos dois lados. A AUC de 1,00 vem da fatia, porque os encontros que não deram certo com 3 flertes dela tiveram mais falas. O homem flertou em quase todos os encontros, 0 a 15 vezes, e mais flerte dele não separou os grupos. No encontro com 15 flertes dele e 1 dela, não houve segundo encontro.

A direção bate com a dos encontros que deram certo, que foram mais alegres, com mais brincadeira e menos fala negativa. Nenhuma dessas medidas passa de p = 0,1.

## Resultados: Kings and Kweens

**Ordem.** Nos 47 episódios de 3 encontros, o escolhido foi o primeiro em 10, o do meio em 14 e o último em 23. O último foi escolhido em 49% das vezes, e o acaso daria 33% (p = 0,02). Nos 5 episódios de 4 encontros, o último foi escolhido em 2. A ordem é decidida pelo programa, e não sabemos se ao acaso. Se o produtor guarda para o fim o participante que acha mais promissor, parte desse efeito é escolha do produtor, não da memória de quem escolhe.

**Conversa** (12 episódios, 36 encontros). Posição média do escolhido entre os do episódio, onde 0,5 é o acaso:

| Medida | Posição do escolhido | p |
|---|---|---|
| Turnos | 0,62 | 0,30 |
| Palavras por turno | 0,33 | 0,19 |
| Perguntas por 100 turnos | 0,28 | 0,06 |
| Acompanhamento por 100 turnos | 0,19 | 0,008 |
| Devolver a pergunta por 100 turnos | 0,59 | 0,44 |
| Backchannel por 100 turnos | 0,46 | 0,79 |
| Elogio por 1.000 palavras | 0,62 | 0,28 |
| Futuro juntos por 1.000 palavras | 0,44 | 0,64 |
| "Nós" por 1.000 palavras | 0,42 | 0,55 |
| "Eu" por 1.000 palavras | 0,58 | 0,55 |
| "Você" por 1.000 palavras | 0,47 | 0,86 |

Os escolhidos tiveram **menos** perguntas de acompanhamento que os outros do episódio (posição 0,19, p = 0,008). Com 11 medidas, a correção de Bonferroni leva isso a p = 0,09. O trecho medido também mistura o participante, o king ou a kween, o apresentador e a plateia, e o recorte é nosso. Não tratamos como achado, e a direção contraria a do Huang et al. 2017, que mediu a conversa a dois sem mais ninguém.

## Resultados: diálogos do Claude

99 diálogos com nota, 50 bons e 49 ruins. A nota média dos bons foi 4,61 (de 4,11 a 4,93) e a dos ruins 2,39 (de 1,20 a 3,33). As duas faixas não se cruzam.

| Medida | Bons (mediana) | Ruins (mediana) | rho, todos | rho dentro do grupo | p dentro |
|---|---|---|---|---|---|
| Palavras por turno | 21,4 | 6,2 | 0,76 | 0,03 | 0,79 |
| Desequilíbrio na fatia de palavras | 0,04 | 0,53 | -0,58 | 0,37 | < 0,001 |
| Perguntas por 100 turnos | 27 | 24 | 0,37 | 0,19 | 0,06 |
| Acompanhamento por 100 turnos | 7 | 2 | 0,68 | -0,06 | 0,59 |
| Devolver a pergunta por 100 turnos | 2 | 0 | 0,60 | -0,07 | 0,49 |
| Backchannel por 100 turnos | 0 | 5 | -0,72 | 0,07 | 0,30 |
| Elogio por 1.000 palavras | 2,6 | 1,6 | 0,27 | 0,02 | 0,82 |
| Futuro juntos por 1.000 palavras | 1,8 | 0 | 0,62 | 0,01 | 0,94 |
| "Nós" por 1.000 palavras | 11,8 | 1,6 | 0,70 | -0,04 | 0,68 |
| "Eu" por 1.000 palavras | 48,3 | 62,5 | -0,65 | -0,45 | < 0,001 |
| "Você" por 1.000 palavras | 26,5 | 50,5 | -0,81 | -0,30 | 0,002 |
| Exclamação por 100 turnos | 23 | 2 | 0,82 | 0,34 | 0,001 |

**Entre os grupos**, quase tudo separa, e na direção esperada: o ruim do Claude é uma das pessoas respondendo seco ("Sometimes.", "It's okay."), sem pergunta de volta e sem acompanhamento. Isso diz como o Claude escreve uma conversa ruim, e não o que torna uma conversa ruim.

**Dentro dos grupos**, quatro medidas acompanham a nota:
- **"Eu" por palavra:** rho -0,30 nos bons e -0,60 nos ruins.
- **"Você" por palavra:** -0,31 e -0,30.
- **Exclamação:** 0,07 e 0,62.
- **Desequilíbrio na fatia de palavras:** 0,26 e 0,48.

O desequilíbrio vai na direção contrária à do Huang et al. 2017. Nos diálogos ruins, quanto mais uma das pessoas carrega a conversa, com animação, enquanto a outra responde seco, mais o leitor gosta. Perguntar mais, fazer acompanhamento e devolver a pergunta não mudaram a nota dentro de nenhum grupo.

Os leitores são de fora, e o Huang et al. 2017 mostrou que quem lê de fora não vê o efeito das perguntas de acompanhamento que o parceiro sente. Estas notas medem o que um leitor gosta de ler, que é o mesmo lugar de um juiz de mensagens, e não o que a outra pessoa da conversa sente.

## Limites

- **Amostras mínimas.** São 21 e 12 encontros. Um efeito médio passaria despercebido, e um resultado com p < 0,05 entre 15 testes pode ser acaso.
- **O desfecho do First Dates e as anotações vêm da mesma pessoa, que via o programa editado.** A edição da TV escolhe o que entra, e o anotador sabia como o encontro acabou. O flerte dela pode ser efeito do interesse, não causa, e pode ter sido mais anotado onde o fim foi feliz.
- **Blink Date é por telefone, com uma pergunta de partida imposta e gente que topou ir a um podcast.** First Dates é TV britânica, com câmera e restaurante. Nenhum dos dois é chat de app.
- **As medidas de texto do Blink Date são contagens por palavra-chave**, sem leitura de sentido. A pergunta de acompanhamento escrita com outras palavras escapa.
- **Faltam 10 transcrições do Blink Date**, e não sabemos se faltam ao acaso.
- **Os diálogos do Claude são ficção com um pedido explícito de "bom" ou "ruim".** A variação dentro de cada grupo é pequena (de 4,1 a 4,9 nos bons), e são 5 leitores por diálogo na mediana. O que o Claude entende por boa conversa já está no texto, e um juiz que também é um modelo de linguagem tende a concordar com ele.
- **O recorte do Kings and Kweens é nosso e grosso.** Os encontros começam na apresentação gravada do participante, e o trecho medido traz o apresentador e a plateia junto. Os 12 episódios que sobraram podem não ser como os 40 que saíram.
