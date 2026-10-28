---
reference: "Cacioppo JT, Cacioppo S, Gonzaga GC, Ogburn EL, VanderWeele TJ. *Marital satisfaction and break-ups differ across on-line and off-line meeting venues*. PNAS 110(25):10135–10140, 2013. Material suplementar (SI com as Tabelas S1–S12, Appendix S1 com o questionário e o codebook, Appendix S2 com as interações, Dataset S1 com os microdados): https://pmc.ncbi.nlm.nih.gov/articles/PMC3690854/"
link: https://doi.org/10.1073/pnas.1222447110
status: verified
verified_on: 2026-10-20
strength: moderate
strength_reason: "Amostra grande (19.131) e plano de análise pré-especificado com estatísticos independentes, mas painel online de adesão voluntária, transversal, com resposta de um só cônjuge e pesquisa encomendada pela eHarmony."
countries: [EUA]
period: "casamentos de 2005 a 2012; questionário aplicado em junho de 2012"
sample:
  n: 19131
  description: "19.131 pessoas que casaram uma única vez entre 2005 e 2012, recrutadas por e-mail num painel online (uSamp) e ponderadas pela Harris Interactive com escores de propensão. Os autores chamam a amostra de nacionalmente representativa, mas admitem que ela é uma aproximação."
  representative: false
design: cross-sectional
conflict: "A eHarmony encomendou a pesquisa à Harris Interactive. J. T. Cacioppo era consultor científico da eHarmony, S. Cacioppo é cônjuge dele e Gonzaga é ex-diretor do eHarmony Labs. Dois estatísticos independentes (Ogburn e VanderWeele, Harvard) supervisionaram as análises com plano pré-especificado, e um acordo prévio garantia a publicação qualquer que fosse o resultado sobre a eHarmony."
covers:
  genders: [man, woman]
---

# Cacioppo et al. (2013): satisfação e separação por local

## O que mediu

