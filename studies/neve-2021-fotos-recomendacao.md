---
reference: "Neve J, McConville R. *Photos Are All You Need for Reciprocal Recommendation in Online Dating*. arXiv:2108.11714 [cs.IR], 26 de agosto de 2021. Preprint. Texto completo aberto: https://arxiv.org/pdf/2108.11714"
link: https://doi.org/10.48550/arXiv.2108.11714
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Preprint sem revisão por pares, com dados de um só serviço de namoro, cedidos por ele e não nomeado; o teste é feito fora do site, sem teste de acaso entre os modelos, e as contagens de usuários do texto não batem entre si."
countries: []
period: "Históricos de até um ano; o preprint não dá as datas"
sample:
  description: "Usuários de um serviço de namoro com vários milhões de cadastros, só para relacionamentos heterossexuais, que o texto não nomeia nem situa num país. A introdução fala em 200.000 usuários e cerca de 800.000 Likes e recusas; os métodos, em 500.000 trios de fotos de 250.000 usuários para treinar a comparação de fotos, no histórico de 100.000 usuários para treinar o modelo completo e em 20.000 Matches e pares Like-recusa para o teste. Ficaram de fora fotos sem rosto e usuários removidos do serviço."
  representative: false
design: platform
conflict: "O preprint não declara financiamento nem conflito de interesse. Os dados foram cedidos pelo próprio serviço de namoro, que o texto não nomeia."
license: "CC BY 4.0 (como diz a página do artigo no arXiv)"
covers:
  genders: [man, woman]
  couple: different-sex
---

# Neve & McConville (2021): fotos e histórico de Likes para prever o match

## O que mediu

Os autores montaram um modelo, o TIRR, que olha as fotos das pessoas que alguém curtiu e recusou, na ordem em que isso aconteceu, e prevê se duas pessoas vão se curtir. Ele usa a rede de comparação de fotos do artigo anterior dos autores, o ImRec, e acrescenta uma parte que lê o histórico como sequência, com até 15 Likes ou recusas por pessoa e até um ano. No serviço, uma pessoa manda um Like, e a outra devolve o Like (é o Match) ou não; os autores testaram se o modelo separava os Matches dos casos em que o Like não foi devolvido. Compararam com o ImRec, com o RECON, que olha só dados do perfil por categoria, como idade e passatempos, e com o LFRR, que olha só o padrão de quem curtiu quem, sem fotos.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| O serviço | Um serviço de namoro que só aceita relacionamentos heterossexuais; o texto não diz qual nem de que país | Seção 3.1 | "The online dating service we used currently only supports heterosexual relationships." |
| Os dados | A introdução diz que os autores usaram 200000 usuários e cerca de 800000 Likes e recusas, divididos entre treino e teste | Seção 1 | "We used 200000 users and approximately 800000 expressions of preference combined split across train and test sets." |
| Treino da comparação de fotos | As fotos vieram de 250000 usuários, metade de fotos de homens e metade de mulheres, recortadas e centradas no rosto | Seção 3.5 | "sampled from 250000 users split evenly over male and female images. Images were cropped and centered on the faces of users before training." |
| Treino do modelo completo | O modelo que lê o histórico como sequência foi treinado com o histórico de 100000 usuários, separado dos dados do treino das fotos | Seção 3.5 | "the LSTM network was trained based on the preference histories of 100000 users to predict Matches and Like-Dislike Tuples." |
| O teste | O teste usou 20000 Matches e pares em que o Like não foi devolvido; nenhum Like ou recusa do teste estava no treino, mas parte dos usuários estava nos dois | Seção 3.5 | "Finally, the LSTM was validated on a separate dataset of 20000 Matches and Like-Dislike Tuples." |
| Fotos com e sem a ordem do histórico | No teste, a nota feita com as fotos e a ordem dos Likes (TIRR) separou os Matches dos Likes não devolvidos melhor que a feita com fotos sem a ordem (ImRec) e que a feita com dados do perfil por categoria (RECON): AUC 0,91, 0,65 e 0,51 | Tabela 3, coluna AUC | "RECON 0.61 0.56 0.68 0.51 ImRec 0.71 0.60 0.88 0.65 TIRR 0.87 0.86 0.88 0.91" |
| Acerto entre os apontados | No ponto de melhor equilíbrio entre acertar e encontrar, dos pares que o TIRR apontou como Match, a fração que deu Match de fato foi 0,86; no ImRec, 0,60, e no RECON, 0,56 | Tabela 3, coluna Precision | "RECON 0.61 0.56 0.68 0.51 ImRec 0.71 0.60 0.88 0.65 TIRR 0.87 0.86 0.88 0.91" |
| Fotos e quem curtiu quem | O LFRR, que não olha fotos e aprende só com quem curtiu quem, ficou quase no mesmo ponto do TIRR (AUC 0,90 contra 0,91; precisão 0,86 nos dois); o artigo não traz teste de acaso para essa diferença | Tabela 4 | "LFRR 0.86 0.86 0.85 0.90 TIRR 0.87 0.86 0.88 0.91" |
| Fotos ruins | Os autores leem no mapa das fotos curtidas e recusadas um grupo de imagens muito distorcidas, de baixa qualidade ou sem rosto, recusadas quase sempre | Seção 4.2, Figura 5 | "represents heavily distorted or very poor quality images, or images misclassified by the face detection algorithm (i.e. images that do not contain a face). These tend to be almost universally Disliked." |

