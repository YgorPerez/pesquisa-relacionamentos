---
reference: "Rong S. *An Empirical Study of Emoji Use in Software Development Communication*. Dissertação de mestrado (Master of Science in Software Engineering), University of California, Irvine, 2023. Orientação: Iftekhar Ahmed; banca: Andre van der Hoek e James A. Jones."
link: https://escholarship.org/uc/item/18p2s3c3
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Dissertação de mestrado, sem revisão por pares; compara comentários com e sem emoji no GitHub, entre desenvolvedores de software, sem levar em conta projeto, assunto ou quem comentou, de modo que não mostra o que causa o quê; o questionário teve 60 respostas de 2.781 convites; e um valor-p da tabela de aceitação não combina com o tamanho da amostra descrita."
countries: []
period: "janeiro de 2015 a junho de 2019 (comentários do GitHub); a tese não dá a data do questionário"
sample:
  n: 39980
  description: "39.980 postagens com emoji de 2.712 projetos de código aberto no GitHub (comentários de issues e de pull requests, mensagens de commit e comentários do GitHub Discussions), em inglês, tiradas do GHTorrent e de uma coleta própria; uma postagem com emoji diferentes virou várias. Para o tempo de resposta, a tese escolheu ao acaso 20 mil comentários de pull request com emoji e 20 mil sem; para a aceitação, 20 mil pull requests com emoji e 20 mil sem. O questionário teve 60 respostas de desenvolvedores que já tinham usado emoji no GitHub, de 17 países não nomeados, de 18 a 50 anos. É comunicação de trabalho entre desenvolvedores, não namoro; a tese não informa o gênero."
  representative: false
design: platform
conflict: "A tese não traz seção de financiamento nem declaração de conflito de interesse."
covers: {}
---

# Rong (2023): emoji em comentários do GitHub e tempo até a resposta

## O que mediu

A tese juntou postagens de desenvolvedores em projetos de código aberto no GitHub e treinou um classificador para dizer com que intenção cada emoji foi usado (organizar o texto, substituir uma palavra, ilustrar uma palavra, acrescentar emoção, reforçar uma emoção ou chamar a atenção). Depois comparou 20 mil comentários de pull request com emoji e 20 mil sem quanto ao tempo até a resposta seguinte, e 20 mil pull requests com emoji e 20 mil sem quanto a serem aceitos. Um pull request é o pedido para incluir uma mudança no código de um projeto. Por fim, mandou um questionário a desenvolvedores que tinham usado emoji no GitHub, perguntando, entre outras coisas, se achavam que emoji ajudam a ter o pull request aceito ou a receber resposta mais rápido.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Postagens analisadas | 39.980 postagens com emoji, de 2.712 projetos de código aberto | Seção 3.1 (p. 11) | "Our final dataset contained 2,712 open-source projects and 39,980 posts with the emoji usage" |
| Tempo até a resposta | Entre comentários de pull request escolhidos ao acaso, os com emoji receberam resposta, em média, em 668,56 minutos, e os sem emoji em 1037,6 minutos. A tese trata a diferença como real, mas de tamanho desprezível (d = 0,12), e não leva em conta outros fatores | Seção 4.6 (p. 37) | "size (0.12) (Cohen’s d [5]). The mean time interval of getting responses for comments with emojis is 668.56 minutes, while the mean time interval of getting responses for comments without emojis is 1037.6 minutes." |
| Tom do emoji e tempo até a resposta | Entre comentários de pull request com emoji, o tempo médio até a resposta foi de 597,24 minutos com emoji de tom positivo, 668,08 com tom neutro e 711,49 com tom negativo; a tese não achou diferença que se distinga do acaso | Seção 4.6 (p. 38) | "The mean of getting responses with the positive sentiment is 597.24 minutes, the mean of neutral sentiment is 668.08 minutes, and the mean of negative sentiment is 711.49 minutes." |
| Aceitação do pull request | Entre pull requests escolhidos ao acaso, ter emoji teve uma ligação positiva muito fraca com o pull request ser aceito (r = 0,02258361), e o número de emoji também (r = 0,01482853); a tese chama as duas de desprezíveis | Tabela 4.5 (p. 36) | "Emoji Usage PR accepted #Emojis PR accepted p-value 0.02258361 < 2.2e 16 0.01482853 0.03085" |
| Intenção mais comum | Nos comentários de pull request e de issue, o uso mais comum do emoji, segundo o classificador, foi chamar a atenção: 41,87% e 47,12% | Seção 4.2 (p. 30) | "Enhancement purposes, 41.87% and 47.12% respectively." |
| Respostas ao questionário | 60 desenvolvedores responderam, 2,2% dos convites entregues por e-mail | Seção 3.6.4 (p. 25) | "In total, we received 60 responses from 2, 781 email requests (2.2% response rate)." |
| Opinião sobre aceitação | Entre os desenvolvedores que responderam ao questionário, 22% concordaram que emoji ajudam o pull request a ser aceito | Seção 4.5 (p. 36) | "Only 22% of the survey respondents agreed on this (shown in Figure 4.5)." |
| Opinião sobre rapidez da resposta | Entre os que responderam ao questionário, 53% ficaram neutros sobre emoji acelerarem a resposta e cerca de 30% concordaram | Seção 4.6 (p. 37) | "Survey: 53% of the survey respondents remained neutral in their responses when we asked if emoji has any positive e↵ect on response time. According to them, the speed of response is more likely to be a↵ected by other factors, such as time for code reviews and other personal issues. On the other hand, about 30% of survey respondents agreed" |

