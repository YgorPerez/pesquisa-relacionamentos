---
reference: "Zhang J, Yasseri T. *What Happens After You Both Swipe Right: A Statistical Description of Mobile Dating Communications*. arXiv:1607.03320, 2016. Preprint, enviado ao arXiv em 12 de julho de 2016. Texto completo aberto: https://arxiv.org/pdf/1607.03320"
link: https://doi.org/10.48550/arXiv.1607.03320
status: verified
verified_on: 2026-11-14
strength: weak
strength_reason: "Preprint sem revisão por pares, com os registros de um único app não nomeado, cedidos pela empresa: são 2,1 milhões de conversas reais, mas sem o texto das mensagens, sem identificar quem escreveu e só entre heterossexuais de 30 regiões metropolitanas dos EUA, e o texto traz números que não batem entre si."
countries: [EUA]
period: "Matches do fim de 2013 a abril de 2015; a última mensagem de cada conversa é de 1º de janeiro a 22 de abril de 2015"
sample:
  n: 400000
  description: "400.000 usuários heterossexuais de um app de namoro por celular não nomeado, das 30 maiores regiões metropolitanas dos EUA, com idade média de 29 anos e mediana de 27, cerca de metade de cada gênero. Os dados são 2.088.486 conversas e 18.917.884 mensagens entre pessoas que deram match. O artigo não diz como a empresa escolheu esses usuários."
  representative: false
design: platform
conflict: "O artigo não declara financiamento nem conflito de interesse. Os dados foram cedidos pela empresa dona do app, sob acordo de confidencialidade com a Universidade de Oxford, e o nome do app não aparece."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Zhang & Yasseri (2016): o que acontece depois do match

## O que mediu

Os autores receberam os registros de conversas de um app de namoro por celular em que duas pessoas só podem conversar depois que uma curte a outra (o match). Os dados não trazem o texto das mensagens. De cada mensagem ficaram o gênero de quem enviou, se a pessoa começou a conversa, o tempo desde o match, o número de caracteres, palavras, linhas, interrogações e exclamações, se havia um número de telefone e a distância entre os dois na rede de amigos do Facebook. Com isso o estudo conta quem escreve primeiro, quanto demora, de que tamanho é a mensagem e quantas conversas têm resposta.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quem manda a primeira mensagem | Os homens mandaram 79,4% das primeiras mensagens | Results, Overall Description (p. 6) | "Of all first messages, 79.4% were sent by men." | |
| Primeira mensagem com resposta | Em 51% das conversas (1.064.537), quem escreveu primeiro recebeu alguma resposta | Results, Conversation Lengths (p. 7) | "That leaves 1,064,537 conversations (51%) where initiators receive a response" | |
| Conversas de uma mensagem só | 39% das conversas tiveram uma única mensagem, que ficou sem resposta | Results, Conversation Lengths (p. 6) | "39% of conversations contain just one, unreciprocated message" | |
| Insistir sem resposta | Em outros 10% das conversas, a pessoa mandou duas mensagens ou mais e não teve resposta | Results, Conversation Lengths (p. 7) | "a further 10% contain two or more messages that are unreciprocated" | |
| Resposta conforme quem começa | Quando a mulher escreveu primeiro, 42% tiveram resposta; quando o homem escreveu primeiro, 53% | Results, Gender (p. 10) | "only 42% of the messages sent by female initiators are responded to. Messages sent by male initiators, however, have a 53% response rate." | |
| Uma mensagem basta | Em 89,4% das conversas com resposta, ela veio depois de uma única mensagem | Results, Overall Description (p. 6) | "89.4% of all reciprocal conversations have a response after just one initial message" | |
| Tamanho da primeira mensagem | A primeira mensagem teve, em média, 8 palavras ou 42 caracteres | Results, Overall Description (p. 6) | "The average first message contains 8 words or 42 characters." | |
| Pergunta na primeira mensagem | Cerca de 47% das primeiras mensagens tinham um ponto de interrogação e 46% não tinham nenhum | Results, Overall Description (p. 6) | "About 47% of first messages contain one question mark, 46% contain none" | |
| Exclamação na primeira mensagem | 70% das primeiras mensagens não tinham ponto de exclamação e 25% tinham um | Results, Overall Description (p. 6) | "70% had no exclamation marks, 25% had one" | |
| Primeira mensagem logo depois do match | 15% das primeiras mensagens saíram logo depois do match, no minuto zero do registro | Results, Timing (p. 7) | "A large percentage of first messages (15%) occurs right after the match, at 0th minute." | |
| Tempo até a primeira mensagem | Em metade das conversas com resposta, a primeira mensagem saiu até 8 horas depois do match; a média foi de 4,2 dias | Results, Timing (p. 7) | "the first message is sent within 8 hours from the match time with an average of 4.2 days" | |
| Conversas que começam na primeira semana | 71% das conversas começaram até uma semana depois do match | Discussion (p. 18) | "most conversations (71%) do begin within a week of a match" | |
| Tempo até a resposta | A primeira resposta veio, em média, 2,4 dias (3.462 minutos) depois da primeira mensagem | Results, Timing (p. 8) | "The average time it takes between first response and first message sent by initiator is 3,462 minutes or 2.4 days" | |
| Resposta e distância na rede de amigos | Tiveram resposta 54% das conversas entre pessoas a 2 graus de distância no Facebook, 52% a 3 graus e 26% a 4 graus ou mais | Tabela 8 (p. 17), coluna "Rate of Reciprocation" (o terceiro número de cada linha) | "2 709,268 (34%) 0.54 0.11 0.20 3 1,236,994 (59%) 0.52 0.09 0.18 +4 141,792 (7%) 0.26" | `scripts/calculations/zhang-2016-conversas-apos-match.ts` |
| Troca de telefone | Em 19% das conversas com resposta, ao menos uma pessoa mandou um número de telefone | Results, Success Rate (p. 13) | "19% of mutual conversations include at least one number exchange" | |
| Tamanho das conversas com troca de telefone | As conversas com troca de telefone tiveram cerca de 30 mensagens em média, contra 11 nas outras conversas com resposta | Discussion and Conclusions (p. 20) | "Successful conversations average about 30 messages versus 11 messages in unsuccessful conversations." | |

