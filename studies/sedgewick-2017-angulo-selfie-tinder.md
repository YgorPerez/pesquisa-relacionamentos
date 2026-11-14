---
reference: "Sedgewick JR, Flath ME, Elias LJ. *Presenting Your Best Self(ie): The Influence of Gender on Vertical Orientation of Selfies on Tinder*. Frontiers in Psychology 8:604, 2017. Texto completo aberto: https://www.frontiersin.org/articles/10.3389/fpsyg.2017.00604/full"
link: https://doi.org/10.3389/fpsyg.2017.00604
status: verified
verified_on: 2026-11-14
strength: weak
strength_reason: "Fotos de perfil vistas num só dia, por dois perfis criados pelos autores, numa só região; o ângulo é a impressão de seis assistentes, com concordância que os autores chamam de moderada, e o artigo traz números que não fecham entre si, inclusive na tabela principal."
countries: [Canadá]
period: "10 de maio de 2016"
sample:
  n: 556
  description: "962 fotos de perfil do Tinder coletadas em 10 de maio de 2016: 508 de mulheres de 18 a 44 anos (média de 24,43) e 454 de homens de 18 a 56 anos (média de 30,5). Os autores criaram dois perfis, um de homem que busca mulheres e um de mulher que busca homens, e coletaram os perfis que o app mostrou a até 160 km do campus da University of Saskatchewan, até não haver mais usuários disponíveis. Entraram na análise as selfies comuns, sem as de espelho, em que pelo menos quatro de seis avaliadores concordaram sobre o ângulo: 556 pela soma da Tabela 1, 207 de homens e 349 de mulheres. O resumo fala em 557."
  representative: false
design: cross-sectional
conflict: "Financiado pelo Natural Sciences and Engineering Research Council of Canada. Os autores declaram ausência de relações comerciais ou financeiras que pudessem constituir conflito de interesse."
license: "Creative Commons Attribution License (CC BY), como diz a última página do artigo."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 56 }
  couple: different-sex
---

# Sedgewick et al. (2017): ângulo da câmera nas selfies de perfil do Tinder

## O que mediu

Os autores coletaram a foto principal de perfis do Tinder e separaram as selfies. Seis assistentes de pesquisa, que não conheciam as hipóteses, olharam cada selfie e disseram se se sentiam acima, abaixo ou na mesma altura da pessoa da foto. Câmera de cima valeu +1, de baixo −1 e de frente 0, e a pose de cada selfie é a que pelo menos quatro dos seis apontaram. O estudo compara esse ângulo nas selfies de homens e nas de mulheres.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Selfies analisadas | 556 selfies, 207 de homens e 349 de mulheres. O artigo não escreve esse total: ele sai da soma das contagens da tabela | Tabela 1, p. 3 | "Men 35 (16.9%) 79 (38.2%) 93 (44.9%) Women 58 (25.5%) 89 (16.6%) 202 (57.9%)" | `scripts/calculations/sedgewick-2017-angulo-selfie-tinder.ts` |
| Selfie como foto de perfil | A foto de perfil era uma selfie em 90% dos perfis de mulheres coletados e em mais da metade dos perfis de homens | Métodos, Sampling, p. 3 | "Selfies accounted for 54% of men’s and 90% of women’s profile pictures." |  |
| Quem julgou o ângulo | Seis assistentes de pesquisa, três homens e três mulheres, que não conheciam as hipóteses do estudo | Métodos, Coding, p. 3 | "coded by six research assistants (three males, three females) blind to the hypotheses of the study" |  |
| Selfies com a câmera inclinada | A câmera vinha de cima ou de baixo em 55,1% das selfies de homens e em 42,1% das de mulheres; nas outras, vinha de frente | Resultados, p. 3; os mesmos percentuais saem da Tabela 1 | "profile photos with an above or below orientation were presented in 55.1% and 42.1% of pictures, respectively" |  |
| Ângulo nas selfies de homens | A câmera vinha de baixo em 38,2% das selfies de homens, de cima em 16,9% e de frente em 44,9% | Tabela 1, linha "Men" (colunas Above, Below, Frontal), p. 3 | "Men 35 (16.9%) 79 (38.2%) 93 (44.9%)" |  |
| Selfies de homens: de baixo ou de cima | Havia mais selfies de homens com a câmera de baixo do que de cima, e a diferença dificilmente é acaso (t = −4,291; p < 0,001) | Resultados, p. 3 | "men oriented the camera more often from below, t (206) = −4.291, p < 0.001" |  |
| Selfies de mulheres com a câmera de frente | 57,9% das selfies de mulheres tinham a câmera de frente | Tabela 1, linha "Women", coluna Frontal, p. 3 | "202 (57.9%)" |  |
| Ângulo: homens comparados com mulheres | Os autores leem o teste assim: nas selfies de homens a câmera vinha de baixo mais vezes que nas de mulheres, e a diferença dificilmente é acaso (F = 24,94; p < 0,001) | Resultados, p. 3 | "A significant difference between groups was revealed, F (1, 398.4) = 24.94, p < 0.001, η2 = 0.03, demonstrating that men oriented the camera more often from below" |  |

