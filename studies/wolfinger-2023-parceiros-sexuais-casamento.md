---
reference: "Wolfinger NH, Perry SL. *Does a Longer Sexual Resume Affect Marriage Rates?* Social Science Research 113:102800, 2023. Texto completo aberto (manuscrito aceito, SocArXiv): https://osf.io/n9e6p"
link: https://doi.org/10.1016/j.ssresearch.2022.102800
status: verified
verified_on: 2026-10-24
strength: moderate
strength_reason: "Duas amostras nacionais grandes dos EUA, uma delas um painel de 17 ondas (NLSY97) com o número de parceiros medido ano a ano, mas observacional: a correção por seleção (probit bivariado) usa só mulheres, dados retrospectivos e um instrumento fraco (idade da menarca), o desfecho é só casamento e o acompanhamento vai até perto dos 30 anos."
countries: [EUA]
period: "1997–2015 (NLSY97, 17 ondas); 2002–2015 (NSFG, quatro ondas)"
sample:
  n: 8975
  description: "Painel NLSY97: 8.975 jovens (4.598 homens e 4.377 mulheres) entrevistados desde 1997, quando tinham de 12 a 16 anos, até 2015 (19.928 pessoas-ano de homens e 21.477 de mulheres; só casamento heterossexual). Mais 29.905 mulheres de 15 a 44 anos das quatro ondas do NSFG (2002 a 2015), com histórico sexual retrospectivo e peso amostral."
  representative: true
design: longitudinal
conflict: "Sem financiamento externo, como diz o manuscrito. Agradecem a Daniel Carlson, Mark Regnerus e W. Bradford Wilcox; Wolfinger escreve para o blog do Institute for Family Studies, que o artigo cita várias vezes."
license: "CC0 1.0 (como diz a página do manuscrito no SocArXiv/OSF)"
covers:
  genders: [man, woman]
  ages: { min: 12, max: 44 }
  couple: different-sex
---

# Wolfinger & Perry (2023): mais parceiros sexuais e a chance de casar

## O que mediu

Se ter tido mais parceiros sexuais fora do casamento diminui a chance de casar. Primeiro, com o NSFG (só mulheres, histórico retrospectivo), os autores comparam a proporção de casadas até os 40 anos por número de parceiros e estimam um probit bivariado que tenta separar seleção de efeito, usando a idade da menarca como variável de identificação. Depois, com o painel NLSY97, modelam ano a ano a chance de casar (regressão complementar log-log de tempo discreto, homens e mulheres separados) em função de dois números: os parceiros do último ano e o total de parceiros na vida, controlando escolaridade da mãe e do próprio, filho fora do casamento, coabitação, religião, raça, região e família de origem.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Amostra do NSFG | 29.905 mulheres, com peso amostral | Seção 4.1 | "The sample size is 29,905, and the data are weighted to make them nationally representative." |
| Amostra do NLSY97 | 8.975 pessoas: 4.598 homens e 4.377 mulheres | Seção 4.2 | "The overall sample size for these data is 8,975, including 4,598 men and 4,377 women." |
| Casadas até os 40 (NSFG): 10 ou mais parceiros vs. um só | 67% vs. 95%, quase 30 pontos de diferença | Seção 5.1.1, Figura 1 | "67% vs. 95%, almost a 30-percentage point gap" |
| Casadas até os 40 com 6 a 9 parceiros (NSFG) | 76% | Seção 5.1.1, Figura 1 | "About three-fourths (76%) of women with between six and nine male partners are married by 40." |
| Casadas até os 40 entre as que nunca tinham feito sexo (NSFG) | 87% | Seção 5.1.1 | "Somewhat fewer (87%) women who had not yet had sex eventually got married." |
| Casadas aos 25 (NSFG): um parceiro vs. seis ou mais | 69% vs. menos de 30% | Seção 5.1.1 | "At age 25, for instance, 69% of women reporting a single non-marital sex partner have entered marriage, while less than 30% of those with six or more partners have married." |
| Casadas até os 40 com muitos parceiros (NSFG) | 68% (10 a 19), 62% (20 a 29), 57% (30 ou mais) | Seção 5.1.1, Figura 2 | "That percentage falls to 68% for women with 10 to 19 partners, 62% for 20 to 29 partners, and 57% for women with 30 or more" |
| Idade ao casar (NSFG) | Quem teve mais de três parceiros casa só um par de anos mais tarde | Seção 5.1.2, Figura 3 | "Women who have had more than three non-marital sex partners tend to be just a couple of years older when they get married" |
| Correlação dos erros no probit bivariado (NSFG) | ρ = 0,02 e −0,04, não significativos | Seção 5.1.4, Tabela 2 | "The rho parameter estimates are quite small (.02 in one model, -.04 in the other) and lack statistical significance." |
| Parceiros na vida toda vs. parceiros do último ano (NLSY97) | O total da vida deixa de prever casamento quando entra o número do último ano | Seção 5.2.1, Tabela 3 | "Put simply, recent sexual behavior, not complete sexual biographies, is what matters for marriage rates." |
| Chance de casar no ano, qualquer número diferente de um parceiro no último ano (NLSY97) | De 66% a 86% menor que com um parceiro só | Seção 5.2.1 | "Respondents who have anything aside from a single non-marital sex partner have between 66% and 86% lower odds of marriage." |
| Homens sem parceiro no último ano (NLSY97) | −84% na chance de casar, vs. um parceiro | Tabela 4 | "0 -84%" |
| Homens com dois parceiros no último ano (NLSY97) | −72% | Tabela 4 | "2 -72%" |
| Homens com cinco ou mais parceiros no último ano (NLSY97) | −68% | Tabela 4 | "5+ -68%" |
| Mulheres com dois parceiros no último ano (NLSY97) | −74% | Tabela 4 | "-74%" |
| Homens vs. mulheres | Efeitos grandes e parecidos nos dois sexos | Seção 5.2.1 | "show that the effects are uniformly large, and similar for men and women." |
| Controles (NLSY97) | Escolaridade, filho fora do casamento, coabitação e religião quase não mudam o efeito dos parceiros do ano | Seção 5.2.1, Tabela 3, Modelos 4 a 7 | "No measured variable can account for the relationship between annual non-marital sex partners and marriage." |
| Parceiros medidos um ano antes (NLSY97) | Mesmo resultado | Nota 11 | "We repeated the analysis with sex variables lagged a year and the results were substantively identical." |
| Intenção declarada de casar (NLSY97, 2000 e 2001) | Prevê casamento, mas quase não muda a relação entre parceiros e casamento | Nota 20 | "Each had a positive and statistically significant effect on marriage chances, but virtually no impact on the relationship between premarital sex partners and marriage." |
| Quantos passam anos com muitos parceiros (NLSY97) | 51% dos homens e 72% das mulheres nunca tiveram um ano com cinco ou mais parceiros | Tabela 5 | "0 51% 72%" |
| Anos com cinco ou mais parceiros, homens (NLSY97) | Mais de 75% tiveram dois anos assim ou menos; menos de 3%, dez anos ou mais | Seção 5.2.2, Tabela 5 | "More than 75% of men report two or fewer years of 5+ partners; less than 3% report ten or more years of five-partner behavior." |
| Conclusão dos autores | A associação é "sazonal": atrasa o casamento enquanto dura, sem efeito de longo prazo visível | Seção 6 | "Our analyses demonstrate that having more numerous sex partners is indeed associated with lower odds of marriage, but only in the short term." |

