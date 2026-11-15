---
reference: "Nguyen D, Rosseel L. *Social Perceptions of English Spelling Variation on Twitter: A Comparative Analysis of Human and LLM Responses*. Preprint no arXiv (arXiv:2511.23041v1 [cs.CL]), 28 de novembro de 2025, sem revisão por pares. O PDF vem formatado para a revista Computational Linguistics, sem dados de submissão nem de aceite."
link: https://doi.org/10.48550/arXiv.2511.23041
license: "CC BY 4.0 (como diz a página do preprint no arXiv)"
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Preprint sem revisão por pares, com 217 participantes pagos do Prolific nascidos no Reino Unido, que os autores dizem não representar a população do país; cada um via as duas versões do mesmo tweet lado a lado, com a palavra sublinhada e sabendo que o estudo era sobre grafia, e dava notas a tweets curtos e neutros montados pelos autores."
countries: [Reino Unido]
period: "Notas humanas coletadas em setembro de 2023; respostas dos modelos de linguagem, não informado no texto lido (os modelos mais novos são de 2025)"
sample:
  n: 217
  description: "Participantes do Prolific nascidos no Reino Unido, com inglês como primeira língua e sem distúrbio de linguagem, pagos £1,35. Dos 230 recrutados, 13 saíram no controle de qualidade (10 por demorar demais e 3 fora do critério de local), e os 217 que ficaram deram 9.114 notas. 59% se identificaram como mulheres, 40% como homens e 1% de outro modo; 67% tinham conta no Twitter. O texto não dá a idade dos participantes. Cada pessoa viu 21 pares de tweets, um de cada um dos sete tipos de grafia para cada uma das três perguntas, cada um sorteado entre os pares daquele tipo, de um total de 70 pares. As mesmas perguntas foram feitas a 12 modelos de linguagem. Não são mensagens de paquera: são tweets curtos e neutros de desconhecidos."
  representative: false
design: experiment
conflict: "O financiamento de Dong Nguyen vem do programa Veni do Conselho Holandês de Pesquisa (NWO, projeto VI.Veni.192.130). O texto não traz declaração de conflito de interesse. A coleta foi aprovada pelo comitê de ética Science-Geo da Universidade de Utrecht."
covers:
  genders: [man, woman]
---

# Nguyen & Rosseel (2025): grafia fora do padrão em tweets, para pessoas e para modelos de linguagem

## O que mediu

Os autores montaram 70 pares de tweets curtos que diferem numa palavra só: uma versão com a grafia padrão do inglês e outra com uma de sete grafias fora do padrão. Os sete tipos são o "g" que cai no fim ("doin"), letra alongada que se pronuncia ("baaaad") ou que não se pronuncia ("funnnn"), vogais omitidas ("wknd"), número no lugar de sílaba ("l8"), letras trocadas de lugar ("certianly") e tecla vizinha ("shpuld"). Os tweets foram inspirados num corpus de tweets da região de Londres e editados para ficarem neutros.

