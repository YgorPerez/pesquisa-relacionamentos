---
reference: "Lee S, Niederle M. *Propose with a rose? Signaling in internet dating markets*. Experimental Economics 18(4):731–755, 2015. Texto completo no site de Niederle: https://web.stanford.edu/~niederle/Roses.Lee.Niederle.pdf"
link: https://doi.org/10.1007/s10683-014-9425-9
status: verified
verified_on: 2026-11-14
strength: moderate
strength_reason: "Experimento de campo num site de namoro real, com sorteio de quem recebia oito rosas em vez de duas, mas pequeno (613 participações, 1.921 propostas) e num grupo específico de coreanos com faculdade; o ganho por rosa compara propostas em que o próprio remetente escolheu pôr a rosa, e a estimativa geral que usa o sorteio pode ser acaso."
countries: [Coreia do Sul]
period: "Julho e agosto de 2008"
sample:
  n: 613
  description: "613 participações (304 de homens e 309 de mulheres) em duas sessões especiais de um grande site de namoro sul-coreano, 212 na primeira e 401 na segunda. Coreanos com faculdade, nunca casados, homens de 26 a 38 anos e mulheres de 22 a 34, que pagaram cerca de 50 dólares por sessão. Trinta e três homens e 25 mulheres participaram das duas."
  representative: false
design: experiment
conflict: "Niederle agradece apoio da NSF. O experimento rodou dentro da empresa do site, e os autores agradecem a três pessoas do Korea Marriage Culture Institute pela ajuda. O artigo não traz declaração de conflito de interesse."
covers:
  genders: [man, woman]
  ages: { min: 22, max: 38 }
  couple: different-sex
---

# Lee & Niederle (2015): a rosa virtual que acompanha o pedido de encontro

## O que mediu

