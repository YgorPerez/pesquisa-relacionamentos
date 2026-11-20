---
reference: "Gao P, Wang X, Chen H, Dai W, Ling H. *What is beautiful is not always good: influence of machine learning-derived photo attractiveness on intention to initiate social interactions in mobile dating applications*. Connection Science 33(2):321–340, 2021 (publicado online em 2 de setembro de 2020). A cópia lida é o PDF da Taylor & Francis, de leitura gratuita sem licença aberta; fica no repositório privado das Fontes."
link: https://doi.org/10.1080/09540091.2020.1814204
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Registros de um app de namoro chinês com 25.389 usuários em três meses, sem sorteio da beleza: a nota de beleza vem de um programa cuja precisão o artigo não informa, o texto e as tabelas dão números diferentes para o mesmo coeficiente, os modelos de efeito fixo por usuário estimam traços que não mudam (sexo, região), e o desfecho é deixar ou não uma mensagem, sem resposta nem encontro."
countries: [China]
period: "três meses; o texto não dá as datas"
sample:
  n: 25389
  description: "25.389 usuários que entraram num app chinês de namoro por troca de fotos ao longo de três meses, com 48.797 fotos; idade média de cerca de 23 anos pelo texto (23,941 na Tabela 2). O app mostrava a quem buscava uma foto borrada de alguém do outro sexo, sorteada; para vê-la nítida, com a cidade e a data da foto, o usuário mandava uma foto sua em troca e decidia se deixava mensagem. As regressões usam 22.933 observações (13.085 de homens e 9.848 de mulheres). A empresa cedeu os dados; o artigo não diz o nome do app."
  representative: false
design: platform
conflict: "Financiado pela National Natural Science Foundation of China (71802108) e pelo China Scholarship Council (201906845029). Os autores declaram não ter conflito de interesses. Quatro autores são da Fudan University e da Nanjing University of Science and Technology; Hong Chen é da Ping An Technology, uma empresa de tecnologia."
covers:
  genders: [man, woman]
---

# Gao et al. (2020): beleza da foto e quem deixa mensagem num app chinês

## O que mediu

Num app chinês de namoro, quem entrava recebia, uma por vez e por sorteio, a foto borrada de alguém do outro sexo. Para vê-la nítida, mandava uma foto sua em troca. Aí via a foto, a cidade da pessoa e há quantos dias a foto tinha sido posta, e decidia se deixava uma mensagem. Os autores chamam de "caçador" quem decide e de "alvo" quem aparece na foto.