"Conversa" é toda troca entre duas pessoas que deram match em que ao menos uma escreveu. "Conversa com resposta" é aquela em que a outra pessoa escreveu de volta ao menos uma vez, com qualquer conteúdo, inclusive uma recusa. O tempo é contado a partir do match e arredondado para blocos de cinco minutos: "minuto zero" é o primeiro bloco. As médias de tempo são puxadas para cima por poucas conversas muito lentas: os autores dizem que a maioria das respostas chega nas primeiras horas. O grau de distância vem da conta do Facebook usada para entrar no app: 1 grau é ser amigo lá, e 4 ou mais é a maior distância dos dados. A linha de 1 grau (432 conversas) ficou fora da tabela. "Troca de telefone" é uma mensagem com dez algarismos seguidos, que os autores usam como sinal de que a conversa saiu do app.

## Limitações

- É um preprint: não passou por revisão por pares, e a página do arXiv não indica publicação em revista.
- Um app só, não nomeado, com usuários heterossexuais de 30 regiões metropolitanas dos EUA, entre 2013 e 2015. O artigo não diz como a empresa escolheu os 400 mil usuários, e toda conversa da base teve a última mensagem entre janeiro e abril de 2015.
- Os dados não trazem o texto. O estudo conta palavras e pontuação, mas não diz o que uma primeira mensagem dizia nem por que teve resposta.
- Não há identificador de usuário: não dá para saber quantas conversas cada pessoa teve, então poucas pessoas muito ativas podem pesar nas porcentagens.
- Ficar sem resposta pode ser desinteresse, uma conta parada ou uma primeira mensagem ruim; os autores dizem que os dados não separam esses casos.
- O app só deixa conversar depois do match. Os números não valem para sites em que qualquer pessoa escreve a qualquer outra.
- Os autores explicam a diferença de resposta entre homens e mulheres por homens que curtem muitos perfis e escolhem depois, mas não testam essa explicação: os dados não trazem as curtidas.
- A troca de telefone só pega dez algarismos seguidos. Um número escrito de outro jeito ou outro contato (uma rede social, por exemplo) fica de fora.
- As conversas guardam no máximo as últimas 100 mensagens, e mensagens repetidas por falha do app não puderam ser retiradas.
- Alguns números do texto não batem entre si. O resumo e os resultados dão 79% e 79,4% de primeiras mensagens de homens, e a seção de gênero dá 80%. As 1.722 primeiras mensagens com telefone, de 2.088.486, aparecem como "menos de 0,01%", quando são perto de 0,08%. O 1,4% com telefone aparece ora como parte das mensagens, ora como parte das conversas. A "média" da primeira mensagem (8 palavras, 42 caracteres) coincide com a mediana e com o pico de todas as mensagens, e o artigo não diz como foi calculada.
