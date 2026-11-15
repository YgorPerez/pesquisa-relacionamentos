---
reference: "Neve J, McConville R. *ImRec: Learning Reciprocal Preferences Using Images*. In: RecSys '20, Fourteenth ACM Conference on Recommender Systems, pp. 170–179. ACM, 2020. Lido na versão aceita dos autores, no repositório da Universidade de Bristol: https://core.ac.uk/download/334413618.pdf"
link: https://doi.org/10.1145/3383313.3411476
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Dados comerciais de um só site, cedidos pela empresa numa colaboração em que ela também deu os recursos para treinar os modelos; o teste é feito fora do site, com pares montados metade Match e metade Nope, e mede se um modelo prevê o Like, não o que numa foto o provoca."
countries: [Japão]
period: "Likes e Nopes do ano mais recente antes do estudo; o artigo não dá as datas"
sample:
  n: 250000
  description: "250.000 usuários do Pairs, serviço de namoro japonês, só da região de Kanto (Tóquio e arredores) e só os que conferiram a identidade com documento com foto. Para cada pessoa curtida ou recusada, entrou a foto principal, e só fotos em que um programa achou um rosto. O teste usou outros 20.000 pares: 10.000 que deram Match e 10.000 em que um recusou o outro. O artigo não dá idade nem quantos são homens e quantas são mulheres."
  representative: false
design: platform
conflict: "Financiado pelo programa de doutorado (DTP) do EPSRC. O artigo diz que foi feito em colaboração com o Pairs e agradece à Eureka Inc. por ceder os dados e os recursos para treinar os modelos. Não há declaração de conflito de interesse."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Neve & McConville (2020): fotos para prever o match

## O que mediu

No Pairs, uma pessoa manda um Like a outra, que responde com um Like (é o Match, e os dois podem trocar mensagens) ou com um Nope. Os autores treinaram uma rede neural para prever, a partir das fotos de quem uma pessoa já curtiu e recusou, se ela curtiria a foto de outra. Um modelo para homens olhando mulheres, outro para mulheres olhando homens. Depois juntaram as duas previsões numa nota para o par, o ImRec, e testaram se essa nota separava os pares que deram Match dos que tiveram um Nope. Compararam com dois modelos de outros grupos: o RECON, que olha só os dados do perfil por categoria (como idade e tipo físico), e o LFRR, que olha só o padrão de quem curtiu quem.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| O site | O Pairs, serviço de namoro japonês voltado a quem procura um relacionamento longo e sério, tinha cerca de 10 milhões de cadastros | Seção 1 | "Pairs is marketed to people searching for a long-term serious relationship. The service has approximately 10 million registered users" |
| Os dados | Os autores usaram 250000 usuários e 1 milhão de Likes e Nopes, dos usuários e das interações mais recentes do site | Seção 1 | "we used a dataset of 250000 users and 1 million positive and negative expressions of preference in our model, taken from the most recent users and interactions on the service." |
| Quem entrou | Só usuários da região de Kanto, que inclui Tóquio e as províncias em volta, com a identidade conferida por documento | Seção 4.1 | "We limited the users used to those in the Kanto area of Japan, which includes Tokyo and the surrounding prefectures." |
| Likes por usuário | No Pairs, quem não paga começa com 30 Likes, e quem assina ganha mais 30 por mês | Seção 3.1 | "Free users are initially given 30 Likes, and users who subsequently subscribe to the service are given a further 30 per month." |
| A foto usada | Para cada pessoa curtida ou recusada, entrou só a foto principal, a maior e a que aparece nas listas do site | Seção 3.1 | "we used their main image under the assumption that, as the largest image and the one that appears on list pages, it is the most important" |
| O teste | O teste usou 20000 pares de usuários: 10000 que deram Match e 10000 em que um dos dois mandou Nope ao outro | Seção 4.2 | "We ran cross-validation on 20000 pairs of users, 10000 of whom had Matched with each other, and 10000 pairs where one of the two users had sent a Nope to the other user." |
| Fotos e dados do perfil | Nos pares de teste do Pairs, a nota feita só com fotos separou os que deram Match dos que tiveram Nope melhor que o acaso, e a feita só com os dados do perfil por categoria (RECON) ficou no nível do acaso (AUC 0,65 contra 0,51) | Tabela 2, linhas ImRec e RECON | "AUC 0.65 0.51" |
| Acerto entre os apontados | No ponto de melhor equilíbrio entre acertar e encontrar, os dois modelos acertaram a mesma fração dos pares que apontaram como Match (precisão 0,59); o de fotos encontrou mais dos Matches que existiam (0,91 contra 0,64) | Tabela 2 | "Algorithm Precision ImRec 0.59 RECON 0.59 Recall 0.91 0.64" |
| Conta nova, pouco histórico | Quando o modelo tinha só 1 Like e 1 Nope do usuário para aprender, a nota feita com fotos separou Match de Nope melhor que o LFRR, que aprende só com quem curtiu quem (AUC 0,613 contra 0,530); com 3 de cada, 0,625 contra 0,604 | Tabela 3, linhas ImRec e LFRR | "1 Indicator 3 Indicators 0.613 0.625 0.530 0.604" |
| Conta com mais histórico | Com 5 Likes e 5 Nopes do usuário, o LFRR já ficou à frente da nota feita com fotos (AUC 0,639 contra 0,633), e com 7 de cada a distância cresceu (0,696 contra 0,639) | Tabela 3, linhas ImRec e LFRR | "5 Indicators 7 Indicators 0.633 0.639 0.639 0.696" |

