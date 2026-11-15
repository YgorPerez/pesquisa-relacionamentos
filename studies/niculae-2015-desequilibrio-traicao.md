---
reference: "Niculae V, Kumar S, Boyd-Graber J, Danescu-Niculescu-Mizil C. *Linguistic Harbingers of Betrayal: A Case Study on an Online Strategy Game*. Proceedings of the 53rd Annual Meeting of the Association for Computational Linguistics and the 7th International Joint Conference on Natural Language Processing (ACL-IJCNLP 2015), pp. 1650–1659, 2015. Texto completo aberto: https://aclanthology.org/P15-1159.pdf"
link: https://doi.org/10.3115/v1/P15-1159
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Registros de 249 partidas de um único jogo de estratégia online, sem relação amorosa nenhuma: amizade e traição são jogadas do jogo, o tom vem de classificadores automáticos, o artigo não diz quantas traições entraram nem quem eram os jogadores, e as diferenças vêm só com valor-p, sem tamanho; o modelo que lê as mensagens acerta pouco acima do acaso."
countries: []
period: "não informado no texto lido"
sample:
  n: 249
  description: "249 partidas terminadas de Diplomacy, um jogo de guerra em que sete jogadores negociam alianças por mensagens, tiradas de duas plataformas online, com 145.000 mensagens entre os jogadores. Cada amizade que acabou em traição foi comparada com uma amizade que durou, escolhida com o mesmo tempo de amizade e o mesmo momento da partida. O artigo não diz quantas traições entraram nem quem eram os jogadores (idade, gênero, país)."
  representative: false
design: platform
conflict: "Jordan Boyd-Graber teve apoio das bolsas CCF-1409287, IIS-1320538 e NCSE-1422492 da NSF; Cristian Danescu-Niculescu-Mizil, de um Google Faculty Research Award. Os dados foram cedidos por três pessoas que o artigo agradece (Mario Huys, Chris Babcock e Christopher Martin). O artigo não traz declaração de conflito de interesses."
covers: {}
---

# Niculae et al. (2015): o desequilíbrio na conversa antes de uma traição num jogo online

## O que mediu

Os autores usaram as mensagens de 249 partidas de Diplomacy jogadas online. No jogo, cada jogador pode apoiar os movimentos de outro, e essas jogadas ficam registradas. A equipe chamou de amizade dois jogadores que se apoiaram um ao outro pelo menos duas vezes seguidas, ao longo de três temporadas do jogo ou mais, e de traição a amizade que acabou com pelo menos dois atos hostis (invadir o território do outro, apoiar um inimigo dele). Quem fez o primeiro ato hostil é quem traiu.

