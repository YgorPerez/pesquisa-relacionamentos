---
reference: "Kreager DA, Cavanagh SE, Yen J, Yu M. *'Where have all the good men gone?' Gendered interactions in online dating*. Journal of Marriage and Family 76(2):387–410, 2014. Versão lida: manuscrito aceito dos autores, no PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC4043335/"
link: https://doi.org/10.1111/jomf.12072
status: verified
verified_on: 2026-11-14
strength: moderate
strength_reason: "Todos os primeiros contatos de 14.533 usuários heterossexuais ativos, comportamento real e não autorrelato, mas de um site gratuito só, numa cidade universitária de porte médio dos EUA, sem separar mensagem de piscadela (wink) e sem saber se a conversa virou encontro."
countries: [EUA]
period: "Seis meses entre 2010 e 2011"
sample:
  n: 14533
  description: "8.259 homens e 6.274 mulheres solteiros e heterossexuais, com perfil ativo num site de namoro gratuito e não nomeado, moradores de uma cidade de porte médio do sudoeste dos EUA (o artigo não diz qual). Entraram os que mandaram ou receberam mensagem e que foram avaliados por outros usuários; cerca de 5% ficaram de fora por não terem avaliação. Mandaram 177.404 primeiros contatos no período."
  representative: false
design: platform
conflict: "Financiado pela W. T. Grant Foundation (8316) e pela DTRA (1-09-1-0054), para Kreager, e pelo NICHD (5 R24 HD042849), para o Population Research Center da Universidade do Texas em Austin. Os dados foram cedidos pela empresa do site. O texto lido não traz declaração de conflito de interesse."
covers:
  genders: [man, woman]
  couple: different-sex
---

# Kreager et al. (2014): quem toma a iniciativa e quem responde num site de namoro

## O que mediu

Os autores receberam de um site de namoro o registro de todos os primeiros contatos trocados em seis meses entre os usuários heterossexuais de uma cidade, com a data de cada um e quantas vezes o contato foi respondido. Mediram quem escreve primeiro, quantos contatos ficam sem resposta e, com a nota de atratividade que os próprios usuários dão uns aos outros, se as pessoas procuram gente mais bem avaliada que elas e com quem acabam conversando.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quem manda o primeiro contato | Os homens mandaram 142.444 primeiros contatos e as mulheres, 34.960, uma proporção de 4 para 1 | Método, Data, §2 | "Of these, 142,444 were sent by men and 34,960 were sent by women: a 4-to-1 male-to-female ratio." | |
| Mensagens por pessoa | O homem médio mandou cerca de 2,5 vezes mais mensagens que a mulher média | Método, Measures, §6 | "The average male sent about 2.5 times as many messages than the average woman" | |
| Média de mensagens enviadas | Em seis meses, 21,02 por homem e 8,61 por mulher | Tabela 1, linha "Outgoing messages" (média e desvio-padrão de homens, depois de mulheres) | "Outgoing messages 21.02 51.73 8.61 13.75" | |
| Quem não mandou nenhuma | 15% dos homens e 31% das mulheres não mandaram nenhuma mensagem | Tabela 1, linha "No outgoing messages" (homens, depois mulheres) | "No outgoing messages 0.15 0.31" | `scripts/calculations/kreager-2014-iniciativa-respostas.ts no-messages` |
| Quem não recebeu nenhuma | Quase todas as mulheres (98%) receberam ao menos uma mensagem de um homem, e cerca de 18% dos homens não receberam nenhuma de mulher | Método, Measures, §6 | "Nearly all women (98%) received at least one message from a man, and about 18% of men received no messages from women." | |
| Contatos sem resposta | 79% dos primeiros contatos dos homens e 58% dos das mulheres nunca tiveram resposta | Tabela 3, linha "Message not reciprocated" (iniciados por homens, depois por mulheres) | "Message not reciprocated (ref.) .79 .58" | `scripts/calculations/kreager-2014-iniciativa-respostas.ts unanswered` |
| Contatos com ao menos uma resposta | 21% dos iniciados por homens e 42% dos iniciados por mulheres, o que sobra da linha anterior | Tabela 3, linha "Message not reciprocated" | "Message not reciprocated (ref.) .79 .58" | `scripts/calculations/kreager-2014-iniciativa-respostas.ts answered` |
| Conversas longas | Só 3% dos contatos dos homens e 7% dos das mulheres passaram de cinco trocas | Método, Measures, §7 | "only 3% of men's, and 7% of women's, sent messages resulted in more than five exchanges" | |
| A quem as pessoas escrevem | O destino mais comum das mensagens de homens e de mulheres foi a faixa mais bem avaliada do outro sexo, qualquer que fosse a avaliação de quem escrevia | Resultados, Comparing Sender and Receiver Desirability | "The modal category for male and female sent messages is to the highest desirability category, regardless of the sender's desirability level." | |
| Para onde escrevem os homens menos bem avaliados | Dos contatos dos homens da faixa mais baixa, 29% foram para mulheres da faixa mais alta e 16% para mulheres da mesma faixa que eles | Tabela 4, remetente homem, linha "Low" (da faixa mais alta para a mais baixa) | "Low .29 .21 .16 .18 .16" | `scripts/calculations/kreager-2014-iniciativa-respostas.ts low-men` |
| Para onde escrevem as mulheres menos bem avaliadas | Dos contatos das mulheres da faixa mais baixa, 30% foram para homens da faixa mais alta e 10% para homens da mesma faixa que elas | Tabela 4, remetente mulher, linha "Low" (da faixa mais alta para a mais baixa) | "Low .30 .22 .20 .18 .10" | `scripts/calculations/kreager-2014-iniciativa-respostas.ts low-women` |
| Mudança ao longo do tempo | O estudo não achou mudança: no último dia em que mandaram mensagens, as pessoas procuravam gente tão bem avaliada quanto no primeiro | Resultados, Predicting Receiver Desirability, §4 | "senders aim for partners of similar desirability on their first day as on their last day of sending messages" | |
| A mulher que escreve primeiro | Pela estimativa do estudo, no ponto em que a conversa costuma virar encontro, ela tem quase 60% de chance de estar falando com um homem mais bem avaliado que ela | Resultados, Predicting Receiver Desirability, §5; Fig. 4, painel A | "women senders have almost a 60% probability of staying connecting to men who are rated more desirable than they are" | |
| A mulher que espera ser procurada | Pela estimativa do estudo, a chance de o homem que a procura ser menos bem avaliado que ela é de quase 70% | Resultados, Predicting Sender Attractiveness, §4; Fig. 5, painel A | "we noted a high probability (almost 70%) that they are initially contacted by less desirable men" | |
| Com quem ela fica conversando quando só responde | Mesmo nas conversas longas, a mulher que respondeu a um contato de homem tende a estar com alguém menos bem avaliado que ela ou do mesmo nível | Resultados, Predicting Sender Attractiveness, §4 | "women who are responding to male-initiated messages are more likely connected with men who are less or similarly desirable as themselves" | |
| Vantagem de quem começa | Quem toma a iniciativa tem mais chance de formar par com alguém mais bem avaliado do que quem espera ser procurado | Discussão, §5 | "Individuals who initiate contact are more likely to pair off with a more desirable partner than those who wait to be asked." | |
| Para quem vale essa vantagem | Os autores concluem que ela vale sobretudo para as mulheres | Resultados, Predicting Sender Attractiveness, §5 | "The initiator advantage thus appears primarily applicable to women." | |
| Pares mais parecidos a cada troca | A diferença de avaliação entre os dois diminui conforme as mensagens vão e voltam, sobretudo na primeira resposta | Discussão, §9 | "the attractiveness gap narrows with increasing message exchanges, particularly at the point of first reciprocation" | |
| O que os usuários procuravam | 73% queriam alguém para namorar, 22% buscavam amizade e menos de 1%, parceiros sexuais | Método, Data, §2 | "The overwhelming majority of users (73%) were interested in finding a dating partner, some (22%) were looking for friendships, and less than 1% were interested in sexual partnerships." | |
| Quantas avaliações cada pessoa teve | Cada usuário ativo foi avaliado, em média, por 180 outros | Método, Measures, §1 | "each active dater was evaluated by an average of 180 other users" | |