As porcentagens da Tabela 4 são a queda na taxa anual de casar (razão de riscos do Modelo 1 da Tabela 3, menos 1) em comparação com quem teve exatamente um parceiro no ano; todas têm p < 0,001. As colunas de mulheres da Tabela 4 perderam o sinal de menos na camada de texto (OCR) da Fonte local; a Ficha usa só a linha em que o sinal aparece.

## Limitações

- Observacional. O probit bivariado, que os autores leem como sinal de efeito causal, roda só no NSFG: só mulheres, com parceiros contados de forma retrospectiva e desfecho censurado (os próprios autores dizem que os coeficientes ficam enviesados e não interpretam o tamanho). O instrumento, idade da menarca, tem coeficientes pequenos e não significativos na equação de parceiros (Tabela 2), o que deixa a identificação fraca.
- Causalidade reversa: quem está num namoro firme tende a ter um parceiro só no ano em que casa. Os autores reconhecem isso no NSFG e testam a defasagem de um ano no NLSY97, mas o painel não separa "estar num relacionamento sério" de "ter um parceiro".
- O número anual de parceiros não diz se eles eram casuais. Dois parceiros num ano podem ser dois namoros seguidos. A Ficha fala de "mais parceiros", não de "sexo casual".
- O desfecho é só casamento. Coabitação entra como controle (Modelo 5), não como desfecho, então o estudo não diz se quem teve muitos parceiros forma união estável sem casar.
- "Longo prazo" quer dizer até os 29 a 33 anos, idade dos participantes do NLSY97 em 2015. O estudo não diz o que acontece depois.
- O resultado "o total da vida não importa" vale com os parceiros do último ano no modelo. Sozinho (Modelo 2), o total da vida prevê menos casamento nos dois sexos.
- O NLSY97 é analisado sem peso amostral, com exclusão de casos com dado faltando.
- O texto e as tabelas não batem em detalhes: o texto diz quedas de 66% a 86%, a Tabela 4 mostra de 62% a 85%; a Tabela 3b tem um sinal trocado (0,91 no lugar de −0,91) e a fonte escrita "NLSY1979"; a nota 18 remete à Tabela 2 em vez da Tabela 3. A Fonte local é o manuscrito aceito, que pode diferir da versão publicada.
- Só EUA, só casamento heterossexual.

## Como usamos

Ainda não citado por nenhum Relatório. Pedido pela issue #134 (sub-questão "tempo": se passar alguns anos com vários parceiros atrasa ou reduz a chance de achar um parceiro de longo prazo).