Num evento de um site de namoro sul-coreano, cada participante podia mandar um pedido de encontro, uma nota pronta e igual para todos, a até dez pessoas do outro sexo, e prender a alguns deles uma "rosa virtual" que indicava interesse especial. A rosa era grátis, mas escassa: por sorteio, a maioria ganhou duas e uma parte ganhou oito. Os autores mediram se o pedido com rosa era mais aceito que o pedido sem rosa e para quem a rosa fazia diferença.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quantos participaram | 613 participantes em dois eventos, cerca de 50% mulheres | §1 (p. 3 do PDF) | "dating company organizes two dating events with 613 participants, about 50 % of whom are female" | |
| Quantas rosas cada um tinha | Oito em cada dez participantes receberam duas rosas e os outros 20%, oito | §3.2.2 | "Eighty percent of participants receive two roses, while 20 % receive eight roses." | |
| Pedidos aceitos | Dos 1.921 pedidos de encontro, 295 foram aceitos | §4.1 | "Of the 1,921 proposals, 295 were accepted." | |
| Aceite por sexo | As mulheres aceitaram 16% dos pedidos que receberam e os homens, 29% | §4.1, nota 14 | "women are significantly less likely to accept an offer than men (16 versus 29 percent" | |
| Pedidos recebidos | Em média, 5,9 por mulher e 3,9 por homem | §4.1, nota 14 | "women on average receive 5.9 offers, while men receive only 3.9" | |
| A rosa e a chance de aceite | Para a mesma pessoa, um pedido com rosa teve 3,3 pontos percentuais a mais de chance de ser aceito que um pedido sem rosa de alguém parecido | §4.3, Hipótese 1; Tabela 2, coluna 1 | "attaching a rose significantly increases the probability of being accepted by 3.3 % points" | |
| Quanto isso pesa | O ganho equivale a 20% da taxa geral de aceite | §4.3, Hipótese 1 | "This corresponds to a 20 % increase compared to the overall acceptance rate." | |
| Rosa comparada a ser mais desejável | O pedido de alguém do grupo mais desejável teve cerca de 18 pontos a mais de chance de aceite que o de alguém do grupo de baixo; o de alguém do grupo do meio, 5 pontos | §4.3, Hipótese 1 | "more likely to accept an offer from a sender in the top desirability group (by approximately 18 % points) or from a sender in the middle group (by 5 % points)" | |
| Contagem simples, pedidos feitos a homens | Foram aceitos 19,7% dos pedidos sem rosa e 23,6% dos pedidos com rosa | §4.3, Hipótese 1 (a frase termina na página seguinte, com "proposals with roses were accepted") | "Among the proposals sent to men, 19.7 % of the proposals without roses were accepted, whereas 23.6 % of the" | |
| Contagem simples, pedidos feitos a mulheres | Foram aceitos 12,3% dos pedidos sem rosa e 12,9% dos pedidos com rosa | §4.3, Hipótese 1 | "Among the proposals sent to women, 12.3 % of the proposals without roses were accepted and 12.9 % of the proposals with roses were accepted." | |
| Conta que usa o sorteio | Usando o sorteio das rosas para separar a rosa da escolha de quem a mandou, o ganho foi de 4,1 pontos, perto dos 3,3 da conta principal | §4.3, Hipótese 1; Tabela 2, coluna 2 | "sending a rose increases the chance of acceptance by 4.1 % points, larger than but not statistically different from the baseline effect (3.3 % points)" | |
| Certeza da conta que usa o sorteio | Sozinho, esse ganho geral pode ser acaso | §4.3, Hipótese 1 | "The overall effect of roses estimated by the IV regression is not statistically significant at a conventional level." | |
| Homens com oito rosas | Nos dois subgrupos de homens em que a comparação é justa, tiveram cerca de 40% a mais de chance de ter ao menos um pedido aceito que os homens com duas rosas | §4.3, Hipótese 2; Tabela 3, painéis A e B | "Men have approximately 40 % increase in their chance of having at least one offer accepted (initiated date), and also have at least 40 % more initiated dates" | |
| Mulheres com oito rosas | 32,8% tiveram ao menos um pedido aceito, contra 21,8% das mulheres com duas rosas | Tabela 3, painel C (duas rosas, depois oito) | "Have at least one initiated date 0.218 0.328" | `scripts/calculations/lee-2015-rosa-virtual.ts` |
| Quem recebe é do grupo mais desejável | Essas pessoas não reagiram à rosa; as do grupo do meio e do grupo de baixo reagiram | §5.2 | "top group recipients made no response to receiving a rose, while the middle and bottom groups do" | |
| Quem recebe é do grupo do meio | Teve 7,8 pontos a mais de chance de aceitar um pedido com rosa | §4.3, Hipótese 3; Tabela 4, coluna 1 (a frase começa na página anterior, com "middle group recipients") | "are 7.8 % points more likely to accept an offer with a rose than one without a rose" | |
| Quanto isso pesa no grupo do meio | A taxa geral de aceite desse grupo é 18,42%, então a rosa a aumenta em cerca de 40% | §4.3, Hipótese 3 | "The overall acceptance rate for middle group recipients is 18.42 %, so a rose results in a roughly 40 % increase in the acceptance rate." | |
| Quem recebe é do grupo de baixo | O ganho foi de 5,4 pontos, mas pode ser acaso | §4.3, Hipótese 3 | "Recipients in the bottom desirability group overall have a positive response to a rose of 5.4 % points, but the effect is not significant." | |
| Quem propõe é mais desejável que quem recebe | Nesse caso a rosa aumentou a taxa de aceite em mais de 50%, para quem recebe no grupo de baixo ou no do meio | §4.3, Hipótese 4; Tabela 5 | "The effect of a rose is always more than a 50 % increase in acceptance rate for either the bottom or middle recipients." | |
| A rosa tira o lugar de outro pedido? | Entre pessoas do grupo do meio com até três pedidos, quem recebeu ao menos uma rosa aceitou 0,259 pedido a mais que quem não recebeu nenhuma | §4.3, Hipótese 5; Tabela 6 | "participants who receive at least one rose accept 0.259 more offers than those who receive no rose" | |
| De onde vem esse aumento | Ele corresponde a 37% e vem quase todo dos homens | §4.3, Hipótese 5 | "this corresponds to a 37 % increase. Note that this effect is almost entirely driven by men." | |
| Quem usou as rosas | Entre quem fez ao menos um pedido, 90,30% dos homens e 64,91% das mulheres usaram ao menos uma rosa | §5.1 | "men were more likely than women to use at least one rose (90.30 compared to 64.91 %" | |
| Rosas mandadas a quem não reage | Cerca de 30% das rosas foram para pessoas do grupo mais desejável, que não reagiram a elas | §1 (p. 5 do PDF) | "approximately 30 % of roses were sent in vain to top group recipients who did not positively respond to them" | |
| Aviso para a mulher propor primeiro | Metade das mulheres via na tela um aviso que as incentivava a fazer o pedido, e metade dos homens via outro que os incentivava a aceitar pedidos de mulheres; nenhum dos dois mudou o comportamento | §3.2.2 | "We find that these encouragements have no impact." | |

