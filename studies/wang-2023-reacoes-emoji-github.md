---
reference: "Wang D, Xiao T, Son T, Kula RG, Ishio T, Kamei Y, Matsumoto K. *More than React: Investigating the role of emoji reaction in GitHub pull requests*. Empirical Software Engineering 28, 2023. Texto lido: preprint arXiv:2307.07111v1, de 14 de julho de 2023."
link: https://doi.org/10.1007/s10664-023-10336-5
status: verified
verified_on: 2026-11-15
strength: moderate
strength_reason: "Registros reais de 365.811 pull requests de 1.850 repositórios do GitHub, uma amostra separada por linguagem de uma lista de projetos ativos, num estudo com protocolo registrado antes; mas o desenho só mostra associação, a leitura dos autores sobre estreantes não se apoia na conta que fazem, intenção e sentimento vêm de classificadores automáticos, e o texto lido é o preprint. Fora do namoro: é revisão de código entre colegas de projeto."
countries: []
period: "pull requests enviados de janeiro de 2020 a abril de 2022"
sample:
  n: 365811
  description: "365.811 pull requests fechados, com 1.188.578 comentários, de 1.850 repositórios do GitHub em sete linguagens (C, C++, Java, JavaScript, Python, PHP e Ruby), depois de tirar os PRs abertos e os enviados por robôs. Os repositórios são uma amostra, separada por linguagem, de 6.695 projetos ativos com pelo menos 100 PRs desde março de 2016. É conversa de trabalho entre quem envia código e quem o revisa, não namoro."
  representative: false
design: platform
conflict: "Financiado pela Japan Society for the Promotion of Science (JSPS KAKENHI 18H04094, 20K19774 e 20H05706). Dois autores, Raula Gaikovina Kula e Yasutaka Kamei, são do conselho editorial da revista; o artigo declara que não há interesse financeiro."
covers: {}
---

# Wang et al. (2023): reações de emoji em pull requests do GitHub

## O que mediu

Desde 2016 o GitHub deixa reagir a um comentário com um emoji de uma lista fixa (entre eles polegar para cima, polegar para baixo, risada, festa, coração, foguete, olhos e confuso). A equipe baixou os pull requests (PRs, pedidos de mudança de código) de 1.850 repositórios e perguntou quatro coisas: se o número de reações anda junto com o tempo até o PR ser fechado; que parte dos PRs com reação veio de quem nunca tinha enviado um PR ao projeto; a que tipo de comentário as pessoas reagem; e se o sentimento da reação combina com o do comentário. A intenção de cada comentário foi classificada por um programa treinado em outro estudo, e o sentimento, pela ferramenta SentiStrength-SE.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quanto se reage | Dos 365.811 PRs, 13,5% tinham ao menos uma reação de emoji; dos 1.188.578 comentários, 80.618 (6,8%) receberam reação | Seção 2 e Tabela 1 (p. 6) | "After the cleaning, 365,811 PRs were left with 1,188,578 PR comments. As shown in Table 1, 13.5% of PRs across seven languages contain at least one emoji reaction. 80,618 PR comments are reacted with emojis, accounting for 6.8%." |
| Reações e tempo até fechar | Levando em conta o tamanho do PR, o número de comentários, a experiência de quem o enviou e outros fatores, o número de reações andou junto com o tempo entre abrir e fechar o PR: os autores leem que PRs com reação tendem a demorar mais para ser fechados que PRs sem reação | Seção 3.1, quadro do RQ1 (p. 10) | "Findings from the non-linear regression models indicate that the number of emoji reactions has a significant correlation with the review time. In other words, PRs with emoji reactions are likely to have a longer review time when compared to those that do not." |
| Forma da relação | O tempo até fechar subiu junto com o número de reações até três e desceu acima de três | Seção 3.1 e Figura 2 (p. 10) | "the number of emoji reactions shares a positive relationship when the number of emoji reactions is less than three. But a negative relationship is observed if the number of emoji reactions is greater than three." |
| Peso das reações no modelo | No modelo do tempo até fechar, o número de reações explicou menos que o número de comentários dos revisores, o de commits, o de comentários de quem enviou o PR e o tamanho da descrição (qui-quadrado de Wald de 624,1 contra 3349,9, 2960,0, 1518,4 e 1338,4) | Seção 3.1 e Tabela 3 (p. 10) | "Specifically, the Wald χ2 value of the # Emoji Reactions variable is 624.1, while the Wald χ2 values of the # Reviewer Comments, # Commits, # Author Comments, Description Length are 3349.9, 2960.0, 1518.4, and 1338.4, respectively." |
| Estreantes entre os PRs com reação | Dos 36.920 PRs que receberam reação de outra pessoa que não o autor, 3.855 (10,4%) eram de quem nunca tinha enviado um PR ao projeto, e 33.065 (89,6%) de quem já tinha enviado | Tabela 4 (p. 11) | "3,855 (10.4%) 33,065 (89.6%) Total PRs 36,920" |
| Comentários que recebem reação | Entre os comentários que receberam reação, o tipo mais comum, com 25,0%, foi o que o programa classificou como dar informação (compartilhar conhecimento ou avisar de planos e mudanças) | Seção 3.3 (p. 13) | "we observe that the information giving category is the most common intention, 25.0% being identified by the SOTA intention classifier." |
| Avaliação entre os comentários com reação | O segundo tipo mais comum entre os comentários com reação foi a avaliação de algum aspecto, com 19,4% | Seção 3.3 (p. 13) | "The second most frequent intention to receive emoji reactions is aspect evaluation (i.e., comments that express opinions or evaluations on a specific aspect), accounting for 19.4%." |
| Qual emoji | Nos comentários com reação, o polegar para cima apareceu em média em 67,2% deles, nos sete tipos de comentário, e o polegar para baixo em 0,9% | Seção 3.3 e Tabela 5 (p. 14) | "the usage frequency of THUMPS UP on average reaches up to 67.2% across seven intentions, while the usage frequency of THUMPS DOWN on average is only 0.9%." |
| Reação e tom do comentário | Nos comentários com reação, a combinação mais comum foi reação positiva num comentário neutro (52,7%), seguida de reação positiva num comentário positivo (31,1%), com o tom do comentário julgado pela ferramenta automática | Seção 3.4 e Figura 4 (p. 16) | "the major pair-wise is Positive-Neutral (i.e., Positive emoji reaction and Neutral comment), accounting for 52.7%. The second most frequent pair-wise is Positive-Positive, being 31.1%." |
| Reação positiva a comentário negativo | Em 11,6% dos comentários com reação, a reação era positiva e o comentário, negativo segundo a ferramenta automática | Seção 3.4 (p. 16) | "we find that the proportion of Positive-Negative (i.e., Positive emoji reaction and Negative comment) pair-wise is not high as expected, 11.6% being identified," |
| Motivos da divergência | Na amostra de comentários divergentes que a equipe leu à mão, o motivo mais comum foi reconhecer um erro (22%), seguido de reconhecer uma proposta (15%) | Seção 3.4 e Tabela 8 (p. 17) | "We find that Acknowledge a mistake is the most common reason behind sentiment inconsistency, accounting for 22%. The following reason is Acknowledge a proposal, being 15% classified." |
| Erro da ferramenta de sentimento | Em 23% dos comentários divergentes lidos à mão, a ferramenta automática tinha errado o sentimento do comentário | Seção 3.4 (p. 17) | "On the other hand, we observe that the rate of False-Positive is relatively high, accounting for 23%." |