Para cada traição, os autores escolheram uma amizade que nunca acabou, com o mesmo tempo de amizade e no mesmo momento da partida. Só entraram as mensagens trocadas antes do último gesto amigável, quando quem seria traído ainda não sabia. Programas automáticos mediram, nas mensagens de cada lado, a proporção de frases positivas, negativas e neutras, a polidez, as palavras de ligação e de plano para o futuro, os pedidos e o quanto cada um escrevia. Depois a equipe comparou os dois lados da dupla e treinou um modelo para prever, só com esses traços, se a amizade acabaria em traição e em qual temporada.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho do registro | 249 partidas e 145.000 mensagens entre jogadores, depois de tirar partidas fora do padrão, partidas em andamento e mensagens do sistema | Seção 2.3 | "This leaves 249 games with 145.000 total messages." |
| Amizade que vira inimizade | No jogo, a chance de uma amizade virar inimizade foi cerca de cinco vezes a de dois inimigos virarem amigos | Seção 3 | "the probability of a friendship to dissolve into enmity is about five times greater than that of hostile players becoming friends" |
| Tempo de amizade | Uma amizade de duas temporadas acabou em 35% das vezes; entre pares que se ajudavam havia dez temporadas ou mais, a chance de traição foi de 23% | Seção 3 | "the probability that a two season long friendship ends is 35%, while for pairs who have helped each other for ten or more seasons, the probability of betrayal is only 23%" |
| Tempo de inimizade | Uma inimizade de duas temporadas acabou em paz em 7% das vezes; entre jogadores em guerra havia mais de dez temporadas, em 5% | Seção 3 | "the probability that a two season long conflict resolves is 7%, while players at war for over ten seasons have only a 5% chance to make up" |
| Frases positivas | Nas amizades que acabaram em traição, os dois aliados não escreviam a mesma proporção de frases positivas antes da traição, uma diferença que dificilmente é acaso (p = 0,008) | Seção 4.2; Figura 3a | "an imbalance in the amount of positive sentiment expressed by the two individuals is a subtle sign that the relation will end in betrayal (Figure 3a, left; one-sample t-test on the imbalance, p = 0.008)" |
| Quem escrevia mais positivo | Quem viria a trair escreveu mais frases positivas que o jogador no mesmo papel numa amizade que durou (p = 0,001) | Seção 4.2; Figura 3a | "it is the eventual betrayer that uses significantly more positive sentiment than the control counterpart in the matched friendship (twosample t-test, p = 0.001)" |
| Palavras de plano | Nas amizades que acabaram em traição, quem seria traído usou mais palavras de plano para o futuro ("próximo", "depois disso") que quem viria a trair (p = 0,03) | Seção 4.2; Figura 3b | "the victim uses planning discourse markers significantly more often than the betrayer (onesample t-test on the imbalance, p = 0.03)" |
| Polidez | Nas amizades que acabaram em traição, quem seria traído foi um pouco menos educado que quem viria a trair, mas a diferença pode ser acaso (p = 0,09) | Seção 4.2; Figura 3c | "friendships that end in betrayal show a slight imbalance between the level of politeness used by the two individuals (one-sample t-test on the imbalance, p = 0.09) and that in those cases the future victim is the one that is less polite" |
| Amizades que duraram | Nas amizades que duraram, com os papéis de possível traidor e traído dados a esmo, os autores dizem que as diferenças de frases positivas, palavras de plano e polidez somem | Legenda da Figura 3 | "The white bars correspond to matched lasting friendships, where the roles of potential betrayer and victim are arbitrarily assigned; in these cases, the imbalances disappear." |
| Expressões de opinião | Entre as amizades que acabaram em traição e as que duraram, não apareceu diferença nas expressões de opinião, acusação, suspeita e especulação | Seção 4.2 | "did not find significant differences between betrayals and control friendships" |
| Número de mensagens | Nas amizades que acabaram, um dos dois mandava mais mensagens que o outro, uma diferença que dificilmente é acaso (p < 0,001); o artigo não diz qual dos dois mandava mais | Seção 4.2 | "friendships that dissolve are characterized by an imbalance in the number of messages exchanged between the two players (one-sample t-test, p < 0.001)" |
| Prever a traição pelas mensagens | Lendo só os traços das mensagens, o modelo acertou se a amizade acabaria em traição em 57% das temporadas, contra 52% de um chute (coeficiente de Matthews de 0,14, contra 0) | Seção 4.3 | "The resulting model achieves a cross-validation accuracy of 57% and a Matthews correlation coefficient of 0.14, significantly above chance (52% accuracy and 0 Matthews correlation coefficient)" |
| De quem vinham os sinais | Para prever a traição, o modelo só aproveitou traços das mensagens de quem viria a trair, e nenhum das mensagens do traído | Seção 4.3; Tabela 2 | "(In this case, only betrayer features were selected.)" |
| Os jogadores traídos | Quem foi traído não previu a traição: pelo jeito como os dados foram montados, o acerto dos jogadores fica no nível do acaso | Seção 4.3 | "by virtue of how the dataset is constructed, the performance of the human players is at chance level" |
| Temporadas logo antes da traição | Nas amizades de quatro temporadas ou mais que acabaram em traição, só 14% das temporadas eram a última antes da traição | Seção 5 | "This learning task is imbalanced, with only 14% of the seasons being immediately before the betrayal." |
| Prever a temporada da traição | O modelo que tentava apontar a temporada logo antes da traição ficou acima do acaso, mas acertou pouco (F1 = 0,31; coeficiente de Matthews = 0,17) | Seção 5 | "The best model achieves an F1 score of 0.31 and a Matthews correlation coefficient of 0.17" |
| Alarmes antes da hora | Dos alarmes falsos desse modelo, 39% caíram até duas temporadas antes do último gesto amigável; os autores leem que os sinais às vezes aparecem um pouco antes | Seção 5 | "39% of the predicted false positives are within two seasons of the last friendly act" |
| Perto da traição | Conforme a traição se aproximava, quem ia trair ficou mais positivo e menos educado, e quem seria traído passou a fazer mais pedidos e a ser mais educado | Legenda da Figura 4 | "As the breakdown approaches, the betrayer becomes more positive but less polite, and the victim tends to make more requests and become more polite." |

O p é a probabilidade de uma diferença desse tamanho aparecer por acaso se ela não existisse; o artigo não dá o tamanho das diferenças. O acerto do modelo foi medido em temporadas, e não em amizades. O coeficiente de Matthews vai de -1 a 1: zero é um chute, 1 é acertar tudo. O F1 vai de zero a 1 e junta quanto dos alarmes estava certo e quanto das temporadas certas o modelo achou.

A frase positiva, a polidez e as palavras de plano foram contadas por programas automáticos (o analisador de sentimento e o classificador de polidez de Stanford, listas de palavras de ligação). As mudanças perto da traição (Figura 4) aparecem num gráfico com barras de erro, sem teste próprio no texto.

## Limitações

- O estudo é sobre um jogo de estratégia online, e não sobre namoro nem sobre amizade fora do jogo. "Amizade" e "traição" são jogadas registradas (apoiar, atacar), e trair faz parte do jogo, em que todos sabem que cada um prefere vencer sozinho. Os autores comparam com pesquisas de relações amorosas, mas os dados não têm nenhuma.
- O artigo não diz quantas traições entraram na comparação, nem a idade, o gênero ou o país dos jogadores.
- As diferenças vêm com valor-p e gráficos, sem tamanho de efeito. Foram testados muitos traços, e o artigo não diz se as contas levaram isso em conta. A diferença de polidez pode ser acaso (p = 0,09).
- O modelo que lê as mensagens acerta 57% das temporadas contra 52% do acaso. Os autores dizem que não esperam um acerto alto e chamam os efeitos de sutis.
- Que os jogadores traídos fiquem no nível do acaso vem da montagem dos dados: só entra como traição a amizade em que o traído ainda fez um gesto amigável antes do ataque. Não houve teste de quanto as pessoas percebem esses sinais.
- Leituras dos autores, sem teste: que quem trai escreve mais positivo para compensar o que vai fazer, e que fazer planos para o futuro pressiona a relação.
- O estudo é observacional: mostra o que andou junto com a traição, e não o que a provoca.
- Na checagem da issue, Crossref, Retraction Watch e PubPeer não tinham retratação, correção nem comentário sobre o artigo.
