---
reference: "Fan J, Chen YM, Zhang L, Wu Y, Liu XF. *Attraction behind “Beauty”: Revealing Gay Men’s Self-Presentation on a Dating App with Computer Vision*. Computational Communication Research 5(1):51, 2023. Texto lido: o preprint no OSF, versão 1, de fevereiro de 2023 (https://doi.org/10.31235/osf.io/vtzhp); a versão da revista não foi lida."
link: https://doi.org/10.5117/CCR2023.1.002.JIAM
license: "CC BY 4.0 (o preprint no OSF, como diz a página dele: CC-By Attribution 4.0 International)"
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "10.334 perfis que o Finka mostrou a três contas de pesquisa em três dias de 2021, numa análise que só observa: as curtidas se acumulam por um tempo de conta que o estudo não conhece, o app dá mais exposição às fotos já populares, a beleza do rosto foi julgada por programas que concordaram só em parte com codificadores humanos, e o texto lido é um preprint com números que não fecham."
countries: [China]
period: "18 a 20 de janeiro de 2021"
sample:
  n: 10334
  description: "10.334 perfis públicos do Finka, app chinês de namoro para homens gays, que o app mostrou a três contas novas abertas pela equipe, com um robô simulando os deslizes de tela. De cada perfil entraram a foto, o número de curtidas e os campos de texto (idade, altura, peso, distância, papel sexual, situação amorosa e outros). O segundo modelo usa 6.234 perfis de quem mostra o rosto. O texto não diz onde ficavam as contas nem como o app escolhe quem mostrar."
  representative: false
design: platform
conflict: "O preprint não traz declaração de financiamento nem de conflito de interesse."
covers:
  genders: [man]
  seeks: [men]
  couple: same-sex
  ages: { min: 18, max: 91 }
---

# Fan et al. (2023): rosto, corpo e cenário nas fotos de um app chinês para homens gays

## O que mediu

A equipe coletou com um robô os perfis públicos que o Finka, o maior app chinês de namoro para homens gays no formato de deslizar, mostrou a três contas novas. Programas de visão computacional classificaram a foto de cada perfil: quanto do rosto aparece, se o rosto é bonito (em dois níveis, alto e baixo), a expressão do rosto, quanto do corpo aparece (por um classificador de nudez) e o cenário ao fundo (nenhum, lugar público ou lugar privado). O formato do corpo veio do índice de massa corporal (IMC), calculado com a altura e o peso que o próprio perfil informa. Codificadores humanos conferiram uma amostra de cada classificação.

A popularidade é o número de curtidas que o perfil mostra. Dois modelos de regressão relacionam essas medidas da foto com a raiz quadrada das curtidas, levando em conta o quanto o perfil preencheu os campos de texto: um com todos os perfis e outro só com os que mostram o rosto.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Perfis coletados | 10.334 perfis do Finka | Data, p. 7 | "A total of 10,334 user profiles were collected." |
| Quando foi a coleta | De 18 a 20 de janeiro de 2021 | Data, p. 7 | "January 18, 2021 to January 20, 2021" |
| Rosto na foto | 47,97% dos perfis mostravam o rosto inteiro, 34,78% em parte e 17,25% não mostravam o rosto | Results, p. 9 | "Nearly half of the 10,334 users (47.97%) fully disclosed their faces, many users (34.78%) partially disclosed their faces, and a few (17.25%) did not disclose their faces" |
| Corpo na foto | 93,79% dos perfis mostravam pouco do corpo, pela medida de nudez do programa | Results, p. 9 | "93.79% of the total sample" |
| Cenário da foto | 37,84% das fotos não tinham cenário reconhecível, 35,37% eram em lugar público e 26,80% em lugar privado | Results, p. 9 | "accounted for 37.84%, 35.37%, and 26.80% of all photos" |
| Curtidas por perfil | Em média 2.682,93 curtidas por perfil, com mediana de 1.310,5: poucos perfis concentram muitas curtidas | Results, p. 9 | "The mean value of likes received was 2,682.93 (median = 1,310.5; standard deviation = 3,952.75)" |
| Corpo à mostra e curtidas | Com todos os perfis e levando em conta rosto, cenário e textos, fotos com o corpo moderadamente ou muito à mostra andaram junto com mais curtidas que fotos com pouco corpo (beta = 0,074 e 0,042; p < 0,001) | Table 3 e texto, p. 11 | "popular (beta = 0.074, p < 0.001; beta = 0.042, p < 0.001)" |
| Cenário e curtidas | Levando em conta o resto, fotos em lugar privado, como casa e quarto, andaram junto com mais curtidas que fotos sem cenário (beta = 0,193), e fotos em lugar público também, menos (beta = 0,126) | Table 3 e texto, p. 11 | "private scenes (e.g., home and bedroom) had a higher coefficient (beta = 0.193) than public scenes (beta = 0.126)" |
| Rosto à mostra e curtidas | Com todos os perfis, mostrar o rosto em parte ou inteiro andou junto com mais curtidas que não mostrar (beta = 0,042 e 0,070) | Table 3 e texto, p. 11 | "affected popularity (beta = 0.042, p < 0.01; beta = 0.070, p < 0.001)" |
| Rosto em parte ou inteiro | Entre os perfis que mostram o rosto, não apareceu diferença de curtidas entre mostrar o rosto em parte e inteiro | Table 3 e texto, p. 11 | "there was no significant difference in user popularity between users with low and high facial exposure" |
| Beleza do rosto e IMC | Entre os perfis que mostram o rosto, rosto julgado bonito pelos programas andou junto com mais curtidas (beta = 0,038), e IMC na faixa que o estudo chama de saudável também (beta = 0,103) | Table 3 e texto, p. 11 | "facial attractiveness and body shape (beta = 0.038, p < 0.01; beta = 0.103, p <" |
| Expressão do rosto | Não apareceu diferença de curtidas entre fotos com e sem expressão no rosto | Multiple linear regression analysis, p. 10 | "the distribution of the number of likes exhibited no significant difference regardless of whether the characters had expressions" |
| Quanto as medidas explicam, todos os perfis | Com todos os perfis, rosto, corpo, cenário e preenchimento dos textos explicam muito pouco da diferença de curtidas entre perfis (R² ajustado = 0,038) | Table 3, p. 10 | "N = 10,334 adjusted R = 0.038" |
| Quanto as medidas explicam, perfis com rosto | Só com os perfis que mostram o rosto, e com a beleza do rosto e o IMC no modelo, explicam um pouco mais (R² ajustado = 0,104) | Table 3, p. 10 | "N = 6,234 adjusted R2 = 0.104" |
| Lugares mais curtidos | Entre os lugares públicos, academia e campo de atletismo foram os mais curtidos, com média acima de 4.000 curtidas; entre os privados, vestiário e quarto | Figure 2 e texto, p. 11 | "with an average of more than 4,000 likes, while among private scenes, the locker room and bedroom were the most popular" |
| Quarto como cenário | O quarto apareceu em 1.563 fotos, bem mais que qualquer outro cenário | Results, p. 11 | "reached 1,563 times, which was much higher than that of the other scenes" |
| Programa contra pessoas, beleza do rosto | Na beleza do rosto, o programa que mais concordou com os codificadores humanos chegou a kappa = 0,581, menos que o programa escolhido para cada uma das outras classificações | Appendix B, p. 18 | "attractiveness accuracy was 0.621 and 0.581" |

