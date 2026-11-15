---
reference: "Norcie G, De Cristofaro E, Bellotti V. *Bootstrapping trust in online dating: Social verification of online dating profiles*. Em: Financial Cryptography and Data Security, FC 2013 Workshops (USEC), Lecture Notes in Computer Science 7862, Springer, 2013. Texto lido: preprint arXiv:1303.4155v2, https://arxiv.org/abs/1303.4155"
link: https://doi.org/10.1007/978-3-642-41320-9_10
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Voluntários do Mechanical Turk que não representam uma população e 20 entrevistados recrutados num site local de classificados e em listas de e-mail de uma universidade; sem grupo de comparação, a mesma pessoa deu a nota antes de ver a interface criada pela própria equipe e de novo imaginando um site que a usasse, e o teste tratou as duas notas como de grupos diferentes."
countries: []
period: "não informado no texto lido"
sample:
  n: 161
  description: "Duas amostras. Entrevistas: 20 usuários, atuais ou antigos, de sites de namoro, recrutados num site local de classificados e em listas de e-mail de uma universidade local (55% mulheres, de 24 a 70 anos). Questionário: 200 participantes do Mechanical Turk que se declararam usuários atuais de sites de namoro, dos quais 161 acertaram as perguntas de atenção e entraram na conta; o sexo deles não é informado."
  representative: false
design: cross-sectional
conflict: "O texto não declara financiamento. Dois autores são da PARC (empresa da Xerox), onde o primeiro autor fez o trabalho como estagiário; a equipe testou uma interface que ela mesma desenhou, e o registro no comitê de ética é o da PARC."
covers:
  ages: { min: 18, max: 70 }
---

# Norcie et al. (2013): verificar o perfil de namoro pelo Facebook

## O que mediu

O estudo tem duas partes. Primeiro, entrevistas com 20 usuários de sites de namoro sobre o que eles postam no Facebook e o que os preocupa nos sites. Depois, um questionário no Mechanical Turk com usuários atuais de sites de namoro: eles deram notas de 1 (nada preocupado) a 7 (extremamente preocupado) para o medo de que outros usuários mintam o estado civil, a idade e as fotos. Em seguida viram telas de uma interface desenhada pela equipe, o Certifeye, que confere a idade, o estado civil e as fotos do perfil com os do Facebook da pessoa e mostra um selo e o número de amigos, e deram as mesmas notas imaginando um site que usasse essa interface. A interface era uma maquete, não um produto em uso.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quem foi entrevistado | 20 usuários, atuais ou antigos, de sites de namoro, em entrevistas semiestruturadas | Resumo e Seção 3.2 | "we report on a series of semi-structured interviews involving 20 participants" |
| Vergonha de usar site de namoro | 15 dos 20 entrevistados não viam o namoro online como muito constrangedor | Seção 3.3 | "We found that a majority of interviewees (15/20) did not see online dating as very embarrassing." |
| Uso de app no feed do Facebook | 15 dos 20 entrevistados (75%) não queriam que o feed do Facebook mostrasse o uso de apps de namoro | Seção 3.3 | "75% of interviewees (15/20) did not want their mini-feeds to reflect their use of dating apps." |
| O que preocupa nos perfis, por idade | Nas entrevistas, os mais velhos se preocupavam com perfis que mentem a idade ou o estado civil, e os mais novos com fotos alteradas, antigas ou tiradas de um ângulo muito favorável | Seção 3.3 | "Older users were concerned that that profiles misrepresented age and/or relationship status, while younger participants were more concerned that the photos posted were either altered, out of date, or taken from an especially flattering angle" |
| Quem respondeu ao questionário | De 200 usuários de sites de namoro no Mechanical Turk, 39 erraram as perguntas de atenção, e 161 entraram na conta | Seção 4.1 | "Out of an initial pool of 200 users, 39 users failed their sanity check, leaving 161 valid responses for analysis." |
| Preocupação com fotos | Entre os usuários do Mechanical Turk, a preocupação média com fotos antigas, retocadas ou de ângulo favorável foi de 4,7 antes de ver a interface e de 3,5 imaginando um site que a usasse (p < 0,001 na tabela dos autores) | Tabela 5 | "Photos 4.7 3.5 < .001" |
| Preocupação com o estado civil | Entre os usuários do Mechanical Turk, a preocupação média com quem mente o estado civil foi de 4,6 antes de ver a interface e de 3,4 imaginando um site que a usasse (p < 0,001 na tabela dos autores) | Tabela 5 | "Rel. Status 4.6 3.4 < .001" |
| Preocupação com a idade | Entre os usuários do Mechanical Turk, a preocupação média com quem mente a idade foi de 4,1 antes de ver a interface e de 3,1 imaginando um site que a usasse (p < 0,001 na tabela dos autores) | Tabela 5 | "Age 4.1 3.1 < .001" |
| Como se julga se um perfil de Facebook é verdadeiro | Os participantes do Mechanical Turk puseram o número de amigos em primeiro lugar entre os critérios para julgar se o perfil de Facebook de um desconhecido é verdadeiro, à frente da cidade e do local de trabalho; a atratividade ou aparência ficou em último entre os critérios com nome | Seção 4.2 | "Number of friends 2. Location (city) 3. Workplace 4. College / Grad School 5. Mutual interests 6. Attractiveness / appearance" |

As notas de preocupação iam de 1 (nada preocupado) a 7 (extremamente preocupado). "p" é a chance de uma diferença assim aparecer só por acaso; os autores o calcularam com um teste para dois grupos diferentes, embora as notas de antes e de depois sejam das mesmas pessoas (ver Limitações).

Os autores leem a queda das notas como prova de que a verificação de idade, fotos e estado civil "reduce users' concerns" (Seção 4.2). O desenho não separa isso de outras explicações: não houve grupo que respondesse duas vezes sem ver a interface, e a segunda nota pedia que a pessoa imaginasse um site com ela.

## Limitações

- Sem grupo de comparação: a mesma pessoa respondeu antes de ver a interface e de novo depois, imaginando um site que a usasse. A diferença pode vir de a pessoa perceber o que o estudo esperava; os próprios autores lembram, na introdução, que voluntários tendem a responder o que parece desejável.
- O teste de Mann-Whitney que os autores usaram trata as 161 notas de antes e as 161 de depois como dois grupos independentes (n1 = n2 = 161), mas são as mesmas pessoas.
- A preocupação é uma nota dada num questionário, não um comportamento: o estudo não mediu se alguém confiaria mais num perfil real, nem se a verificação pega quem mente.
- Os voluntários do Mechanical Turk não representam uma população. O texto não diz o país nem o sexo deles, e o uso de site de namoro foi o que cada um declarou.
- A Tabela 3 não fecha: as idades somam 171 pessoas, não 161, e as 20 pessoas de 51 a 70 anos seriam 12,4%, não os 6,2% impressos. Com 10 pessoas nessa faixa, a soma daria 161 e os 6,2% bateriam; o 20 parece erro de digitação, mas o texto não diz.
- A ordem dos critérios de perfil verdadeiro vem sem números: os autores pedem uma ordem de 1 a 8, listam sete opções e não dizem como juntaram as respostas.
- As 20 entrevistas foram com pessoas recrutadas num site local de classificados e em listas de e-mail de uma universidade local, e os autores avisam que o que observaram "do not necessarily extend to the general population". A Tabela 1 tem uma faixa de 18 a 25 anos, embora o texto diga que as idades iam de 24 a 70.
- A equipe da PARC testou a própria interface. O texto lido é o preprint do arXiv (versão 2); a versão publicada nos anais não foi lida.
