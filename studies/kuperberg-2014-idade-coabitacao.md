---
reference: "Kuperberg A. *Age at Coresidence, Premarital Cohabitation, and Marriage Dissolution: 1985–2009*. Journal of Marriage and Family 76(2):352–369, 2014. Versão aceita: https://libres.uncg.edu/ir/uncg/f/A_Kuperberg_Age_2014.pdf"
link: https://doi.org/10.1111/jomf.12092
status: verified
verified_on: 2026-10-26
strength: moderate
strength_reason: "Amostra nacional ponderada e comparação de especificações com testes de sensibilidade, mas históricos retrospectivos de uma única pesquisa não separam seleção de efeito causal da coabitação."
countries: [EUA]
period: "Primeiros casamentos iniciados em 1985–2009; entrevistas do NSFG em 1995, 2002 e 2006–2010"
sample:
  n: 7037
  description: "Mulheres de 15 a 44 anos entrevistadas pelo National Survey of Family Growth, com primeiro casamento antes dos 35 anos e nos dez anos anteriores à entrevista. Amostra analítica de 3.957 mulheres que moraram com o futuro marido antes de casar e 3.080 que casaram sem coabitação prévia com ele; resultados ponderados pelo desenho amostral."
  representative: true
design: cross-sectional
conflict: "Trabalho apoiado por uma National Science Foundation Graduate Research Fellowship. O manuscrito não traz declaração de conflitos de interesse."
covers:
  genders: [woman]
  seeks: [men]
  ages: { min: 15, max: 44 }
  couple: different-sex
---

# Kuperberg (2014): idade ao morar junto e dissolução

## O que mediu

Se a idade ao começar a morar com o futuro marido explica parte da associação entre coabitação pré-marital e dissolução do primeiro casamento. A autora reconstruiu históricos conjugais de entrevistas transversais e comparou modelos de sobrevivência de Cox ajustados pela idade ao casar ou pela idade ao iniciar a convivência, incluindo o termo quadrático de cada idade.

O desfecho reúne separação e divórcio; viuvez encerra a observação sem contar como dissolução. O tempo sob risco começa no casamento, mesmo para quem já morava junto. Os modelos completos controlam coorte, onda da pesquisa, coabitação anterior com outro parceiro, raça, escolaridade, família de origem, religião na infância, filhos e gravidez antes da convivência e diferenças de idade e raça entre os cônjuges.

## Achados

HR é a razão entre taxas instantâneas de dissolução ao longo do casamento, comparando quem coabitou antes com quem casou diretamente. Não é a probabilidade de divórcio ao longo da vida. Os dois resultados ajustados abaixo usam os mesmos controles demográficos; muda a idade usada no ajuste.

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Idade média ao começar a morar junto: quem morou junto antes de casar e quem casou direto, nessa ordem | 22,4 e 23,1 anos | Resultados, comentário da Tabela 1 | "22.4 and 23.1" |
| Risco de separação de quem morou junto antes de casar, comparado a quem casou direto, levando em conta dados demográficos e a idade ao casar | HR = 1,37; p < 0,001 | Resultados após a Tabela 3, modelo com idade ao casar | "1.37, significant at the p < .001 level." |
| Risco de separação de quem morou junto antes de casar, comparado a quem casou direto, levando em conta dados demográficos e a idade ao começar a morar junto | HR = 1,09; associação não significativa | Resultados após a Tabela 3, modelo com idade ao iniciar a convivência | "hazard ratio of 1.09, which was not statistically significant." |

## Limitações

- Os históricos foram recolhidos retrospectivamente. Há datas imputadas e exclusão de casos sem informações necessárias; recordação e seleção podem afetar os resultados.
- A representatividade se restringe às mulheres e aos primeiros casamentos que satisfazem os recortes da análise. Não cobre casamentos iniciados mais tarde, relações entre pessoas do mesmo sexo nem coabitações que terminaram antes de virar casamento. Os dados são dos EUA e não estimam o risco no Brasil.
- A observação do casamento vai até a entrevista, com duração máxima de dez anos na análise principal. A convivência anterior ao casamento fica fora desse relógio; o estudo não compara a estabilidade de todas as uniões desde que começaram a morar juntas.
- A associação diminui ao trocar a medida de idade, mas isso não identifica um efeito causal. Ausência de [[significância]] não demonstra equivalência entre os grupos nem prova que morar junto seja inofensivo em qualquer contexto.
- Os testes de sensibilidade preservaram a direção da mudança entre especificações. Porém, no teste que ampliou a janela de casamentos e restringiu a idade ao casar, a associação ajustada pela idade ao iniciar a convivência continuou estatisticamente significativa. A conclusão de ausência de associação depende do recorte e dos controles.
- A sugestão da autora de adiar a convivência até uma idade maior não foi testada como intervenção. A análise não estabelece uma idade ideal universal para morar junto ou casar.

## Como usamos

[Relatório 2026-10-26: leituras conferidas](../reports/2026-10-26-leituras-conferidas.md), leitura sobre inércia da coabitação: a idade ao começar a morar junto explica parte da associação observada com dissolução e limita uma interpretação causal simples.
