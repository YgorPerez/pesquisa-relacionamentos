---
reference: "Joel S, Eastwick PW, Allison CJ, et al. *Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies*. PNAS 117(32):19061–19071, 2020. A Fonte local é a página do artigo no PMC (sem o apêndice suplementar). Texto completo aberto: https://pmc.ncbi.nlm.nih.gov/articles/PMC7431040/"
link: https://doi.org/10.1073/pnas.1917036117
status: verified
verified_on: 2026-10-21
strength: strong
strength_reason: "43 bases longitudinais diádicas de 29 laboratórios, 11.196 casais, plano de análise pré-registrado para cada base e resultados combinados em meta-análise; mas quase tudo é autorrelato, as bases são todas de países ocidentais e o seguimento médio é de 14 meses."
countries: [EUA, Canadá, Suíça, Nova Zelândia, Holanda, Israel]
period: "não informado no texto lido"
sample:
  n: 11196
  description: "11.196 casais (22.163 participantes na linha de base) de 43 bases longitudinais de 29 laboratórios. As bases acompanharam os casais por quatro ondas em média (de 2 a 11) ao longo de 14 meses em média (de 2 a 48). Mais da metade dos casais (6.298) vem do Supporting Healthy Marriages Project, que sobreamostrou casais de baixa renda."
  representative: false
design: meta-analysis
conflict: "A agregação das bases foi financiada pelo SSHRC do Canadá (Insight Grant 435-2019-0115); cada uma das 43 bases teve financiamento próprio (NSF, NIMH, NICHD, SSHRC, Fetzer Institute, Templeton Foundation, entre outros). Os autores declaram não ter conflito de interesse."
covers:
  genders: [man, woman]
---

# Joel et al. (2020): machine learning em 43 bases de casais

## O que mediu

Quanto da [[satisfação]] e do compromisso com a relação dá para prever a partir de 2.413 medidas da linha de base, quase todas de autorrelato, agrupadas em quatro conjuntos:

1. variáveis da relação relatadas pela própria pessoa ("ator"), como conflito, apreciação e compromisso percebido do parceiro;
2. as mesmas variáveis relatadas pelo parceiro;
3. diferenças individuais do ator (personalidade, humor, apego, idade, renda etc.);
4. diferenças individuais do parceiro.

Em cada base, Random Forests previram a satisfação na linha de base, no fim do seguimento e a mudança entre as duas. Os resultados das 43 bases foram combinados por [[meta-análise]] de efeitos aleatórios. O estudo também contou quantas vezes cada construto entrou como preditor útil entre as bases (a "taxa de sucesso").

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quantos participaram | 11.196 casais, com 22.163 pessoas no começo dos estudos | Introdução, §4 | "with 11,196 couples (baseline n = 22,163 participants)" |
| Satisfação no início: o que cada um diz da relação | O que a própria pessoa disse da relação previu 45% das diferenças de satisfação; o que o parceiro disse, 15% | Resultados, Primary Meta-Analytic Results (Fig. 2) | "Actor-reported relationship variables predicted baseline satisfaction quite powerfully (45%), much more so than partner-reported relationship variables (15%)." |
| Satisfação no início: as características de cada um | As características da própria pessoa previram 19% das diferenças de satisfação; as do parceiro, 5% | Resultados, Primary Meta-Analytic Results (Fig. 2) | "actor-reported individual variables (19%) were approximately four times as powerful as partner-reported individual variables (5%)" |
| Satisfação no início: as características dos dois | Juntas, previram 21%, nada além das da própria pessoa sozinhas | Resultados, Primary Meta-Analytic Results (Fig. 2) | "combining actor and partner individual variables (21%) added no predictive power beyond actor individual variables alone" |
| Satisfação no início: somando tudo | O que os dois disseram da relação previu 46%, e todas as medidas juntas, 44%: nada além do que a própria pessoa disse da relação | Resultados, Primary Meta-Analytic Results (Fig. 2) | "Combining actor- and partner-reported relationship variables (46%), and combining all individual and relationship variables (44%) added no predictive power beyond actor-reported relationship variables alone." |
| Qualidade da relação, no início e no fim dos estudos | As medidas da relação previram até 45% das diferenças no início e até 18% no fim; as características de cada pessoa, 21% e 12% | Resumo, §1 | "relationship-specific variables predicted up to 45% of variance at baseline, and up to 18% of variance at the end of each study. Individual differences also performed well (21% and 12%, respectively)." |
| O que se soma ao que a própria pessoa diz | O que o parceiro diz e as características dos dois acrescentaram só de 0,0% a 1,9% no início e de 0,9% a 3,5% no fim, nas três versões da conta | Resultados, Predictor Restriction Effects (Fig. 4) | "the individual difference and partner-reported variables consistently explain only an additional 0.0 to 1.9% of the variance at baseline and 0.9 to 3.5% of the variance at follow-up" |
| Prever a mudança de satisfação | Nenhuma conta explicou mais de 5% das diferenças na mudança da satisfação com o tempo | Resultados, Primary Meta-Analytic Results, §2 | "No analyses accounted for more than 5% of the variance" |
| Compromisso no lugar da satisfação | Os números saíram em média 3% menores, com o mesmo padrão | Resultados, Primary Meta-Analytic Results (Fig. 3) | "Results for commitment were generally smaller across models (the average estimate was 3% smaller), but the pattern of findings mirrored those of satisfaction" |
| O que mais previu, na relação | O compromisso que a pessoa vê no parceiro, a apreciação, a satisfação sexual, a satisfação que ela vê no parceiro e o conflito | Resumo, §1 | "the top relationship-specific predictors of relationship quality were perceived-partner commitment, appreciation, sexual satisfaction, perceived-partner satisfaction, and conflict" |
| O que mais previu, em cada pessoa | A satisfação com a vida, o afeto negativo, a depressão, o apego evitativo e a ansiedade de apego | Resumo, §1 | "The top individual-difference predictors were life satisfaction, negative affect, depression, attachment avoidance, and attachment anxiety." |
| Amabilidade | Ajudou a prever a qualidade da relação em pelo menos um momento em 54% das medidas testadas (taxa de sucesso) | Tabela 3 | "Agreeableness 20 18 50 60 50 56 54" |
| Conscienciosidade | Ajudou a prever em 43% das medidas testadas (taxa de sucesso) | Tabela 3 | "Conscientiousness 19 17 47 26 53 47 43" |
| Neuroticismo | Ajudou a prever em 41% das medidas testadas (taxa de sucesso) | Tabela 3 | "Neuroticism 20 18 65 40 33 22 41" |
| Extroversão | Ajudou a prever em 28% das medidas testadas (taxa de sucesso) | Tabela 3 | "Extraversion 20 18 40 30 28 11 28" |
| Padrões ideais de parceiro | Ajudaram a prever em 10% das medidas testadas, a menor taxa da tabela (taxa de sucesso) | Tabela 3 | "Ideal standards 39 39 10 3 18 8 10" |
| O que a taxa de sucesso quer dizer | Compara a força de uma medida com a das outras do mesmo tipo; sozinha, não diz quanto ela pesa | Nota da Tabela 2 | "Success rate percentages can be interpreted as the strength of the variable relative to the other variables of this class, but it does not have any independent meaning or effect size." |
| Quase tudo foi a pessoa dando nota | 99,4% das 1.149 medidas da relação eram escalas respondidas pela própria pessoa | Discussão, Limitations and Future Directions, §2 | "of the 1,149 relationship-specific variables tested in this project, 99.4% were explicit self-report rating scales" |
| Casais do Supporting Healthy Marriages Project | 6.298 casais, mais da metade do total, vieram desse programa, que buscou de propósito casais de baixa renda; o padrão foi o mesmo das outras bases | Discussão, Limitations and Future Directions, §1 | "more than half of the couples tested ( n = 6,298) were recruited as part of the Supporting Healthy Marriages Project" |

