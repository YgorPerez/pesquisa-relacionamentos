---
reference: "Kalra A, Peterson B. *Photofeeler-D3: A Neural Network with Voter Modeling for Dating Photo Impression Prediction*. Em: Proceedings of the Future Technologies Conference (FTC) 2019, Advances in Intelligent Systems and Computing, p. 188–203, 2019. Lido no preprint aceito: https://arxiv.org/abs/1904.07435v3"
link: https://doi.org/10.1007/978-3-030-32523-7_13
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Estudo comercial: o segundo autor é cofundador e diretor de tecnologia da Photofeeler, os dados são os votos do site da empresa e o jeito de pesar e normalizar os votos fica em segredo; o artigo mede o quanto uma rede neural prevê esses votos, não o que a foto muda em matches ou encontros, e foi lido no preprint."
countries: []
period: "não informado no texto lido"
sample:
  n: 1200000
  description: "1,2 milhão de fotos de namoro enviadas ao Photofeeler, um site em que os usuários sobem fotos e recebem votos de outros usuários em troca dos votos que dão: 1 milhão de fotos de 200 mil homens e 200 mil fotos de 50 mil mulheres. Cada voto vem de alguém do outro sexo e dá uma nota de 0 a 3 para o quanto a pessoa da foto parece inteligente, confiável e atraente. Para o teste, 10.000 fotos de homens e 8.000 de mulheres, recentes, com pelo menos 10 votos e de pessoas que não estavam no treino. O artigo não diz de onde são os usuários."
  representative: false
design: platform
conflict: "O segundo autor (Peterson) é cofundador e diretor de tecnologia (CTO) da Photofeeler Inc., dona dos dados; o primeiro (Kalra) aparece como consultor de visão computacional da empresa e, segundo o artigo, foi parceiro de pesquisa durante o projeto sem ser empregado dela. O artigo não traz declaração de financiamento."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Kalra & Peterson (2019): a impressão que uma foto de namoro passa, prevista por uma rede neural

## O que mediu

O Photofeeler é um site em que a pessoa sobe fotos e outros usuários, sempre do outro sexo, dão a cada uma uma nota de 0 (não) a 3 (muito) para o quanto ela parece inteligente, confiável e atraente; o site pesa e normaliza esses votos para chegar à nota da foto. Os autores treinaram uma rede neural com 1,2 milhão dessas fotos para prever a nota de cada traço e compararam a nota da rede com a média dos votos em fotos que ela não tinha visto. Também contaram a quantos votos de pessoas a nota da rede equivale. O artigo é sobre o método de previsão; não mede matches, conversas nem encontros.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| O banco de fotos | 1,2 milhão de fotos de namoro: 1 milhão de fotos de 200 mil homens e 200 mil fotos de 50 mil mulheres | 3.1, p. 4 | "The PDD contains 1.2 million dating photos - 1 million male images of 200k unique male subjects and 200k female images of 50k unique female subjects." |
| Quem vota | Todos os votos de uma foto vêm de pessoas do outro sexo que o da pessoa da foto | 3.1, p. 4 | "All voters are the opposite sex of the subject in the photo." |
| Como se vota | Quem sobe fotos recebe votos de acordo com quantos votos dá; quem vota vê a foto e dá nota de 0 (não) a 3 (muito) à impressão de cada traço | 3.1, p. 4 | "Users upload their images and then receive votes based on how many votes they cast. The voters are given an image and told to rate their impression of each trait on a scale of 0 (No) to 3 (Very)." |
| Peso dos votos | O site pesa e normaliza os votos de cada pessoa conforme o jeito dela de votar, mas o artigo não mostra como, porque é propriedade intelectual da Photofeeler | 3.1, p. 4 | "We exclude the weighting and normalization algorithms since they are Photofeeler Intellectual Property" |
| Fotos de teste | Ficaram para o teste 10.000 fotos de homens e 8.000 de mulheres, de pessoas que não estavam nas fotos de treino, cada uma com pelo menos 10 votos | 3.1, p. 4 | "We separate out 10000 male subject images and 8000 female subject images to be used for testing. We guarantee that these images are of subjects not found in the training set and contain at least 10 votes" |
| Fotos que somem | Segundo os autores, as fotos com mais votos tendem a ter notas mais altas, porque o usuário costuma trocar mais rápido a foto que recebe nota baixa | 3.1, p. 4 | "images with a higher number of votes tend to have higher scores because images getting low scores tend to be replaced more quickly by the user." |
| Nota da foto, não da pessoa | As notas são dadas à foto, não à pessoa; o artigo mostra como exemplo quatro fotos da mesma pessoa com notas diferentes, mas não conta quanto a nota costuma variar entre fotos da mesma pessoa | Figura 1, p. 2 | "Four example photos of the same subject with different scores from the Photofeeler Dating Dataset." |
| Rede contra a média dos votos | Nas fotos de teste, a nota prevista pela rede acompanhou de perto a média dos votos do site: nas fotos de mulheres, 81,4 para inteligente, 83,2 para confiável e 81,6 para atraente; nas de homens, 80,4, 80,6 e 74,3, a mais baixa sendo a de homem atraente (correlação de Pearson, em %) | Tabela 2, p. 7 | "Dataset Large Female Large Male Smart 81.4 80.4 Trustworthy 83.2 80.6 Attractive 81.6 74.3" |
| A rede vale quantos votos | Comparada com a média de muitos votos da mesma foto, a nota da rede acertou, em média, tanto quanto 10 votos crus de pessoas, ou 4,2 votos já pesados e normalizados pelo site; os autores leem que ela é melhor que o voto de uma pessoa sozinha | 4.2, p. 7 | "Table 3 shows that the model is worth an averaged 10.0 raw votes and 4.2 normalized, weighted votes - which means it is better than any single human." |
| Votos por traço | Em votos pesados pelo site, a nota da rede valeu menos votos para "atraente" (2,7 nas fotos de mulheres e 3,1 nas de homens) que para "inteligente" (4,4 e 4,9) e "confiável" (5,0 e 5,2) | Tabela 3, colunas Norm. Votes? = yes, p. 8 | "Smart (#votes) 4.4 11.6 4.9 11.2 Trustworthy (#votes) 5.0 14.5 5.2 11.6 Attractive (#votes) 2.7 5.2 3.1 5.9" |
| Concordância entre quem vota | Na nota de atraente, os autores dizem que os votos de homens em fotos de mulheres concordam mais entre si que os de mulheres em fotos de homens, e leem que a atratividade masculina numa foto é mais difícil de prever, tanto para pessoas quanto para a rede; o artigo não mostra os números dessa concordância | 4.2, p. 7 | "female attractiveness has a significantly higher correlation on the test set than male attractiveness, yet it is worth close to the same number of human votes. This is because male votes on female subject images have a higher correlation with each other than female votes on male subject images. This shows not just that predicting male attractiveness from photos is a more complex task than predicting female attractiveness from photos, but that it is equally more complex for humans as for AI." |
| Poucos votos contra muitos | No banco do site, a média de 10 votos crus de uma foto acompanha a média de todos os votos dela, mas não por inteiro (correlação de 87%, que os autores chamam de "só") | 4.4, p. 8 | "We notice that with our dataset, using the average of 10 raw votes is only 87% correlated with using the average of all the votes." |
| Atraente noutro banco de fotos | Num banco público de fotos votadas por pessoas do outro sexo (HotOrNot), sem treino nele, a nota de atraente da rede acompanhou mais a das 1000 fotos de mulheres que a das 1000 de homens (correlação de 68% e de 42%) | 4.4, p. 8 | "Another interesting observation is that our model achieves 68% correlation with the 1000 females and 42% correlation with the 1000 males." |

