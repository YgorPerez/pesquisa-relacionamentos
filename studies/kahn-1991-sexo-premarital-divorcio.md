---
reference: "Kahn JR, London KA. *Premarital Sex and the Risk of Divorce*. Journal of Marriage and the Family 53(4):845–855, 1991. JSTOR: https://www.jstor.org/stable/352992"
link: https://doi.org/10.2307/352992
status: verified
verified_on: 2026-10-28
strength: moderate
strength_reason: "Amostra nacional probabilística (NSFG 1988), mas só mulheres brancas, histórico retrospectivo de uma única pesquisa, virgindade inferida de datas e um resultado central que depende das hipóteses de identificação do probit bivariado."
countries: [EUA]
period: "Primeiros casamentos de 1965 a 1983 (de 1965 a 1978 na análise dos anos 6 a 10); entrevistas do NSFG de 1988"
sample:
  n: 2746
  description: "2.746 mulheres brancas de 15 a 44 anos, entrevistadas no National Survey of Family Growth de 1988 (amostra nacional representativa dos EUA), cujo primeiro casamento foi de 1965 a 1983, pelo menos cinco anos antes da entrevista. A análise dos anos 6 a 10 usa as 1.562 casadas de 1965 a 1978 que continuavam casadas no quinto ano. As negras aparecem só nas tabelas descritivas, porque eram poucas as que casaram virgens."
  representative: true
design: cross-sectional
conflict: "Financiado em parte por um Summer Research Award da University of Maryland, com análise apoiada pelo Computer Science Center da mesma universidade. O NSFG de 1988 foi planejado e financiado pelo National Center for Health Statistics (onde London trabalhava), pelo NICHD e pelo Office of Population Affairs. Sem vínculos comerciais declarados."
covers:
  genders: [woman]
  seeks: [men]
  ages: { min: 15, max: 44 }
  couple: different-sex
---

# Kahn & London (1991): sexo antes do casamento e risco de divórcio

## O que mediu

Com o NSFG de 1988, as autoras compararam mulheres que casaram virgens com as que já tinham tido relação sexual antes do primeiro casamento. A virgindade foi deduzida da data da primeira relação: contou como virgem quem disse que a primeira relação foi no mês do casamento ou depois. O desfecho foi separação ou divórcio do primeiro marido nos cinco primeiros anos e, entre as que passaram dos cinco, do sexto ao décimo ano.

Primeiro, uma série de modelos probit acrescentou os fatores que poderiam explicar a diferença: gravidez ou filho antes do casamento, idade ao casar, escolaridade, família intacta e religião. Depois, um probit bivariado estimou junto a chance de casar virgem e a de se separar, para descontar fatores não observados que pesam nas duas, como atitudes sobre o casamento. Escolaridade da mãe, regras rígidas em casa e ida à igreja aos 14 anos entraram só na equação da virgindade, para identificar o modelo.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Amostra dos cinco primeiros anos | 2.746 mulheres brancas casadas de 1965 a 1983 | Tabela 3, nota a | "aThe sample is limited to white women who first got married between 1965 and 1983 (n = 2,746)" |
| Amostra do sexto ao décimo ano | 1.562 mulheres casadas de 1965 a 1978 | Tabela 3, nota b | "bThe sample is limited to white women who first got married between 1965 and 1978 and remained married for at least five years (n = 1,562)" |
| Casar virgem ficou mais raro que entre as brancas casadas de 1960 a 1965 | Menos de 15% das brancas casadas de 1980 a 1985 | p. 846 | "white women marrying between 1960 and 1965 were virgins as compared with less than 15% of those marrying between 1980 and 1985" |
| Proporção que casou virgem, total de 1965 a 1983 | Brancas 0,28; negras 0,08 | Tabela 1 | "Total .28 2,746 .08 925" |
| Separadas ou divorciadas, brancas casadas de 1965 a 1985 | 25% das virgens contra 35% das não virgens | p. 847 | "at marriage (25% vs. 35%)" |
| Separadas ou divorciadas do primeiro marido, total por raça | Brancas: 0,26 das virgens contra 0,38; negras: 0,48 contra 0,51 (diferença sem teste significativo) | Tabela 2 | "Total .26 .38 .48 .51" |
| Coeficiente probit de casar virgem nos cinco primeiros anos, modelo 1 (só coorte, residência urbana e diferença de idade) | −0,567 | Tabela 3 | "at marriage? - Yes -.567" |
| Com o probit bivariado, o efeito de casar virgem deixa de ser significativo | Cinco primeiros anos: −0,511 (erro padrão 0,514); quinquênio seguinte: −0,274 | Tabela 4 | "Yes -.511 -.274 (.514)" |
| Correlação entre os erros das duas equações (rho), pequena e não significativa | −0,054 e −0,079 | Tabela 4 | "Rho 2,746 -.054 (p < .86) 1,562 -.079 (p < .88)" |
| Casar mais velha reduz o risco de separação nos cinco primeiros anos (modelo 2) | Coeficiente −0,080 por ano | Tabela 3 | "Age at marriage -.080" |
| Divórcios de 1987 que aconteceram antes dos dez anos de casamento | 64% | Nota 5 | "An estimated 64% of all divorcing couples in 1987 had been married for less than ten years at the time of the divorce decree" |

