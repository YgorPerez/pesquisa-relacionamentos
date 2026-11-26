---
ticket: 940
---

# O que separa o primeiro encontro que vira segundo: Blink Date e First Dates

**Data:** 2026-11-26 · **Ticket:** [#940](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/940)
**Status de verificação:** este relatório é uma **reanálise nossa** de duas bases abertas e pequenas, listadas no [catálogo de bases de conversa e encontros](2026-11-26-bases-de-conversa-e-encontros.md). Os autores não publicaram nenhuma destas contas. Nenhuma das duas bases tem Ficha.

A pergunta: numa conversa de primeiro encontro entre desconhecidos, o que se mede no que foi dito separa os encontros que viram segundo encontro dos que não viram? As medidas são de perguntas, de equilíbrio entre os dois, de tamanho de turno, de elogio e de flerte e brincadeira. São 21 encontros por telefone e 12 encontros à mesa, gravados para a TV. É pouco, e o relatório trata tudo como exploração.

## Resposta curta

- **No Blink Date, quase nada se separa do acaso.** Das 15 medidas de texto, duas deram p < 0,05, e com 15 testes se esperam umas 0,75 por puro acaso. Nenhuma sobrevive à correção para comparações múltiplas.
- **Perguntar mais, e de que tipo, não separou os encontros.** Quem foi ao segundo encontro fez 33 perguntas a cada 100 turnos; quem não foi, 31. As perguntas de acompanhamento, sobre o que o outro acabou de dizer, foram 7 contra 8 a cada 100 turnos. Devolver a pergunta ("e você?") foi quase igual nos dois grupos.
- **Os encontros que deram certo tiveram mais vaivém** (mediana de 59 turnos contra 45), com a mesma duração. Foi a única tendência que aparece também na coluna `turn_count` dos 31 encontros da base (62 contra 47,5; p = 0,07). Ela não chega a ser significativa.
- **No First Dates, o que mais separou foi ela flertar de volta.** Nos 4 encontros que deram certo, a mulher teve de 3 a 5 falas anotadas como flerte. Nos 8 que não deram, teve de 0 a 3. Flerte só dele não bastou: o encontro em que ele mais flertou (15 falas) não deu certo, e ela flertou uma vez.
- **As anotações do First Dates são do autor da base, que via o programa e sabia o desfecho.** Não dá para separar o que aconteceu no encontro do olhar de quem anotou. O resultado é uma pista, não uma medida.

## Os dados

**Blink Date** (podcast). Encontros só por telefone, de 11 a 13 minutos, entre desconhecidos, com uma pergunta de partida por episódio. O desfecho é `matched`: os dois responderam "sim" ou "talvez" a um segundo encontro. A base vem do projeto [OSF 7ju2s](https://osf.io/7ju2s/) de O'Nell, Sanchez e Finn (2026, *Science Advances*, doi 10.1126/sciadv.aeb2684). O CSV de desfecho tem 31 encontros (19 sim e 12 não), e a pasta de transcrições tem 24 arquivos. Pelo nome do arquivo, 21 transcrições casam com uma linha do CSV: 14 encontros com match e 7 sem. Os outros 3 arquivos não têm linha. A transcrição é profissional, com o falante em cada fala, e não marca riso. O OSF não declara licença. Usamos só contagens, sem citar trecho.

**First Dates** (TV, Channel 4). São 12 encontros à mesa, com 1.928 falas transcritas em minúsculas e sem pontuação. Cada fala traz o sexo de quem fala, a emoção de quem fala e de quem ouve (neutra, alegre, triste, surpresa, nojo, raiva, medo), a entonação (neutra, brincadeira, confiante, flerte, nervosa, hesitante, sarcasmo) e o alvo: o par, a cabine onde a pessoa fala com a câmera, a entrevista final ou outro. O desfecho `label` diz se o encontro deu certo, e foram 4 sim e 8 não. A base é de Kinch (2022, [figshare 20219411](https://figshare.com/articles/dataset/First_Dates_Dataset/20219411)), em CC BY 4.0, e os direitos do programa são do Channel 4. Só as 1.277 falas dirigidas ao par entram nas medidas de conversa. Um dos encontros que deram certo tem só falas femininas dirigidas ao par, e deve ser um encontro entre duas mulheres. Ele entra nas medidas gerais, e nas medidas por sexo conta só a parte feminina.

## Método

**Blink Date.** As falas seguidas do mesmo falante viram um turno só. Para cada encontro, um script conta:

- turnos, palavras e palavras por turno;
- o desequilíbrio entre os dois na fatia de palavras e no tamanho médio do turno;
- as perguntas, separadas em três tipos. **Devolver** é "e você?", "what about you?" e parecidas. **Acompanhamento** é a pergunta que repete uma palavra de conteúdo dos dois últimos turnos do outro. **Outras** é o resto. Perguntas retóricas ("right?", "you know?") e de uma palavra ficam fora;
- backchannel, que é o turno só de "yeah", "mm hmm", "right" ou "wow";
- elogio ("that's so cool", "I love that"), papo de futuro juntos ("we should", "next time") e as taxas de "eu", "você" e "nós".

O classificador de perguntas é grosso. Ele erra o acompanhamento escrito com outras palavras, e uma amostra lida à mão mostrou acertos e erros nos três tipos.

**First Dates.** Para cada encontro, conta a fatia das falas ao par anotadas como flerte, brincadeira, nervosismo ou hesitação e confiança, e a fatia com emoção alegre ou negativa, de quem fala e de quem ouve. Separa também por sexo e conta as perguntas, que são as falas que começam com palavra interrogativa ou verbo auxiliar, já que não há pontuação.

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

## Limites

- **Amostras mínimas.** São 21 e 12 encontros. Um efeito médio passaria despercebido, e um resultado com p < 0,05 entre 15 testes pode ser acaso.
- **O desfecho do First Dates e as anotações vêm da mesma pessoa, que via o programa editado.** A edição da TV escolhe o que entra, e o anotador sabia como o encontro acabou. O flerte dela pode ser efeito do interesse, não causa, e pode ter sido mais anotado onde o fim foi feliz.
- **Blink Date é por telefone, com uma pergunta de partida imposta e gente que topou ir a um podcast.** First Dates é TV britânica, com câmera e restaurante. Nenhum dos dois é chat de app.
- **As medidas de texto do Blink Date são contagens por palavra-chave**, sem leitura de sentido. A pergunta de acompanhamento escrita com outras palavras escapa.
- **Faltam 10 transcrições do Blink Date**, e não sabemos se faltam ao acaso.
