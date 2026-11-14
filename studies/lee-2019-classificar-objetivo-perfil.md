---
reference: "van der Lee C, van der Zanden T, Krahmer E, Mos M, Schouten A. *Automatic identification of writers' intentions: Comparing different methods for predicting relationship goals in online dating profile texts*. Proceedings of the 5th Workshop on Noisy User-generated Text (W-NUT 2019), p. 94–100, Hong Kong, 2019. Texto completo aberto: https://aclanthology.org/D19-5512.pdf"
link: https://doi.org/10.18653/v1/D19-5512
status: verified
verified_on: 2026-11-14
strength: weak
strength_reason: "Artigo curto de workshop, com 300 textos de um único site de namoro holandês avaliados por 152 universitários que concordaram pouco entre si; os acertos ficam pouco acima do acaso e o objetivo é o que a pessoa marcou no site."
countries: [Holanda]
period: "não informado no texto lido"
sample:
  n: 300
  description: "300 textos de perfil de um site de namoro popular na Holanda, de 50 a 100 palavras e em holandês, metade de quem marcou relação duradoura e metade de quem marcou encontro, tirados ao acaso dos 12.310 perfis que o texto diz ter coletado. Cada texto foi avaliado por cerca de três dos 152 universitários que participaram em troca de crédito de curso (68% mulheres, idade média de 21,8 anos). Os programas treinaram com outros 2.928 textos do mesmo site."
  representative: false
design: platform
conflict: "Apoio do RAAK-PRO SIA (2014-01-51PRO) e da Organização Neerlandesa para a Pesquisa Científica (NWO 360-89-050). Os cinco autores são da Tilburg University. O artigo não traz declaração de conflito de interesse."
license: "CC BY 4.0 (Creative Commons Attribution 4.0 International License, como diz a página do artigo na ACL Anthology)"
covers: {}
---

# van der Lee et al. (2019): adivinhar pelo texto do perfil o que a pessoa procura

## O que mediu

Os autores coletaram textos de perfil de um site de namoro holandês junto com o objetivo que cada pessoa marcou no site: relação duradoura ou encontro (*date*). Depois compararam três jeitos de adivinhar esse objetivo só pelo texto: universitários que leram os textos, um programa treinado com as palavras dos textos e um programa treinado com as notas do LIWC, um dicionário que conta palavras por tema. As pessoas também deram nota a seis temas de cada texto (status, aparência física, emoção positiva e o quanto a pessoa fala de si, do leitor e de "nós") e marcaram as palavras em que basearam o palpite. O interesse dos autores é o método de análise de texto, não o namoro online.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Objetivo marcado nos perfis coletados | Dos perfis coletados, 87% marcavam relação duradoura e 13% encontro | Tabela 1 (p. 95), linha Full: o primeiro número é o de textos de relação duradoura e o último, o de textos de encontro | "10,696 1,464 150 863,227 117,947 11,886 1,634" | `scripts/calculations/lee-2019-classificar-objetivo-perfil.ts corpus` |
| Acerto das pessoas | As pessoas acertaram o objetivo de quem escreveu em 57% dos palpites, com dois objetivos possíveis e metade dos textos de cada um | Tabela 3 (p. 96), coluna Human: precisão, recall, F1 e acurácia (o último número) | "0.55 0.67 0.60 0.57" | `scripts/calculations/lee-2019-classificar-objetivo-perfil.ts human` |
| Acerto do programa que lê as palavras | O programa treinado com as palavras dos textos acertou 62% | Tabela 3 (p. 96), colunas Word e Meta, iguais: precisão, recall, F1 e acurácia (o último número) | "0.61 0.65 0.63 0.62" | `scripts/calculations/lee-2019-classificar-objetivo-perfil.ts word` |
| Acerto do programa com o dicionário LIWC | O programa treinado com as notas do LIWC acertou 56% | Tabela 3 (p. 96), coluna LIWC: precisão, recall, F1 e acurácia (o último número) | "0.54 0.87 0.67 0.56" | `scripts/calculations/lee-2019-classificar-objetivo-perfil.ts liwc` |
| Pessoas contra o acaso | Os palpites das pessoas acertaram mais do que um chute acertaria (χ²(1) = 17,58; p < 0,001) | 3.2 (p. 97) | "humans: χ2 (1) = 17.58, p < .001" | |
| Pessoas contra programas | Nenhum dos jeitos de adivinhar acertou mais que os outros: a diferença entre eles pode ser acaso (χ²(3) = 4,22; p = 0,24) | 3.2 (p. 97) | "not significant chi-square test (χ2 (3) = 4.22, p = .24), meaning that there was no method that performed significantly better than any other" | |
| Concordância entre as pessoas | As pessoas concordaram pouco entre si sobre o objetivo de um mesmo texto (α de Krippendorff = 0,24) | 2.3 (p. 95–96); a frase começa na p. 95 com "Krippendorff's α" e o número está no alto da p. 96 | "= 0.24). These predictions were used as a baseline for the relationship goal classification task." | |
| Dificuldade da tarefa | Os autores chamam a tarefa de difícil: acertos baixos em todos os jeitos de adivinhar e pouca concordância entre as pessoas | 4 (p. 98) | "Relationship goal prediction turned out to be a difficult task (low accuracy scores overall, and low inter-rater agreement)." | |
| Notas das pessoas e dos programas para os temas | As notas que os programas deram aos seis temas andaram junto com as das pessoas, mas de forma fraca a moderada (r de 0,13 a 0,51) | 3.1 (p. 97) | "the correlation coefficients are relatively low (ranging from .13 to .51), which indicates a weak to moderate relationship" | |
| Palavras em que as pessoas se basearam | Entre as palavras fora do LIWC, as que as pessoas mais marcaram como pista de relação duradoura foram "procurar", "conhecer", "empreender", "doce", "bonito", "desejo de ter filhos" e "pessoa de família"; como pista de encontro, "date", "legal", "pessoas", "espontâneo", "terraço" e "aproveitar" | Tabela 5 (p. 98), linha Human; a cor de cada palavra (azul para relação duradoura, vermelho para encontro) só aparece no PDF, não no texto extraído | "Human seek, date, nice, know, people, undertake, spontaneous, sweet, terrace, pretty, enjoy, child wish, family person" | |
| A mesma palavra lida ao contrário | "Espontâneo" e "legal" foram pista de encontro para as pessoas e pista de relação duradoura para o programa que lê as palavras | Tabela 5 (p. 98), linha Classifier, comparada com a linha Human; a cor só aparece no PDF | "date, spontaneous, let, live, nature, sociable, send, build, exercise, nice, independent, again, friendship, sea, girl, terrace" | |
| "Espontâneo" nos dois grupos | Pelo teste que o artigo traz para a palavra "espontâneo", os dois grupos não se separam (χ²(1) = 0,13; p = 0,72), embora as pessoas e o programa a tenham tratado como pista | 3.3 (p. 97) | "‘spontaneous’ (χ2 (1) = 0.13, p = .72, but distinctive according to humans and Gini Importances)" | |

