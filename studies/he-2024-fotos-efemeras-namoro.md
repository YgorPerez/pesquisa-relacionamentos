---
reference: "He Y, Xu X, Huang N, Hong Y, Liu D. *Enhancing User Privacy Through Ephemeral Sharing Design: Experimental Evidence from Online Dating*. Information Systems Research 36(1):162–183, 2025. A cópia lida é a versão do SSRN (abstract 3740782), marcada como \"Forthcoming at Information Systems Research\", sem os apêndices A a F; fica no repositório privado das Fontes. Versão do SSRN: https://ssrn.com/abstract=3740782"
link: https://doi.org/10.1287/isre.2021.0379
status: verified
verified_on: 2026-11-20
strength: moderate
strength_reason: "Experimento de campo com sorteio, feito com 70.275 usuários de um app de namoro do Leste Asiático em 18 dias de 2020, que mede comportamento real (fotos mandadas, matches, mensagens recebidas); é um app só, num país só, os ganhos em matches (3,3%) e mensagens (4,6%) são pequenos e saem de regressões com variáveis de controle (os autores dizem que comparações simples de médias dão o mesmo resultado, mas não as mostram), e a explicação pela privacidade vem de um experimento online à parte com 105 pessoas."
countries: [China]
period: "28 de fevereiro a 16 de março de 2020 (experimento de campo)"
sample:
  n: 70275
  description: "70.275 usuários do Summer, nome que o artigo dá a um app de namoro grande que atende sobretudo o Leste Asiático, sorteados entre os dois grupos ao atualizar o app para a versão 3.8.2 (62,3% homens, idade média de 24,2 anos, de 19 a 32). O artigo não diz o país do app; o experimento online foi feito na China 'para ser coerente com o cenário do experimento de campo'. O experimento online teve 105 pessoas na Sojump, estudantes de formação parecida com a dos usuários do app ou profissionais de design de produto, pagas com 1 a 2 dólares."
  representative: false
design: experiment
conflict: "A versão lida não traz declaração de financiamento nem de conflito de interesses. Os autores são de Tulane, University of Washington, University of Miami e University of Minnesota; o experimento foi feito em parceria com a plataforma, que depois liberou o recurso para todos os usuários."
covers:
  genders: [man, woman]
  ages: { min: 19, max: 32 }
---

# He et al. (2025): foto que some depois de vista, no pedido de match

## O que mediu

No app estudado, quem quer um match manda um pedido com as respostas às perguntas que o outro deixou no perfil. Durante o experimento, o app passou a deixar anexar uma foto pessoal ao pedido. O sorteio dividiu os usuários em dois grupos: num, a foto anexada era efêmera, sumia pouco depois de vista e não podia ser baixada nem capturada na tela; no outro, era uma foto comum, que ficava. Os autores contaram, em 18 dias, quantos pedidos cada usuário mandou com foto, quantos com um rosto na foto (detectado por um programa da Baidu), quantos matches teve e quantas mensagens recebeu de quem aceitou.

Para explicar o resultado, fizeram depois um experimento online com 105 pessoas na China, que viram um vídeo do recurso com foto efêmera ou comum e responderam a escalas de preocupação com privacidade e de vontade de mandar a foto.