"Previu 45%" quer dizer que a conta explicou 45% das diferenças entre as pessoas. "Medidas da relação" são coisas como conflito e apreciação; "características" são traços de cada pessoa, como personalidade, humor, apego, idade e renda. "Início" e "fim" são o começo e o fim do acompanhamento de cada estudo.

- Demografia pesou pouco: "Demographic variables, such as sex/gender, race/ethnicity, and education mattered little."
- As interações ator × parceiro, que é onde um "match" entre os dois apareceria, não estão no modelo da Fig. 5 porque, segundo os autores, "are likely quite small".
- Conclusão dos autores: os fatores de risco individuais "may matter little" se a relação tem apreciação, satisfação sexual e pouco conflito.

## Definições

| Verbete | Definição | Onde | Trecho |
|---|---|---|---|
| satisfacao | A medida de satisfação com a relação que cada base de dados trazia, usada como a medida principal da qualidade da relação, isto é, de quão boa ou ruim a pessoa acha a própria relação | Métodos, Measures | "The dependent measure was relationship quality (i.e., a person's subjective perception that their relationship is relatively good vs. bad; a person's evaluation of the relationship), and our primary operationalization of this construct consisted of relationship-satisfaction measures." |

## Limitações

- Quase tudo é autorrelato. A satisfação e as percepções da relação vêm da mesma pessoa e da mesma hora, o que infla as associações do ator (variância de método compartilhada).
- As percepções da relação, como o compromisso percebido do parceiro ou a apreciação, não são características do parceiro que se vejam antes de a relação começar. O estudo mostra o que prevê a qualidade *dentro* de uma relação, não como escolher alguém.
- A taxa de sucesso da Tabela 3 diz quantas vezes um construto entrou no modelo, não o tamanho nem a direção do efeito.
- Prever a mudança ao longo do tempo falhou (até 5%), e o seguimento médio é curto (14 meses).
- Todas as bases são de países ocidentais; os autores pedem testes fora desse contexto.
- A Fonte local é a página do PMC. O apêndice suplementar, onde estão os moderadores e as versões alternativas dos modelos, não foi lido.

## Como usamos

- [Relatório 2026-10-18: características do parceiro](../reports/2026-10-18-caracteristicas-parceiro.md): principal evidência de que os traços do parceiro explicam pouco e a dinâmica da relação explica muito.
