---
reference: "Smith J, Wolfinger NH. *Re-Examining the Link Between Premarital Sex and Divorce*. Journal of Family Issues 45(3):674–696, 2024. Texto lido: o manuscrito aceito dos autores no PubMed Central (NIHMS1910902), https://pmc.ncbi.nlm.nih.gov/articles/PMC10989935/, conferido em 2026-10-25 contra o PDF da revista arquivado no Internet Archive, https://web.archive.org/web/20250221104139/https://journals.sagepub.com/doi/pdf/10.1177/0192513X231155673"
link: https://doi.org/10.1177/0192513X231155673
status: verified
verified_on: 2026-10-24
strength: moderate
strength_reason: "Painel nacional longitudinal (Add Health), com homens e mulheres e controles medidos na adolescência, antes do casamento, mas observacional; a contagem de parceiros só existe para a subamostra que casou depois da onda III, e as uniões observadas vão só até os 32 anos."
countries: [EUA]
period: "1994–2009 (ondas I, III e IV do Add Health)"
sample:
  n: 7030
  description: "7.030 pessoas que já tinham casado até a onda IV (2008–2009, idades de 24 a 32 anos) do Add Health, estudo nacional que sorteou alunos do 7º ao 12º ano em 1994–1995; 6.989 em casamentos de sexo diferente e 41 do mesmo sexo. A contagem de parceiros usa a subamostra de 3.506 que casaram depois da onda III (2001–2002). Análises ponderadas pelo desenho amostral."
  representative: true
design: longitudinal
conflict: "Financiado pelo NICHD (Eunice Kennedy Shriver National Institute of Child Health and Human Development), por meio do Population Research Institute da Pennsylvania State University (P2C HD041025 e T-32HD007514). Os autores declaram não ter conflito de interesse."
covers:
  genders: [man, woman]
  ages: { min: 24, max: 32 }
---

# Smith & Wolfinger (2024): sexo antes do casamento e divórcio, de novo

## O que mediu

Os autores acompanharam, com modelos de história de eventos em tempo discreto (log-log complementar, mês a mês de casamento), quanto tempo durou o primeiro casamento de quem já tinha casado até a onda IV do Add Health. A variável principal é ter tido parceiros sexuais antes do casamento além do futuro cônjuge; na subamostra que casou depois da onda III, eles contam esses parceiros (o maior número informado até a onda III, menos um, que pode ser o cônjuge) e os dividem em 0, de 1 a 8 e 9 ou mais. Os modelos acrescentam primeiro controles sociodemográficos e de história do relacionamento (idade ao casar, filho e coabitação antes do casamento, idade da primeira relação, sexo forçado na infância) e depois o que foi medido na adolescência: religião e frequência religiosa, voto de virgindade, valores sobre sexo e casamento, sintomas depressivos, delinquência, estilo de decisão e relação com os pais. Por fim, testam se o efeito difere entre homens e mulheres.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Pessoas na análise | 7.030 pessoas já casadas (6.989 em casamento de sexo diferente, 41 do mesmo sexo) | Data and Methods | "This leaves an analytic sample of 7030 respondents who had been in either opposite-sex ( N = 6989) or same-sex ( N = 41) marriages." |
| Entrevistados na quarta rodada da pesquisa (onda IV) | 15.701 pessoas de 24 a 32 anos, taxa de resposta de 80,3% | Data and Methods | "Wave IV took place in 2008–2009 and consisted of 15,701 respondents ages 24–32, with a response rate of 80.3%." |
| Tiveram parceiros antes do casamento além do cônjuge | Oitenta e quatro por cento | Results | "Eighty-four percent of respondents reported having premarital, nonspousal sexual partners." |
| Casamentos desfeitos até a onda IV | Cerca de 21% | Results | "approximately 21% had a marriage which ended in divorce" |
| Algum parceiro antes do casamento além do cônjuge, sem controles | Chance de divórcio 2,61 vezes a de quem não teve | Tabela 3, Modelo 1 | "2.61 (0.12) ***" |
| O mesmo, com todos os controles, inclusive os da adolescência | 2,52 vezes | Tabela 3, Modelo 3 | "2.52 (0.13) ***" |
| Religião, valores e crenças na adolescência | Não explicam a associação | Results | "We thus find no evidence that the link between premarital sex and divorce is due to selectivity based on early-life religiosity or beliefs and values." |
| Distribuição dos parceiros até a onda III (subamostra que casou mais tarde) | Cerca de um quarto sem parceiros, 57% de um a oito, 19% com nove ou mais | Results | "about a quarter reported one or zero sexual partners as of Wave III, over half (57%) reported between one and eight partners, and 19% reported 9 or more" |
| De 1 a 8 parceiros, sem controles | Chance de divórcio 1,50 vez a do grupo sem parceiros | Tabela 4, Modelo 1 | "1.50 (0.20) *" |
| De 1 a 8 parceiros, com todos os controles | 1,64 vez (64% maior) | Results | "in the full model the odds of divorce for those with one to eight partners are 64% higher than those with no premarital partners (ORs = 1.50—1.64)" |
| 9 ou mais parceiros, sem controles | 2,65 vezes | Tabela 4, Modelo 1 | "2.65 (0.20) ***" |
| 9 ou mais parceiros, com todos os controles | 3,20 vezes | Tabela 4, Modelo 3 | "3.20 (0.24) ***" |
| O que acontece com a associação de 9 ou mais parceiros ao incluir os controles | A associação fica mais forte, não mais fraca | Results | "Notably, this effect becomes stronger as controls are added to the model" |
| Homens e mulheres | Sem diferença em nenhum modelo | Results | "we do not any evidence of sex differences in the link between premarital sex and divorce risk in any model for either sample" |
| Outras características que o estudo não mediu podem explicar a associação? | Não dá para descartar | Discussion | "our analysis does not rule out the possibility that unmeasured variables might be driving selection" |