A acurácia é a parte dos palpites que acertou. Como havia dois objetivos e metade dos textos de cada um, um chute acertaria perto da metade. O χ² é o teste que compara os acertos com o acaso ou entre os métodos, e o p indica quão fácil seria um resultado assim aparecer só por acaso: quanto menor, mais difícil. O α de Krippendorff vai até 1, que é concordância total; perto de 0, as pessoas concordam tanto quanto concordariam chutando. O r vai de −1 a 1 e diz o quanto duas notas andam juntas. A coluna Meta da Tabela 3 é um programa que junta os outros dois e teve os mesmos números do programa de palavras.

As palavras da Tabela 5 são traduções nossas das traduções para o inglês que o artigo faz do holandês, e só entram as que o LIWC não tem. Na linha de "espontâneo", o artigo não diz qual teste é o χ²; pelo contexto, é a comparação da frequência da palavra nos dois grupos de textos (razão de verossimilhança), a terceira medida que os autores usam além das marcações das pessoas e do programa.

## Limitações

- Os próprios autores dizem que o conjunto de teste é pequeno (300 textos) e que os resultados poderiam ser outros com mais dados.
- Quem leu os textos eram 152 universitários, 68% mulheres, com idade média de 21,8 anos, e não usuários do site. O artigo não diz a idade nem o gênero de quem escreveu os perfis.
- O objetivo "verdadeiro" é o que a pessoa marcou no site, entre duas opções. Quem marcou uma pode querer a outra, ou as duas.
- Um site só, em holandês, com textos de 50 a 100 palavras. O artigo não nomeia o site nem diz quando os perfis foram coletados.
- Nos perfis coletados, quem marcou encontro era minoria. O teste usou metade de cada objetivo, o que não é a proporção dos perfis coletados: com 87% de relação duradoura, dizer sempre "relação duradoura" acertaria 87%, mais que qualquer um dos métodos.
- O texto fala em 12.310 perfis, mas a Tabela 1 soma 12.330 (10.696 e 1.634). A porcentagem da primeira linha usa a soma da tabela.
- O teste de que nenhum método foi melhor junta cerca de 900 palpites das pessoas com 300 de cada programa; não achar diferença com tão poucos textos não mostra que os métodos são iguais.
- É um artigo curto de workshop de linguística computacional. O apêndice com os detalhes dos modelos fica num arquivo à parte da ACL Anthology, fora da Fonte local.
- A direção de cada palavra da Tabela 5 está só na cor do PDF, e o artigo não traz quantas vezes cada uma foi marcada.
