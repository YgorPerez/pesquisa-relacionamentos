---
reference: "Xia P, Jiang H, Wang X, Chen C, Liu B. *Predicting User Replying Behavior on a Large Online Dating Site*. Proceedings of the Eighth International AAAI Conference on Weblogs and Social Media (ICWSM) 8(1):545–554, 2014. Texto completo aberto: https://cdn.aaai.org/ojs/14516/14516-28-18034-1-2-20201228.pdf"
link: https://doi.org/10.1609/icwsm.v8i1.14516
status: verified
verified_on: 2026-11-14
strength: weak
strength_reason: "Dados comerciais de um site só, cedidos por ele numa colaboração, com dois dos cinco autores empregados na divisão de produto do site e nenhum conflito declarado; o sorteio de 200 mil usuários com o registro real de mensagens é um bom desenho, mas cobre só as oito primeiras semanas de cada conta, e os modelos preveem a resposta sem testar o que a causa."
countries: [China]
period: "Novembro de 2011 a janeiro de 2012 (as oito primeiras semanas de cada conta)"
sample:
  n: 200000
  description: "200.000 usuários do baihe.com, sorteados entre os que se cadastraram em novembro de 2011: 139.482 homens e 60.518 mulheres. O site é só para namoro heterossexual e só deixa homem escrever a mulher e mulher a homem. Para cada sorteado, os autores têm o perfil e o registro de quem escreveu a quem e quando, mais o perfil de quem trocou mensagem com ele."
  representative: false
design: platform
conflict: "O artigo não declara financiamento nem conflito de interesse. Dois dos cinco autores (Hua Jiang e Xiaodong Wang) assinam pela Divisão de Produto do Baihe.com, o site que cedeu os dados; os outros três são da Universidade de Massachusetts Lowell."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Xia et al. (2014): dá para prever quem responde à primeira mensagem?

## O que mediu

Os autores pegaram o registro de mensagens de um grande site de namoro chinês e contaram quantas primeiras mensagens tiveram resposta. Depois treinaram cinco tipos de modelo para prever se uma primeira mensagem seria respondida, usando 145 informações sobre quem escreve e quem recebe: o perfil, o que a pessoa diz procurar, o estilo de vida, os planos de casamento e filhos e o histórico de mensagens de cada um no site. O texto das mensagens não entrou.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho do site | O site tinha 60 milhões de usuários cadastrados | §1 | "a large online dating site in China with a total number of 60 million registered users" |
| Quem entrou | Os autores sortearam 200.000 usuários entre os que se cadastraram em novembro de 2011 | §3 | "200,000 users uniformly sampled from users registered in November of 2011" |
| Homens e mulheres | Dos sorteados, 69,7% eram homens e 30,3% eram mulheres | §3 | "constituting 69.7% and 30.3% of the total number of sampled users respectively" |
| Tempo observado | Só as oito primeiras semanas de cada conta | §3 | "we will consider the activities of each user during the first eight weeks of his/her membership" |
| Primeiras mensagens recebidas | As mulheres sorteadas receberam 1.586.059 primeiras mensagens de homens, e os homens sorteados receberam 328.645 de mulheres | Tabela 1 | "Initial contact links 1,586,059 328,645" |
| Resposta das mulheres | As mulheres sorteadas responderam a 9,5% das primeiras mensagens que receberam de homens (150.917 respostas) | Tabela 1 | "150,917 (9.5%)" |
| Resposta dos homens | Os homens sorteados responderam a 17,9% das primeiras mensagens que receberam de mulheres (58.946 respostas) | Tabela 1 | "58,946 (17.9%)" |
| O que entrou nos modelos | 145 informações por mensagem: 81 tiradas dos perfis de quem escreve e de quem recebe e 64 tiradas do histórico de mensagens no site | §5.5 | "a total number of 145 extracted features out of which 81 are user-based features while 64 are graph-based features" |
| Acerto do melhor modelo | Com todas as informações, o melhor modelo separou as mensagens respondidas das não respondidas em 84,1% das comparações quando um homem escreve a uma mulher, e em 81,6% quando uma mulher escreve a um homem (AUC) | §5.4 | "AUC of 81.6% for female to sample male, and 84.1% for male to sample female" |
| Perfil ou histórico | As informações dos perfis e as do histórico de mensagens previram a resposta mais ou menos igual, e juntar as duas ajudou pouco | §5.4 | "There is only a small gain in performance when we use both user-based and graph-based features." |
| O que a pessoa diz procurar | Saber se quem escreve cumpre o que a outra pessoa disse procurar (idade, altura, renda, escolaridade) ajudou pouco a prever a resposta: ficou entre 0,5 e 0,6, numa medida em que 0,5 é o acaso (AUC) | §5.3 | "worse than other feature sets with AUC in the range of 0.5 - 0.6" |
| O hábito de quem recebe | Entre as informações do histórico de mensagens, a que mais ajudou a prever a resposta foi quanto a própria pessoa que recebe costuma responder, para homens e para mulheres | §5.5, Tabela 6 | "the receiver's reply rate feature ranks first for both males and females" |
| Idade e renda de quem escreve | A idade, a renda e a situação de moradia de quem escreve ficaram entre as informações de perfil que mais ajudaram a prever se uma mulher responde; para prever se um homem responde, não ficaram entre as 15 primeiras | §5.5, Tabela 5 | "while age, income, and house situation of a sender are important factors for female receivers, they are not among the top 15 features for male receivers" |
| Itens que mais pesam na resposta dos homens | Na lista dos itens isolados que mais ajudaram a prever se um homem responde a uma mulher, os de estilo de vida e de planos para o futuro apareceram mais que os do perfil básico. Como grupo, porém, o perfil básico previu a resposta melhor que os outros dois | §5.5, Tabela 5 | "life style and future plan features play a more important role than user profile features" |