O "t" e o "F" são os números dos testes: quanto mais longe de zero, mais difícil a diferença ser acaso. O "p" é a chance de uma diferença daquele tamanho aparecer só por acaso; por convenção, abaixo de 0,05 a diferença é tida como improvável de ser acaso. O t dos homens compara a média das selfies deles com zero, que seria a câmera de frente; o sinal de menos quer dizer "de baixo".

O artigo afirma também que, nas selfies de mulheres, a câmera vinha de cima mais vezes do que de baixo (t = 2,577; p = 0,01). Essa metade do resultado não entrou como linha porque a Tabela 1 se contradiz justamente aí; a conta está nas Limitações.

## Limitações

- A Tabela 1 se contradiz nas selfies de mulheres. Ela imprime 58 selfies de cima com 25,5% e 89 de baixo com 16,6%, mas 58 em 349 são 16,6% e 89 em 349 são 25,5%: contagens e percentuais estão trocados, e a linha de totais segue as contagens impressas. A média (0,089), o t (2,577) e o F entre homens e mulheres (24,94) que o texto relata só saem com 89 de cima e 58 de baixo; com as contagens como estão impressas, haveria mais selfies de mulheres de baixo do que de cima (`scripts/calculations/sedgewick-2017-angulo-selfie-tinder.ts`). A Figura 2 (p. 4) mostra o mesmo que os percentuais: nas selfies de mulheres, a barra de cima fica perto de 25% e a de baixo perto de 17%. Lemos isso como troca de digitação nas duas contagens, mas a Ficha não afirma o sentido do ângulo nas selfies de mulheres.
- Outros números não fecham. O resumo fala em 557 selfies e a tabela soma 556. A introdução diz que 57% dos homens usavam selfie; o resumo e os métodos dizem 54%. Os métodos dizem que o conjunto final tinha 665 selfies, 247 de homens e 457 de mulheres, que somam 704; a diferença, 39, é o número de selfies de espelho excluídas. Tirando de 665 as 95 descartadas por falta de acordo ficam 570, não 556. O desvio-padrão dos homens aparece igual ao das mulheres (0,644), e pelas contagens seria 0,713. Os tamanhos de efeito impressos (d = 0,598 e 0,276) são cerca do dobro da média dividida pelo desvio-padrão, e a Ficha não os usa.
- Os autores chamam de moderada a concordância entre os avaliadores (κ = 0,4) e dão para ela um intervalo de confiança, de 0,035 a 0,044, que não contém o próprio valor. As 95 selfies sem acordo de quatro avaliadores (14%) saíram da análise; os autores dizem que nelas a divisão costumava ser entre uma pose inclinada e a de frente.
- O ângulo é a impressão de quem olha, em três categorias. Os autores dizem que não puderam comparar o grau de inclinação, só o sentido.
- São fotos de um único dia, mostradas a dois perfis, a até 160 km de uma universidade do Canadá. Só entram perfis de homens mostrados a uma mulher que busca homens e perfis de mulheres mostrados a um homem que busca mulheres. Não é amostra dos usuários do Tinder em geral, nem do Brasil.
- Os homens dos perfis eram mais velhos que as mulheres (30,5 contra 24,43 anos, em média), e a comparação não leva a idade em conta.
- O estudo só olhou as fotos. Não perguntou aos donos dos perfis por que escolheram aquela foto, nem mediu se o ângulo muda a altura, o poder ou a atração que alguém vê na pessoa. A explicação dos autores, de que homens buscariam parecer mais altos e mulheres mais baixas, é interpretação deles. Eles mesmos levantam outras: a experiência com fotografia e com selfies, e o ângulo de cima ser tido como mais favorável ao rosto.
- O artigo não diz quem separou as selfies das outras fotos, nem por qual critério além da definição de selfie que adota.
