---
reference: "Leone T, Hinde A. *Fertility and union dissolution in Brazil: An example of multi-process modelling using the Demographic and Health Survey calendar data*. Demographic Research 17(7):157–180, 2007. Texto completo aberto: https://www.demographic-research.org/volumes/vol17/7/17-7.pdf"
link: https://doi.org/10.4054/DemRes.2007.17.7
status: verified
verified_on: 2026-10-24
strength: moderate
strength_reason: "Sai de uma pesquisa nacional representativa de mulheres brasileiras (DHS 1996), com modelo de risco que controla a heterogeneidade não observada; mas a amostra analisada deixa de ser representativa porque a reconstrução das uniões exclui quase metade das mulheres com mais de uma união, e só há mulheres e dados de 1991 a 1996, numa entrevista só com calendário retrospectivo."
countries: [Brasil]
period: "1991–1996 (calendário de cinco anos antes da entrevista da DHS de 1996)"
sample:
  n: 7517
  description: "7.517 mulheres de 15 a 49 anos da Pesquisa Nacional sobre Demografia e Saúde (DHS) de 1996, que entrevistou uma amostra representativa de mais de 12.000 mulheres. Entram as que já tinham feito sexo e não estavam esterilizadas, de 8.663 elegíveis; as demais saíram porque a duração da união não podia ser reconstruída. União inclui casamento e união consensual."
  representative: false
design: cross-sectional
conflict: "Bolsa do Economic and Social Research Council do Reino Unido (R00429834523) à primeira autora. O artigo não declara outros vínculos."
covers:
  genders: [woman]
  seeks: [men]
  ages: { min: 15, max: 49 }
---

# Leone & Hinde (2007): o que se associa ao fim das uniões no Brasil

## O que mediu

Com o calendário mês a mês da DHS brasileira de 1996, que registra uniões, gestações e nascimentos nos cinco anos antes da entrevista, as autoras estimaram o risco de uma união terminar. "União" é casamento ou união consensual. O modelo é de risco em tempo contínuo, com o logaritmo do risco como desfecho, e tem três versões: só efeitos fixos, com um termo para a propensão não observada de cada mulher e um modelo conjunto com o risco de engravidar. O foco do artigo é a relação entre instabilidade das uniões e fecundidade; o modelo de dissolução traz os fatores associados ao fim da união.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Amostra da DHS de 1996 | mais de 12.000 mulheres de 15 a 49 anos | Seção 3.1 | "The 1996 BDHS interviewed a representative sample of more than 12,000 eligible women aged between 15 and 49 years." |
| Mulheres na análise | 7.517 de 8.663 elegíveis | Seção 3.1 | "Out of 8,663 eligible women of the initial sample (that were not sterilised and that had experienced sex), 7,517 women were selected" |
| Mulheres com mais de uma união excluídas por falta de datas | 46% (557) só no grupo que começou a última união antes do calendário | Seção 3.2 | "(557 women, 46 per cent of the women that experience more than one union)" |
| Segunda união ou mais: coeficiente (log do risco) nos três modelos | 2,077; 2,607; 2,712 | Tabela 3 | "Two or more unions 2.077 (0.111) 2.607 (0.157) 2.712" |
| Leitura das autoras sobre a segunda união | risco maior de separar | Seção 5 | "women who are in their second or higher order union have a higher probability of splitting up with their partners" |
| Escolaridade, por ano completo (log do risco) | 0,068; 0,093; 0,102 | Tabela 3 | "Education 0.068 (0.011) 0.093 (0.014) 0.102" |
| Residência urbana (log do risco) | 0,718; 0,844; 0,844 | Tabela 3 | "Urban 0.718 (0.126) 0.844 (0.149) 0.844" |
| Escolaridade e cidade | as duas associadas a mais dissolução | Seção 5 | "education and urban residence are both positively associated with the risk of dissolution" |
| Primeira relação sexual antes dos 18 anos | risco maior de dissolução | Seção 5 | "Women that had their first sexual intercourse before the age of 18 show a higher risk of union dissolution." |
| Grávida e com filhos: coeficientes (log do risco) nos três modelos (efeitos fixos, efeito aleatório, conjunto); o Trecho intercala as duas linhas | grávida 1,008, 1,377 e 0,962; com filhos 0,914, 1,394 e 1,069 | Tabela 3 | "Pregnant With children 1.008 (0.117) 0.914 (0.092) 1.377 (0.130) 1.394 (0.121) 0.962 (0.141) 1.069" |
| Gravidez | risco maior de separar durante a gestação | Seção 5 | "During pregnancy there is a higher risk of union dissolution." |
| Filhos | risco maior de dissolução para quem tem filhos, ao contrário de estudos anteriores | Seção 5 | "Despite previous findings, our model shows a higher risk of dissolution for couples that have children." |
| Primeiro filho fora do casamento | sem efeito significativo | Seção 5 | "whether the first birth took place 'out of wedlock' has no significant impact on the risk of future union dissolution" |
| Idade da mulher, com a heterogeneidade controlada | risco maior nas muito jovens e nas mais velhas, menor por volta dos 25 anos | Seção 5 | "higher risks of dissolution are found among very young women and older women, with the lowest risks at ages about 25 years" |
| Correlação entre a propensão a separar e a de engravidar | 0,659 | Seção 5 | "the joint estimation revealed a positive correlation between ε d and ε c of 0.659" |
| Uniões consensuais no Brasil | os parceiros se chamam de marido e mulher | Seção 2 | "the partners in Brazilian consensual unions describe themselves as husband and wife" |

## Limitações

- Só mulheres responderam; o que se sabe do parceiro é nada.
- Dados de 1991 a 1996, antes da Emenda Constitucional 66 (2010) e da mudança das uniões nas décadas seguintes.
- O calendário só cobre cinco anos e não dá a ordem das uniões antes dele. As autoras excluíram quase metade das mulheres com mais de uma união e só 6% das com uma; dizem que a comparação com a subamostra sem exclusões não mudou a direção dos efeitos, só talvez a intensidade.
- Os coeficientes estão na escala do logaritmo do risco. O artigo não os converte em razões de risco, e esta Ficha também não.
- Escolaridade, religião, raça e residência são medidas na data da entrevista, não no início da união. As autoras avisam que a residência pode ter mudado.
- O texto chama de "Table 4" o modelo de dissolução que está na Tabela 3, e de "Table 3" a Tabela 2.
- O texto extraído do PDF intercala as colunas da linha de gravidez e da de filhos; o Valor da linha correspondente desfaz a intercalação e segue a ordem das colunas da tabela (efeitos fixos, efeito aleatório, conjunto).
- É associação: a mesma propensão não observada que eleva o risco de separar eleva o de engravidar, e o desenho não diz qual vem primeiro.

## Como usamos

- [Relatório 2026-10-24: preditores de término e divórcio](../reports/2026-10-24-preditores-termino-divorcio.md): o único dado brasileiro sobre o que vem junto com o fim de uma união.
