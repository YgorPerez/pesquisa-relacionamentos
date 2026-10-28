---
reference: "Hu JM, Zhu R, Zhang Y. *Does Online Dating Make Relationships More Successful? Replication and Extension of a Previous Study*. Cyberpsychology, Behavior, and Social Networking 27(9):635–640, 2024. A Fonte local é a versão submetida pelos autores (19 pp.), anterior à revisão; a publicada não foi lida."
link: https://doi.org/10.1089/cyber.2024.0136
status: verified
verified_on: 2026-10-28
strength: moderate
strength_reason: "Painel probabilístico do Pew (2.787 pessoas casadas ou namorando, das 4.860 que responderam), mas analisado sem os pesos do Pew, transversal, com o sucesso da relação medido por uma pergunta só e com só 377 casais online; o efeito principal é marginal (p = 0,065)."
countries: [EUA]
period: "16 a 28 de outubro de 2019"
sample:
  n: 2787
  description: "2.787 participantes do American Trends Panel do Pew (onda 56) casados (1.882) ou numa relação de compromisso sem casamento (905) que disseram ter conhecido o par online (377) ou fora da internet (2.410); 52,8% mulheres, 86,5% em casais de sexos diferentes."
  representative: false
design: cross-sectional
conflict: "A versão submetida não traz declaração de financiamento nem de conflitos de interesse; diz que os autores não têm vínculo com o Pew Research Center."
covers:
  genders: [man, woman]
---

# Hu, Zhu & Zhang (2024): conhecer o par online e o sucesso da relação

## O que mediu

Reanálise dos dados públicos do Pew de 2019 sobre namoro online, para repetir o estudo de [Sharabi & Dorrance-Hall (2024)](sharabi-2024-online-dating-effect.md), que achou casamentos online menos satisfeitos. O desfecho é uma pergunta só: "No geral, você diria que as coisas na sua relação estão indo..." (de "muito bem" a "nada bem"). Modelos de regressão compararam quem conheceu o par online com quem o conheceu fora, separando casados de não casados, e testaram se falar da relação nas redes sociais muda a diferença. Os modelos controlaram idade, sexo, escolaridade, renda, etnia, tipo de casal e duração da relação.

## Versão lida

A Fonte local é a versão que os autores submeteram à revista, como diz a primeira página: "This is the submitted version of this paper. An updated version has been published online in Cyberpsychology, Behavior, and Social Networking in July 2024." A versão publicada é fechada e não foi lida. O resumo publicado no PubMed (PMID 39058656) traz o mesmo N (2.787) e as mesmas conclusões, sem outros números. A única diferença de conteúdo é a descrição da amostra: a versão submetida diz "a representative sample of the U.S. population", e a publicada diz "another sample of the U.S. population". Os coeficientes abaixo podem ter mudado na revisão.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Coleta | Pew, de 16 a 28 de outubro de 2019 | p. 5, Procedure | "collected by the Pew Research Center between October 16 and October 28, 2019" |
| Respondentes da onda | 4.860 (81,7% dos panelistas ativos) | p. 5, Procedure | "A total of 4,860 panelists completed the survey (response rate: 81.7% among active panelists)." |
| Amostra analisada | 2.787 pessoas em relação | p. 6, Sample Profile | "The criteria led to a final sample of 2787 participants." |
| Onde se conheceram | 2.410 fora da internet; 377 online | p. 6, Measurement | "0 = Meeting offline [n = 2410], 1 = Meeting in online dating [n = 377]" |
| Tipo de relação | 1.882 casados; 905 não casados | p. 6, Measurement | "0 = In a marital relationship [n = 1882], 1 = In a non-marital relationship [n = 905]" |
| Sucesso da relação, média | 3,50 (DP 0,64) | p. 6–7, Measurement | "higher score indicates higher relationship success (M = 3.50, SD = .64)" |
| Casados: online contra fora | Um pouco menos de sucesso, marginal (b = −0,10; p = 0,065) | p. 8, Results | "though the difference was marginally significant (b = -.10, SE = .05, p = .065" |
| Não casados: online contra fora | Sem diferença (b = 0,04; p = 0,499) | p. 8, Results | "meeting venue was not related to relationship success (b = .04, SE = .05, p = .499" |
| Falar da relação nas redes muda a diferença | Interação significativa (b = 0,24; p = 0,003) | p. 8, Results | "the interaction between meeting venue and relationship talk on social media was significant (b = .24, SE = .08, p = .003" |
| Casados que não falam da relação nas redes | Online com menos sucesso (b = −0,24; p < 0,001) | p. 8, Results | "less relationship success compared to meeting one's partner offline (b = -.24, SE = .07, p < .001" |
| Casados que falam da relação nas redes | Sem diferença (b = 0,00; p = 0,969) | p. 8, Results | "relationship success did not differ by meeting venue (b = .00, SE = .08, p = .969" |
| Não casados que não falam | Sem diferença (b = −0,10; p = 0,164) | p. 8, Results | "the association between meeting venue and relationship success was not significant (b = -.10, SE = .07, p = .164" |
| Não casados que falam | Online com mais sucesso (b = 0,14; p = 0,045) | p. 8, Results | "more relationship success compared to meeting one's partner offline (b = .14, SE = .07, p = .045" |
| Pesos do Pew | Não usados | p. 7, Data Analysis | "We did not use the weights provided by the Pew Research Center" |

"b" é a diferença estimada na escala de 1 a 4 entre quem se conheceu online e quem se conheceu fora, com os controles.

## Limitações

- Transversal, como os autores dizem: não separa efeito do app de quem escolhe usar app, nem conta as relações que já acabaram.
- O sucesso da relação é uma pergunta só, e os autores dizem que não deu para avaliar confiabilidade e validade das medidas. Não mediram estilo de apego, que pode confundir a relação.
- A amostra vem de um painel probabilístico, mas a análise não usou os pesos do Pew (a macro PROCESS não aceita pesos). Por isso a Ficha marca `representative: false`, e a versão publicada deixou de chamar a amostra de representativa.
- Só 377 pessoas se conheceram online. O efeito nos casados, que repetiria Sharabi & Dorrance-Hall, é marginal (p = 0,065), e os modelos explicam 3% a 4% da variação.
- Os graus de liberdade da Tabela 2 (2.649 no modelo 1, 2.018 no modelo 2) indicam que cada modelo usou menos gente que os 2.787; a pergunta sobre redes sociais teve 2.115 respostas. O texto não explica as perdas.
- O intervalo de confiança da interação com as redes ([.0179, .2965]) não bate com b = 0,24 e erro-padrão de 0,08. Pode ser erro da versão submetida.
- O efeito positivo nos não casados que falam da relação nas redes contraria a hipótese dos autores e tem p = 0,045, perto do limite.
