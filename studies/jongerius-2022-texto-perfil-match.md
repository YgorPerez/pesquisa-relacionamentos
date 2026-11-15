---
reference: "Jongerius R. *LoveBERT: Leveraging Language Models to Improve Matchmaking at Breeze*. Dissertação de mestrado (MSc), Delft University of Technology, outubro de 2022."
link: https://resolver.tudelft.nl/uuid:2db1d7af-9b7b-4503-9141-35cb3aa12d4b
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Dissertação de mestrado, sem revisão de periódico, feita dentro da Breeze com um supervisor da empresa e com os dados dela; as taxas de match com e sem bio comparam grupos sem nenhum ajuste, e a pesquisa com usuários teve 46 respostas de cerca de 800 convidados."
countries: []
period: "não informado no texto lido; a bio existe no app desde o fim de dezembro de 2021, e o texto dos perfis usado é o do começo de abril"
sample:
  n: 113197
  description: "Sugestões históricas do app de namoro Breeze, em que os dois lados tinham bio: 113.197 sugestões, de um total de 5.314.152 (Tabela 3.1). O conjunto de teste tinha 2.941 usuários diferentes. À parte, uma pesquisa online foi mandada a cerca de 800 usuários ativos, sorteados entre os ativos no último mês e também por um e-mail de marketing; 46 responderam. A tese não dá o sexo, a idade nem a orientação dos usuários, nem o país; diz que a maioria dos perfis é em holandês."
  representative: false
design: platform
conflict: "Dissertação de mestrado na TU Delft feita dentro da Breeze, por convite de um fundador da empresa; um dos supervisores e membros da banca é da Breeze, e os dados são dela. O texto não declara financiamento nem conflito de interesse."
covers: {}
---

# Jongerius (2022): o texto do perfil e o match no app Breeze

## O que mediu

No Breeze, um app de namoro em que quem dá match vai direto a um primeiro encontro, sem conversar antes, cada usuário recebe poucas sugestões por dia. A tese usou o texto livre dos perfis (a bio e as respostas a perguntas abertas que o usuário escolhe) para treinar um modelo de linguagem, o LoveBERT, a prever duas coisas numa sugestão: se quem recebeu a sugestão curtiu a pessoa sugerida (curtida de um lado) e se as duas se curtiram (match). Comparou esse modelo com outros que não leem texto: um que usa dados do perfil e da sugestão, como idade, altura, distância, escolaridade e o quanto a pessoa curte e é curtida; um que aprende só com o histórico de curtidas; e uma mistura dos dois, inspirada no algoritmo que o Breeze usava. Testou também cada pedaço do texto em separado (bio com bio, respostas com respostas, bio de um com respostas do outro).