A foto do experimento não é a foto do perfil. Os usuários podiam pôr fotos no perfil e no mural como sempre; o teste é sobre a foto extra mandada junto com o pedido.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quantos usuários | Mais de 70 mil usuários entraram no experimento de campo | Resumo | "we report a large-scale randomized field experiment with over 70,000 users" | |
| Quando | De 28 de fevereiro a 16 de março de 2020, 18 dias, sem outro experimento rodando no app | 3.2 (p. 13) | "The experiment was implemented by the platform between February 28, 2020, and March 16, 2020, lasting 18 days, and no other experiments were running on the platform during this period" | |
| Rosto no perfil | Cerca de 30% dos usuários tinham foto de perfil com rosto, e 25% dos murais de fotos tinham pelo menos uma com rosto | 3.2 (p. 14) | "Approximately 30% of the users have a profile picture with a human face, and 25% of photo walls have at least one picture with a human face" | |
| Pedidos com foto | Nos dois grupos juntos, só cerca de 4,6% dos pedidos de match levaram foto: 0,271 pedido com foto por usuário, para 5,877 pedidos | Tabela 3 (p. 16), médias de NumPhoto e NumRequest | "NumRequest 70,275 5.877 12.225 0 NumPhoto 70,275 0.271" | `scripts/calculations/he-2024-fotos-efemeras-namoro.ts share` |
| Fotos mandadas | Quem tinha a foto efêmera mandou mais pedidos com foto: 0,111 a mais por usuário, sobre 0,215 no grupo da foto comum, um aumento de 52,1% segundo os autores | 5.1.1 (p. 18) | "Note that the average number of photos shared in the control group is 0.215 and the effect size of 0.111 corresponds to a relative increase of 52.1%" | |
| Fotos mandadas, refeito | Dividindo 0,111 por 0,215, o aumento dá 51,6%, não os 52,1% do texto | 5.1.1 (p. 18) | "the average number of photos shared in the control group is 0.215 and the effect size of 0.111" | `scripts/calculations/he-2024-fotos-efemeras-namoro.ts photos` |
| Fotos com rosto | Os pedidos com uma foto de rosto subiram 61,6% no grupo da foto efêmera | 5.1.1 (p. 18) | "This is a relative increase of 61.6% in the number of photos with human faces" | |
| Matches | O grupo da foto efêmera teve 3,3% mais matches que o da foto comum, levando em conta sexo, idade, estudo, popularidade, tempo de app e se o mural tinha foto com rosto (b = 0,086 e 0,079 nos dois modelos, p < 0,05) | 5.1.2 (p. 19) | "(βEphemeral = 0.086 and 0.079, respectively, both p < 0.05). This translates into an increase of 3.3% in the number of matches" | |
| Mensagens recebidas | Quem tinha a foto efêmera recebeu 4,6% mais mensagens de quem aceitou o pedido | 5.1.3 (p. 19) | "the matches in the treatment group produced 4.6% more messages from the receivers of match requests" | |
| Quantos pedidos | O número de perfis abertos e de pedidos mandados não mudou entre os grupos (p > 0,1 nos dois) | 5.2.2.1 (p. 22) | "there are no significant differences in NumRequestPageView (p > 0.1) or NumRequest (p > 0.1)" | |
| Pelo caminho da foto | A análise de mediação diz que o ganho em matches e mensagens passou pelo aumento de pedidos com foto (intervalo de 0,011 a 0,021 no caminho foto, match, mensagem); o caminho direto, sem a foto, pode ser acaso | 5.2.1 (p. 21) | "has a 95% confidence interval (CI) of [0.011, 0.021] that does not include zero" | |
| Fotos ousadas | A parte de fotos classificadas como explícitas (pornografia, hentai ou "sexy") foi quase igual nos dois grupos: 0,037 com a foto efêmera e 0,038 com a comum (p = 0,731) | Tabela 15 (p. 26) | "Explicit% 0.037 0.157 0.038 0.163 -0.344 0.731" | |
| Beleza do rosto | A beleza do rosto nas fotos mandadas, dada por um programa treinado com notas de pessoas, ficou igual: 5,823 com a foto efêmera e 5,818 com a comum (p = 0,750) | 5.2.2.6 (p. 27) | "(Facial Attractiveness Ephemeral = 5.823, Facial Attractiveness Persistent = 5.818, p = 0.750)" | |
| Quem não mostra o rosto no mural | O ganho com a foto efêmera foi maior entre quem não tinha nenhuma foto com rosto no mural: o efeito nas fotos mandadas foi 0,093 menor e nas fotos com rosto, 0,078 menor entre quem tinha (p < 0,05) | 5.4 (p. 30) | "β = -0.093, p < 0.05; β = -0.078, p < 0.05" | |
| Experimento online | Com 105 pessoas, a foto efêmera baixou a preocupação com a coleta dos dados, com o repasse da foto a terceiros e com o mau uso da identidade, mas não a preocupação de ser reconhecido | 5.3 (p. 28–29) | "A group of 105 individuals participated in the experiment at Sojump" | |

O b é o quanto o grupo da foto efêmera ficou acima do da foto comum, na unidade da medida (pedidos com foto, matches), levando em conta as outras características da tabela. O p é a probabilidade de uma diferença desse tamanho aparecer por acaso; abaixo de 0,05 costuma-se tratar como improvável. O intervalo de 95% é a faixa em que o valor provavelmente está; se não inclui o zero, o caminho dificilmente é acaso.

## Limitações

- Um app, de um país do Leste Asiático, com usuários de 19 a 32 anos, em 18 dias. A foto testada é a anexada ao pedido de match, não a do perfil, e poucos a usaram: cerca de 4,6% dos pedidos levaram foto (linha "Pedidos com foto").
- O ganho em matches (3,3%) e em mensagens (4,6%) é pequeno, e o artigo dá os resultados por usuário, somando todos os pedidos. A mediação mostra que os números andam juntos, mas quem mandou foto não foi sorteado: o sorteio foi do tipo de foto.
- As contas de 52,1% e 61,6% usam uma média do grupo de controle que só aparece para as fotos (0,215), e 0,111 sobre 0,215 dá 51,6% (linha "Fotos mandadas, refeito"). A média do grupo de controle para fotos com rosto, matches e mensagens não está no texto.
- As mensagens contam quantidade, não conteúdo nem encontro, como os autores dizem.
- A explicação pela privacidade vem de um experimento à parte com 105 pessoas, pagas com 1 a 2 dólares, que imaginaram mandar a foto depois de ver um vídeo; os detalhes estão em apêndices que a cópia lida não tem.
- O rosto na foto foi detectado por programa (acertou 395 de 400 fotos conferidas à mão), e o artigo supõe que o rosto é de quem mandou.
- A versão lida é a do SSRN; a versão publicada na Information Systems Research pode ter mudanças. Ela não traz declaração de financiamento nem de conflitos.

## Como usamos

O Relatório [Que fotos de perfil andam junto com mais curtidas, matches e mensagens?](../reports/2026-11-15-fotos-do-perfil.md) usa esta Ficha entre os experimentos de campo: deixar a foto do pedido sumir depois de vista fez mais gente mandar foto, e quem tinha esse recurso teve um pouco mais de matches e mensagens.
