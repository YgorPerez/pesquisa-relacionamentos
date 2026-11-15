---
reference: "Liu J, Jiang H, Wang S. *Physicians' online writing language style and patient satisfaction: The mediator of depth of physician–patient interactions*. Healthcare (Basel) 11(11):1569, 2023."
link: https://doi.org/10.3390/healthcare11111569
status: verified
verified_on: 2026-11-15
license: "CC BY 4.0 (Creative Commons Attribution License, como diz a primeira página do artigo)"
strength: weak
strength_reason: "Registros de uma só plataforma chinesa de consulta online de pediatria (5.064 consultas de 337 médicos), que só observam o que aconteceu, com a satisfação medida por uma marca de sim ou não; fora do namoro, entre médico e paciente ou responsável; e duas tabelas trazem erros (uma média impossível e uma linha repetida)."
countries: [China]
period: "360 dias de consultas a partir de 14 de fevereiro de 2022"
sample:
  n: 5064
  description: "5.064 registros de consultas de pediatria online de 337 médicos no app Chunyu Physician, coletados em 360 dias a partir de 14 de fevereiro de 2022. Ficaram só as consultas com mais de uma rodada de pergunta e resposta, sem links nem respostas automáticas. Quem consulta em pediatria costuma ser o responsável pela criança, não o paciente; o artigo não teve acesso ao gênero nem à escolaridade de quem consultou."
  representative: false
design: platform
conflict: "Sem financiamento externo. Os autores, da Escola de Administração da Universidade de Xangai, declaram não ter conflito de interesse."
covers: {}
---

# Liu et al. (2023): emoji e linguagem inclusiva de médicos em consultas online

## O que mediu

O estudo analisou o texto de consultas de pediatria por escrito num app chinês de saúde. Contou, em cada consulta, quantos emoji o médico usou e quantas vezes usou a primeira pessoa do plural ("nós"), e calculou a profundidade da conversa como o número de trocas multiplicado pelo quanto as falas do médico e do paciente tratavam do mesmo assunto. Depois cruzou essas contagens com a marca de "satisfatório" que o paciente pode deixar ao fim, levando em conta o médico, o mês, o preço, o tempo de resposta e outras características.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Dados analisados | 5.064 registros de consultas de saúde online de 337 pediatras | Resumo (p. 1) | "The study obtained 5064 online health counseling records from 337 pediatricians" | |
| Origem e período | Consultas de pediatria do app chinês Chunyu Physician, de 360 dias a partir de 14 de fevereiro de 2022 | 4.1 Data Collection (p. 8) | "We collected 360 days of online pediatric consultation records since 14 February 2022." | |
| Como a satisfação foi contada | A consulta conta como 1 quando quem consultou deixou a avaliação "satisfatório", e como 0 em qualquer outro caso | Tabela 3 (p. 10) | "If the patient leaves a satisfactory evaluation, the code is 1 and the other is 0." | |
| Consultas marcadas como satisfatórias | 80,7% das consultas analisadas receberam a marca de "satisfatório" | Tabela 4, coluna Mean, PatSatis (p. 11) | "0.807 4.070 0.110 0.520" | `scripts/calculations/liu-2023-estilo-escrita-medicos.ts` |
| Emoji e "nós" por consulta | Os pediatras usaram em média 0,52 emoji e 0,11 pronome da primeira pessoa do plural por consulta | Tabela 4, coluna Mean, Inclusive e Emojis (p. 11) | "0.807 4.070 0.110 0.520" | |
| Emoji, "nós" e satisfação | Nas consultas em que o pediatra usou mais emoji, a marca de "satisfatório" de quem consultou veio com mais frequência, levando em conta o médico, o preço, o tempo de resposta e outras características (coeficiente 0,6059; p < 0,01); o mesmo valeu para o uso de "nós" (0,3198; p < 0,05) | 5.1 Hypothesis Test, Tabela 6, Modelo 1 (p. 11) | "the frequency of physicians’ use of emojis (β = 0.6059, p < 0.01) and inclusive language (β = 0.3198, p < 0.05) was positively associated with patient satisfaction" | |
| Emoji, "nós" e profundidade da conversa | Nas consultas em que o pediatra usou mais emoji, a conversa foi mais profunda (mais trocas sobre o mesmo assunto), levando em conta o médico, o mês e outras características (0,3064 por emoji; p < 0,01); o mesmo valeu para o uso de "nós" (1,3604; p < 0,01) | 5.1 Hypothesis Test, Tabela 5 (p. 11) | "the frequency of physicians’ emoji use (β = 0.3064, p < 0.01) and inclusive language (β = 1.3604, p < 0.01) have a significant positive effect on the depth of online interactions" | |
| Profundidade e satisfação | Consultas com conversa mais profunda receberam com mais frequência a marca de "satisfatório" (coeficiente 0,0575; p < 0,01) | 5.1 Hypothesis Test, Tabela 6, Modelo 2 (p. 12) | "(β = 0.0575, p < 0.01), supporting our research hypothesis H3." | |
| "Nós" com a profundidade na conta | Com a profundidade da conversa no mesmo cálculo, o coeficiente do uso de "nós" caiu para 0,2362 e ficou marcado na tabela só no nível menos exigente, de modo que pode ser acaso; o do emoji continuou acima do acaso | Tabela 6, Modelo 2 (p. 12) | "(0.0145) 0.2362" | |
| Parte que passa pela profundidade | Pelo teste de mediação dos autores, parte da ligação entre o número de emoji e a satisfação passa pela profundidade da conversa (intervalo de 95% de 0,008 a 0,028, que não inclui zero) | 5.1 Hypothesis Test (p. 13) | "the frequency of emoji use → depth of interaction → patient satisfaction path with 95% confidence intervals of [0.008, 0.028]" | |
| Muitos emoji | Os autores acharam uma curva em U invertido: a satisfação sobe com o número de emoji do pediatra até um ponto de virada perto de 9,6 emoji por consulta e cai depois dele (p = 0,012) | 5.3 Additional Analysis, Tabela 9 (p. 14) | "an extreme value point of 9.6 at the 5% level (confidence interval [7.087458, 16.534115], p = 0.012). That is, when physicians use emoticons more frequently than 9.6, it will decrease patient satisfaction." | |

