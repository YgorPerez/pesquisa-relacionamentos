---
reference: "Heston M, Birnholtz J. *Worth the wait?: The effect of responsiveness on interpersonal attraction among known acquaintances*. In: Collaboration and Technology (CRIWG 2017), Lecture Notes in Computer Science 10391:164–179, 2017. Texto completo aberto (manuscrito dos autores): https://socialmedia.northwestern.edu/wp-content/uploads/2012/09/worth-wait-effect-6.pdf"
link: https://doi.org/10.1007/978-3-319-63874-4_13
status: verified
verified_on: 2026-11-14
strength: weak
strength_reason: "Um experimento de laboratório com 48 estudantes (24 duplas) de uma universidade, numa conversa de até 8 minutos; a demora veio de uma tarefa extra, e as notas ficaram altas nos dois grupos."
countries: [EUA]
period: "não informado no texto lido"
sample:
  n: 48
  description: "48 estudantes de graduação (24 duplas) de uma universidade do Meio-Oeste dos EUA, de 18 a 26 anos, recrutados em duplas por cartazes no campus, redes sociais e avisos em aula. Cada dupla precisava se conhecer havia pelo menos três meses; 54% eram de duas mulheres, 40% mistas e 6% de dois homens. O artigo trata as duplas como conhecidos e amigos. Não estuda paquera nem namoro."
  representative: false
design: experiment
conflict: "Financiado pela National Science Foundation (IIS–217143). Autores da Northwestern University; o texto não declara conflito de interesse."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 26 }
---

# Heston & Birnholtz (2017): demora para responder e atração social entre conhecidos

## O que mediu

Num laboratório, duplas de conhecidos ficaram em salas separadas e tiveram até 8 minutos para combinar, por chat de texto no computador, os cinco itens mais importantes para sobreviver numa ilha deserta. As duplas foram distribuídas ao acaso em três condições: nenhum dos dois com tarefa extra, só um deles, ou os dois. A tarefa extra era uma série de quebra-cabeças online que valiam pontos e atrasavam as respostas de quem os montava. Antes e depois da conversa, cada pessoa deu notas ao parceiro em três coisas: atração social (sentir amizade e querer passar tempo com a pessoa), atração de tarefa (respeito por ela e confiança na capacidade dela de fazer tarefas) e quanto esperava que ela respondesse logo.

O contexto não é romântico. A atração medida é a de amizade, entre pessoas que já se conheciam.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quantas pessoas | 48 estudantes de graduação, em 24 duplas, de 18 a 26 anos | Seção 3.1, Participants | "Participants included 48 undergraduate students (24 pairs) from a Midwestern U.S. university (age 18-26)." |
| Há quanto tempo a dupla se conhecia | Cada dupla precisava se conhecer havia pelo menos três meses | Seção 3.1, Participants | "Participants were recruited in pairs, and required to have known each other for at least three months." |
| Tempo até responder em cada grupo | Quem tinha os quebra-cabeças para montar levou em média 24,5 segundos para responder ao parceiro, e quem não tinha levou 14,6: uns 10 segundos a mais | Seção 3.5, Analysis | "low-responsive participants took 10 seconds longer to respond than high-responsiveness participants (M = 24.5 seconds, SD = 13.3 seconds vs M = 14.6 seconds, SD = 5.2 seconds)" |
| Atração social pelo parceiro | Quem conversou com um parceiro atrasado pelos quebra-cabeças deu a ele nota de atração social mais baixa (3,95) que quem conversou com um parceiro sem a tarefa extra (4,13). A diferença dificilmente é acaso (p < 0,05) | Seção 4.2, Differences in Attraction | "partner responsiveness condition was found to have a significant effect on social attraction (F(1,43) = 5.18, p < .05), and social attraction was higher for responsive partners (M = 4.13, SE = 0.06) than those with delayed responsiveness (M = 3.95, SE = 0.06)" |
| Altura das notas de atração social | Nos dois grupos de parceiro as notas continuaram altas, perto de 4 | Seção 5.1, Responsiveness and Impressions | "social attraction ratings across all partner conditions were still high, even when they varied: close to 4 on a 5point Likert scale" |
| Atração de tarefa pelo parceiro | A nota de atração de tarefa dada ao parceiro atrasado e ao parceiro sem a tarefa extra não se distinguiu: a diferença pode ser acaso (p = 0,092) | Seção 4.2, Differences in Attraction | "The effect of partner responsiveness was not significant (F(1,43) = 2.97, p = .092)" |
| Expectativa de resposta rápida | Depois da conversa, quem teve um parceiro atrasado pelos quebra-cabeças esperava dele menos atenção e rapidez (3,23) que quem teve um parceiro sem a tarefa extra (3,49) | Seção 4.1, Differences in Expectations | "the average expectations score among those with high-responsive partners (M = 3.49, SE = 0.08) to be higher than those with low-responsive partners (M = 3.23, SE = 0.08)" |
| A situação de quem dá a nota | A nota de atração social dada ao parceiro não mudou de forma clara conforme quem avaliava tinha ou não os quebra-cabeças para montar: a diferença pode ser acaso (p = 0,61) | Seção 4.2, Differences in Attraction | "the effect of an individuals own responsiveness condition (F(1,43) = 0.26, p = .61) and the interaction term (F(1,43) = 0.00, p= .99) were not statistically significant" |
| Mensagens enviadas em cada grupo | Quem tinha os quebra-cabeças mandou em média 17,67 mensagens e quem não tinha mandou 20,92; a diferença pode ser acaso (p = 0,186) | Seção 4.3, Completion Time and Interaction | "the mean number of messages sent by participants in the low-responsive (M=17.67, SD=7.49) and high-responsive (M=20.92, SD=9.12) conditions but found no significant difference (t(46) = 1.34, p = .186)" |
| Como quem esperava tentou chamar a atenção | Nos registros do chat, quem ficou sem resposta perguntou se o parceiro estava disponível ou seguiu a conversa pulando a vez dele | Seção 7, Conclusion | "individuals use different strategies to get attention from an unresponsive partner, including asking questions about their partners availability as well as skipping their partners turn in conversation" |