"Primeiro contato" junta a mensagem escrita e a "piscadela" (*wink*), um aviso de interesse sem texto; os dados não separam as duas. Por isso, onde a tabela diz "mensagem", a piscadela também entra: o artigo chama as duas de "message". "Bem avaliado" é a medida de desejabilidade do estudo: a média das notas de atratividade, de 1 a 5 estrelas, que usuários do outro sexo deram ao perfil numa ferramenta do site. As "faixas" são cinco grupos do mesmo tamanho, formados dentro de cada sexo. As chances de quase 60% e quase 70% saem de um modelo estatístico para o remetente ou o destinatário médio, já levando em conta as outras características; não são contagens diretas. "Mais de cinco trocas" é o ponto em que outro estudo, de Hitsch e colegas, viu a conversa passar para um encontro, e os autores o tomam emprestado.

## Limitações

- Um site só, gratuito e não nomeado, numa cidade de porte médio com uma universidade grande. Mais de 60% dos usuários se diziam brancos, mais de um quarto eram estudantes e a idade média era 32 anos. Os autores limitam as conclusões a "one dating market at one point in time".
- Os dados não separam mensagem de piscadela, e os autores avisam que os contatos das mulheres podem ter sido na maioria piscadelas, e não mensagens ("The data did not allow us to distinguish these exchanges"). A piscadela arrisca menos e deixa a escrita para o outro, então "tomar a iniciativa" aqui pode ser menos do que escrever a primeira mensagem.
- Ninguém sabe se as conversas viraram encontro. Sem o conteúdo das mensagens, "it remains possible that few of these exchanges resulted in face-to-face meetings".
- A vantagem de quem começa é uma associação. As mulheres que escrevem primeiro podem ser diferentes das que esperam, e o estudo não sorteou quem escreve. Os próprios autores descartam a explicação que tinham proposto e ficam com uma mais simples: de tanto tentar gente mais bem avaliada, às vezes dá certo, "though the odds of success are slim even for the most attractive daters".
- A desejabilidade vem das notas de outros usuários, cujas características o estudo não conhece. Faltam também a data em que cada perfil foi criado e a nota de compatibilidade que o algoritmo do site calcula, e os autores admitem que isso pode enviesar as estimativas.
- Só usuários heterossexuais. O artigo diz que os resultados podem ser outros entre quem procura parceiro do mesmo sexo.
- O texto se contradiz em dois pontos. Diz que os dados cobrem "a 6-month period in 2010–2011" e, logo depois, "a 6-month window in 2011". E o resumo diz que as mulheres têm 4 vezes menos chance de mandar mensagem, o que corresponde ao total de primeiros contatos (4 para 1); na média de mensagens enviadas por pessoa, a diferença é de 2,5 vezes. Os resultados (seção "Predicting Sender Attractiveness", §5) ainda falam em "one in four messages" mandada por mulher, quando 4 para 1 dá uma em cada cinco.
- Li o manuscrito aceito que os autores depositaram no PMC, não a versão diagramada da revista. O Crossref não registra correção nem retratação do artigo (consulta em 14/11/2026).