Os coeficientes são os das tabelas dos autores. Os de satisfação vêm de uma regressão logística: um número positivo quer dizer que a marca de "satisfatório" aparece com mais frequência quando a contagem sobe, mas o número não é uma porcentagem. Os de profundidade vêm de uma regressão linear: é quanto a profundidade sobe a cada emoji ou "nós" a mais. O p é a chance de uma ligação daquele tamanho aparecer só por acaso; 0,05 é o limite usual. Na Tabela 6, um asterisco marca p < 0,1, dois marcam p < 0,05 e três marcam p < 0,01. O intervalo de 95% dá a faixa provável do valor; quando não inclui zero, a ligação não parece acaso.

## Limitações

- O estudo não é sobre namoro: são consultas médicas de pediatria por escrito, e quem consulta costuma ser o responsável pela criança, não o paciente.
- Os dados só observam o que aconteceu nas consultas; ninguém sorteou o uso de emoji. O artigo usa palavras de causa ("impacto", "aumentou a satisfação"), mas os resultados mostram associações. Os autores levam em conta o médico e o mês e repetem a conta da profundidade usando o estilo médio do médico no mês anterior (Tabela 8), mas isso não exclui que consultas mais tranquilas tenham, ao mesmo tempo, mais emoji e mais satisfação.
- A satisfação é uma marca de sim ou não. O 0 junta tudo que não foi "satisfatório", e o artigo não diz se inclui quem não deixou avaliação nenhuma.
- A curva em U invertido depende de consultas com muitos emoji. O artigo não diz quantas passaram de 9,6; a Tabela 4 dá média de 0,52 emoji por consulta, desvio-padrão de 1,35 e máximo de 19.
- Duas tabelas trazem erros. Na Tabela 4, a média da nota de recomendação do médico (GoodR) aparece como 5064, acima do máximo de 4,5 da mesma linha. Na Tabela 5, a linha de polidez do paciente (P_Civility) no Modelo 3 repete os números da linha do nível do hospital (−0,5216 e 1,9302).
- Os autores dizem que, por privacidade, não tiveram acesso a características de quem consultou, como gênero e escolaridade, e que a maioria das consultas era de doenças leves.
- O artigo declara que não se aplica uma aprovação de comitê de ética.
- No PDF, as páginas com figuras (8, 9, 15, 17 e 18) trazem por cima o texto de uma versão de revisão; os números desta Ficha vêm das páginas sem essa sobreposição.
