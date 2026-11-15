---
reference: "Warner M, Kitkowska A, Gibbs J, Maestre JF, Blandford A. *Evaluating 'Prefer not to say' Around Sensitive Disclosures*. Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems (CHI '20), ACM, 2020. Versão final dos autores no repositório da UCL: https://discovery.ucl.ac.uk/id/eprint/10089729/11/Warner_CHI2020_Unraveling_CR_Final_revised.pdf"
link: https://doi.org/10.1145/3313831.3376150
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Experimento com sorteio das condições, mas com 183 voluntários pagos da plataforma Prolific, na maioria jovens, brancos e europeus, dando estrelas a perfis fictícios sem foto, uma única vez."
countries: []
period: "2019"
sample:
  n: 183
  description: "183 homens maiores de 18 anos, com interesse em sexo com homens e que já tinham usado um app de sexo e encontros, recrutados e pagos pela plataforma acadêmica Prolific em março de 2019. Dos 235 que responderam, 43 falharam na checagem de atenção, 5 não terminaram e 4 saíram como valores extremos. A maioria era jovem (28,9% com menos de 24 anos, 50,3% de 24 a 34), branca (77,5%) e da Europa (62,3%) ou da América do Norte (30,6%); o texto não nomeia países. A maioria disse ser HIV negativo."
  representative: false
design: experiment
conflict: "Financiado em parte pelo programa Horizon 2020 da União Europeia (ação Marie Skłodowska-Curie, ITN 675730) e pelo Departamento de Ciência da Computação da University College London; o texto não traz declaração de conflito de interesses."
covers:
  genders: [man]
  seeks: [men]
---

# Warner et al. (2020): o status de HIV não informado em perfis de apps de encontro entre homens

## O que mediu

Pelo navegador do celular, homens que fazem sexo com homens deram de 1 a 5 estrelas a perfis fictícios de um app de sexo e encontros, sem foto, respondendo "How interested are you in me?". Os 24 perfis de teste vinham em pares: o mesmo perfil, com outro nome, uma vez com o status de HIV informado (negativo, negativo em PrEP ou positivo indetectável) e outra sem. Cada participante foi sorteado para uma de três telas de perfil sem status: o campo à mostra dizendo que não foi informado ("Visible"), o campo sumido do perfil ("Hidden") ou o campo com "Ask Me", pergunte. Antes, cada um foi sorteado para avaliar 15 perfis em que a maioria informava o status, ou em que a maioria não informava, para testar se o costume do lugar muda a nota.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quantos participaram | 183 homens que fazem sexo com homens | Introdução (p. 1) | "deployed to N = 183 participants" |
| Status de HIV e nota, todas as telas juntas | Somando as três telas, os participantes deram as notas mais baixas aos perfis HIV positivo indetectável; os perfis sem status ficaram acima deles e abaixo dos HIV negativo e dos negativo em PrEP | Seção 5 (p. 7) | "Positive, Undetectable profiles were rated lower than all other profiles. Undisclosed profiles were rated higher than Positive, Undetectable profiles, but lower then both HIV Negative, and HIV Negative, on PrEP profiles." |
| A tela mudou o efeito de não informar | O peso de não informar o status na nota dependeu da tela sorteada (F = 2,841; p = 0,016) | Seção 5.1 (p. 7) | "a significant interaction effect between HIV status disclosure and the interface design conditions, F(4.921, 435.544) = 2.841, p = .016" |
| Campo à mostra como não informado | Com o campo à mostra dizendo que o status não foi informado, os participantes deram ao perfil sem status nota diferente da dos outros três: abaixo dos HIV negativo e dos negativo em PrEP, acima dos positivo indetectável (p < 0,001 em cada comparação) | Seção 5.1 (p. 8) | "In the Visible condition there was a significant difference between means of Undisclosed ratings against Negative (p < .001), Negative, on PrEP (p < .001), and Positive, Undetectable (p < .001) ratings." |
| Tamanho, campo à mostra | Com o campo à mostra, os perfis que diziam HIV negativo tiveram dos participantes, em média, 0,603 estrela a mais que os perfis sem status | Tabela 3, Visible, linha "Neg vs. Undisclosed" (p. 9) | ".603**" |
| Campo sumido do perfil | Com o campo sumido do perfil, não apareceu diferença entre a nota que os participantes deram ao perfil sem status e a dos HIV negativo e negativo em PrEP | Seção 5.1 (p. 8) | "However, unlike in the Visible condition, the means of Undisclosed ratings were not statistically significantly different from the means of Negative and Negative on PrEP (p > .05) when the undisclosed information field was hidden." |
| Tamanho, campo sumido | Com o campo sumido, os perfis que diziam HIV negativo ficaram, em média, 0,174 estrela acima dos perfis sem status, uma distância que pode ser acaso | Tabela 3, Hidden, linha "Neg vs. Undisclosed" (p. 9) | ".174" |
| Sem status contra positivo indetectável, campo sumido | Com o campo sumido, os participantes deram aos perfis sem status, em média, 0,953 estrela a mais que aos perfis que diziam HIV positivo indetectável | Tabela 3, Hidden, linha "Undisclosed vs. Pos, Undetectable" (p. 9) | ".953**" |
| Campo com "Ask Me" | Com o rótulo "Ask Me", os participantes também deram ao perfil sem status nota abaixo dos HIV negativo (p < 0,001) e dos negativo em PrEP (p = 0,022), e acima dos positivo indetectável | Seção 5.1 (p. 8) | "There was a significant difference between means of Undisclosed ratings against Negative (p < .001), Negative, on PrEP (p = .022), and Positive, Undetectable (p < .001) ratings." |
| Tamanho, "Ask Me" | Com o rótulo "Ask Me", os perfis que diziam HIV negativo tiveram dos participantes, em média, 0,402 estrela a mais que os perfis sem status | Tabela 3, Ask Me, linha "Neg vs. Undisclosed" (p. 9) | ".402**" |
| "Ask Me" contra "prefere não dizer" | Entre o rótulo "Ask Me" e o campo à mostra como não informado, não apareceu diferença | Seção 6.5 (p. 10) | "However, in our study no significant difference was found between the Ask Me and Visible design conditions." |
| O costume de informar | Entre quem avaliou antes perfis que na maioria informavam o status e quem avaliou perfis que na maioria não informavam, não apareceu diferença nas notas; entre as três telas, também não apareceu diferença na nota geral (p > 0,05) | Seção 5.2 (p. 8) | "interactions between the social disclosure norm conditions (p > .05). Moreover, the statistical analysis did not identify significant between-subject effects for different design conditions and social disclosure norm conditions (p > .05)." |
| Etnia do perfil sem status | Ao separar os perfis sem status pela etnia escrita neles, os autores relatam nota menor para os de minorias (não brancos), nas três telas; o texto não dá as médias | Seção 5.3 (p. 8) | "profile desirability was found to reduce across all design conditions for profiles reporting a minority ethnicity" |
| Etnia, campo sumido | Mesmo com o campo sumido, os perfis sem status de minorias étnicas tiveram dos participantes nota abaixo dos HIV negativo e dos negativo em PrEP (p < 0,05 nas duas) | Seção 5.3 e Figura 4 (p. 8) | "minority profiles continued to be affected by reduced desirability even when the undisclosed information field was removed from view, with the means of Undisclosed (minority) ratings being significantly different from the means of Negative (p < .05), Negative, on PrEP (p < .05) in the Hidden condition" |

