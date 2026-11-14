---
reference: "Maldeniya D, Varghese A, Stuart T, Romero DM. *The Role of Optimal Distinctiveness and Homophily in Online Dating*. Proceedings of the Eleventh International AAAI Conference on Web and Social Media (ICWSM 2017) 11(1):616–619, 2017. Texto completo aberto: https://www.dmaldeniya.com/files/role_of_optimal_distinctiveness_and_homophily.pdf"
link: https://doi.org/10.1609/icwsm.v11i1.14940
status: verified
verified_on: 2026-11-14
strength: weak
strength_reason: "Dados reais de 410 mil usuários de um site de namoro dos EUA, mas num artigo curto de quatro páginas que não diz quantas mensagens entraram nos modelos, não traz margem de erro nem a escala dos números, só olha homens escrevendo a mulheres e não separa a semelhança do texto de outras coisas que os dois têm em comum."
countries: [EUA]
period: "Setembro a novembro de 2013"
sample:
  n: 410000
  description: "Perfis e registro de cliques de 410.000 usuários ativos de um site de namoro popular dos EUA, não nomeado, em dez regiões metropolitanas, com 25 milhões de mensagens em três meses. Cerca de 55% dos usuários eram homens e 94% heterossexuais. A análise fica só com as primeiras mensagens de homens a mulheres, fora as da primeira e da última semana; o artigo não diz quantas são."
  representative: false
design: platform
conflict: "O artigo não declara financiamento nem conflito de interesse. Autores da Universidade de Michigan e da Universidade da Califórnia em Berkeley. Os dados são de um site que o artigo não nomeia."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Maldeniya et al. (2017): semelhança com ela e diferença dos outros homens

## O que mediu

Os autores compararam o texto livre dos perfis de um site de namoro dos EUA: o do homem que manda a primeira mensagem, o da mulher que a recebe e o dos outros homens que disputam a atenção dela. Mediram a semelhança entre dois perfis pelas palavras pouco comuns que eles têm em comum e viram se a mulher respondeu. Os concorrentes foram definidos de três jeitos: todos os homens que escreveram a ela no período, os que escreveram antes dele e os homens cujo perfil ela tinha visitado antes. O que foi comparado é o texto do perfil, não o da mensagem.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho dos dados | Perfis e cliques de 410.000 usuários ativos do site, em dez regiões metropolitanas | Results, Data | "They contain the profiles and clickstreams of 410,000 active users in ten distinct metropolitan areas." |
| Mensagens no período | Os usuários escreveram 25 milhões de mensagens nos três meses | Results, Data | "users authored 25 million messages" |
| Quem usa o site | Cerca de 55% dos usuários ativos eram homens e 94% eram heterossexuais | Results, Data | "about 55% of the users are male and 94% are heterosexual" |
| Quem escreve primeiro | Os homens começaram 86% das conversas e mandaram 62% de todas as mensagens | Results, Data | "males account for 62% of all messages sent and they initiated 86% of all communication dyads" |
| Perfil parecido com o dela | Quanto mais o texto do perfil dele se parecia com o dela, mais vezes ela respondia | Results, Fig. 2(a) | "as dyadic text similarity increases, the likelihood of a replies increases" |
| Perfil parecido com o dela, no modelo | A chance de ela responder andou junto com um texto de perfil mais parecido com o dela, mesmo levando em conta idade, altura, cidade, etnia, nota de atratividade e os outros dados dos dois (0,0243, com três asteriscos, no modelo em que os concorrentes são todos os homens que escreveram a ela) | Tabela 1, linha "dyad text similarity", coluna MLC | "0.0243***" |
| Perfil parecido com o dos outros homens | Quanto mais o texto dele se parecia com o dos outros homens que escreveram a ela, menos vezes ela respondia | Results, Fig. 2(b) e 2(c) | "There is a clear drop in the response probability as the male sender becomes more similar to his peers for market level and female choice sets." |
| Concorrentes: todos os que escreveram a ela | No modelo, parecer com eles andou junto com menos resposta (−0,0289, com três asteriscos) | Tabela 1, linha "MLC text similarity" | "0.0289***" |
| Concorrentes: os que escreveram antes dele | No modelo, parecer com eles andou junto com menos resposta (−0,0222, com três asteriscos) | Tabela 1, linha "FCC text similarity" | "0.0222***" |
| Concorrentes: os perfis que ela tinha visitado | No modelo, parecer com eles andou junto com um pouco menos de resposta (−0,0074, com três asteriscos) | Tabela 1, linha "PVC text similarity" | "0.0074***" |
| Perfis que ela tinha visitado, no gráfico | A resposta primeiro cai quando ele se parece mais com esses perfis e depois volta a subir quando a semelhança é alta | Results, Fig. 2(d) | "Figure 2(d) shows an initial drop in the probability of replying as similarity increases, but it is followed by an increase in probability when similarity is high." |
| Nota de atratividade | Ele recebia mais resposta quando a nota que os outros usuários davam a ele era maior que a da média dos concorrentes | Results, depois da Tabela 1 | "the male is more likely to receive a response when he is more attractive than his average competitor" |
| Outras coisas em comum | Segundo os autores, ela respondia mais quando os dois eram parecidos nos outros dados do perfil; as exceções foram altura, tipo de corpo e atratividade | Results, depois da Tabela 1 | "all except for height, body type, and attractiveness support homophily" |
| O hábito dela | A porcentagem de primeiras mensagens que ela costuma responder teve o maior número da tabela (0,3720, com três asteriscos, no modelo em que os concorrentes são todos os homens que escreveram a ela) | Tabela 1, linha "female message response rate", coluna MLC | "0.3720***" |
| Conclusão dos autores | Ele recebia mais resposta quando o perfil se parecia com o dela e era diferente do dos outros homens | Conclusion | "males who describe themselves in language that is distinct from the other men they compete with are more likely to be rewarded with a response" |