Questionário online da Harris Interactive, de junho de 2012, com pessoas que casaram entre 2005 e 2012. Perguntou se a pessoa conheceu o cônjuge online ou offline e em qual local, se o casamento terminou em separação ou divórcio e, para quem continuava casado, a [[satisfação]] conjugal: a média de duas escalas de 1 a 7. Comparou separação e satisfação entre online e offline e entre os locais, com e sem controles demográficos e do ano do casamento.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quem entrou na análise | 19.131 pessoas casadas uma única vez entre 2005 e 2012 (95,43% da amostra final) | Methods, p. 10139 | "19,131 (95.43%) reported being married once between 2005 and 2012" |
| Conheceram o cônjuge online | Mais de um terço; 34,95% nos microdados, com os pesos | Results, p. 10135; Fig. 1B | "more than one-third of those married between 2005 and 2012 met on-line" | `scripts/calculations/cacioppo-2013-satisfacao-por-local.py online` |
| Dos que se conheceram online, via site de namoro | 45,01% | Fig. 1D, legenda | "45.01% through an online dating site" |
| Locais offline mais comuns | Trabalho 21,66%, amigos 19,06%, escola 10,97% | Fig. 1C, legenda | "21.66% of the respondents who met their spouse offline met through work, 19.06% through friends, 10.97% at school" |
| Separação ou divórcio: online vs. offline | 5,96% vs. 7,67% (qui-quadrado 9,95; P < 0,002) | Results, p. 10136 | "met their spouse on-line (5.96%) than off-line [7.67%; χ2(1) = 9.95, P < 0.002]" |
| A diferença de separação com controles | Menor, mas ainda significativa (qui-quadrado 3,87; P < 0,05) | Results, p. 10136 | "this difference was attenuated but remained significant [χ2(1) = 3.87, P < 0.05]" |
| Separação varia entre locais offline? | Não (P = 0,34; P = 0,56 com controles) | Results, p. 10136 | "differences across off-line venues were not statistically significant [χ2(9) = 10.17, P = 0.34], and neither test was significant after controlling for covariates [χ2(10) = 14.41, P = 0.17, and χ2(9) = 7.66, P = 0.56, respectively]" |
| Separação varia entre locais online? | No limite (P = 0,08); não com controles (P = 0,17) | Results, p. 10136 | "The differences in percentage of marital break-ups across online venues approached statistical significance [χ2(10) = 16.71, P = 0.08; Table S5], but differences across off-line venues were not statistically significant [χ2(9) = 10.17, P = 0.34], and neither test was significant after controlling for covariates [χ2(10) = 14.41, P = 0.17" |
| Satisfação: online vs. offline | 5,64 (n = 5.349) vs. 5,48 (n = 12.253); diferença de 0,18 | Results, p. 10136 | "reported higher marital satisfaction (M = 5.64, SE = 0.02, n = 5,349) than currently married respondents who met their spouse off-line [M = 5.48, SE = 0.01, n = 12,253; mean difference = 0.18" |
| Satisfação: online vs. offline, com controles | Diferença de 0,16 | Results, p. 10137 | "[mean difference = 0.16; F(1, 16,622) = 43.39, P < 0.001]" |
| Satisfação varia entre locais offline, com controles? | Sim (F = 3,87; P < 0,001) | Results, p. 10137 | "[F(9, 11,466) =3.87, P < 0.001]" |
| Locais offline com mais satisfação | Cresceram juntos, escola, local de culto, evento social | Results, p. 10137 | "Those currently married who grew up together or who met their spouse through school, place of worship, or social gathering expressed the highest levels of marital satisfaction" |
| Locais offline com menos satisfação | Bar ou balada, trabalho, encontro às cegas | Discussion, p. 10139 | "the venues associated with relatively low levels of marital satisfaction are bars/clubs, work, and blind dates" |
| Tamanho dos efeitos, nas palavras dos autores | Pequenos, e não valem para todo mundo | Discussion, p. 10139 | "the effects of where one meets their spouse are understandably quite small and do not hold for everyone" |
| Tempo de casamento coberto | Os primeiros 6 ou 7 anos | Discussion, p. 10139 | "The present results addressed marital outcomes in the first 6 or 7 y of marriage" |
| Tempo médio de casamento na data da pesquisa, com os pesos | 4,41 anos no total; 4,39 online vs. 4,43 offline. Entre quem continuava casado: 4,45 online vs. 4,48 offline | Dataset S1, variável `Days_in_Relationship_All`; método no Methods, p. 10139 | "For each marriage, participants were asked the month and year of the marriage" | `scripts/calculations/cacioppo-2013-satisfacao-por-local.py duration` |
| Escala 1: Couples Satisfaction Index de 4 itens | α = 0,89 | Methods, p. 10139 | "Consistent with prior research, the Cronbach α was excellent (α = 0.89) in our survey." |
| Escala 2: 11 frases sobre o cônjuge | α = 0,97; correlação de 0,78 com a primeira escala | Methods, p. 10140 | "The Cronbach α for this scale was 0.97. The correlation between these two measures of marital satisfaction was 0.78" |
| Representatividade, nas palavras dos autores | Uma aproximação, não uma representação perfeita | Methods, p. 10139 | "This finding suggests that the sample is an approximation rather than a perfect representation of the true population." |

## Satisfação por local

Tabela 2 do artigo, médias sem ajuste, escala de 1 a 7, só entre quem continuava casado. O texto extraído do PDF separa as colunas da tabela dos rótulos, por isso estes números ficam fora dos Achados; foram conferidos à mão na Tabela 2 (p. 10138).

| Local offline | Média | n ponderado | Local online | Média | n ponderado |
|---|---|---|---|---|---|
| Cresceram juntos | 5,67 | 873 | Rede social | 5,72 | 1.301 |
| Escola | 5,59 | 1.277 | Jogo multiplayer | 5,72 | 222 |
| Local de culto | 5,58 | 466 | Site de namoro | 5,69 | 2.782 |
| Evento social | 5,56 | 1.133 | E-mail | 5,67 | 133 |
| Amigos | 5,47 | 2.135 | Mensagem instantânea | 5,66 | 279 |
| Família | 5,43 | 769 | Mundo virtual | 5,65 | 125 |
| Outro | 5,42 | 944 | Chat | 5,42 | 596 |
| Bar/balada | 5,39 | 988 | Comunidade online | 5,29 | 393 |
| Trabalho | 5,38 | 2.474 | | | |
| Encontro às cegas | 5,31 | 299 | | | |

