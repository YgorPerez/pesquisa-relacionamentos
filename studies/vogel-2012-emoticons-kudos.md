---
reference: "Vogel C, Mamani Sanchez L. *Epistemic Signals and Emoticons Affect Kudos*. 3rd IEEE International Conference on Cognitive Infocommunications (CogInfoCom 2012), Košice, Eslováquia, p. 517–522, 2012."
link: https://doi.org/10.1109/CogInfoCom.2012.6422036
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Contagem de posts de um único fórum técnico de uma empresa de software que o artigo não nomeia, fora do namoro, num trabalho curto de congresso: só compara proporções de posts que receberam kudos, sem levar em conta o conteúdo, o tamanho ou o tema do post, dá as comparações principais só em gráficos sem números e o resumo diz o contrário do resto do texto sobre o efeito das ressalvas."
countries: []
period: "não informado no texto lido"
sample:
  n: 208284
  description: "208.284 posts em inglês de um fórum de usuários de uma grande multinacional de software, que cedeu os dados aos autores e não é nomeada. Dos 308.274 posts do banco, saíram os de tópicos em que só um ou dois dos grupos de usuários podiam escrever e os de gurus antes de receberem o título. Os autores dividem quem escreveu em funcionários da empresa (400), gurus (15, usuários com distinção dada pela empresa), usuários com ranking (2.273) e usuários sem ranking (19.462), e os posts em os que receberam kudos (18.540) e os que não receberam (189.744). O artigo não dá país, idade nem gênero de quem escreveu. Não é um estudo de namoro: são perguntas e respostas técnicas sobre produtos de software."
  representative: false
design: platform
conflict: "Financiado por uma bolsa de pesquisa do Trinity College e por uma verba da Science Foundation Ireland (07/CE/I1142) ao Centre for Next Generation Localisation, ao qual a segunda autora está ligada. Os dados foram cedidos pela empresa dona do fórum, que o artigo descreve como colaboradora da pesquisa e não nomeia. O artigo não traz declaração de conflito de interesse."
covers: {}
---

# Vogel & Mamani Sanchez (2012): emoticons, ressalvas e "kudos" num fórum técnico

## O que mediu

