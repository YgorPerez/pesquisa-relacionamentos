---
reference: "Guan Y, He Y, Huang N, Guo X, Chen G. *Mining linguistic styles in bilateral matching: a contrastive learning approach to reciprocal recommendation*. ACM Transactions on Knowledge Discovery from Data 19(6):115, 2025."
link: https://doi.org/10.1145/3736418
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Dado real grande (174.277 usuários de um site de namoro chinês), mas de 16 dias, num artigo de engenharia que mede quanto um modelo de recomendação acerta, não se estilos parecidos aproximam as pessoas: o estilo é uma representação aprendida pelo próprio modelo, treinada para ficar parecida nos pares que se formaram, e nada foi sorteado."
countries: [China]
period: "2019"
license: "CC BY 4.0 (Creative Commons Attribution International 4.0, como diz o artigo)"
sample:
  n: 174277
  description: "174.277 usuários de uma plataforma de namoro líder na China, que cedeu os dados sob acordo de confidencialidade, de 19 de agosto a 3 de setembro de 2019; a maioria universitários, idade média de 22 anos, 60% mulheres. No período houve 2.046.304 cliques em perfis, 457.902 pedidos de contato (cada um com uma mensagem escrita por quem pede) e 114.637 pares formados. Os textos são em chinês."
  representative: false
design: platform
conflict: "Financiado em parte pela National Natural Science Foundation of China. Os dados vieram da plataforma sob acordo de confidencialidade, e partes do modelo foram implantadas no site dela; o artigo não diz que algum autor trabalhe na plataforma e não traz declaração de conflito de interesses."
covers:
  genders: [man, woman]
---

# Guan et al. (2025): o estilo das mensagens num recomendador de pares de um site de namoro chinês

## O que mediu

É um artigo de engenharia, não um estudo sobre o que as pessoas sentem. Num site de namoro chinês, quem quer contato com alguém manda um pedido com uma mensagem, e o outro aceita ou recusa. Os autores montaram um sistema que recomenda pares e testaram se ele acerta mais quando leva em conta o estilo de escrita dessas mensagens de pedido.

O estilo não é medido por uma lista de palavras: uma rede neural aprende uma representação do jeito de escrever de cada usuário a partir dos pedidos que ele mandou, com as palavras de conteúdo (substantivos e adjetivos) apagadas ao acaso, e é treinada para que os textos da mesma pessoa e os de pares que se formaram fiquem parecidos. O sistema junta esse estilo com idade, escolaridade, cidade natal e o tipo de foto do perfil, e estima a chance de um pedir e o outro aceitar. A medida de acerto é se os pares que de fato se formaram aparecem no topo da lista de 10 recomendações (NDCG@10, de 0 a 1). Para saber quanto o estilo pesa, os autores tiram partes do modelo e veem quanto o acerto cai.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Usuários | 174.277 usuários, a maioria universitários, com idade média de 22 anos; 60% mulheres | 3.1 Research Data | "In total, the dataset comprises 174,277 users, the majority of whom are university or college students with an average age of 22 years. Female users account for 60% of the total user base." |
| Período | Os dados vão de 19 de agosto a 3 de setembro de 2019 | 3.1 Research Data | "The dataset spans the period from 19 August 2019, to 3 September 2019." |
| Pedidos aceitos | Houve 2.046.304 cliques em perfis; os usuários mandaram 457.902 pedidos de contato, e 25% foram aceitos | 3.1 Research Data | "Our dataset includes a total of 2,046,304 clicks. Of these, users sent out 457,902 requests, with 25% of the requests being accepted." |
| Tirar o estilo | Tirar do modelo a parte que extrai o estilo de escrita fez o acerto das recomendações cair 29,35% (queda relativa no NDCG@10, não pontos percentuais) | 3.3.2 Ablation Study, Tabela 6 | "removing the entire contrastive component (corresponding to Section 2.2.1) leads to a 29.35% decrease in NDCG@10" |
| Um estilo igual para todos | Manter essa parte, mas tratando todos os usuários como se escrevessem do mesmo jeito, fez o acerto cair 26,49% (queda relativa) | 3.3.2 Ablation Study, Tabela 6 | "if we retain the linguistic style module but assume all users share a common linguistic style (thereby ignoring individual variations), the performance dramatically decreases by 26.49% in NDCG@10" |
| Tirar a foto | Tirar o tipo de foto do perfil fez o acerto cair só 3,86% (queda relativa) | 3.3.2 Ablation Study, Tabela 6 | "when the visual image embedding component is removed, performance drops by only 3.86%" |
| Pedir e aceitar em duas etapas | O que mais pesou no acerto foi tratar o par como duas decisões em sequência (um pede, o outro aceita): trocar isso por uma média simples das duas preferências fez o acerto cair 57,57% (queda relativa) | 3.3.2 Ablation Study, Tabela 6 | "Replacing the two-stage multiplicative preference score with a simple average of the two preference scores (Equation (16)) causes the NDCG@10 to decline by 57.57%." |
| O que o modelo olha | Em duas mensagens sorteadas para ilustrar (na figura de pesos de atenção), o modelo deu mais peso a pontos de exclamação e de interrogação, interjeições, pronomes e advérbios, e a verbos como "gostar" | 3.3.4 Effectiveness of Linguistic Style Extraction, Figura 6 | "Punctuation marks, including exclamation marks and question marks, which signal emotional states and engagement levels, receive high attention weights" |

As quedas são relativas ao acerto do modelo completo, que foi de 0,5152 no NDCG@10 (Tabela 6): cair 29,35% quer dizer chegar a 0,3640, não perder 29,35 pontos. O NDCG@10 vai de 0 a 1 e é maior quando os pares que de fato se formaram aparecem mais no alto da lista de 10 recomendações.

## Limitações

- O artigo mede quanto um recomendador acerta, não se escrever parecido com alguém aumenta a chance de ele aceitar. O estilo é uma representação opaca, aprendida pelo próprio modelo e treinada para ficar parecida justamente nos pares que se formaram; o estudo não diz quais traços de estilo combinam com quais.
- Nada foi sorteado, e o estilo de cada um sai dos pedidos que ele mandou, não de uma conversa entre os dois. A ligação entre estilo e aceitar o pedido pode vir de outras coisas que andam junto com o jeito de escrever.
- O resumo fala em "aumento de 29,35%" no acerto ao incluir o estilo, mas a Tabela 6 dá essa porcentagem como a queda a partir do modelo completo; contado a partir do modelo sem estilo, o aumento seria maior.
- Só 16 dias de dados de um site chinês, com usuários jovens e em maioria universitários. O site não é nomeado.
- Um par conta como formado quando o pedido é aceito; o que acontece depois (conversa, encontro) ficou de fora, como os autores reconhecem.
- Os dados vieram sob acordo de confidencialidade e não são públicos; partes do modelo foram implantadas no site.
- Os exemplos de estilo parecido e diferente (Tabela 7), os casos da Tabela A1 e as duas mensagens da Figura 6 foram escolhidos pelos autores para ilustrar, não medidos.

## Como usamos

O relatório [Espelhar o estilo do outro por texto](../reports/2026-11-15-espelhar-o-estilo-por-texto.md) usa esta Ficha como o único dado lido de site de namoro que liga o estilo das mensagens a aceitar um pedido, e diz que ele não testa o espelhamento.
