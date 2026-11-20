---
reference: "Lu F, Turkel D, Chen S, Afghahi B. *Improving Dating Outcomes by Predicting for Conversations at Hinge*. Em: Proceedings of the 49th International ACM SIGIR Conference on Research and Development in Information Retrieval (SIGIR '26), p. 4785–4789, 2026."
link: https://doi.org/10.1145/3805712.3808464
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Artigo curto de congresso escrito por quatro funcionários do Hinge com os dados do próprio app: a comparação entre curtida, match e conversa vem de pesquisas no app sem método descrito nem número de respostas, e o teste sorteado compara dois algoritmos de recomendação, não o que os usuários escrevem."
countries: [EUA]
period: "não informado no texto; o teste sorteado durou três semanas, em data que o artigo não dá"
sample:
  description: "Usuários do Hinge. A comparação entre as etapas (curtida, match, conversa) usa dados históricos de usuários dos EUA e pesquisas feitas de tempos em tempos no app, sem número de pessoas nem de respostas. O teste sorteou quinze regiões metropolitanas para cada versão do algoritmo, por três semanas; o artigo não diz quantos usuários entraram nem de que países são as regiões."
  representative: false
design: platform
conflict: "Os quatro autores trabalham no Hinge, o app que forneceu os dados e cujo algoritmo o artigo descreve. O artigo não declara financiamento nem conflito de interesses."
covers: {}
---

# Lu et al. (2026): prever conversas, e não só matches, no Hinge

## O que mediu

O artigo descreve o algoritmo que o Hinge usa para ordenar os perfis que cada usuário vê. O caminho no app é ver um perfil, curtir, virar match, conversar, combinar o encontro e sair. O antigo algoritmo tentava prever o match; o novo tenta prever a conversa, que o artigo define como o par em que os dois mandaram pelo menos uma mensagem.

Para justificar a troca, os autores compararam, em dados históricos de usuários dos EUA, a chance de um encontro presencial depois de cada etapa, com os encontros medidos por pesquisas que o app faz de tempos em tempos. Depois testaram o algoritmo novo contra o antigo: quinze regiões metropolitanas foram sorteadas para cada versão, por três semanas, e o algoritmo testado preenchia só quatro de cada lote de 20 perfis mostrados. Por fim, mediram que tipo de informação pesou mais em cada algoritmo.

O artigo não analisa o texto de perfis nem o de mensagens.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| O que conta como conversa | Para o artigo, há conversa quando os dois do par mandaram pelo menos uma mensagem; combinar o encontro é trocar contato ou marcar no próprio app | Seção 1.1 | "When both users have sent at least one message, this is a conversation. When users coordinate to meet in person, whether by sharing contact information or scheduling directly in-app, this is date planning." |
| Como os encontros foram medidos | Os encontros presenciais vieram de pesquisas que o app faz com os usuários de tempos em tempos, sobre dados históricos | Seção 3.2 | "historical data on the platform using periodic in-app surveys to measure in-person dates" |
| Encontro depois de cada etapa | Comparado a só mandar uma curtida, ter um match veio com cerca de 14 vezes a chance de um encontro presencial, e chegar a uma conversa, com cerca de 20 vezes, nos usuários dos EUA | Tabela 1 | "Like sent Match formed Conversation 1x (baseline) ∼14x ∼20x" |
| O teste dos algoritmos | Quinze regiões metropolitanas foram sorteadas para cada versão do algoritmo, por três semanas; o algoritmo testado preenchia quatro posições fixas de cada lote de perfis | Seção 4.1 | "The experiment is conducted as a metro-level randomized controlled test, with fifteen metros assigned to each variant over a three-week period." |
| Resultado do teste | Nas regiões com o algoritmo que prevê conversas, as curtidas recebidas mudaram −0,4%, o que pode ser acaso; os matches subiram 2,4%, as conversas 2,8% e a parcela de usuários que trocou contato por mensagem 1,4%, comparado ao algoritmo que previa matches | Tabela 2 e nota 1 | "−0.4%1 +2.4% +2.8% +1.4%" |
| O que é a troca de contato | A troca de contato é a porcentagem de usuários que passaram um contato por mensagem, que os autores usam como sinal de que um encontro está sendo combinado | Seção 4.2 | "Exchange coverage measures the percentage of unique users who shared contact information via messaging." |
| Taxas entre as etapas | Nas posições do teste, o algoritmo novo teve 20,4% menos curtidas por perfil visto, 42,2% mais matches por curtida e 6,9% mais conversas por match que o antigo | Tabela 3 | "Impression to like rate Like to match rate Match to conversation rate −20.4% +42.2% +6.9%" |
| Por que caíram as curtidas | Os autores leem que o algoritmo novo mostrou menos perfis de que muita gente gosta e mais perfis com chance de interesse dos dois lados | Seção 4.2 | "exposure shifts away from broadly likable profiles toward profiles with higher predicted mutual intent, reducing likes slightly while improving downstream dating outcomes" |
| O peso de cada tipo de informação | No algoritmo antigo, os dados do perfil (o que o usuário declara sobre si) responderam por 18,3% do peso, as preferências por 13,0%, o tempo de app e a atividade recente por 9,9% e o comportamento no app por 58,8%; no novo, 19,4%, 13,5%, 19,3% e 47,8% | Tabela 4 | "Profile features Preference features Tenure & recency features Behavioral features 18.3% 13.0% 9.9% 58.8% 19.4% 13.5% 19.3% 47.8%" |
| Leitura dos autores sobre o peso | Os autores leem que, para haver conversa, os dois precisam estar ativos no app, e por isso o tempo de app e a atividade recente passaram a pesar mais | Seção 4.3 | "Producing a conversation requires both users to be actively engaged on the platform, so lifecycle and recency signals carry more predictive value." |

"Cerca de 14 vezes" e "cerca de 20 vezes" são como a Tabela 1 escreve (∼14x e ∼20x): a chance de encontro de quem chegou àquela etapa, dividida pela de quem só mandou uma curtida. O artigo não dá as porcentagens de origem nem quantas pessoas responderam às pesquisas. As porcentagens do teste são mudanças relativas: +2,8% de conversas quer dizer 2,8% a mais que nas regiões do algoritmo antigo, não 2,8 pontos percentuais. A nota 1 da Tabela 2 diz que a mudança nas curtidas pode ser acaso, e que as outras três não.

## Limitações

- Os autores são funcionários do Hinge e descrevem um produto do próprio app. O artigo tem cinco páginas, não dá o número de usuários nem o de respostas às pesquisas, nem as datas dos dados.
- A comparação entre curtida, match e conversa só mostra o que anda junto: quem conversa já é quem tem mais interesse em sair. Ela não diz que puxar conversa causa o encontro.
- Os encontros vêm de pesquisas no app, respondidas por quem quis; o artigo não diz quantos responderam nem como a pergunta foi feita.
- O teste sorteou o algoritmo, não o comportamento dos usuários. Ele não diz nada sobre o que escrever no perfil ou na primeira mensagem.
- O algoritmo testado preenchia só quatro de cada 20 perfis; o efeito no app inteiro pode ser outro. O artigo não diz quantas pessoas havia nas trinta regiões nem em que países elas ficam.
- Os "dados do perfil" da Tabela 4 são o que o usuário declara sobre si; o artigo não diz se inclui o texto livre ou as respostas às perguntas do app.