"Pontos percentuais" é a diferença direta entre duas taxas: de 10% para 13,3% são 3,3 pontos. "Desejável" é o índice que a empresa calcula para cada cliente, de 0 a 100, com renda, patrimônio, emprego, altura, peso, nota da foto, faculdade e família; os participantes não o viam. O estudo dividiu cada sexo em três grupos por esse índice: os 30% de baixo, os 40% do meio e os 30% de cima. Pedido sem resposta conta como recusado. Aceito o pedido, a empresa mandava aos dois o telefone um do outro.

## Limitações

- O experimento é pequeno: 613 participações, 1.921 pedidos e 295 aceites. As contas por grupo têm margem larga, e várias só passam no teste a 10%. O texto dá dois números para quem participou das duas sessões: 58 pessoas no §3.3 e 56 na nota 18.
- O grupo é específico: coreanos com faculdade, nunca casados, de 22 a 38 anos, a maioria da Grande Seul, clientes de uma empresa que desde 1991 apresenta pessoas para casar e confere documentos. Os autores dizem que eles aceitam poucos encontros porque o tempo lhes custa caro.
- A rosa não é uma mensagem. O pedido era uma nota pronta, igual para todos, e ninguém escrevia nada. O estudo mostra o peso de um sinal de interesse escasso, não o do que se escreve.
- Quem recebia oito rosas foi sorteado, mas pôr ou não a rosa em cada pedido era escolha do remetente. A conta principal (3,3 pontos) compara pedidos com e sem rosa levando em conta quem mandou e quem recebeu. A conta que usa o sorteio dá um número parecido que, no geral, pode ser acaso; os autores se apoiam nas versões por grupo dessa conta, que para quem recebe no grupo do meio seguem [[significativas]].
- Na contagem simples, a diferença entre pedidos com e sem rosa é pequena, sobretudo nos feitos a mulheres (12,3% contra 12,9%). O ganho só aparece depois dos ajustes.
- O sorteio saiu desequilibrado entre os homens: o grupo de oito rosas tinha mais clientes regulares da empresa. Por isso a comparação entre duas e oito rosas, nos homens, usa só dois subgrupos, com testes de um lado só.
- O desfecho é o aceite do pedido, que faz a empresa trocar os telefones. O artigo não sabe se o encontro aconteceu nem o que veio depois.
- A conta sobre o total de encontros usa 97 pessoas do grupo do meio que receberam até três pedidos.
- Um resultado saiu contra o esperado, e os autores o chamam de "surprising": a rosa também ajudou pedidos de remetentes do grupo de baixo a pessoas do grupo do meio.
- Não li o suplemento, que traz a validação do índice de desejabilidade e os detalhes da conta com o sorteio; a editora só o libera para assinantes.
- Li o PDF da editora na versão online de 2014, antes da paginação do volume, hospedado no site de Niederle. O Crossref não registra correção nem retratação (consulta em 14/11/2026).
