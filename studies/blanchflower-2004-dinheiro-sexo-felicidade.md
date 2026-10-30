---
reference: "Blanchflower DG, Oswald AJ. *Money, Sex and Happiness: An Empirical Study*. Scandinavian Journal of Economics 106(3):393–415, 2004. Texto lido: a versão de working paper, NBER Working Paper 10499 (maio de 2004), aberta em https://www.nber.org/papers/w10499"
link: https://doi.org/10.1111/j.0347-0520.2004.00369.x
status: verified
verified_on: 2026-10-24
strength: moderate
strength_reason: "Amostra aleatória grande de adultos americanos (General Social Survey, cerca de 16 mil pessoas), mas transversal, sem efeito fixo da pessoa nem correção para a causalidade reversa, como os próprios autores avisam."
countries: [EUA]
period: "1988–2002 (cortes transversais do GSS; as regressões de felicidade usam 1988–2000)"
sample:
  n: 16000
  description: "Cerca de 16 mil adultos americanos sorteados no General Social Survey, entrevista face a face e confidencial. As equações de felicidade usam 12.291 pessoas (5.448 homens e 6.843 mulheres) com todas as variáveis."
  representative: true
design: cross-sectional
conflict: "O working paper não declara financiamento nem conflito de interesse; os autores eram economistas de Dartmouth College e da Universidade de Warwick."
covers:
  genders: [man, woman]
---

# Blanchflower & Oswald (2004): dinheiro, sexo e felicidade nos EUA

## O que mediu

Os autores juntaram as rodadas de 1988 a 2002 do General Social Survey, que pergunta quantos parceiros sexuais a pessoa teve nos últimos 12 meses, com que frequência transou e o sexo dos parceiros, e cruzaram com a pergunta de felicidade geral ("muito feliz", "bem feliz", "não muito feliz"). As equações de felicidade (MQO e logit ordenado) controlam idade, sexo, raça, escolaridade, situação de trabalho, estado civil, divórcio dos pais aos 16 anos, renda familiar, ano e região, e trazem ao mesmo tempo a frequência de sexo e um indicador de "um parceiro só" no último ano.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Amostra | Cerca de 16.000 adultos sorteados | Resumo | "It uses recent data on a random sample of 16,000 adult Americans." |
| Número de parceiros no último ano que maximiza a felicidade | 1 | Resumo | "The happiness-maximizing number of sexual partners in the previous year is calculated to be 1." |
| Felicidade de quem teve um parceiro só no último ano, todos (logit ordenado, com a frequência de sexo e os controles) | Coeficiente 0,263 (t = 4,65), mais feliz, significativo | Tabela 3, coluna 1, linha Single partner | ".263 (4.65)" |
| Felicidade de quem teve um parceiro só no último ano, homens | Coeficiente 0,165 (t = 2,09), mais feliz | Tabela 3, coluna 2 | ".165 (2.09)" |
| Felicidade de quem teve um parceiro só no último ano, mulheres | Coeficiente 0,362 (t = 4,36), mais feliz | Tabela 3, coluna 3 | ".362 (4.36)" |
| Felicidade de quem teve um parceiro só no último ano, menores de 40 anos | Coeficiente 0,240 (t = 3,18), mais feliz | Tabela 3, coluna 4 | ".240 (3.18)" |
| Felicidade de quem teve um parceiro só no último ano, na escala de 1 a 3 (MQO) | +0,077 ponto de felicidade (t = 4,69) | Tabela 2, coluna 1 | ".077 (4.69)" |
| Sexo quatro ou mais vezes por semana, mesma escala (MQO) | +0,115 ponto, comparado a nenhum sexo no ano | Tabela 2, coluna 1 | ".115 (3.94)" |
| Felicidade de quem já pagou por sexo | Coeficiente −0,330 (t = 4,47), menos feliz | Tabela 4, coluna 1 | "-.330 (4.47)" |
| Felicidade de quem já transou fora do casamento (entre quem já casou) | Coeficiente −0,210 (t = 3,32), menos feliz | Tabela 4, coluna 2 | "-.210 (3.32)" |
| Menores de 40 com até um parceiro no último ano | 84% das mulheres e 70% dos homens | p. 7 | "among the under-40s 84% of US women and 70% of US men had at most one sexual partner in the previous year" |
| Menores de 40 com três ou mais parceiros no último ano | 11% | p. 7 | "only 11% of under-40 Americans reported themselves as having 3 or more sexual partners in the previous year" |
| Aviso dos autores | Cada pessoa respondeu uma vez só: não dá para saber se o sexo traz felicidade ou se é o contrário | Resumo | "Our conclusions are based on pooled cross-section equations in which it is not possible to correct for the endogeneity of sexual activity." |

O indicador "um parceiro só" vale 1 para quem teve exatamente um parceiro nos 12 meses anteriores. Como a mesma equação já separa quem não transou no ano (a categoria de referência da frequência), o coeficiente compara, na prática, um parceiro com dois ou mais, para a mesma frequência de sexo e o mesmo estado civil. Um coeficiente de logit ordenado não é uma porcentagem: indica a direção e a força relativa dentro da mesma tabela. Na escala de MQO, 0,077 ponto é cerca de dois terços do ganho associado a transar quatro ou mais vezes por semana (0,115).

## Limitações

- Transversal e sem efeito fixo: não dá para saber se ter um parceiro só deixa a pessoa mais feliz ou se gente mais feliz (ou casada e satisfeita) tem um parceiro só. Os autores dizem que os resultados devem ser lidos com cautela.
- Mede parceiros **no último ano**, não o histórico de parceiros antes de um relacionamento sério. Não responde se uma fase de sexo casual no passado afeta a felicidade de hoje.
- A maior parte dos casados tem um parceiro no ano (90%, Tabela 1); apesar do controle do estado civil, o indicador mistura monogamia dentro do casamento com estar sozinho com alguém fora dele. A Ficha não traz resultado separado para solteiros jovens porque o artigo não o estima.
- Autorrelato de números sensíveis; os autores suspeitam de exagero, sobretudo entre homens.
- A felicidade é uma pergunta única de três categorias.
- A Ficha usa o working paper do NBER, de maio de 2004, que já agradece a três pareceristas; os números podem diferir em detalhe da versão publicada na revista, que não foi lida.