Os números da Tabela 1 saem de um modelo que estima a chance de resposta a partir de todos os dados ao mesmo tempo. Número positivo quer dizer mais resposta; negativo, menos. Três asteriscos querem dizer p < 0,005: uma ligação desse tamanho dificilmente apareceria por acaso. O artigo não diz em que escala os números estão, então eles mostram a direção de cada ligação, não quanto a chance de resposta muda. A "nota de atratividade" é a média das estrelas, de 1 a 5, que os outros usuários deram ao perfil.

## Limitações

- O artigo é curto, de quatro páginas. Não diz quantas mensagens entraram nos modelos, não traz margem de erro e não diz a escala dos números da Tabela 1. Dá para ler a direção de cada ligação, não o tamanho.
- Na Figura 2, lendo os eixos dos gráficos, a chance de resposta fica entre cerca de 17% e 20% em toda a faixa de semelhança de texto. A diferença entre os extremos é de poucos pontos percentuais.
- Só homens escrevendo a mulheres. O artigo não analisa mulheres que escrevem primeiro nem pares do mesmo sexo.
- O que se compara é o texto livre do perfil, tratado como um saco de palavras sem ordem. A medida diz se dois perfis usam as mesmas palavras pouco comuns, não o tom, a qualidade nem o assunto do texto. O texto da primeira mensagem não foi analisado.
- É um estudo de observação. Dois perfis com palavras parecidas podem ser de pessoas com os mesmos interesses, a mesma escolaridade ou o mesmo meio, e o modelo não separa uma coisa da outra. Escolaridade e renda, que o perfil do site traz, não aparecem entre os dados levados em conta na Tabela 1.
- O texto diz que todos os dados de semelhança, fora três, favorecem a resposta a quem é parecido. Na Tabela 1, a semelhança no tipo de relação buscada não tem asterisco em nenhuma das três colunas (0,0009, −0,0001 e −0,0001).
- Para os perfis que ela visitou antes, o gráfico mostra uma curva que cai e depois sobe, e o modelo resume isso num número negativo pequeno.
- O grupo "todos os que escreveram a ela" inclui homens que escreveram depois dele, que ela ainda não tinha como comparar.
- "Resposta" é qualquer resposta à primeira mensagem. O artigo não diz se a conversa continuou nem se virou encontro.
- O artigo não diz se os modelos levam em conta que o mesmo homem e a mesma mulher aparecem em muitas mensagens.
- Um site só, não nomeado, em dez regiões metropolitanas dos EUA, em três meses de 2013. O artigo não declara financiamento e não tem seção de limitações.
