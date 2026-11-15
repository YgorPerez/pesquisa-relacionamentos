---
reference: "Huang N, He Y, Xu X, Hong Y. *Designing demand information disclosure in the presence of capacity constraints: A large-scale randomized field experiment on a matching platform*. ICIS 2020 Proceedings 17, 2020. Texto completo aberto (AIS Electronic Library): https://aisel.aisnet.org/icis2020/user_behaviors/user_behaviors/17"
link: https://aisel.aisnet.org/icis2020/user_behaviors/user_behaviors/17
status: verified
verified_on: 2026-11-15
strength: moderate
strength_reason: "Experimento de campo com sorteio entre 48.658 usuários de um app de namoro chinês, com pedidos e matches reais, mas num app só, por duas semanas, num artigo de congresso que não dá médias por grupo nem divide por gênero; o ganho em matches foi estimado levando em conta o número de pedidos, que o próprio tratamento mudou."
countries: [China]
period: "2 a 16 de setembro de 2019"
sample:
  n: 48658
  description: "48.658 usuários do Summer, um app de namoro chinês que os autores descrevem como um dos maiores do país, que entraram no experimento ao atualizar o app para a versão 3.5.2 durante as duas semanas do teste. Cada usuário foi sorteado para um de quatro grupos e ficou nele até o fim. O artigo não diz quantos homens e mulheres havia, as idades, nem com quem cada um buscava par."
  representative: false
design: experiment
conflict: "O texto lido não traz seção de financiamento nem declaração de conflito de interesse. No artigo, os autores assinam pela University of Houston e pela Tsinghua University; a capa da biblioteca do congresso lista também Arizona State University e University of Minnesota. A empresa dona do app desenhou as telas testadas, rodou o experimento e cedeu aos autores os dados sem identificação; depois do teste, adotou uma versão do desenho."
covers:
  genders: [man, woman]
---

# Huang et al. (2020): o número de pedidos recebidos, exibido no perfil

## O que mediu

No Summer, um app de namoro chinês, quem quer dar match com alguém responde às perguntas que essa pessoa deixou no perfil, e ela decide se aprova o pedido. Durante duas semanas de setembro de 2019, os usuários que atualizaram o app foram sorteados para quatro versões da página de perfil dos outros: sem informação nenhuma (a tela de antes), com o número de pedidos que o dono do perfil recebeu no último mês, com esse número e uma frase de popularidade ("é muito popular" ou "não foi escolhida por muitos"), ou com o número e uma frase de capacidade ("está ocupada atendendo pedidos" ou "tem tempo para atender pedidos"). A frase mudava conforme o perfil tivesse 10 pedidos ou mais no mês (muito procurado) ou menos (pouco procurado).

