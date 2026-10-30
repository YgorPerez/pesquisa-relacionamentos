---
reference: "Schwartz CR, Han H. *The reversal of the gender gap in education and trends in marital dissolution*. American Sociological Review 79(4):605–629, 2014. Texto completo aberto (manuscrito do autor): https://pmc.ncbi.nlm.nih.gov/articles/PMC4212646/"
link: https://doi.org/10.1177/0003122414539682
status: verified
verified_on: 2026-10-21
strength: strong
strength_reason: "Duas pesquisas nacionais dos EUA (NSFG e PSID) que dão tendências parecidas, 39.589 casos no modelo agrupado e coortes de casamento de 1950 a 2004; mas é observacional, o modelo de risco não usa pesos, e as coortes recentes têm poucos divórcios."
countries: [EUA]
period: "casamentos formados entre 1950 e 2004, acompanhados nas ondas de 1973 a 2006–10 da NSFG e de 1968 a 2009 da PSID"
sample:
  n: 39589
  description: "Esposas casadas entre 16 e 40 anos na National Survey of Family Growth (ondas de 1973, 1976, 1982, 1988, 1995, 2002 e 2006–10) e na Panel Study of Income Dynamics (1968–2009), juntadas num modelo só: N = 39.589 (Tabela 3). As ondas de 1973 a 1995 da NSFG têm só primeiros casamentos; as outras incluem recasamentos, com controle."
  representative: true
design: longitudinal
conflict: "Financiado em parte pela Wisconsin Alumni Research Foundation (bolsa à primeira autora), com a infraestrutura do Center for Demography and Ecology da University of Wisconsin-Madison (R24 HD047873). O artigo não traz declaração de conflito de interesse."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Schwartz & Han (2014): escolaridade relativa dos cônjuges e divórcio

## O que mediu

O risco de separação ou divórcio em três tipos de casal, pela escolaridade de cada cônjuge perto da data do casamento (em quatro faixas: menos de 12, 12, 13 a 15 e 16 anos ou mais de estudo):

- **hipogâmicos:** esposa mais escolarizada;
- **homogâmicos:** mesma faixa de escolaridade;
- **hipergâmicos:** marido mais escolarizado (grupo de referência).

O estudo usa modelos de risco proporcional de Cox e mede como esse risco mudou entre as coortes de casamento. Os modelos controlam a escolaridade de cada cônjuge, o tamanho da diferença entre eles, a idade de cada um ao casar, a raça da esposa e se é recasamento. Um teste à parte, só com a PSID, junta a renda de cada um, a renda relativa e o emprego da esposa.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Esposa com mais estudo, casamentos de 1950–54 | Esses casais tiveram mais risco de separar que aqueles em que o marido tinha mais estudo (HR = 1,51) | Resultados, Tabela 3 | "hypogamous marriages formed in 1950–54 were more likely to dissolve than hypergamous marriages (the hazard was 1.51 times higher)" |
| Mesma escolaridade, casamentos de 1950–54 | Não apareceu diferença clara para os casais em que o marido tinha mais estudo (HR = 1,09) | Tabela 3, Modelo 2 | "Homogamous (W=H) 1.09 (0.99)" |
| Esposa com mais estudo, casamentos de 2000–04 | Não apareceu diferença clara para os casais em que o marido tinha mais estudo (HR = 0,82) | Tabela 3, Modelo 2 | "Hypogamous (W>H) 0.82 (1.48)" |
| Mesma escolaridade, casamentos de 2000–04 | Esses casais tiveram menos risco de separar que aqueles em que o marido tinha mais estudo (HR = 0,78) | Resultados, Tabela 3 | "homogamous couples were less likely to divorce than hypergamous couples (the hazard was 0.78 that of hypergamous couples)" |
| Como o risco mudou com o tempo | Comparado ao dos casais em que o marido tinha mais estudo, o risco era, em 1950–54, 1,85 vez o de 2000–04 quando a esposa tinha mais estudo, e 1,40 vez quando os dois tinham a mesma escolaridade | Resultados, Tabela 3 | "The hazard of dissolution for hypogamous relative to hypergamous couples was 1.85 times higher in 1950–54 than in 2000–04, and was 1.40 times higher for homogamous couples." |
| Esposa com mais estudo, casamentos de 1950 a 1979, Modelo 3 | Risco de separar 34% maior que o dos casais em que o marido tinha mais estudo (p = 0,010) | Resultados (p. 16) | "the hazard of dissolution for hypogamous couples marrying between 1950 and 1979 was 34% higher than for hypergamous couples and that this is statistically significant (p = .010, not shown)" |
| Esposa com mais estudo, casamentos de 2000–04, Modelo 3 | Risco de separar menor que o dos casais em que o marido tinha mais estudo, mas pode ser acaso (HR = 0,58; p = 0,091) | Resultados, Tabela 3 | "The hazard of dissolution for hypogamous couples was 0.58 that of hypergamous couples in 2000–04 and 0.63 for homogamous couples (Table 3). Although the point estimates suggest that hypogamous marriages are substantially more stable than hypergamous ones in the most recent cohort, this estimate does not attain statistical significance at p < .05 (p = .091)." |
| Casais de escolaridade diferente, casamentos de 2005–09 | Em mais de 60% deles, a esposa tinha mais estudo | Resultados, Figura 1 | "For couples married in 2005–9, over 60% of couples with different levels of education were those in which wives had more education than their husbands" |

