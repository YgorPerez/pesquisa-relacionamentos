---
reference: "Lehrer EL, Chen Y. *Delayed entry into first marriage and marital stability: Further evidence on the Becker-Landes-Michael hypothesis*. Demographic Research 29(20):521–542, 2013. Texto completo aberto (CC BY-NC 2.0 DE): https://www.demographic-research.org/volumes/vol29/20/29-20.pdf"
link: https://doi.org/10.4054/DemRes.2013.29.20
status: verified
verified_on: 2026-10-24
strength: moderate
strength_reason: "Amostra nacional representativa (NSFG 2006–2010) e modelo de sobrevivência, mas só mulheres brancas não hispânicas até 44 anos, poucos casos depois dos 33 e controles limitados (faltam escolaridade e religião do marido)."
countries: [EUA]
period: "2006–2010 (entrevistas do NSFG, ciclo 7)"
sample:
  n: 3184
  description: "3.184 mulheres brancas não hispânicas de 15 a 44 anos que já tinham se casado, da amostra feminina (12.279) do National Survey of Family Growth 2006–2010, uma pesquisa nacional representativa dos EUA. Analisa só o primeiro casamento."
  representative: true
design: cross-sectional
conflict: "O artigo não declara financiamento; agradece a pareceristas e colegas. Sem vínculos declarados."
covers:
  genders: [woman]
  seeks: [men]
  ages: { min: 15, max: 44 }
  couple: different-sex
---

# Lehrer & Chen (2013): idade ao casar e risco de separação

## O que mediu

Se a idade da mulher no primeiro casamento muda o risco de separação, e se esse risco volta a subir depois dos 30 (a curva em U que Becker, Landes e Michael propuseram em 1977, por "escolha pior" quando o relógio biológico aperta). Com o histórico de casamento das entrevistadas do NSFG 2006–2010, modelos de Cox estimaram o risco de separação por faixa de idade ao casar. O painel I controla só a família de origem (não intacta, criada sem religião); o painel II acrescenta escolaridade, filho de união anterior, coabitação antes do casamento, marido já casado antes, diferença de raça e de idade. O painel III repete o modelo só com quem casou aos 27 ou depois.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Amostra | 3.184 mulheres brancas não hispânicas que já casaram | Resumo | "We used data on non-Hispanic white women from the 2006–2010 National Surveys of Family Growth (NSFG) (N = 3,184)." |
| Casamentos aos 27 anos ou mais | 26% | Métodos, p. 525 | "26% of the marriages took place at age 27 or later" |
| Probabilidade de separação até o quinto ano, por idade ao casar (painel I) | 0,31 antes dos 20; cai até 0,09 aos 30–32 | Resultados, p. 530 | "the fifth-year dissolution probability is .31 for women who entered first marriage before age 20, and declines steadily to .09 for those who did so at age 30–32" |
| Casar aos 33 ou mais (sem diferença significativa da faixa anterior) | sobe a 0,11 | Resultados, p. 530 | "The probability rises slightly to .11 for ages 33 and older" |
| Razão de risco, casar com 20 anos ou menos vs. 21–23 (painel I) | 1,47 | Tabela 2 | "1.47 0.31 Panel II" |
| Razão de risco, casar aos 30–32 vs. 21–23 (painel I) | 0,38 | Tabela 2 | "0.38 0.09 -0.96(0.20)" |
| A curva em U | não aparece; o risco cai até o começo da casa dos trinta e se estabiliza | Discussão, p. 533 | "the Ushape postulated by Becker, Landes, and Michael (1977) is not there" |
| Diferença entre casar aos 24–26 e aos 30–32 | 6 pontos percentuais na probabilidade de separação até o quinto ano | Discussão, p. 533 | "the difference in the estimated fifth-year dissolution probabilities for marriages contracted at ages 24–26 versus 30–32 is also sizeable: 6 percentage points" |
| Quem casa tarde faz escolhas "fora do padrão" | marido já casado, diferença de idade; mesmo assim, uniões sólidas | Resumo | "women who delay marriage disproportionately make unconventional matches, which are generally associated with high marital instability. We also found, however, that their unions are very solid." |
| Probabilidade de separação até o quinto ano com marido já casado antes, casal típico da amostra toda (painel II) | 0,24 contra 0,20 | Resultados, p. 532 | "the fifth-year dissolution probability is .24 if the husband had been married before, compared to .20 if he had not" |
| ... casal típico de quem casou aos 27–29 com faculdade (painel III) | 0,09 contra 0,06 | Resultados, p. 532 | "the fifth-year dissolution probability is .09 if the husband had been married before, compared to .06 if he had not" |
| Faculdade completa (16 anos de estudo ou mais) ao casar, painel II | razão de risco 0,59 | Tabela 2 | "0.59 0.12 -0.59(0.21)" |
| Filho de união anterior, painel II | razão de risco 1,31 | Tabela 2 | "1.31 0.25 0.75(0.21)" |
| Casos com 33 anos ou mais ao casar | 159 | Limitações, p. 534 | "a relatively small number of cases in the 33 years and older age at marriage category (n=159)" |

As razões de risco 0,59 e 1,31 aparecem na tabela logo depois dos coeficientes −0,53 e 0,27 (exp(−0,53) ≈ 0,59; exp(0,27) ≈ 1,31); o Trecho dessas linhas começa na razão de risco porque os asteriscos de significância logo antes dela não podem entrar num Trecho. A probabilidade de separação até o quinto ano vem como proporção (0,31 = 31%).

## Limitações

- Os autores lembram que há fatores não medidos na família de origem e nas características dos cônjuges, então o "efeito total" da idade está sujeito a viés de variável omitida. É associação, não causa.
- Só mulheres brancas não hispânicas; os autores pedem o teste com mulheres negras e hispânicas.
- A pesquisa entrevista mulheres até 44 anos: um casamento feito aos 40 é observado por no máximo quatro anos, e os depois dos 45 ficam de fora. Só 159 casos casaram com 33 ou mais.
- O ciclo 7 do NSFG não tem a escolaridade nem a religião do marido.
- O estudo mede separação, não qualidade do casamento. Os autores citam trabalhos divergentes sobre a qualidade dos casamentos tardios.
- O desenho é uma pesquisa transversal com histórico retrospectivo de casamento, analisado como sobrevivência.

## Como usamos

- [Relatório 2026-10-24: preditores de término e divórcio](../reports/2026-10-24-preditores-termino-divorcio.md): o risco de separação cai com a idade ao casar até o começo dos 30, sem curva em U.