O grupo de comparação é o que via só o número. Os autores contaram, por usuário, os pedidos mandados a perfis muito e pouco procurados, os matches (pedidos aprovados) e os "matches bem-sucedidos", com pelo menos duas rodadas de troca de mensagens.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Participantes | 48.658 usuários do app entraram no experimento | Data, p. 9 | "There were a total of 48,658 subjects participated in the experiment." |
| Duração | O experimento rodou por duas semanas, de 2 a 16 de setembro de 2019 | Experimental Design and Procedure, p. 6 | "The experiment was live for a total of two weeks, starting and ending at same time from September 2 to 16 in 2019." |
| Corte entre muito e pouco procurado | Nos dados do app antes do teste, a mediana de pedidos recebidos por mês por um usuário ativo era nove; os autores usaram 10 pedidos no mês como o corte entre perfil muito procurado e pouco procurado | Experimental Design and Procedure, p. 8 | "the median number of monthly requests for any active user is nine. Additionally, our surveys and interviews indicate that the users believe a single-digit request number is considered relatively low and a double-digit request number is perceived to be relatively high (see Appendix A). Therefore, we use 10 requests as the cut-off point for high- versus low-demand users" |
| Pedidos a perfis pouco procurados, aviso de capacidade | Quem via o número de pedidos junto com o aviso de que a pessoa "tem tempo para atender pedidos" mandou, em duas semanas, em média 0,189 pedido a mais a perfis pouco procurados do que quem via só o número (p < 0,05) | Tabela 4 e texto, p. 11 | "significantly increased their total number of matching requests to low-demand users (βDemand+Capacity = 0.189, p < 0.05) compared to the control group" |
| Pedidos a perfis muito procurados, aviso de capacidade | Com o aviso de capacidade, a diferença em relação a quem via só o número foi 0,361 pedido menor nos perfis muito procurados do que nos pouco procurados (p < 0,01); os autores leem isso como menos pedidos aos muito procurados | Tabela 4 e texto, p. 11 | "High_demand Profile = -0.361, p < 0.01), suggesting that receiving a ‘Demand Info + Capacity Cue’ treatment has a substantial negative impact on the subjects’ number of matching requests for high-demand users" |
| Pedidos a perfis pouco procurados, aviso de popularidade | Quem via o número com a frase de popularidade mandou a perfis pouco procurados 0,054 pedido a mais que quem via só o número, e a diferença pode ser acaso (erro-padrão 0,089) | Tabela 4, linha Demand+Popularity, modelo 2, p. 11 | "Demand+Popularity 0.046 (0.089) 0.054 (0.089)" |
| Pedidos a perfis muito procurados, aviso de popularidade | Na conta por usuário, quem via o aviso de popularidade mandou a perfis muito procurados, em relação aos pouco procurados, 0,157 pedido a menos que quem via só o número, e a diferença pode ser acaso (erro-padrão 0,101) | Tabela 4, linha Demand+Popularity * High_demand Profile, modelo 2, p. 11 | "High_demand Profile -0.157 (0.135) -0.157 (0.101)" |
| Pedido por visita, aviso de popularidade | Na conta por visita a um perfil, quem via o aviso de popularidade teve chance menor de pedir match ao abrir um perfil muito procurado do que quem via só o número (−0,009, p < 0,01) | Robustness Checks, p. 13 | "High_demand Profile = -0.009, p < 0.01)" |
| Pedidos sem informação, perfis pouco procurados | Na conta por usuário, quem não via número nenhum (a tela antiga) mandou a perfis pouco procurados 0,054 pedido a mais que quem via só o número, e a diferença pode ser acaso (erro-padrão 0,089) | Tabela 4, linha Holdout, modelo 2, p. 11 | "Holdout 0.050 (0.089) 0.054 (0.089)" |
| Pedidos sem informação, perfis muito procurados | Na conta por usuário, quem não via número nenhum mandou a perfis muito procurados, em relação aos pouco procurados, 0,165 pedido a mais que quem via só o número, e a diferença pode ser acaso (erro-padrão 0,106) | Tabela 4, linha Holdout * High_demand Profile, modelo 2, p. 11 | "High_demand Profile 0.165 (0.143) 0.165 (0.106)" |
| Pedido por visita, sem informação | Na conta por visita a um perfil, quem não via número nenhum teve chance maior de pedir match ao abrir um perfil muito procurado do que quem via só o número (0,010, p < 0,01) | Robustness Checks, p. 14 | "High_demand Profile = 0.010, p < 0.01)" |
| Pedido por visita a perfil pouco procurado, aviso de capacidade | Na conta por visita, quem via o aviso de capacidade teve chance 0,006 maior de pedir match ao abrir um perfil pouco procurado do que quem via só o número (p < 0,05) | Robustness Checks, p. 13 | "(αDemand+Capacity = 0.006, p < 0.05, when High_demand Profile = 0)" |
| Pedido por visita a perfil muito procurado, aviso de capacidade | Na conta por visita, quem via o aviso de capacidade teve chance menor de pedir match ao abrir um perfil muito procurado do que quem via só o número (−0,014, p < 0,01) | Robustness Checks, p. 13 | "High_demand Profile = -0.014, p < 0.01, when High_demand Profile = 1)" |
| Matches, aviso de capacidade | Levando em conta quantos pedidos cada um mandou, quem via o aviso de capacidade teve em média 0,066 match a mais que quem via só o número (p < 0,01), cerca de 6,9% a mais sobre uma média de 0,96 match por usuário. Quem aprova o pedido é a pessoa que o recebe | Tabela 5 e texto, p. 12 | "(λDemand+Capacity = 0.066, p < 0.01) compared with the control group. This coefficient estimate also translates to a 6.9% relative increase in the number of matches, given that a user on average makes around 0.96 matches on the platform." |
| Matches, aviso de popularidade e tela antiga | Levando em conta quantos pedidos cada um mandou, quem via o aviso de popularidade teve 0,040 match a mais que quem via só o número, e quem não via número nenhum, 0,004 a menos; as duas diferenças podem ser acaso (erro-padrão 0,026) | Tabela 5, linhas Holdout e Demand+Popularity, p. 12 | "Holdout -0.006 (0.026) -0.004 (0.026) Demand+Popularity 0.040 (0.026) 0.040 (0.026)" |
| Matches com conversa | Levando em conta quantos pedidos cada um mandou, quem via o aviso de capacidade teve em média 0,032 match a mais com pelo menos duas rodadas de mensagens que quem via só o número (p < 0,05), cerca de 6,2% a mais sobre uma média de 0,52 | Tabela 6 e texto, p. 13 | "(γDemand+Capacity = 0.032, p < 0.05). Given that a user on average achieves 0.52 matches with at least two rounds of message exchanges, our estimate translates to a 6.2% relative lift in successful matches." |
| Matches com conversa, aviso de popularidade | Com o aviso de popularidade, a diferença nos matches com conversa foi de 0,018 a mais, e pode ser acaso (erro-padrão 0,015) | Tabela 6, linha Demand+Popularity, p. 13 | "Demand+Popularity 0.018 (0.015) 0.018 (0.015)" |