A AUC é a medida que os autores usam para dizer se um modelo acerta: é a chance de o modelo dar nota mais alta a uma mensagem respondida do que a uma não respondida, quando se sorteia uma de cada. Com 50% (ou 0,5) o modelo não sabe mais que uma moeda; com 100% acerta sempre. Os autores mediram a AUC num conjunto montado com o mesmo número de mensagens respondidas e não respondidas, não na proporção real do site.

"Ajudar a prever" não é o mesmo que causar. Na Tabela 5, quase todas as 15 informações que mais ajudaram a prever a resposta de um homem descrevem o próprio homem que recebe a mensagem (a posição entre os irmãos, a situação dos pais, os planos de filhos e de casamento), não a mulher que escreveu.

## Limitações

- Um site só, da China, só para namoro heterossexual, com quem se cadastrou em novembro de 2011 e apenas as oito primeiras semanas de cada conta. Os dados são de 2011 e 2012.
- As taxas de resposta são uma contagem simples: o artigo não diz por que as mulheres respondem menos. As mulheres sorteadas, que eram menos da metade dos homens sorteados, receberam bem mais primeiras mensagens que eles (1.586.059 contra 328.645).
- O texto das mensagens não foi analisado: os dados dizem quem escreveu a quem e quando. O estudo não diz nada sobre o que escrever numa primeira mensagem.
- "Resposta" é qualquer resposta à primeira mensagem, inclusive uma recusa. O artigo não acompanha a conversa depois dela nem se virou encontro, porque as pessoas podem sair do site e continuar por outro canal.
- Os modelos preveem, não explicam. Uma informação que ajuda a prever a resposta pode só andar junto com outra coisa que o modelo não vê.
- A informação que mais ajudou (quanto a pessoa costuma responder) é, como os próprios autores notam, uma medida direta do que se quer prever.
- Os autores ordenaram em separado as informações dos perfis e as do histórico de mensagens, então o artigo não diz qual das 145 ajuda mais no conjunto.
- O acerto foi medido com metade de mensagens respondidas e metade de não respondidas, sorteando partes dos mesmos dados para treinar e para testar. No site real, onde menos de uma em cinco mensagens tem resposta, e em outro período ou outro site, o acerto pode ser outro.
- Dois dos cinco autores trabalhavam no site que cedeu os dados, e o artigo não traz declaração de financiamento nem de conflito de interesse. Ele também não diz se os dados estão disponíveis para outros pesquisadores.
- O artigo não tem seção de limitações. Ele remete a descrição detalhada dos dados a dois textos anteriores do grupo, um de 2013, apresentado no congresso ASONAM e sem Ficha aqui, e o preprint arXiv:1401.5710, dos cinco autores com mais três, que tem Ficha própria: [Xia et al. (2014), quem namora quem](xia-2014-quem-namora-quem.md). Os dados são os mesmos, os 200.000 usuários do baihe.com cadastrados em novembro de 2011, e as contagens de resposta também: 150.917 respostas das mulheres (9,5%) e 58.946 dos homens (17,9%). As duas Fichas não são evidência independente uma da outra.