Na Tabela 3, o coeficiente de casar virgem fica em −0,567, −0,614 e −0,601 nos cinco primeiros anos (modelos 1 a 3, cada um com mais controles) e em −0,419, −0,410 e −0,402 no quinquênio seguinte, todos com p < 0,001 (\*\*\*). Os Trechos param antes desses asteriscos, que a tabela do Markdown não reproduz.

Sem descontar os fatores não observados, a diferença resiste a todos os controles: as virgens continuam com risco bem menor de separação, e nem gravidez antes do casamento nem idade ao casar a explicam (Tabela 3). No probit bivariado, ela some: "virgin brides are not significantly less likely than nonvirgins to separate or divorce, at least not within the first ten years of marriage" (Resultados). As autoras concluem que a ligação vem de diferenças anteriores entre as mulheres, e não do sexo em si, e especulam que sejam atitudes tradicionais sobre o casamento, que elas não puderam medir: "it is prior attitudes, and not sexual activity per se" que pesariam no risco de divórcio (Discussão).

As mulheres tinham mais chance de casar virgens quando vinham de família intacta, iam à igreja toda semana aos 14 anos (sobretudo as protestantes fundamentalistas) e tinham regras rígidas em casa (Tabela 4).

## Limitações

- Só mulheres brancas na análise multivariada. As negras ficaram de fora porque havia poucas virgens (78 na amostra, nota 1), e entre elas a diferença na separação foi pequena (Tabela 2).
- Não há dado sobre os maridos nem sobre a experiência sexual deles; as autoras supõem que o efeito seria fraco, porque virgindade ao casar não era uma expectativa para homens.
- Mede só virgem contra não virgem: não conta quantos parceiros a mulher teve nem se a relação antes do casamento foi só com o futuro marido. Não responde, portanto, se mais parceiros fazem diferença.
- A virgindade vem de datas lembradas na entrevista; quem teve a primeira relação no mês do casamento, antes dele, entrou como virgem (nota 6).
- A coabitação antes do casamento ficou fora do modelo porque todas as que coabitaram não eram virgens (nota 7).
- Segue o casamento só até o décimo ano. Pela nota 5, a maior parte dos divórcios acontece nesse intervalo, mas não todos.
- A conclusão central depende do probit bivariado e das variáveis que só entram na equação da virgindade. O próprio rho, que mediria a seleção, é pequeno e não significativo (Tabela 4); o coeficiente de virgindade perde a significância sobretudo porque o erro padrão cresce muito (de 0,078 para 0,514 nos cinco primeiros anos), não porque o efeito estimado encolhe tanto.
- As atitudes que explicariam a seleção não foram medidas; as autoras dizem que só podem especular sobre elas.
- Casamentos de 1965 a 1983, nos EUA. Hoje casar virgem é bem mais raro, e a comparação pode ter mudado de sentido.
- O texto foi lido numa cópia do artigo do JSTOR republicada no Scribd, cuja camada de texto mistura as duas colunas. Os Trechos foram escolhidos onde o texto saiu contínuo.

## Como usamos

Nenhuma Dica nem Guia cita esta Ficha ainda. O Relatório [Parceiros sexuais e vínculo](../reports/2026-10-25-parceiros-e-vinculo.md) e o de [leituras conferidas](../reports/2026-10-26-leituras-conferidas.md) a citam, para a Pergunta `mais-parceiros-faz-mal`, como o estudo que mostrou que a seleção podia explicar a ligação entre sexo antes do casamento e divórcio; o de [sexo casual antes de assumir](../reports/2026-10-24-sexo-casual-antes-de-assumir.md) a deixou de fora por falta de texto completo.