As razões de chance vêm dos modelos de tempo discreto e se leem como razão de risco mensal de terminar o primeiro casamento. "0 parceiros" na subamostra quer dizer até um parceiro até a onda III (18 a 26 anos), já que os autores descontam um, que pode ser o futuro cônjuge. Os autores escolheram os cortes 1–8 e 9+ porque o risco sobe com um parceiro, fica estável até oito e sobe de novo com nove (Tabela A2).

## Limitações

- Observacional. Os controles da adolescência não mudam o resultado, mas os autores dizem que variáveis não medidas podem explicar a associação e que os dados não permitem testar mecanismos causais.
- Todos tinham no máximo 32 anos na onda IV: os casamentos são precoces e o tempo para observar divórcio é curto. Os resultados valem sobretudo para casamentos e divórcios de gente jovem.
- A contagem de parceiros vale só para a subamostra que casou depois da onda III e não pega os parceiros entre a onda III e o casamento; os autores dizem que isso tende a subestimar o efeito.
- O dado de separação e divórcio não é distinguido: conta o fim do casamento como o respondente o relata.
- Para 6% da amostra completa não dava para saber se houve parceiro antes do casamento, e o valor foi imputado.
- O texto diz que as razões de chance da Tabela 3 vão de 2,50 a 2,52, mas a própria tabela traz 2,61, 2,54 e 2,52; a Ficha usa a tabela.
- Os autores medem divórcio, não contentamento nem qualidade do casamento.
- A Ficha usa o manuscrito aceito no PubMed Central. Na versão da revista (Journal of Family Issues 45(3):674–696), conferida em 25/10/2026, os cortes (0, 1 a 8 e 9 ou mais), as razões de chance das Tabelas 3 e 4 e as porcentagens são os mesmos; o resumo da revista e o do PubMed falam em "nine or more" e "one to eight". O resumo com "six or more" e "one to two", que aparece no OpenAlex, é o da versão submetida ao SocArXiv em novembro de 2021 (https://osf.io/ke5fj), que dividia os parceiros em 0, 1–2, 3–5 e 6 ou mais e tinha outras razões de chance (2,29 a 2,43 para 6 ou mais). Os autores mudaram os cortes depois da submissão; a Ficha e o Guia usam os números publicados.