A correlação de Pearson vai de −100% a 100% e mede o quanto duas notas sobem e descem juntas; aqui, a da rede e a média dos votos de cada foto. "Votos crus" são as notas de 0 a 3 como foram dadas; "pesados e normalizados" são as notas depois do ajuste do site, que, pelo que o artigo descreve sem mostrar a conta, dá peso menor a quem vota de modo previsível (quem vota sempre 1 fica com peso zero) e corrige quem costuma dar notas altas ou baixas.

## Limitações

- O estudo é comercial: o segundo autor é cofundador e diretor de tecnologia da Photofeeler, os dados são do site da empresa e o ajuste dos votos não é mostrado. O artigo apresenta o site e a rede como produtos e os compara com dois serviços concorrentes, usando para eles os números de um texto publicado na internet em 2018, que o artigo chama de estudo online.
- O que se mede é a impressão que a foto passa a quem vota no site, não se a pessoa é inteligente, confiável ou atraente, nem o que a foto muda em matches, mensagens ou encontros. A conclusão de que a rede escolhe a melhor foto "tão bem quanto 10 pessoas votando" é dos autores e se refere a prever a média dos votos.
- Quem vota são usuários do próprio site, que votam para receber votos; o artigo não diz quem são, de onde são nem a idade deles e das pessoas das fotos.
- Fotos com nota baixa tendem a ser trocadas antes de juntar muitos votos, então o banco tem menos fotos ruins com muitos votos; o teste ficou com fotos de pelo menos 10 votos e só recentes, porque o ajuste dos votos mudou com o tempo.
- O banco tem cinco vezes mais fotos de homens que de mulheres, e os votos são sempre do outro sexo; o artigo não traz dados de quem procura pessoas do mesmo sexo.
- A versão lida é o preprint do arXiv (versão 3, de maio de 2019), marcado como aceito; a Ficha não leu a versão publicada nos anais da conferência.
- A introdução traz números de matérias de imprensa sobre namoro online (por exemplo, que 90% das pessoas decidiriam um encontro só pelas fotos, atribuído ao The Guardian); não são resultados deste estudo.