A AUC é a chance de o modelo dar nota mais alta a um Match do que a um Like não devolvido, quando se sorteia um de cada: 0,5 é o acaso, 1 é acertar sempre. A precisão é a parte dos pares apontados como Match que deram Match de fato. Os números da Tabela 3 são os do ponto de corte que deu a melhor combinação entre precisão e cobertura (o F1) no treino, aplicado ao teste; para a Tabela 4, o texto diz só que são os do melhor F1.

Os autores dizem que o TIRR também superou o RCF, outro modelo que aprende só com quem curtiu quem, mas não dão os números dele. Para a rede que compara uma foto com outra, o artigo mostra só a curva (Figura 4), sem número.

O título diz que as fotos bastam. Na comparação do artigo, o modelo com fotos e o que não olha fotos ficaram quase iguais (AUC 0,91 e 0,90), e nenhum modelo leu o texto livre dos perfis.

## Limitações

- É um preprint, sem revisão por pares. O texto não nomeia o serviço nem o país, e não declara financiamento nem conflito de interesse.
- As contagens não batem entre si: a introdução fala em 200.000 usuários, e o treino da comparação de fotos sozinho usou 250.000. O texto não explica a diferença.
- O treino da comparação de fotos (500.000 trios de 250.000 usuários) e a rede da Tabela 1 são os mesmos do artigo de 2020 dos mesmos autores, que usou o Pairs, do Japão: [Neve & McConville (2020)](neve-2020-preferencias-reciprocas-imagens.md). Este texto não diz se os dados são os mesmos, e as duas Fichas não devem contar como evidência independente uma da outra.
- Os números do ImRec e do RECON na Tabela 3 diferem um pouco dos do artigo de 2020 (lá, precisão 0,59 nos dois e cobertura 0,91 e 0,64; aqui, 0,60 e 0,56, e 0,88 e 0,68). O texto não diz o que mudou.
- O texto não diz quantos Matches e quantos Likes não devolvidos havia no teste.
- O teste foi feito fora do site, com dados do passado. O artigo não testou recomendar com o modelo para gente de verdade, e o Match não diz quem conversou nem quem se encontrou.
- Parte dos usuários do teste estava também no treino. Os autores dizem que isso imita o uso real; para usuários novos o acerto pode ser outro.
- O texto chama de "Dislike" o Like que não foi devolvido e não diz se conta igual um Nope explícito e um Like ignorado.
- O modelo prevê, não explica: o artigo não diz o que nas fotos pesa no Like. A leitura do grupo de fotos ruins é dos autores, feita num gráfico, sem contagem.
- Os modelos foram montados para homens que curtem mulheres e mulheres que curtem homens, porque o serviço só aceita relacionamentos heterossexuais.