As notas vão de 1 a 5 estrelas. "p" é a chance de uma diferença assim aparecer só por acaso; acima de 0,05, o artigo trata a diferença como não encontrada. F mede se a diferença entre as telas vai além do acaso: quanto maior, mais longe. As comparações da Tabela 3 têm correção de Bonferroni, que exige mais de cada teste porque são muitos.

Os autores leem o resultado como "privacy unraveling": quem não informa o status é tomado por quem esconde algo ruim. Eles mesmos lembram outra leitura, a de que o perfil sem status só dá menos informação, e a descartam em parte porque a perda não apareceu com o campo sumido, que tem a mesma informação (Seção 6.1).

## Limitações

- Perfis fictícios, sem foto, avaliados uma vez numa tarefa online; não há conversa, match nem encontro. Os autores lembram que a foto também deixa adivinhar etnia e idade (Seção 6.3).
- Os participantes não foram perguntados sobre o status que imaginavam; o efeito é medido pelas estrelas.
- Amostra de voluntários pagos de uma plataforma acadêmica, na maioria jovens, brancos e europeus, que os autores chamam de enviesada (Seção 6.7). Poucos viviam com HIV, então o estudo não diz como pessoas com HIV leem um perfil sem status (Seção 6.4).
- O texto dá duas porcentagens de quem se disse HIV negativo: 86,1% na Seção 4.2 e 89,8% na Seção 6.4. A pergunta sobre o status era opcional, o que pode dar denominadores diferentes, mas o texto não diz sobre quantos cada porcentagem é calculada.
- Cada tela teve 61 participantes. Com o campo sumido, o perfil deixava um espaço em branco, que os testes piloto não conseguiram apagar de todo como pista.
- Os participantes foram informados de um estudo sobre a usabilidade de apps de namoro, um engano leve aprovado pelo comitê de ética da UCL.
- Lemos a versão final dos autores no repositório da UCL, não a página da ACM.