Entre os sites de namoro, a eHarmony teve a média mais alta (5,86) e a Yahoo a mais baixa (5,29). As diferenças entre locais offline vão de 5,31 a 5,67: [[significativas]], mas pequenas.

Quem se conheceu online era mais frequentemente homem, de 30 a 49 anos, hispânico, de renda mais alta e empregado (Tabela 1).

## Como a satisfação foi medida

Fonte: Methods (p. 10139–10140) e o questionário da Harris Interactive no Appendix S1 (p. 7–10 do PDF), salvo em `sources/private/cacioppo-2013-satisfacao-por-local-appendix-s1.pdf`.

- Respondeu **uma pessoa** por casamento; o cônjuge não foi ouvido.
- O questionário seguiu esta ordem: estado civil e data do casamento; se conheceu o cônjuge online; o local (online ou offline), com as opções em ordem aleatória; e logo depois a satisfação.
- **Primeiro bloco, o CSI-4** (Funk & Rogge 2007), quatro perguntas nesta ordem: o grau de felicidade no casamento, de "Extremely Unhappy" a "Perfect" (7 pontos); "I have a warm and comfortable marriage with my partner"; "How rewarding is your marriage with your partner?"; e "In general, how satisfied are you with your marriage?". As três últimas têm 6 pontos no questionário, embora o artigo descreva o CSI numa escala de 1 a 7. Para metade dos respondentes, a escala de cada pergunta aparecia invertida.
- **Segundo bloco, as 11 frases** sobre o cônjuge, de 1 ("Strongly disagree") a 7 ("Strongly agree"): "We have chemistry", "We are happy", "We are able to understand each other's feelings", "We are able to show each other affection", "We laugh a lot in our relationship", "We are able to disagree with one another without losing our tempers", "We 'get' each other", "We are in love", "We have great communication", "We are compatible", "We trust each other". As frases apareciam em **ordem aleatória**, todas no sentido positivo, sem item invertido.
- A nota final é a média das duas escalas (o codebook chama a variável de `total_sat`). A análise fatorial indicou um só fator.
- O questionário perguntava a satisfação a quem estava casado **ou separado**; o artigo analisa só quem continuava casado.

## Quanto tempo de casamento

- O artigo, o SI (Tabelas S1–S12) e os Appendixes S1 e S2 **não publicam o tempo médio de casamento**. O questionário não pergunta quando o casal se conheceu, então não há como saber quanto tempo namoraram antes.
- O Dataset S1 do suplemento (microdados, uma linha por respondente) traz a duração de cada casamento em dias (`Days_in_Relationship_All`): do primeiro dia do mês do casamento até 1º de julho de 2012, ou até o divórcio. Calculamos a média com os pesos da Harris (`wts`), os mesmos que reproduzem os 34,95% online, os 5,96% e 7,67% de separação e as médias de satisfação de 5,64 e 5,48 do artigo.
- **Tempo médio: 4,41 anos.** Online e offline quase iguais: 4,39 e 4,43 anos; entre quem continuava casado, 4,45 e 4,48. A comparação de satisfação e de separação entre online e offline não é distorcida por um grupo ter casamentos mais longos que o outro.
- Os casamentos começaram entre 2005 e junho de 2012, então tinham de zero a cerca de sete anos e meio na data da pesquisa. Idade média ponderada dos respondentes: 37,83 anos (Tabela S1).
- Online e offline foram comparados com controle do ano do casamento, o que corrige parte da diferença de tempo de exposição à separação entre os grupos. O efeito protetor de ter se conhecido online foi maior entre os casados mais recentemente (interação com o ano, P = 0,015).
- Para comparação: no Brasil, o divórcio ocorre em média mais de uma década depois do casamento ([[IBGE]] [2024](ibge-2024-registro-civil.md)). Muitas separações ainda não tinham acontecido na data da pesquisa.

## Definições

| Verbete | Definição | Onde | Trecho |
|---|---|---|---|
| satisfacao | Satisfação com o casamento, só de quem continuava casado: a média do Couples Satisfaction Index, quatro perguntas como "em geral, quão satisfeito você está com o seu casamento", de 1 a 7, com uma segunda escala de onze frases sobre o cônjuge | Methods, p. 10140 | "and "In general, how satisfied are you with your marriage" on a scale of 1 "Extremely Unhappy" to 7 "Perfect."" |

## Limitações

