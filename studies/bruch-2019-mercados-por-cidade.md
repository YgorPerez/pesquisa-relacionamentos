---
reference: "Bruch EE, Newman MEJ. *Structure of online dating markets in U.S. cities*. Sociological Science 6:219–234, 2019. Texto completo aberto: https://sociologicalscience.com/articles-v6-9-219/ (suplemento: https://sociologicalscience.com/download/vol-6/april/supplemental_materials/SocSci_v6_219to234_supp.pdf). A Fonte local junta o artigo e o suplemento num só PDF."
link: https://doi.org/10.15195/v6.a9
status: verified
verified_on: 2026-11-14
strength: moderate
strength_reason: "Todas as mensagens de cerca de 187 mil usuários heterossexuais de um site de namoro em quatro cidades, comportamento real e não autorrelato, mas de um site só, num único mês de 2014, com o número de submercados escolhido pelos autores e as taxas de resposta entre submercados mostradas só em figuras, sem números."
countries: [EUA]
period: "Janeiro de 2014 (1 a 31); os dados foram coletados em julho de 2014"
sample:
  n: 186935
  description: "Usuários heterossexuais e solteiros de um site de namoro gratuito e popular dos EUA, não nomeado, que mandaram ou receberam ao menos uma mensagem em janeiro de 2014 e buscavam alguma relação amorosa. O total é o das quatro cidades analisadas (Nova York, Boston, Chicago e Seattle), somado da Tabela S1 do suplemento. A primeira análise, do país inteiro, usa todas as mensagens do site no mês, que tinha mais de 4 milhões de usuários ativos. Ficaram de fora os gays e bissexuais (cerca de 14% do site) e quem não buscava relação amorosa."
  representative: false
design: platform
conflict: "Financiado em parte pelo NIH (K01-HD-079554, para Bruch) e pela NSF (DMS-1107796, DMS-1407207 e DMS-1710848, para Newman). Os autores declaram não ter conflito de interesse. Os dados são do site, protegidos por regras do comitê de ética, e o código só sai a pedido."
license: "Creative Commons Attribution 4.0 International (CC BY 4.0), como diz a página do artigo; a primeira página do PDF diz Creative Commons Attribution License."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Bruch & Newman (2019): submercados de namoro online em cidades dos EUA

## O que mediu