As três notas vêm de escalas de 5 pontos; nota mais alta quer dizer mais atração ou mais expectativa de resposta rápida. As médias de atração e de expectativa são as do fim da conversa, ajustadas pela nota que a pessoa deu antes dela. "p" é a chance de uma diferença desse tamanho aparecer só por acaso: quanto menor, menos provável que seja acaso. O tempo até responder conta os segundos entre a primeira de uma sequência de mensagens do parceiro e a resposta. No PDF, "5-point" cai numa quebra de linha e o `pdftotext` o devolve como "5point"; o Trecho copia o texto como ele sai.

## Limitações

- O estudo não é sobre paquera nem namoro. As duplas eram de conhecidos e amigos, e o que se mediu foi atração social, a de amizade. Os próprios autores deixam em aberto como o resultado se comporta "across different types of relationships".
- São 48 estudantes de uma universidade americana, em 24 duplas, num único experimento.
- As porcentagens de duplas por gênero (54%, 40% e 6%) não fecham com 24 duplas: 13 duplas dão 54%, mas nenhum número inteiro de duplas dá 40% ou 6%. O texto não explica.
- O estudo não fixou o tempo de resposta. Ele deu a uma parte das pessoas uma tarefa extra que rendia pontos, e a demora foi consequência. Quem tinha a tarefa extra também ganhava menos pontos pela tarefa conjunta (50 contra 150). O parceiro lento era, então, alguém com a atenção dividida e menos incentivo para a conversa, e a nota mais baixa pode vir disso tudo, não só dos segundos a mais.
- Os autores checaram se a tarefa extra mudou o andamento da dupla. O tempo para terminar não diferiu de forma clara entre as condições (F(2, 21) = 3.32, p = .06), nem o número de mensagens.
- A conversa durou até 8 minutos, ao vivo, com prazo e bônus em dinheiro, e cada um precisava da atenção do outro para terminar. Os autores dizem que nesse cenário a pessoa tem uma expectativa própria do contexto. O resultado vale para um chat ao vivo desse tipo; o estudo não testou a demora entre mensagens trocadas ao longo do dia.
- As notas de atração social ficaram altas nos dois grupos (4,13 e 3,95), e o texto não diz se a diferença dura depois da conversa. Os autores pedem estudos mais longos.
- Os participantes usaram computadores de mesa no laboratório, não o celular.
- A leitura foi do manuscrito dos autores, sem a paginação do livro; a versão da editora pode ter diferenças de redação.