- Conflito de interesse com a eHarmony, mitigado pela supervisão de estatísticos independentes, pelo plano de análise pré-especificado e pelo acordo de publicação, mas presente.
- [[Painel online]] de adesão voluntária: dos 471.710 convidados, 20.047 chegaram à amostra final. Os pesos de propensão aproximam a amostra da população casada no período; os próprios autores dizem que ela não é uma representação perfeita. Sem ponderação, 62,96% dos respondentes eram mulheres (Tabela S1).
- Transversal e observacional. Os autores apontam que personalidade e motivação para um casamento longo podem explicar as diferenças entre online e offline.
- Cobre só os primeiros 6 ou 7 anos de casamento, com casamentos de meses e de sete anos na mesma análise (o ano do casamento entra como controle).
- Satisfação medida só em quem continuava casado: quem se separou saiu da comparação.
- Resposta de um só cônjuge, num único momento.
- Era dos sites (2005–2012), antes da popularização dos apps de swipe.
- O Appendix S2 avisa que as interações com variáveis categóricas têm células pequenas, muitas bem abaixo de 30 casos, e não devem ser lidas como estimativas da população.
- A comunicação de imprensa citava "mundos virtuais" entre os piores locais; no artigo, mundo virtual está na média, e o pior local online é "comunidade online".

### Possíveis vieses na medida de satisfação

Análise nossa; o artigo não discute esses vieses. O formato e a ordem do questionário foram conferidos no Appendix S1. Das três referências de literatura, só se leu o resumo de Schwarz, Strack & Mai (1991); o texto completo dela, Weiss (1980) e Edmonds (1967) não puderam ser lidos (ver a [issue #46](https://github.com/YgorPerez/pesquisa-relacionamentos/issues/46)).

| Viés | Por que se aplica aqui |
|---|---|
| **Ordem das perguntas** | As perguntas gerais (CSI-4) vêm antes das 11 frases específicas, e a pergunta sobre o local onde o casal se conheceu vem logo antes de tudo. Schwarz, Strack & Mai (1991), *Public Opinion Quarterly* 55(1):3–23, estudam a sequência inversa: quando a pergunta específica vem antes da geral, o que ela traz à mente entra no julgamento geral (assimilação) ou, se a pessoa entende as duas como uma conversa só, é deixado de fora (contraste). O artigo não trata da ordem geral → específica que este questionário usa. Que a resposta geral puxe as específicas para a mesma direção é hipótese nossa, sem fonte conferida. A ordem aleatória das 11 frases e a escala invertida para metade dos respondentes no CSI-4 controlam efeitos de ordem dentro de cada bloco, não entre os blocos. |
| **Aquiescência** | As 11 frases são todas positivas; "concordo" sempre significa "casamento bom". Não há itens invertidos para detectar quem concorda com tudo. |
| ***Sentiment override*** | A impressão geral sobre o parceiro colore as respostas sobre cada detalhe. O conceito é atribuído a Weiss (1980), um capítulo de livro (*Advances in family intervention, assessment and theory*, JAI Press) que não conseguimos ler. Parte da correlação de 0,78 e do α de 0,97 pode ser a mesma impressão medida duas vezes. |
| **Desejabilidade social** | Tendência a pintar o casamento melhor do que é, que Edmonds (1967), *Journal of Marriage and the Family* 29(4):681–688, chamou de *marital conventionalization*. Não conseguimos ler o artigo; a atribuição vem de trabalhos que o citam. |

- **Efeito provável:** inflam o **nível** das notas (5,5 de 7 deve exagerar a qualidade real). Afetam menos a **comparação** entre locais, a menos que um grupo infle mais que outro.
- **Hipótese não testada:** quem pagou um site (por exemplo, a eHarmony, com a média mais alta) pode ter mais motivação para justificar a escolha.
- **Consequência:** o dado mais confiável do estudo é o de separação (fato, não opinião), e ele **não** variou entre locais offline.

## Como usamos

- [Relatório 2026-10-18](../reports/2026-10-18-casamentos-apps-e-onde-procurar.md), seções 2.1 e 2.2: online vs. offline e ranking de locais.
- [Relatório 2026-10-18: onde casais se conhecem](../reports/2026-10-18-onde-casais-se-conhecem.md): online vs. offline nos EUA.