Os autores pegaram todas as mensagens trocadas num site de namoro em janeiro de 2014 e trataram como uma rede: cada usuário é um ponto, e dois usuários se ligam quando há mensagem nos dois sentidos. Um método de detecção de comunidades separou a rede em grupos que conversam mais entre si do que com os de fora. No país, os grupos saíram por região. Dentro de quatro cidades (Nova York, Boston, Chicago e Seattle), os autores dividiram cada rede em quatro "submercados" e olharam quem está em cada um, para quem os homens mandam a primeira mensagem e quem responde. É a mesma base de dados de [Bruch & Newman (2018)](bruch-2018-aspirational-pursuit.md).

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quantos usuários nas quatro cidades | 186.935 pessoas: 94.627 em Nova York, 18.468 em Boston, 51.871 em Chicago e 21.969 em Seattle | Suplemento, Tabela S1 (p. S3), linha Total number of users | "New York Men Women 44 009 50 618 Boston Men Women 9 113 9 355 Chicago Men Women 28 635 23 236 Seattle Men Women 12 721 9 248" | `scripts/calculations/bruch-2019-mercados-por-cidade.ts` |
| Tamanho da rede no país | No site inteiro, 15.302.512 pares de pessoas trocaram mensagem nos dois sentidos no mês observado | p. 221 | "A total of 15,302,512 reciprocal interactions took place during this period." | |
| Distância | Houve 75.686 dessas trocas entre gente de Manhattan e do vizinho Brooklyn, e só 2.170 entre Manhattan e a distante San Francisco | p. 221 | "there were 75,686 reciprocal interactions between individuals in Manhattan and individuals in neighboring Brooklyn but only 2170 interactions between individuals in Manhattan and individuals in far-away San Francisco" | |
| Mercados no país | A rede de mensagens dos 48 estados contíguos se dividiu em 19 grupos, cada um preso a uma região | Fig. 1 (p. 222) | "Division of the messaging network for the lower 48 states into 19 communities by modularity maximization" | |
| Submercados dentro da cidade | Com cada cidade dividida em quatro submercados, cerca de 75% das trocas nos dois sentidos ficaram dentro do mesmo submercado | p. 223 | "about 75 percent of all reciprocal interactions in our four cities are between individuals within the same submarket" | |
| O que separa os submercados | Sobretudo a idade: o mais jovem reúne gente no começo dos 20 anos, e os outros três, gente no fim dos 20, nos 30 e dos 40 em diante | p. 223 | "The youngest submarket, numbered 1 in each city, corresponds primarily to individuals in their early 20s, whereas submarkets 2 to 4 correspond to those in their upper 20s, 30s, and 40s and above, respectively." | |
| Idade de homens e mulheres | Em todos os submercados os homens são mais velhos que as mulheres; a diferença mediana é de 1 ano e 7 meses | p. 223 | "In every case, the men are older than the women, with a median age difference of 1 year and 7 months." | |
| Homens e mulheres por submercado | Os submercados mais jovens têm mais homens, e os mais velhos vão tendo cada vez mais mulheres | p. 223 | "The younger submarkets tend to be male heavy, but the mix becomes progressively more female heavy in the older submarkets." | |
| Submercado mais jovem de Chicago e de Seattle | Tem quase dois homens para cada mulher | p. 224 | "The youngest submarkets in Chicago and Seattle, for example, have almost two men for every woman." | |
| Quem manda a primeira mensagem | Os homens mandam mais de 80% das primeiras mensagens do site | p. 225 | "Because men send more than 80 percent of first messages on the site, we focus on men's first messages and women's replies." | |
| Primeira mensagem para fora do submercado | Cerca de 43% das primeiras mensagens vão para alguém de outro submercado, e essas tentativas muitas vezes não dão certo | p. 228, Discussão | "A larger fraction, about 43 percent, of all first messages are between different submarkets, which indicates that people do attempt to contact partners outside of their submarkets, but those attempts are often unsuccessful." | |
| Para onde vão as mensagens de fora | As pessoas escrevem um pouco para o submercado logo mais velho e para o logo mais novo que o delas, e quase nada para os que ficam a dois ou mais degraus | p. 227, Fig. 4 | "users are sending a modest number of messages to the submarkets immediately older and younger than their own but very few messages to submarkets two or more steps away" | |
| Homens na casa dos 30 anos | É o único grupo que manda a maior parte das mensagens para fora do próprio submercado, sobretudo para as mulheres do submercado seguinte mais jovem, o do fim dos 20 anos | p. 227, Fig. 4 | "this group is the only one whose members send a majority of their messages to women in different submarkets from their own, the largest number going to women in the next youngest submarket, submarket 2 (mid-to-late 20s)" | |
| Resposta de mulheres e de homens | As mulheres respondem às primeiras mensagens dos homens bem menos do que os homens respondem às delas | p. 227, Fig. 4 | "Women's replies to messages sent by men (second row) occur at a substantially lower rate than men's replies to women (fourth row)" | |
| Por que elas respondem menos, segundo os autores | Provavelmente pelo volume: as mulheres recebem quatro vezes mais primeiras mensagens que os homens e podem escolher mais | p. 227 | "which is likely a volume effect: Because women receive four times as many first messages as men, they can afford to be more selective in their replies" | |
| Onde a resposta é mais comum | Em todas as cidades, para homens e para mulheres, a resposta é mais comum quando a mensagem fica dentro do próprio submercado | p. 227, Fig. 4 | "across all cities and among both men and women, reply rates are highest within submarkets" | |
| Mulheres que escrevem primeiro | Recebem resposta com mais frequência quando escrevem a homens de submercados mais velhos que o delas, com algumas exceções | p. 227 | "Women receive replies more often when initiating contact with men in older submarkets" | |
| Quem escreve mais e quem recebe mais resposta | Os homens mandam mais mensagens que as mulheres e têm menos chance de receber resposta | Suplemento, seção 1.2 (p. S4) | "men send more messages than women. However, men have a lower chance than women of receiving replies to their messages." | |
| Mensagens e respostas, homens de Nova York | Mandaram 23,3 mensagens em média e 15% tiveram resposta | Suplemento, Tabela S1 (p. S3), coluna New York, Men: Mean age, Mean messages sent, Replies received (%) | "31.6 23.3 15" | |
| Mensagens e respostas, mulheres de Nova York | Mandaram 9,4 mensagens em média e 34% tiveram resposta | Suplemento, Tabela S1 (p. S3), coluna New York, Women: Mean age, Mean messages sent, Replies received (%) | "31.5 9.4 34" | |
| Mensagens e respostas, homens de Seattle | Mandaram 12,4 mensagens em média e 20% tiveram resposta | Suplemento, Tabela S1 (p. S3), coluna Seattle, Men: Mean age, Mean messages sent, Replies received (%) | "32.7 12.4 20" | |
| Mensagens e respostas, mulheres de Seattle | Mandaram 7,8 mensagens em média e 45% tiveram resposta | Suplemento, Tabela S1 (p. S3), coluna Seattle, Women: Mean age, Mean messages sent, Replies received (%) | "33.1 7.8 45" | |
| Diferença de idade em quem os homens procuram | Em Chicago e em Nova York, a diferença de idade entre os homens e as mulheres a quem eles escrevem é cerca de duas a três vezes maior no submercado mais velho que no mais jovem | p. 225, Fig. 3 | "the age differences between men and the women they message are approximately two to three times larger in the oldest submarket than in the youngest" | |
| Primeira mensagem e resposta, diferença de idade | Em Boston e Seattle, como em Nova York e Chicago, a diferença de idade tende a ser maior nas primeiras mensagens do que nas respostas | Suplemento, seção 3 (p. S16), Fig. S5 | "age differences tend to be larger for first messages than for replies, and also larger in older submarkets" | |
| Homens do submercado mais velho de Nova York | Os negros escrevem a mulheres em média 4,5 anos mais novas que eles, e os brancos, 6,2 anos | p. 225–226 | "write to women who are on average 4.5 years younger than they are, whereas for white men, the corresponding figure is 6.2 years" | |
| Idade das mulheres negras em Chicago | No submercado mais velho, elas são em média mais de oito anos mais novas que as brancas do mesmo submercado | p. 225 | "In Chicago's oldest submarket, for instance, black women are more than eight years younger on average than white women" | |
| Homens brancos mais velhos e mulheres de minorias, Chicago | Nos submercados mais velhos, eles procuram mulheres de minorias em média dois anos ou mais mais novas que as brancas a quem escrevem | p. 225, Fig. 3 | "white men in older submarkets pursue minority women who are on average two or more years younger than the white women they message" | |
| Resposta das mulheres de minorias, Chicago | Elas tendem a não responder às investidas de homens brancos mais velhos | p. 225, Fig. 3 | "minority women tend not to reciprocate overtures from older white men" | |