O d mede a distância entre duas médias em desvios-padrão: perto de 0,2 é pequena. O r vai de −1 a 1 e mede o quanto duas medidas sobem juntas; perto de 0 quer dizer quase nenhuma ligação. O tom positivo, neutro ou negativo de cada emoji foi dado por um modelo automático (SEntiMoji), não por pessoas.

## Limitações

- O estudo é sobre comunicação de trabalho entre desenvolvedores de software num site de código aberto, não sobre namoro nem sobre conversa entre desconhecidos que querem se conhecer.
- A comparação do tempo de resposta só observa comentários com e sem emoji, sem levar em conta projeto, assunto, tamanho do comentário ou quem comentou. A própria tese diz que não investigou por que os comentários com emoji tiveram resposta mais rápida e lista fatores que podem explicar a diferença, como a relação entre quem manda e quem responde, o contexto da conversa e a personalidade dos desenvolvedores. Mesmo assim, em outras partes, escreve que o emoji "afeta" a rapidez da resposta.
- O resumo da tese diz que o resultado leva a supor que um emoji de tom positivo acelera mais a resposta que um de tom negativo; o teste da própria tese não achou diferença que se distinga do acaso entre os tons.
- Na Tabela 4.5, o valor-p da ligação entre ter emoji e a aceitação (< 2,2e-16) é bem menor do que uma correlação de 0,023 daria com os 40 mil pull requests descritos no método; o do número de emoji (0,03085) combina com os 21.199 pull requests citados para essa conta. A tese não explica.
- A tese se contradiz sobre os desenvolvedores mais e menos ativos: relata uma diferença pequena no número de emoji (1,95 contra 1,48 por projeto, p = 0,0008), mas a observação final e a seção de validade dizem que o papel não muda o uso de emoji e que não houve relação estatisticamente significativa.
- O classificador de intenção foi treinado com 1.690 comentários de outro conjunto de dados, rotulados pelos pesquisadores, e acertou menos nas intenções emocionais (precisão de 0,66 e 0,61) que nas outras.
- O questionário teve 2,2% de resposta e só chamou quem já usava emoji no GitHub.
- É uma dissertação de mestrado, sem revisão por pares. Os agradecimentos falam de um artigo publicado com colaboradores; esta Ficha não o leu.