Participantes britânicos do Prolific viam as duas versões lado a lado, com a palavra sublinhada, e davam a cada uma uma nota de formalidade e uma de cuidado de quem escreveu, numa régua de 0 a 100, e um palpite da idade de quem escreveu. As instruções diziam que o estudo era sobre grafia. Depois, os autores pediram as mesmas notas a 12 modelos de linguagem (GPT, Claude, Llama, Gemma, Qwen e DeepSeek) e compararam as respostas deles com as das pessoas.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quem deu as notas | 217 participantes britânicos do Prolific, com 9.114 notas no total | Seção 4.1.2, p. 11 | "Our final dataset contains 9,114 ratings by 217 participants." |
| Formalidade | Os participantes deram, em média, nota 66,2 de formalidade aos tweets com a grafia padrão e 22,0 aos mesmos tweets com a grafia fora do padrão | Seção 4.2, p. 11 | "Tweets with the conventional spelling variants are rated as more formal (Mean = 66.2, SD = 5.5) compared to the ones with the unconventional spellings (Mean = 22.0, SD=8.8)." |
| Cuidado de quem escreveu | Os mesmos participantes deram nota média 74,8 ao cuidado de quem escreveu com a grafia padrão e 32,8 ao de quem escreveu fora do padrão | Seção 4.2, p. 11 | "Tweets written with the conventional spelling are also rated as more careful (Mean = 74.8, SD=3.8 vs. Mean = 32.8, SD = 9.4)" |
| Idade de quem escreveu | Os participantes deram a quem escreveu com a grafia padrão, em média, 33,3 anos, e a quem escreveu fora do padrão, 22,4 anos | Seção 4.2, p. 11 | "perceived as written by older authors (Mean = 33.3, SD=2.7 vs. Mean = 22.4 years, SD = 3.0)" |
| Um exemplo com número no lugar de sílaba | Os participantes deram nota média 73,5 de formalidade a "Forever grateful" e 13,3 a "4ever grateful" | Seção 5.3, p. 15 | "“Forever grateful ” (Claude: 69.8, humans: 73.5) vs. “4ever grateful” (Claude: 20.0, humans: 13.3)" |
| Formalidade por tipo de grafia | Para os participantes, a formalidade caiu menos com letras trocadas de lugar (29,72 pontos) e com tecla vizinha (36,13 pontos) e mais com número no lugar de sílaba (55,64 pontos); o "g" que cai no fim tirou 47,47 pontos | Tabela 5, coluna Humans / Formality | "-47.47 -55.64 -29.72 -36.13" |
| Cuidado por tipo de grafia | Para os participantes, o cuidado de quem escreveu caiu mais com tecla vizinha (57,45 pontos) e com letras trocadas de lugar (50,13 pontos), os dois tipos que parecem erro de digitação, e menos com letra alongada que se pronuncia (32,15 pontos) | Tabela 5, coluna Humans / Carefulness | "-40.97 -34.36 -50.13 -57.45 -32.15" |
| Idade por tipo de grafia | No palpite dos participantes, a idade de quem escreveu caiu menos com letras trocadas de lugar (7,56 anos) e com tecla vizinha (7,62 anos) que com os outros tipos, que tiraram de 11,73 a 12,94 anos | Tabela 5, coluna Humans / Age | "-11.73 -12.05 -7.56 -7.62 -11.91 -12.94 -12.56" |
| Formalidade e cuidado | Nas notas dos participantes, os tweets mais formais tenderam a ser também os de quem pareceu mais cuidadoso (correlação de Spearman 0,69 entre as duas notas) | Seção 5.3, p. 16 | "formality and carefulness have a Spearman correlation of 0.69 in the human data" |
| Concordância entre as pessoas | Os participantes concordaram bastante entre si sobre quais tweets eram mais formais, mais cuidadosos ou de gente mais velha (0,787, 0,769 e 0,667), e bem menos sobre o tamanho da queda que cada grafia provocava (0,394, 0,416 e 0,253) | Seção 4.2, p. 11 | "0.787 (formality), 0.769 (carefulness) and 0.667 (age). We also consider the difference scores between ratings for the conventional and non-conventional forms (similar to sociolinguistic studies like Zenner, Rosseel, and Speelman 2021). We then obtain lower correlations: 0.394 (formality), 0.416 (carefulness) and 0.253 (age)." |
| Modelos de linguagem contra pessoas | Com as duas versões lado a lado, as notas do GPT-5 acompanharam de perto as dos participantes (0,901), mas bem menos no tamanho da queda que cada grafia provocava (0,524); no Claude-4.5-sonnet, de 0,910 para 0,414 | Seção 5.3, p. 14 | "GPT-5’s correlation with human ratings decreases from 0.901 (raw ratings) to 0.524 (rating differences) in the paired setup. The decrease with Claude-4.5-sonnet is even larger: from 0.910 to 0.414." |
| Tweet sozinho ou em par | Os modelos ficaram mais perto das pessoas quando viam as duas versões juntas, como as pessoas viram; no GPT-5, de 0,784 para 0,901 nas notas e de 0,166 para 0,524 na queda | Seção 5.3, p. 13 | "GPT-5’s correlation increases from 0.784 to 0.901 when correlating the raw ratings, and from 0.166 to 0.524 when correlating the rating differences" |
| Variação das notas | As notas de pessoas diferentes para o mesmo tweet variaram muito mais (desvio médio de 17,4 na formalidade, 18,2 no cuidado e 8,1 na idade) que as repetidas de um mesmo modelo (GPT-5: 6,7, 4,0 e 1,5) | Seção 5.3, p. 15 | "GPT-5’s average standard deviation is 6.7 for formality, 4.0 for carefulness and 1.5 for age; Claude-4.5-sonnet’s average standard deviation is 5.5 for formality, 4.6 for carefulness and 1.6 for age. In contrast, for humans this is 17.4 for formality, 18.2 for carefulness and 8.1 for age." |
| Palavras inventadas no lugar da grafia | Quando a grafia fora do padrão foi trocada por uma palavra inventada, os modelos ainda separaram as duas versões (Claude-4.5-sonnet: 0,782, contra 0,910 com a grafia real), mas deixaram de acompanhar o tamanho da queda que as pessoas deram | Seção 5.4, p. 18 | "Claude-4.5-sonnet obtains a correlation of 0.782, compared to 0.910 in the main experiment), but the correlations disappear when comparing the rating differences" |

As notas de formalidade e de cuidado vão de 0 (muito informal, muito descuidado) a 100 (muito formal, muito cuidadoso); a idade é um palpite em anos. Nos participantes, as três diferenças entre grafia padrão e fora do padrão deram p < 0,001, ou seja, dificilmente são acaso. A queda de cada tipo, na Tabela 5, é a média da nota da versão fora do padrão menos a da versão padrão. Os números entre parênteses nas linhas de concordância e de modelos são correlações de Spearman, que vão de −1 a 1: perto de 1, as duas listas de notas põem os tweets quase na mesma ordem; perto de 0, não têm ligação. Na linha de concordância, cada participante é comparado com a média dos outros.

## Limitações

- É um preprint sem revisão por pares. Os autores dizem que os dados e o código serão publicados depois.
- Os participantes são pessoas pagas do Prolific nascidos no Reino Unido, e os autores dizem que eles não formam uma amostra representativa da população do país. O texto não dá a idade deles, e a grafia e os tipos estudados são do inglês.
- O desenho põe a atenção na grafia: cada pessoa via as duas versões lado a lado, com a palavra sublinhada, e as instruções diziam que o estudo era sobre grafia. Os autores escolheram isso de propósito e reconhecem que fica longe de ler um tweet solto, sem nada marcado. O tamanho das diferenças pode ser maior do que numa leitura comum.
- Os tweets são curtos, neutros e editados pelos autores, e só a palavra marcada muda. Não são mensagens de paquera nem conversas: quem dá a nota é um desconhecido diante do tweet de outro desconhecido. O estudo não mede se alguém responderia, só formalidade, cuidado e idade.
- O texto tem pequenas inconsistências que não mudam os números da tabela: o modelo da Llama 3.1 aparece como 450b e como 405b, uma nota de rodapé fala de um modo "complex" que não existe no resto do texto, e a legenda da Tabela 3 fala em notas de "informality" para uma régua em que 100 é muito formal.
