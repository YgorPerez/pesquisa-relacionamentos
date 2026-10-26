---
reference: "Copen CE, Daniels K, Vespa J, Mosher WD. *First Marriages in the United States: Data From the 2006–2010 National Survey of Family Growth*. National Health Statistics Reports, nº 49. Hyattsville, MD: National Center for Health Statistics, 2012."
link: https://www.cdc.gov/nchs/data/nhsr/nhsr049.pdf
license: "Domínio público; o relatório declara: All material appearing in this report is in the public domain and may be reproduced or copied without permission."
status: verified
verified_on: 2026-10-26
strength: strong
strength_reason: "Amostra nacional probabilística dos EUA, com 22.682 entrevistas, resposta de 77% e análise de sobrevivência que considera o desenho amostral; as estimativas de longa duração favorecem quem casou jovem, pois ninguém tinha mais de 44 anos na entrevista."
countries: [EUA]
period: "2006–2010 (entrevistas; históricos de casamento anteriores à entrevista)"
sample:
  n: 22682
  description: "12.279 mulheres e 10.403 homens de 15 a 44 anos da população em domicílios dos EUA, em amostras independentes, não de casais. A análise de duração do primeiro casamento usa 5.534 mulheres e 3.734 homens que já haviam se casado. Exclui residentes de instituições e bases militares."
  representative: true
design: cross-sectional
conflict: "Autores da Division of Vital Statistics do NCHS/CDC. A NSFG foi planejada e financiada por programas do Departamento de Saúde dos EUA: NICHD, Office of Population Affairs, NCHS, divisões do CDC de HIV/AIDS, IST e saúde reprodutiva, Children's Bureau e Office of the Assistant Secretary for Planning and Evaluation. O Survey Research Center da Universidade de Michigan realizou as entrevistas sob contrato com o NCHS."
covers:
  genders: [man, woman]
  ages: { min: 15, max: 44 }
  couple: different-sex
---

# Copen et al. (2012): duração dos primeiros casamentos nos EUA

## O que mediu

O relatório do CDC/NCHS descreve a formação e a duração dos primeiros casamentos com os históricos retrospectivos da NSFG 2006–2010. Usa Kaplan–Meier, com o desenho amostral e a censura, para estimar a probabilidade de o primeiro casamento permanecer sem separação ou divórcio até determinada duração. As pessoas foram entrevistadas uma vez; não é um acompanhamento de recém-casados por duas décadas.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Amostra total da NSFG | 12.279 mulheres e 10.403 homens | Resumo, Methods, p. 1 | "a nationally representative sample of 12,279 women and 10,403 men aged 15–44 years in the household population of the United States" |
| Amostra da análise de duração do primeiro casamento | 5.534 mulheres e 3.734 homens que já haviam se casado | Statistical analysis, p. 4 | "The probability that a first marriage would remain intact was based on a sample of N=5,534 women and N=3,734 men who had ever been married." |
| Taxa de resposta da NSFG | 77% no total; 78% entre mulheres e 75% entre homens | Resumo, Methods, p. 1 | "The overall response rate for the 2006–2010 NSFG was 77%—78% for women and 75% for men." |
| Probabilidade estimada de o primeiro casamento durar pelo menos dez anos | 68% para mulheres; 70% para homens | Duration of first marriage, p. 7; Tabelas 5 e 6, pp. 16–17 | "In 2006–2010, the probability of a first marriage lasting at least 10 years was 68% for women and 70% for men." |
| Probabilidade estimada de o primeiro casamento durar vinte anos | 52% para mulheres; 56% para homens | Duration of first marriage, p. 7; Tabelas 5 e 6, pp. 16–17 | "Looking at 20 years, the probability that the first marriages of women and men will survive was 52% for women and 56% for men in 2006–2010." |
| Mudança na probabilidade estimada de o primeiro casamento das mulheres durar vinte anos | 50% na NSFG de 1995 e 52% na de 2006–2010; diferença não significativa | Duration of first marriage, p. 7; Tabela 5, p. 16 | "For women, there was no significant change in the probability of a first marriage lasting 20 years between the 1995 NSFG (50%) and the 2006– 2010 NSFG (52%) (Table 5)." |
| Definição do desfecho nas notas técnicas | Separação ou divórcio; viuvez não conta como ruptura | Technical Notes, Marital disruption or dissolution, p. 20 | "Disruption and dissolution are used interchangeably and are defined in this report as either separation or divorce. Widowhood is very rare in the age range for the sample and is not defined as disruption." |

Os percentuais são estimativas de sobrevivência, não a fração bruta de entrevistados ainda casados. Mulheres e homens vêm de amostras independentes e podem ter cônjuges fora da faixa etária da pesquisa; os dois resultados não descrevem os mesmos casais. As Tabelas 5 e 6 apresentam as probabilidades como proporções e informam seus erros-padrão; a prosa acima conserva os percentuais usados pelos autores.

Fonte local: [relatório completo do CDC/NCHS](../sources/copen-2012-primeiros-casamentos.pdf), baixado da URL principal. A declaração de domínio público está na última página, em Copyright information.

## Limitações

- A entrevista só cobre pessoas de 15 a 44 anos. Quem contribui com vinte anos completos de casamento necessariamente casou até os 24. Os autores avisam que as estimativas mais longas favorecem as experiências de quem casou jovem; elas não estimam a duração de toda a vida nem o futuro de todos os casamentos atuais.
- Históricos retrospectivos autorrelatados podem ter erros de memória. Pessoas em instituições ou bases militares ficaram fora, e a não resposta pode introduzir viés.
- A análise considera casamentos com cônjuge do sexo oposto e primeiros casamentos do entrevistado. Não cobre uniões sem casamento nem estima o risco de todos os recasamentos.
- O relatório descreve diferenças entre grupos sem modelos multivariados para separar fatores como coabitação, idade e escolaridade. Essas comparações não mostram causa.
- Há uma inconsistência interna sobre morte do cônjuge: a prosa da p. 7 inclui mortes raras entre os términos, mas as definições da p. 20 excluem viuvez do desfecho e dizem que esses casos são censurados. Seguimos a definição técnica. O complemento da sobrevivência não deve ser chamado de taxa de divórcio, pois o desfecho também inclui separação.
- Não houve ajuste para comparações múltiplas. Dados dos EUA coletados em 2006–2010 não dão uma taxa atual ou brasileira.

## Como usamos

- [Relatório 2026-10-26: leituras conferidas](../reports/2026-10-26-leituras-conferidas.md), Leitura 9: sustenta a referência de duração dos primeiros casamentos nos EUA usada ao conferir a afirmação de que o rompimento seria inevitável. O resultado mede permanência do casamento, sem avaliar sua satisfação.