A AUC é a chance de o modelo dar nota mais alta a um par que deu Match do que a um par com Nope, quando se sorteia um de cada: 0,5 é o acaso, 1 é acertar sempre. A precisão é a parte dos pares apontados como Match que deram Match de fato. Os autores escolhem o ponto de corte que dá a melhor combinação (o F1) entre a precisão e a parte dos Matches que o modelo encontrou.

Com todo o histórico disponível, o LFRR também supera a nota feita com fotos, como dizem os autores na Seção 4.5; para esse caso o artigo não dá números. Para a rede que compara uma foto com outra, o artigo mostra só a curva (Figura 4), sem número.

Os autores leem a vantagem sobre o RECON como sinal da importância das fotos no namoro online, frente às informações em texto (Seção 5.1). Na comparação do artigo, porém, o RECON usou só os dados do perfil por categoria: nenhum dos modelos leu o texto livre dos perfis.

## Limitações

- Dados de um só site, o Pairs, do Japão, e só da região de Kanto, de usuários com identidade conferida e do ano mais recente. Os autores dizem que a base é quase toda de um só grupo étnico e que não deu para ver o efeito em minorias.
- A pesquisa foi feita em colaboração com o site, que cedeu os dados e os recursos para treinar os modelos. Duas informações do artigo vêm de pesquisas internas do Pairs que não são mostradas: que quem tem muitos Matches sai do site mais vezes dizendo ter achado alguém, e que o primeiro dia decide se o usuário fica. Os dados não foram liberados para outros pesquisadores.
- O teste foi feito fora do site, com pares do passado, metade Match e metade Nope. No uso real, a mistura de Matches e Nopes é outra, e o artigo não testou recomendar com o modelo para gente de verdade.
- O Match é uma medida indireta de sucesso: o artigo não sabe quem conversou, saiu ou começou um relacionamento, porque as pessoas saem do site para conversar.
- O modelo prevê, não explica. O artigo não diz o que nas fotos pesou no Like: rosto, roupa, lugar ou a qualidade da imagem.
- O RECON foi feito para um site de texto livre e atributos, sem fotos, e os autores o rodaram nos dados do Pairs; isso pode explicar parte do resultado dele no nível do acaso, como os autores reconhecem (Seção 4.4).
- Os modelos foram montados para homens que curtem mulheres e mulheres que curtem homens, por causa dos dados disponíveis.
- O artigo não traz teste de acaso para as diferenças de AUC entre os modelos.
- Na Seção 4.2, a fórmula da cobertura, escrita como está, dá o mesmo que a precisão; os números diferentes da Tabela 2 mostram que a conta foi outra, que o artigo não detalha.
- Lemos a versão aceita dos autores, não a publicada pela ACM. É um artigo de congresso.
- Os mesmos autores ampliaram o modelo em 2021, num preprint que não nomeia o site: [Neve & McConville (2021)](neve-2021-fotos-recomendacao.md).
