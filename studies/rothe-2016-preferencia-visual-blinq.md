---
reference: "Rothe R, Timofte R, Van Gool L. *Some like it hot: visual guidance for preference prediction*. Em: IEEE Conference on Computer Vision and Pattern Recognition (CVPR), p. 5553–5561, 2016. Texto completo aberto: https://openaccess.thecvf.com/content_cvpr_2016/papers/Rothe_Some_Like_It_CVPR_2016_paper.pdf"
link: https://doi.org/10.1109/CVPR.2016.599
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Base grande, de 17,33 milhões de votos, mas de um só aplicativo, cedida pela empresa dona dele, sem país nem período informados e restrita a heterossexuais de 18 a 37 anos; o artigo é de visão computacional, e o que diz sobre as pessoas são descrições de figuras, sem teste estatístico."
countries: []
period: "não informado no texto lido"
sample:
  n: 13210
  description: "Usuários do Blinq, um aplicativo de namoro do tipo 'hot or not' (curtir ou não a foto de perfil), cuja base a empresa cedeu aos autores: 4.650 mulheres e 8.560 homens, com idade mediana de 25 anos, e 17,33 milhões de votos. Os autores tiraram menores de idade, quem tinha mais de 37 anos, usuários bissexuais e homossexuais e quem recebeu menos de 10 votos, e usaram só a primeira foto de cada perfil. O artigo não diz o país dos usuários nem quando os votos foram dados."
  representative: false
design: platform
conflict: "Os autores agradecem ao Blinq por ceder os dados e à NVIDIA pela doação de uma placa de vídeo; o artigo não traz declaração de financiamento nem de conflito de interesses."
covers:
  genders: [man, woman]
  seeks: [men, women]
  ages: { min: 18, max: 37 }
  couple: different-sex
---

# Rothe et al. (2016): prever pela foto quem vai ser curtido num aplicativo

## O que mediu

O artigo é de visão computacional. Os autores treinaram um programa (uma rede neural e um método de recomendação) para prever, a partir da foto de perfil, se um usuário do Blinq curtiria ou não outra pessoa. No Blinq, o aplicativo mostra pessoas do sexo de interesse, uma por vez; o usuário curte ou não, e quem se curte mutuamente pode conversar. A base, cedida pela empresa, traz a idade, o sexo e os votos de cada usuário.

Além da precisão do programa, o artigo descreve a base: quantos votos foram positivos entre homens e mulheres e, numa figura, que idades cada lado preferiu. A previsão foi feita só para os votos de homens em mulheres.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quem ficou na base | 4.650 mulheres e 8.560 homens, com idade mediana de 25 anos | Seção 5.1.1, p. 5557 | "The resulting dataset has 4,650 female users and 8,560 male users. The median age is 25." |
| Quem saiu da base | Os autores tiraram menores de idade, quem tinha mais de 37 anos e usuários bissexuais e homossexuais, por serem poucos | Seção 5.1.1, p. 5557 | "Before performing any experiments we removed underage people, anyone over 37 and bi- and homosexual users as these comprise only a small minority of the dataset." |
| Votos | 17,33 milhões de votos: 11,27 milhões dados por homens e 6,05 milhões por mulheres | Seção 5.1.1, p. 5557 | "In total there are 17.33 million ratings, 11.27m by men and 6.05m by women." |
| Parcela de curtidas | Entre os usuários do Blinq na base, 44,81% dos votos dos homens em mulheres foram curtidas, contra 8,58% dos votos das mulheres em homens | Seção 5.1.1, p. 5557 | "Interestingly, 44.81% of the male ratings are positive, while only 8.58% of the female ratings are positive." |
| Pares formados | A base tem 332.730 pares em que os dois se curtiram | Seção 5.1.1, p. 5557 | "There are 332,730 matches." |
| Idade preferida | Na leitura que os autores fazem de uma figura sem números, as mulheres preferiram em geral homens um pouco mais velhos, e os homens do aplicativo preferiram mulheres com menos de 25 anos | Seção 5.1.1, p. 5558; Figura 5 | "Women generally prefer slightly older men and give better ratings the older they get. In comparison, men on this app prefer women under 25." |
| Previsão só pela foto | Vendo só a foto de uma mulher, sem nenhum voto que ela já tivesse recebido, o programa acertou 75,92% dos votos que os homens deram a ela | Seção 5.1.3, p. 5558; Tabela 3 | "Knowing just the image of the person, we can predict 75.92% of the ratings correctly." |
| Previsão de referência | Chutar sempre o voto mais comum entre os homens da parte de treino acertava 54,92% | Tabela 3, linha Baseline, p. 5558; Seção 5.1.2 | "Accuracy 54.92%" |
| Previsão com o histórico | Somando à foto os votos que a mulher já tinha recebido, o acerto chegou a 83,64% | Seção 5.1.3, p. 5558; Tabela 3 | "Adding past received ratings of the user improves performance to up to 83.64%." |
| Foto e poucos votos | Quando se conheciam só 10 votos recebidos pela mulher, juntar a foto subiu o acerto do programa de 72,92% para 78,68% | Seção 5.1.3, p. 5558; Tabela 3 | "from 72.92% to 78.68% for 10 known ratings" |
| Filtros do Instagram | Em exemplos com fotos de três mulheres, o programa previu mais curtidas para versões com filtro do Instagram que para a foto sem filtro. É a previsão do programa, sem voto de pessoas sobre as fotos com filtro | Seção 5.1.3, p. 5559; Figura 8 | "We observed that the filters lead to an increase in predicted hotness." |

Um voto é a curtida (positivo) ou a recusa (negativo) que um usuário dá à foto de outro. O acerto é a parcela dos votos da parte de teste que o programa adivinhou; metade dos usuários de cada sexo foi usada para treinar o programa e a outra metade para testá-lo.

## Limitações

- A base é de um só aplicativo, cedida pela empresa dona dele. O artigo não diz em que país ficam os usuários nem quando os votos foram dados.
- Os autores tiraram da base usuários bissexuais e homossexuais, quem tinha mais de 37 anos e quem recebeu menos de 10 votos, e usaram só a primeira foto de cada perfil, dizendo que a maioria decide por ela; o artigo não mostra esse dado.
- O artigo é de visão computacional, apresentado num congresso. O que ele diz sobre as pessoas (a parcela de curtidas, a idade preferida) é descrição da base, sem teste estatístico; a preferência por idade está só numa figura de cores, e a frase "give better ratings the older they get" não deixa claro se fala da idade de quem vota ou de quem é votado.
- A diferença na parcela de curtidas de homens e de mulheres descreve como cada lado votou nesse aplicativo; o artigo não compara quem cada um viu.
- A previsão foi feita só para votos de homens em mulheres. Os autores dizem que deixaram de fora os votos das mulheres por causa do forte desvio deles: só 8,58% eram curtidas.
- O efeito dos filtros do Instagram é a nota prevista pelo próprio programa em três fotos de exemplo, não uma comparação com votos de pessoas.
- O programa recorta a foto em torno do rosto e inclui parte do corpo e do fundo; o artigo não separa o que, na foto, pesa na previsão.