O tempo até fechar vai da abertura ao fechamento do PR, em horas, e conta tanto PRs aceitos quanto recusados. O modelo do tempo usou os 49.460 PRs com reação e o mesmo número de PRs sem reação tirados ao acaso, e explicou cerca de 28% da variação do tempo (R² ajustado de 0,2830). O qui-quadrado de Wald mede o quanto cada fator contribui para o modelo: quanto maior, mais ele explica. A amostra de comentários divergentes lidos à mão teve 100 comentários.

## Limitações

- Mostra associação, não causa. Os autores dizem que não afirmam causa e levantam que PRs com reação podem ser os mais complexos, com mais discussão e mais gente.
- A variável "tem ou não reação" saiu do modelo por andar junto demais com outra variável. A leitura de que PRs com reação demoram mais vem da curva do número de reações, que sobe até três e desce depois.
- Sobre estreantes, os autores concluem que um PR de estreante tem menos chance de receber reação. A conta que fazem é outra: que parte dos PRs com reação veio de estreantes (10,4%). Sem saber que parte de todos os PRs veio de estreantes, o número não diz se eles recebem reação com mais ou menos frequência. O texto também diz que restaram 36.902 PRs, e a Tabela 4 soma 36.920.
- Da mesma forma, os 25,0% de "dar informação" são a parte desse tipo entre os comentários que receberam reação, não a chance de um comentário desse tipo receber reação.
- A intenção dos comentários veio de um programa que acertou 24 de 30 comentários conferidos à mão (80%), e o sentimento, de uma ferramenta que errou em 23 de 100 comentários divergentes lidos à mão.
- O tempo até fechar não separa PRs aceitos de recusados, e o artigo não analisa se o PR foi aceito.
- Os autores mudaram partes do protocolo registrado: a amostra de repositórios, as variáveis do modelo, o cálculo do tempo e os testes das hipóteses.
- O texto lido é o preprint do arXiv; a versão da revista pode ter mudanças.
- É revisão de código entre colegas de projetos de software livre, numa plataforma de trabalho. Não é namoro, nem conversa entre amigos ou casal. O artigo não diz de que países são as pessoas.
