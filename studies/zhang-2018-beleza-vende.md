---
reference: "Zhang Q, Phang CW, Zhang C. *Beauty sells: identifying physical attractiveness effect in an online dating platform*. CONF-IRM 2018 Proceedings, 13, 2018."
link: https://aisel.aisnet.org/confirm2018/13
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Registros de um app de namoro chinês com 25.389 usuários, em que a plataforma sorteava as fotos mostradas, mas é um artigo curto de anais de conferência que não diz o que conta cada linha das regressões, mede a beleza com um algoritmo que acertou cerca de 81% das notas humanas, mostra uma tabela descritiva com uma linha repetida, e a ligação da beleza com responder só passa no limite mais frouxo da tabela."
countries: [China]
period: "agosto de 2014 a setembro de 2015"
sample:
  n: 25389
  description: "25.389 usuários ativos do MMD, um app chinês de namoro, espalhados pela China, com os registros de quem viu a foto de quem, quem convidou e quem respondeu ao longo do período. As regressões de quem manda convite têm N = 8.799 e as de quem responde, N = 2.175; o artigo não diz se esse N conta usuários, convites ou fotos. As notas de beleza vêm de um algoritmo treinado com 1.121 avaliadores (576 mulheres e 545 homens) que deram notas a 800 fotos."
  representative: false
design: platform
conflict: "O artigo não informa financiamento, conflitos de interesse nem como os autores obtiveram os dados da plataforma. Os autores são da Universidade Fudan e da Universidade de Nottingham Ningbo China."
covers:
  genders: [man, woman]
---

# Zhang, Phang & Zhang (2018): beleza da foto e convites num app chinês

## O que mediu

O estudo usou os registros do MMD, um app chinês de namoro. Lá, quem aperta o botão de buscar recebe quatro fotos borradas, sorteadas pela plataforma. Ao clicar numa, a foto fica nítida, com a cidade da pessoa, e o usuário decide se manda um convite. Quem recebe o convite decide se responde. O perfil completo só aparece depois do match, de modo que, na hora de convidar, o usuário só vê a foto e a cidade.

A beleza de cada foto veio de um algoritmo. Os autores pediram a 1.121 pessoas notas de 1 a 10 para 800 fotos e treinaram programas que separam rostos "bonitos" de "normais", um para homens e outro para mulheres. Depois, com regressões que levam em conta gênero, idade, região da China, número de convites mandados, dias entre a foto e o convite e tempo de uso do app, compararam a nota de beleza com a chance de mandar convite e a chance de responder.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Os dados | Registros de 25.389 usuários ativos do app, de toda a China | Seção 3.1, p. 6 do PDF | "Our full sample contains information on the attributes and online activities of 25,389 active users of the online dating service. The users are located in all around China" |  |
| Como a foto aparecia | A plataforma sorteava quatro fotos borradas; o usuário clicava numa, via a foto nítida com a cidade e decidia se mandava convite | Seção 3.1, p. 6 do PDF | "the platform randomly selects four frosted photos processed as mosaic appearance. By clicking on one of them, the user can see the photo becoming transparent with city information available on the photo" |  |
| Quem deu as notas de beleza | 1.121 pessoas (576 mulheres e 545 homens) deram notas a 800 fotos, 400 de homens e 400 de mulheres, que serviram para treinar o algoritmo | Seção 3.2, p. 7 do PDF | "we recruited 1121 subjects (576 female and 545 male) to conduct physical attractiveness rating for 800 photos (400 male and 400 female)" |  |
| Acerto do algoritmo | Ao separar fotos "bonitas" de "normais", o programa acertou a classificação das pessoas em 81,4% das fotos de homens e em 80,7% das de mulheres | Seção 3.2, p. 7 do PDF | "The model fitness for male under logistic regression algorithm was good, accuracy rate attaining 81.4%. For female samples, the decision tree algorithm had higher efficiency, with an accuracy rate of 80.7%." |  |
| Convites respondidos | Em média, cada usuário teve 3,5% dos convites que mandou respondidos | Tabela 2 (apêndice), p. 13 do PDF | "Ratio of Initiator’s Requests Being Replied 0.035" | scripts/calculations/zhang-2018-beleza-vende.ts |
| Beleza de quem aparece na foto | Quanto maior a nota de beleza que o algoritmo deu à pessoa da foto, mais os usuários mandaram convite a ela, levando em conta gênero, idade, região e uso do app; a ligação passa no critério usual da tabela (b = 0,258) | Tabela 1, p. 9 do PDF | "(0.191) (0.198) 0.258" |  |
| Beleza de quem manda o convite | Não apareceu ligação clara entre a nota de beleza do próprio usuário e a chance de ele mandar convite; pode ser acaso (b = −0,234) | Tabela 1, p. 9 do PDF | "Initiator’s Looks Rating Recipient’s Looks Rating -0.234" |  |
| Diferença de beleza, ao convidar | Quanto maior a diferença entre a nota da pessoa da foto e a do usuário, mais convites, uma ligação que passa no critério usual da tabela (b = 0,250). Os autores leem que os usuários preferem convidar quem é mais bonito que eles | Tabela 1, p. 9 do PDF | "Difference in Looks Rating 0.250" |  |
| Beleza de quem convida, ao responder | Entre os convites recebidos, quanto maior a nota de beleza de quem convidou, mais respostas, mas a ligação só passa no critério mais frouxo da tabela (b = 0,889) | Tabela 3 (apêndice), p. 13 do PDF | "Initiator’s Looks Rating (3) (4) yes yes 0.889" |  |
| Diferença de beleza, ao responder | Ao responder, não apareceu ligação clara entre a diferença de nota de beleza das duas pessoas e a chance de resposta; pode ser acaso (b = 0,570) | Tabela 3 (apêndice), p. 13 do PDF | "Difference in Looks 0.570 Rating (0.399)" |  |
| Distância, ao convidar | A distância entre as cidades das duas pessoas não apareceu mudando a ligação da diferença de beleza com mandar convite; pode ser acaso (b = −0,007) | Tabela 1, p. 9 do PDF | "Difference in Looks Rating -0.007 ×Geographic Distance (0.045)" |  |
| Distância, ao responder | A distância também não apareceu mudando a ligação da diferença de beleza com responder; pode ser acaso (b = 0,088) | Tabela 3 (apêndice), p. 13 do PDF | "Difference in Looks Rating 0.088 ×Geographic Distance (0.104)" |  |
| Rostos parecidos | Trocando a diferença de beleza por uma medida de quanto os dois rostos se parecem, os dois algoritmos usados deram resultados opostos: num, a ligação com convidar foi positiva e pode ser acaso; no outro, negativa e além do acaso. Os autores dizem que só notas dadas por pessoas resolveriam a questão | Seção 4, p. 10 do PDF | "The coefficient of Youtu indicator is positive but not significant, whereas the coefficient in Azure context is negative and significant." |  |