"Troca nos dois sentidos" é um par de pessoas em que cada uma mandou ao menos uma mensagem à outra; os autores tomam isso como sinal de um mínimo de interesse dos dois lados. "Submercado" é um grupo que o método achou na rede de mensagens: gente que troca mais mensagens entre si do que com o resto da cidade. O número de submercados por cidade, quatro, foi escolha dos autores. "Minorias" são as mulheres que se declararam asiáticas, negras ou hispânicas no perfil.

A Tabela S1 sai do `pdftotext` coluna por coluna. Os Trechos dessas linhas copiam o texto extraído como ele sai: idade média, mensagens enviadas em média e respostas recebidas (%), nessa ordem, do grupo que o Onde indica. A tabela foi reproduzida de Bruch & Newman (2018).

## Limitações

- Um site só, gratuito e não nomeado, em janeiro de 2014, antes de os aplicativos de deslizar dominarem. Os usuários se concentram no litoral e só "correspondem por alto" à população, como dizem os autores.
- Só heterossexuais solteiros: gays, bissexuais e quem não buscava relação amorosa ficaram de fora.
- Nas quatro cidades, a maioria dos usuários se declarou branca (de 73% a 87%, pela Tabela S1), e os grupos de minorias dentro de cada submercado são pequenos. O artigo não dá o tamanho deles.
- O número de submercados é, nas palavras dos autores, "em certa medida arbitrário". Eles repetiram a divisão com três, cinco e seis grupos e dizem ter visto os mesmos padrões; o suplemento mostra isso só para Nova York.
- As taxas de resposta dentro e entre submercados aparecem só em mapas de cor (Fig. 4), sem números. O texto dá a direção das diferenças, não o tamanho.
- Os números de resposta por cidade e por gênero (Tabela S1) são os mesmos de Bruch & Newman (2018). É a mesma base, não uma replicação.
- O artigo descreve diferenças, sem teste estatístico nem margem de erro.
- A explicação pelo volume para as mulheres responderem menos é uma hipótese dos autores; o artigo não a testa.
- Mede a quem as pessoas escrevem e quem responde, não se a conversa vira encontro ou relação.
- Os dados são do site e ficam protegidos; não dá para refazer a análise de fora.