Antes, a tese contou a taxa de match nas sugestões com e sem bio e fez uma pesquisa online com usuários sobre o que olham num perfil.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Match em todas as sugestões e com uma bio | De todas as sugestões do app, 0,66% viraram match; nas sugestões em que uma das duas pessoas tinha bio, 0,76% | p. 19, 3.1.2 | "Overall, the match rate of suggestions is 0.66%. When we consider suggestions in which one of the two parties has a bio, the match rate increases to 0.76%." |
| Match quando os dois têm bio | Nas sugestões em que as duas pessoas tinham bio, 1,09% viraram match, cerca de 65% acima da taxa de todas as sugestões; a tese não ajusta nada nessa comparação | p. 20, 3.1.2 | "rate of suggestions where both users have a bio is 1.09%, an increase of roughly 65%" |
| Sugestões usadas no modelo | Nas sugestões com bio dos dois lados, houve 1232 matches em cerca de 113 mil sugestões, pouco mais de 1% | p. 48, 5.1.1 | "In our case, there are 1232 matches in a dataset of 113K samples, so just over 1%." |
| O que pesa num perfil, segundo os usuários | Na pesquisa com usuários, as fotos foram de longe a parte mais importante para decidir curtir; a bio e as respostas abertas ficaram por último | p. 19, 3.1.2 e Figura 3.2 | "As can be seen in ﬁgure 3.2, the pictures are overwhelmingly the most important aspect." |
| Semelhança ou diferença | Na pesquisa, 28 dos que responderam (60,9%) disseram procurar semelhanças nos perfis sugeridos, e só 2 (4,3%) procuravam diferenças | p. 20, 3.1.2 | "28 of the respondents (60.9%) indicating they look for similarities, and only 2 people (4.3%) actively looking" |
| Quem tinha bio | 18 dos que responderam (39,1%) tinham bio, perto dos cerca de 35% entre todos os usuários ativos | p. 22, 3.1.2 | "18 people (39.1%) had a bio at the time of ﬁlling in the survey, which is roughly in line with the ratio of the total active userbase (∼35%)" |
| Por que não ter bio | Entre os que responderam sem bio, 53,6% disseram não saber o que escrever, e 17,9% acharam trabalho demais | p. 24, 3.1.2 | "because they simply do not know what to put in it (53.6%), or think it is too much effort (17.9%)" |
| Respostas sérias ou engraçadas | Na pesquisa, 73,9% preferiram que as respostas abertas dos outros misturassem sério e engraçado | p. 25, 3.1.2 | "In this case, 73.9% of people wanted a mix of both." |
| Texto e curtida de um lado | Para prever se quem recebeu a sugestão curtiu a pessoa sugerida, o modelo que lê os textos dos dois perfis acertou bem mais que o melhor dos modelos que não leem texto (MCC de 0,496 contra 0,110) | p. 38, 4.2 e Tabela 4.1 | "It achieves an F1-score of 0.555, and a MCC of 0.496, compared to the 0.225 and 0.110 respectively of the best performing non-NLP approaches." |
| Texto e match | Para prever match, o modelo que lê os textos acertou menos que o modelo misto, parecido com o do Breeze, que não lê texto (MCC de 0,028 contra 0,065) | p. 41, 4.2 e Tabela 4.2 | "and an MCC of 0.065, more than double the 0.028 of LoveBERT" |
| Bio com bio | Comparando só a bio de um com a bio do outro, o modelo quase não previu match (MCC de 0,004, contra 0,016 da combinação seguinte mais fraca) | p. 46, 4.2.2 e Tabela 4.3 | "It is only 0.004, 4 times as low as the next lowest score of 0.016." |
| Bio de um, respostas do outro | Comparando a bio de quem recebe a sugestão com as respostas abertas da pessoa sugerida, o modelo chegou perto do modelo completo na previsão de match (MCC de 0,026 contra 0,028) | p. 46, 4.2.2 e Tabela 4.3 | "In fact, it performs nearly as well as the best performing model on its own, with an MCC of 0.026 compared to LoveBERTbest ’s 0.028." |

MCC é a nota de acerto que a tese usa por ser feita para dados em que um lado é raro, como o match: vai de −1 a 1, e quanto maior, melhor.

Pela tese, a bio "signiﬁcantly improves the match rate" (p. 19), mas ela não mostra teste nem ajuste para essa comparação. O próprio texto diz que quem tem bio tende a ser mais velho (Figura 3.6).

## Limitações

- As taxas de match com e sem bio só comparam grupos: quem escreve bio pode ser diferente de quem não escreve (a tese diz que é mais velho), e nada foi ajustado. A tese também compara com "todas as sugestões", que incluem as com bio, e não diz se "uma das duas tem bio" exclui as com bio dos dois lados nem de que período são as 5,3 milhões de sugestões.
- O Breeze não guarda o histórico dos perfis: o texto usado é o do começo de abril, que pode não ser o que o usuário viu na hora da sugestão (5.1.3).
- O que o modelo aprende é se o perfil inteiro, com fotos, levou à curtida ou ao match, não só o texto; a tese diz que duas pessoas podem combinar no texto e não se atrair fisicamente (5.1.3).
- O modelo foi treinado com curtidas de um lado, porque treinar com matches, raros, não funcionou (5.1.1).
- A pesquisa com usuários teve 46 respostas de cerca de 800 convidados, por adesão; a tese a chama de amostra de conveniência.
- A tese não diz o sexo, a idade, a orientação nem o país dos usuários; diz que a maioria dos perfis é em holandês.
- Um app só, com um formato raro (encontro marcado logo após o match, sem conversa), e dados que não foram publicados.
- A tese foi feita dentro da empresa, com supervisor dela, e não passou por revisão de periódico. O texto tem trocas evidentes: diz que o conjunto de curtidas está contido no de matches (é o contrário) e, na conclusão, que o desempenho "não se sustenta ao prever curtidas" quando os resultados mostram isso para matches.