Os "b" são coeficientes de regressões logísticas em vários níveis, que levam em conta gênero, idade, região da China, número de convites mandados, dias entre a foto e o convite e tempo de uso do app. Um b positivo quer dizer mais chance de convidar (Tabela 1) ou de responder (Tabela 3). A tabela marca três critérios: p < 0,01, p < 0,05 (o usual) e p < 0,1 (o mais frouxo). Nos modelos que juntam a nota de beleza de cada pessoa com a distância, nenhuma das combinações passa nem o critério mais frouxo. O "p" é a chance de um resultado daquele tamanho aparecer só por acaso. O artigo não diz como a nota de beleza entra no modelo; na Tabela 2 ela vai de 0 a 1, com média de 0,149.

## Limitações

- É um artigo curto de anais de conferência. Não traz os coeficientes das variáveis levadas em conta, nem tamanhos de efeito em probabilidade.
- O artigo não diz o que conta o N das regressões (8.799 ao convidar, 2.175 ao responder), que é bem menor que os 25.389 usuários, nem como esses casos foram escolhidos.
- O artigo não define o sentido da "diferença de beleza". A leitura de que os usuários preferem quem é mais bonito que eles é dos autores.
- A beleza é a de um algoritmo, que acertou a classificação humana em cerca de 81% das fotos. Os autores dizem que primeiro escolheram o serviço da Microsoft (Azure) num teste com 475 fotos e depois treinaram classificadores com as notas humanas; o texto não deixa claro como os dois passos se juntam na nota final.
- Os autores dizem que os 1.121 avaliadores representam o país, mas não mostram os números que sustentam isso.
- Os autores escrevem que, tanto ao convidar quanto ao responder, as pessoas procuram as mais bonitas. Ao responder, a ligação só passa no critério mais frouxo da tabela (p < 0,1).
- Na Tabela 2, as linhas do tempo de uso do app e da distância têm os mesmos números (média 0,632, desvio 0,218, máximo 1,080), o que parece erro de cópia; na linha dos dias entre a foto e o convite, o mínimo (339) e o máximo (0) aparecem trocados. A idade dos usuários vai de 10,17 a 45,25 anos, então havia menores de idade nos dados.
- Os autores falam em "13 meses" e dão o período de agosto de 2014 a setembro de 2015.
- O artigo diz que o resultado não mudou ao levar em conta o tamanho da mensagem, o horário e o clima, mas não mostra esses números.
- Os autores chamam as decisões ora de namoro, ora de "fazer amizade" (friend-making). O artigo não diz se os pares eram só de sexos diferentes.
- Os dados são de um só app, na China, com uma busca que mostra só foto e cidade. O artigo não compara com outros apps nem com o mundo fora da internet, como os próprios autores lembram.