Os números das linhas de pedidos e de matches são coeficientes de regressões lineares: a diferença média, por usuário, em relação ao grupo que via só o número de pedidos, nas duas semanas do teste, levando em conta gênero, idade e o dia em que a pessoa entrou no experimento (o modelo 2 de cada tabela). A conta "por visita" é a checagem dos autores em que cada abertura de um perfil conta uma vez (1.741.890 visitas), e o número é a diferença na chance de mandar o pedido naquela visita. "p" é a chance de uma diferença daquele tamanho aparecer só por acaso; o erro-padrão é a incerteza da estimativa. "Pode ser acaso" marca as diferenças que, segundo a tabela, não chegaram à [[significância]] estatística.

## Limitações

- Um app só, chinês, por duas semanas, com o desenho de match por perguntas e respostas próprio desse app. Os usuários entraram ao atualizar o app; o artigo não compara quem atualizou com quem não atualizou.
- O artigo não dá o número de usuários de cada grupo, as médias de pedidos por grupo (só um gráfico, a Figura 3) nem a divisão por gênero, idade ou orientação. Não se sabe se o efeito foi o mesmo para homens e mulheres. O Apêndice A, citado para o corte de 10 pedidos, não está no PDF lido.
- As regressões de matches levam em conta o número de pedidos que cada usuário mandou, que o próprio tratamento mudou. O ganho de 6,9% em matches e de 6,2% em matches com conversa é, portanto, o que sobra depois de igualar o número de pedidos, e não a diferença total entre os grupos, que o artigo não dá.
- A discussão diz que mostrar só o número já fez os usuários pedirem menos aos muito procurados, e que o aviso de popularidade desanimou os pedidos a eles. Na conta por usuário, que os autores chamam de análise principal, essas duas diferenças podem ser acaso (Tabela 4); elas só aparecem na conta por visita e no gráfico. Os autores avisam que a conta por visita ganha força estatística por repetir o mesmo usuário muitas vezes.
- O número de pedidos mostrado era o real, sem manipulação: os perfis muito e pouco procurados diferem em tudo o que leva alguém a ser procurado. O sorteio vale para a frase mostrada, não para a procura de cada perfil.
- Os autores leem o efeito do aviso de capacidade como a percepção de que o outro tem tempo, e o do aviso de popularidade como medo de rejeição; o estudo não mediu nenhuma das duas coisas.
- É um artigo de congresso (ICIS 2020, na categoria "Completed Research Paper"); o texto lido não diz como foi revisado, e não há versão em revista entre o que foi lido.