O beta é o coeficiente padronizado da regressão: diz quanto as curtidas sobem ou descem junto com cada medida, já levando em conta as outras do modelo; perto de zero é quase nada. Os betas da foto que passaram do limite de 5% ficam entre 0,04 e 0,23. O R² ajustado é a parte da diferença de curtidas entre perfis que o modelo inteiro explica: 0,038 é menos de 4%. O kappa mede a concordância além do acaso, de 0 a 1.

Nas linhas "Quanto as medidas explicam", o Trecho é o cabeçalho da Tabela 3 como sai do PDF, onde o expoente do R² se solta ou vira um 2 comum.

O segundo modelo, só com quem mostra o rosto, repete o corpo à mostra (beta = 0,06 e 0,04) e o cenário (0,12 para o público e 0,23 para o privado), pela Tabela 3. Os autores leem o resultado do cenário como um "efeito ambiente": o cenário daria pistas sociais à foto, e os lugares íntimos despertariam desejo. Eles também dizem que os cenários privados podem ser comuns por terem espelho, o que facilita a selfie. O estudo não testa nenhuma dessas leituras.

## Limitações

- O estudo só observa: as fotos não foram sorteadas nem trocadas. Os autores escrevem que as medidas "afetaram" e "influenciaram" as curtidas, mas os números mostram só o que andou junto.
- As curtidas são o total que o perfil mostra, acumulado por um tempo de conta que o estudo não conhece. Os autores dizem que o algoritmo de recomendação do app e o momento em que a foto foi posta podem mexer na popularidade, e contam que o Finka anunciou que fotos com muitas curtidas ganham exposição extra. Uma foto pode ter mais curtidas por ter sido mais mostrada.
- Os perfis são os que o app mostrou a três contas novas, em três dias. O texto não diz onde ficavam as contas nem como o app escolhe quem mostrar.
- A beleza do rosto foi julgada por programas de reconhecimento de rosto (Baidu e Face++), em dois níveis. A concordância com os codificadores humanos foi de 0,58 e 0,42 (kappa, Tabela B2), a mais baixa entre os programas escolhidos para cada classificação, e o texto não diz onde fica o corte entre rosto bonito e não. Os autores dizem que essas ferramentas vão mal em medidas subjetivas.
- O "formato do corpo" é o IMC calculado com a altura e o peso que o perfil informa, não com a foto. O estudo chama de saudável o IMC de 18,5 a 28,0, pela norma chinesa.
- O segundo modelo usa 6.234 perfis "com rosto à mostra", sem dizer como chegou a esse número. Pelas porcentagens do próprio texto, mostram o rosto inteiro ou em parte cerca de 8.551 dos 10.334 perfis, e só o rosto inteiro, cerca de 4.957. Nenhum dos dois dá 6.234.
- Os testes da expressão do rosto não acharam diferença de curtidas, e a hipótese 2 previa mais curtidas com expressão. Mesmo assim, o texto diz que o resultado "apoia" essa hipótese.
- Na Tabela 3, o peso do preenchimento dos textos passa de −0,006 (pode ser acaso) no primeiro modelo para −0,20 no segundo, sem comentário; a nota da tabela marca com três asteriscos p < 0,01, e o texto fala em p < 0,001.
- O texto lido é o preprint de fevereiro de 2023, não a versão publicada na revista. Os números da versão final podem ter mudado.
- O estudo é sobre um app só de homens gays na China. Os autores lembram que a falta de aceitação social leva muitos a esconder o rosto e o corpo, o que pode não valer em outros lugares nem entre heterossexuais.