Um programa de aprendizado de máquina, treinado com notas dadas por pessoas, deu a cada foto uma nota de beleza de 0 a 1. Com uma regressão logística de painel, com efeito fixo para cada caçador, os autores compararam a nota de beleza do alvo com a chance de o caçador deixar mensagem, e repetiram a conta em separado por região (mesma região da China ou não), por sexo do caçador e pela beleza do próprio caçador.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Usuários e fotos | Em três meses, 25.389 usuários entraram no app e puseram 48.797 fotos | 3.1 (p. 328) | "During this period, a total of 25,389 users logged into the app, with 48,797 personal photos uploaded" |
| Quem deixa mensagem, por região | Deixaram mensagem 15,3% dos caçadores diante de alvos da mesma região e 13,9% diante de alvos de outra | 3.2 (p. 331) | "15.3% users tend to initiate a social interaction; whereas the percentage of users who leave a message to a "target" living in a different region is only 13.9%" |
| Beleza de quem recebeu mensagem | A nota média de beleza dos alvos que receberam mensagem foi 0,161, contra 0,122 dos que não receberam | 3.2 (p. 331) | "(group 1: 0.161 vs. group 2: 0.122)" |
| Beleza do alvo | Quanto mais bonita a foto do alvo, pela nota do programa, maior a chance de o caçador deixar mensagem, levando em conta região, sexo, idade, tempo de app, a beleza do próprio caçador e os dias desde que a foto foi posta (b = 0,350, p ≤ 0,001) | 4.1 (p. 332) | "intention to leave a message (b = 0.350, p ≤ .001)" |
| Distância | Diante de um alvo de outra região, a chance de deixar mensagem foi menor (b = −0,108, p ≤ 0,05) | 4.1 (p. 332) | "the coefficient of location difference is significantly negative (b = −0.108, p ≤ .05)" |
| Mulheres que deixam mensagem | Mulheres deixaram mensagem menos que homens (b = −0,248 no texto; ver Limitações) | 4.1 (p. 332) | "A female user is significantly less likely to initiate a social interaction than a male user (b = −0.248, p ≤ .001)" |
| Beleza, mesma região | Entre caçador e alvo da mesma região, a beleza do alvo andou junto com mais mensagens (b = 0,402, p ≤ 0,001) | 4.2 (p. 332) | "photo attractiveness has a significant positive effect on the hunter's intention to leave a message (b = 0.402, p ≤ .001)" |
| Beleza, regiões diferentes | Entre caçador e alvo de regiões diferentes, o peso da beleza foi menor (b = 0,314) | 4.2 (p. 332) | "for user dyads living in different regions, the absolute value of the regression coefficient (b = 0.314) is smaller" |
| Beleza, homens e mulheres | Nos homens, a beleza da foto da mulher andou junto com mais mensagens (b = 0,366, p ≤ 0,001); nas mulheres, o coeficiente foi quase zero e pode ser acaso (b = 0,009, p > 0,1) | 4.2 (p. 333) | "(b = 0.366, p ≤ .001); whereas for female users, although the regression coefficient is positive, but is insignificant at all (b = 0.009, p > .1)" |
| Beleza de quem decide | Para os caçadores de nota abaixo da média, a beleza do alvo pesou (b = 0,295, p ≤ 0,01); para os de nota alta, mais de um desvio-padrão acima da média, pode ser acaso (b = 0,171, p > 0,1) | 4.2 (p. 333) | "(b = 0.295, p ≤ .01). On the contrary, for users who are highly attractive themselves, they do not put too much weight on the photo attractiveness, leading to an insignificant impact of target attractiveness on their intention to leave a message (b = 0.171, p > .1)" |

O b é o coeficiente da regressão logística: positivo quer dizer mais chance de deixar mensagem, negativo, menos. Só se compara com outro b deste estudo. O p é a probabilidade de uma ligação desse tamanho aparecer por acaso; abaixo de 0,05 costuma-se tratar como improvável. A nota de beleza vai de 0 a 1, com média de 0,153.

## Limitações

- É associação: o app sorteava a foto mostrada, mas a beleza é a que cada foto já tinha, e a pessoa mais bonita na foto pode diferir em outras coisas que o caçador viu (a cidade, a data da foto).
- O artigo não diz como foi treinado o programa de beleza, quantas pessoas deram as notas de treino nem quanto ele acerta. A nota média é baixa (0,153 numa escala de 0 a 1).
- Números que não fecham: o efeito de ser mulher é −0,248 no texto e −2,480 na Tabela 3; na Tabela 5, os coeficientes do tempo de app e da idade da foto parecem trocados em relação à Tabela 3; e modelos com efeito fixo por usuário estimam coeficientes para o sexo e a região do usuário, que não mudam dentro de um mesmo usuário. O "quase 40 vezes" do texto é a divisão de 0,366 por 0,009, um coeficiente que pode ser zero.
- Os autores dão a primeira hipótese por confirmada a partir de duas médias (0,161 e 0,122) sem teste.
- O desfecho é deixar uma mensagem, que também entregava a foto do caçador ao alvo. O artigo não olha a resposta, como os próprios autores dizem.
- Um app, na China, com usuários de cerca de 23 anos, em três meses sem data. O número de usuários (25.389), o mecanismo de fotos borradas sorteadas e a cidade como única informação são os mesmos do app MMD em [Zhang, Phang & Zhang 2018](zhang-2018-beleza-vende.md), dos mesmos grupos de pesquisa da Fudan; é provável que as duas Fichas usem a mesma base, e não sejam evidência independente uma da outra.

## Como usamos

O Relatório [Que fotos de perfil andam junto com mais curtidas, matches e mensagens?](../reports/2026-11-15-fotos-do-perfil.md) usa esta Ficha entre os dados de plataforma: a beleza da foto andou junto com deixar mensagem nos homens, e nas mulheres não apareceu ligação.