Num fórum de suporte de uma empresa de software, em inglês, qualquer usuário pode marcar um post como útil, o que o fórum chama de dar "kudos". Os autores contaram, em 208.284 posts, os emoticons (98 de texto, como ":)", mais 45 carinhas desenhadas que o fórum oferece) e as expressões de certeza ("I know", "I'm sure") ou de incerteza ("I think", "maybe", "could"), e compararam a parte dos posts que recebeu kudos conforme o post tinha ou não emoticon, de que tom, e tinha ou não ressalva. O tom de cada post foi o da maioria dos seus emoticons. É uma contagem de registros reais, sem sorteio, e não é sobre namoro nem sobre conversa entre duas pessoas: é um fórum público de perguntas técnicas.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Posts analisados | Dos 308.274 posts do banco, ficaram 208.284, depois de tirar os tópicos em que só um ou dois grupos de usuários podiam escrever e os posts de gurus anteriores ao título | III, Method | "From the raw dataset (308,274 posts), we excluded posts and threads where only one or two groups of users could participate, as well as posts from gurus before they were assigned this role. This leaves 208,284 posts." | |
| O que é kudos | Dar kudos é marcar um post como útil | Nota 2, p. 517 | "The act of rating a message as useful is known as giving it kudos." | |
| Posts que receberam kudos | Dos 208.284 posts, 18.540 receberam kudos, ou 8,9% | Tabela I, coluna numposts | "numposts 25,490 27,489 50,456 104,849 18,540 189,744" | `scripts/calculations/vogel-2012-emoticons-kudos.ts` |
| Quanto se usa emoticon | Pouco: os usuários com ranking foram os que mais usaram, e mesmo assim em cerca de 10% dos posts | IV-A | "Emoticon use is low in our dataset; ranked users have the highest use (10%)." | |
| Emoticon por grupo e por kudos | Tiveram algum emoticon 3,2% dos posts de funcionários, 7,9% dos de gurus, 8,5% dos de usuários sem ranking e 10,8% dos de usuários com ranking; entre os posts que receberam kudos, 9,6%, e entre os que não receberam, 8,9%. O artigo não testa essa última diferença | Tabela IV, coluna %>0 | "%> 0 3.2 7.9 8.5 10.8 9.6 8.9" | |
| Posts com kudos e emoticon | Nas palavras dos autores, os posts que receberam kudos tinham uma chance só um pouco maior de ter emoticon que os que não receberam | IV-A | "posts which have kudos are slightly more likely to have used emoticons than those that do not." | |
| Tom do emoticon e kudos | Nos posts que receberam kudos, a parte positiva dos emoticons foi maior que nos posts que não receberam, numa diferença que os autores dizem estar longe do acaso (p < 0,05) | IV-A | "Kudoer posts show more positive emoticon use than non-kudoer posts (p < .05)." | |
| Parte positiva dos emoticons | Dos emoticons dos posts que receberam kudos, 71,9% eram positivos; dos posts que não receberam, 58,3% | Tabela VI, coluna pos (funcionários, gurus, sem ranking, com ranking, com kudos, sem kudos) | "pos 0.882 0.862 0.394 0.596 0.719 0.583" | `scripts/calculations/vogel-2012-emoticons-kudos.ts` |
| Tom por grupo | Funcionários e gurus usaram sobretudo emoticons positivos (mais de 80%); entre os usuários sem ranking, mais da metade dos emoticons era negativa | IV-A | "More than half of the emoticons of not-ranked users were negative. Employees and gurus used a significant amount of positive (> 80%) compared to negative emoticons" | |
| O que contou como emoticon negativo | Os dois sinais mais contados como emoticon negativo foram "!!!" (3.272 vezes) e "???" (2.410 vezes), que não são carinhas | Tabela II, coluna Negative | "!!! 3,272 ??? 2,410" | |
| Ressalva sem emoticon | Os posts sem emoticon e com expressões de certeza ou incerteza tiveram menos chance de receber kudos (p < 0,001); o texto não diz contra qual grupo, e o gráfico não traz os números | IV-C, Figura 2 | "This suggest that posts with no emoticons and with markers are less likely to being given kudos (p < 0.001)" | |
| O que ficou acima da média | Ficaram acima da média de posts com kudos (0,089) os posts com emoticon positivo ou neutro e os posts com expressão de incerteza; os sem emoticon ficaram perto da média, e os sem ressalva, os com expressão de certeza e os com emoticon negativo ficaram abaixo. O gráfico não traz os números de cada grupo | IV-C, Figura 4 | "Posts with positive and neutral emotions, and posts with uncertainty markers yield values above the mean of kudoer posts (0.089)." | |
| Emoticon positivo, com incerteza | Entre os posts com expressão de incerteza, os de emoticon positivo tiveram mais chance de kudos que os de emoticon negativo ou sem emoticon; contra os de emoticon neutro, a diferença pode ser acaso | IV-C, Figura 5 | "Positive emoticon use is more likely to yield kudos compared to negative or no emoticons, but there is no significant difference with neutral emoticons." | |
| Emoticon positivo, com certeza ou sem ressalva | Entre os posts com expressão de certeza e entre os sem ressalva nenhuma, os de emoticon positivo também tiveram mais chance de kudos que os de emoticon negativo ou sem emoticon | IV-C, Figura 5 | "When certainty markers are used, positive emoticon use is more likely to lead to kudo attribution than negative or no emoticons. When no epistemic markers are used, positive emoticons are more likely to lead to kudoer posts than negative or no emoticons" | |
| Incerteza sem emoticon | Entre os posts sem emoticon, os com expressão de incerteza tiveram mais chance de kudos que os com expressão de certeza ou sem ressalva; entre os de emoticon positivo, os sem ressalva tiveram menos chance que os com incerteza | IV-C, Figura 5 | "When there is no emoticon use, there is more chance of a post being kudoer when an uncertainty marker is used compared to certainty markers or lack of epistemic markers." | |

O p é a chance de uma diferença daquele tamanho aparecer só por acaso; "pode ser acaso" quer dizer que ele ficou acima do corte dos autores. As comparações da Figura 2 em diante vêm de um modelo para a chance de um post receber kudos, com p corrigido para muitas comparações; as das Tabelas IV a VI comparam proporções. O artigo dá as diferenças entre grupos de post só em gráficos, sem os números.

## Limitações

- Não é sobre namoro nem sobre conversa entre duas pessoas: é um fórum público de suporte técnico de uma empresa de software, em inglês, onde quem dá kudos marca uma resposta como útil. Os autores esperam que o resultado valha para outros fóruns técnicos, não para outros contextos.
- É contagem de registros, sem sorteio. O modelo só olha emoticon e ressalva; não leva em conta o que o post diz, se resolve o problema, o tamanho, o tema, quem escreveu nem quantas pessoas o viram. Entre os posts com emoticon, os que receberam kudos tinham em média mais palavras que os outros (Tabela V), e um post mais longo pode ter mais chance de trazer emoticon e ressalva só por ter mais texto.
- O resumo diz que as ressalvas baixaram a chance de kudos e só ajudaram junto com emoticons; a Figura 4 e a conclusão dizem que as expressões de incerteza ficaram acima da média e "are more likely to yield kudos" do que as de certeza ou nenhuma. O texto não resolve a diferença.
- A lista de emoticons negativos inclui "!!!", "???" e "!?!?", que são os mais contados; boa parte do que o estudo chama de emoticon negativo é pontuação repetida, comum em quem relata um problema.
- Os grupos de usuários têm tamanhos muito diferentes (15 gurus contra 19.462 usuários sem ranking), e um "usuário com kudos" é quem teve ao menos um post com kudos, o que mistura as duas classificações.
- A empresa, o país dos usuários e o período dos posts não são ditos, e os dados não podem ser compartilhados. É um trabalho de congresso de seis páginas, com várias comparações par a par só em gráfico.