"HR" compara o risco de separação de um grupo com o dos casais em que o marido tem mais estudo: acima de 1 é mais risco; abaixo de 1, menos. Os números vêm da conta que junta todas as épocas (Tabela 3, Modelo 2). O Modelo 3 é outra versão, em que a ligação entre a escolaridade de cada cônjuge e a separação muda com a época do casamento. "p" vem do teste de [[significância]]: quanto menor, menos provável que seja só acaso. Nos Trechos da Tabela 3, o número entre parênteses é a estatística |z|, não um intervalo.

- A desvantagem dos casais em que a esposa tem mais estudo **sumiu** nas coortes recentes. Os autores situam a virada nos casamentos do começo dos anos 1990.
- Casais com a **mesma escolaridade** passaram a se separar menos que aqueles em que o marido tem mais estudo; nos anos 1950 não havia diferença.
- Controlar a renda e o emprego dos cônjuges (só na PSID) quase não muda as estimativas.
- Uma diferença maior de escolaridade entre os cônjuges se associa a mais divórcio (nota 8).
- Os autores leem isso como sinal de uma mudança para parcerias mais igualitárias, mas dizem que a seleção de quem casa também pode explicar a tendência.

## Limitações

- Observacional. Os autores não separam efeito causal de mudança na seleção de quem casa com quem.
- Só EUA; o Brasil não foi estudado.
- As coortes recentes têm menos tempo de acompanhamento e poucos divórcios (175 na NSFG e 107 na PSID para 2000–04, Tabela A1). As estimativas são imprecisas, e os autores dizem isso.
- A escolaridade é medida uma vez e só em quatro faixas: não pega curso nem prestígio da faculdade. Nas ondas de 1973 a 1988 da NSFG ela é a da época do casamento, relembrada pela esposa; nas de 2002 e 2006–10 (e para a esposa em 1995), é a da entrevista, que pode incluir estudo feito depois de casar. Na PSID, é a do primeiro ano em que o casamento aparece.
- Na NSFG, a história do casamento é relembrada pela entrevistada (dados retrospectivos); só a PSID é um painel.
- "Divórcio" inclui separação (nota 6), e só a escolaridade da esposa e do marido de casais de sexos diferentes entra.
- O modelo de risco não usa os pesos amostrais; os autores dizem que os resultados se mantêm com eles.

## Como usamos

- [Relatório 2026-10-18: características do parceiro](../reports/2026-10-18-caracteristicas-parceiro.md): homogamia educacional e divórcio.
