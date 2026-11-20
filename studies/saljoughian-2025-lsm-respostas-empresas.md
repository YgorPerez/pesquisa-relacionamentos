---
reference: "Saljoughian M, Hewett K, van Heerde HJ, Rand W. *How firms can steer social media conversations*. Journal of Marketing Research 62(6):1003–1025, 2025."
link: https://doi.org/10.1177/00222437251329816
status: verified
verified_on: 2026-11-20
strength: moderate
strength_reason: "Dado real em grande escala (cerca de 206 mil conversas de Twitter com quatro bancos dos EUA em dez anos), com correções para quem escolhe responder e para o estilo de cada atendente; mas nada foi sorteado, o estilo e o sentimento são medidos por programa, e é atendimento de bancos, fora do namoro."
countries: [EUA]
period: "2011–2020"
sample:
  n: 206120
  description: "Tweets de e sobre quatro grandes bancos dos EUA (Bank of America, Wells Fargo, Citibank e JPMorgan Chase) de 2011 a 2020. A base final tem 969.477 tweets em 206.360 conversas em que um usuário escreve, o banco responde e um usuário volta a escrever; a conta principal usa 401.801 respostas de usuários em 206.120 conversas. O texto não diz o país, o gênero nem a idade dos usuários. Não é um estudo de namoro."
  representative: false
design: platform
conflict: "Os autores declaram não ter conflito de interesses e não ter recebido financiamento para a pesquisa."
covers: {}
---

# Saljoughian et al. (2025): o estilo da resposta da empresa e o tom do cliente no Twitter

## O que mediu

O estudo não é sobre namoro: são conversas públicas no Twitter entre clientes e o atendimento de quatro grandes bancos dos EUA. Para cada sequência em que o usuário escreve, o banco responde e o usuário escreve de novo, os autores mediram o sentimento do tweet seguinte do usuário (de −1, muito negativo, a 1, muito positivo, por um programa de análise de sentimento) e oito características da resposta do banco: palavras de empatia, positividade, se repetiu o assunto do usuário, se o estilo de escrita era parecido com o dele, a rapidez, um índice de autenticidade, se convidou a passar para mensagem privada e se o atendente assinou com o primeiro nome.

O estilo parecido é o LSM (_language style matching_), calculado sobre nove categorias de palavras de ligação (advérbios, artigos, verbos auxiliares, conjunções, pronomes impessoais, negações, pronomes pessoais, preposições, quantificadores) entre a resposta do banco e o tweet anterior do usuário. A conta leva em conta o sentimento que o usuário já trazia, o assunto, o tamanho dos textos, a hora, notícias sobre o banco e outros fatores. Para separar o efeito do estilo do atendente de outras coisas que mudam junto com o tom do usuário, usa o estilo médio do mesmo atendente nos 30 dias anteriores, e corrige o fato de que nem o banco nem o usuário respondem sempre. Nada foi sorteado.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho da base | Quase 1 milhão de tweets, em mais de 206.000 conversas com quatro grandes bancos dos EUA, ao longo de dez anos | Resumo | "Based on an analysis of nearly 1 million tweets capturing over 206,000 threads involving four major U.S. banks across ten years" |
| Período e bancos | Os bancos foram Bank of America, Wells Fargo, Citibank e JPMorgan Chase, de 2011 a 2020 | Introdução | "involving the four largest U.S. banks (Bank of America, Wells Fargo, Citibank, and JPMorgan Chase) from 2011 to 2020" |
| Respostas analisadas | A conta principal usou 401.801 tweets de usuários em 206.120 conversas | Nota 9 | "This means that the effective sample size for UGCt is reduced to a total of 401,801 observations across 206,120 conversations." |
| Tom dos usuários | Cerca de 30% dos tweets de usuários eram negativos, 22% quase neutros e 48% positivos | Measures | "We note that only around 30% of the user tweets in our sample are negative (those with sentiment < −.01), 22% are approximately neutral (those with sentiment between −.01 and +.01), and the remaining 48% are positive." |
| Estilo parecido e tom seguinte | Respostas do banco com estilo de escrita mais parecido com o do usuário vieram seguidas de tweets mais positivos dele (β = 0,343), levando em conta as outras sete características da resposta; repetir o assunto do usuário também (β = 0,448) | Results, Tabela 7, Modelo 1 | "both topic matching (β = .448, p < .001) and LSM (β = .343, p < .001) enhance user sentiment" |
| Tamanho comparado | Levar o estilo parecido de um nível baixo a um alto veio com o tweet seguinte do usuário 0,12 ponto mais positivo; das oito características, só repetir o assunto pesou mais (0,29) | Comparing the Measured Impact of FGC on User Sentiment, Figura 2 | "One is that staying on topic is the single most effective FGC element, given that the impact of lifting topic matching from low to high on user sentiment (.29) is by far the strongest of the FGC variables. The second-most effective strategy (at .12) is LSM" |
| As outras características | Do nível baixo ao alto, positividade e palavras de empatia vieram com 0,05 ponto a mais; rapidez, 0,04; assinar com o nome e convidar para mensagem privada, 0,03; autenticidade, 0,02 | Comparing the Measured Impact of FGC on User Sentiment, Figura 2 | "The next-strongest pair of variables are FGC sentiment and FGC empathetic understanding, both lifting UGC sentiment by .05 when they go from low to high. The least effective FGC variables, in terms of lifting UGC sentiment, are response time (.04), agent signing and DMing (both at .03), and FGC authenticity (.02)." |
| Estilo parecido com cliente irritado ou contente | O peso do estilo parecido não mudou de forma clara conforme o usuário vinha mais negativo ou mais positivo, ao contrário do que os autores esperavam | Interaction Effects (Model 2) | "Contrary to our expectations, we find no significant interactions with prior user sentiment for LSM, response speed, or agent signing." |

O β diz quanto o sentimento do tweet seguinte do usuário (de −1 a 1) muda quando a característica sobe uma unidade, levando em conta as outras. Como cada característica tem uma escala, os autores comparam o tamanho de outro jeito: levam cada uma do percentil 10 ao percentil 90 (de baixo a alto), com as outras na média, e medem a mudança no sentimento. É isso que dão os números 0,29, 0,12 e os seguintes, para um usuário que vinha com sentimento exatamente neutro.

## Limitações

- O estudo não é sobre namoro nem sobre duas pessoas que se escolhem: é o atendimento público de quatro bancos grandes no Twitter, e os próprios autores perguntam se vale para empresas menores ou outros setores.
- Nada foi sorteado. A correção com o estilo do atendente nos 30 dias anteriores depende de supor que esse estilo passado só afeta o tom do cliente pelo estilo da resposta atual, o que os autores defendem mas não provam.
- O sentimento, o estilo, a empatia e a autenticidade foram medidos por programas e listas de palavras. Os autores conferiram empatia, sentimento, autenticidade e assunto com dois avaliadores humanos em 960 tweets; o LSM não passou por essa conferência.
- O desfecho é o tom do tweet público seguinte, de quem voltou a escrever. O que se passou em mensagem privada ficou fora.
- O texto não diz o país, a idade nem o gênero de quem escreveu aos bancos.
- No texto, o termo de autenticidade vezes o sentimento anterior aparece como 0,006 nos Resultados e como 0,004 na Tabela 7; a Ficha não usa esse número.

## Como usamos

O relatório [Espelhar o estilo do outro por texto](../reports/2026-11-15-espelhar-o-estilo-por-texto.md) usa esta Ficha como dado real, fora do namoro, em que o estilo parecido da resposta andou junto com um tom mais positivo de quem a recebeu.
