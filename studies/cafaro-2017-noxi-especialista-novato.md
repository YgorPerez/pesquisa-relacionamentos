---
reference: "Cafaro A, Wagner J, Baur T, Dermouche S, Torres Torres M, Pelachaud C, André E, Valstar M. *The NoXi Database: Multimodal Recordings of Mediated Novice-Expert Interactions*. Proceedings of the 19th ACM International Conference on Multimodal Interaction (ICMI 2017), pp. 350–359, 2017. Dados: https://multimediate-challenge.org/datasets/Dataset_NoXi/ (EULA, só uso científico não comercial)."
link: https://doi.org/10.1145/3136755.3136780
status: verified
verified_on: 2026-11-26
strength: weak
strength_reason: "Base de 84 conversas com 87 pessoas recrutadas nos próprios laboratórios e no círculo social dos autores, 61 delas homens; feita para treinar um agente virtual, não para medir nada numa população."
countries: [França, Alemanha, Reino Unido]
period: "não informado no texto lido"
sample:
  n: 87
  description: "87 pessoas de 21 a 50 anos (26 mulheres e 61 homens), gravadas em 84 conversas a dois por tela, na França, na Alemanha e no Reino Unido. Recrutadas nos laboratórios dos autores e no círculo social deles; parte das duplas era de colegas, parte de desconhecidos. Uma pessoa explicava um assunto que dominava (especialista) a outra que queria aprender (novato)."
  representative: false
design: cross-sectional
conflict: "Financiado pelo programa Horizon 2020 da União Europeia (acordo 645378), dentro do projeto ARIA-VALUSPA, que quer um agente virtual que busca informação. Os autores fizeram a base e as ferramentas usadas para anotá-la (NOVA, SSI)."
covers:
  genders: [man, woman]
  ages: { min: 21, max: 50 }
---

# Cafaro et al. (2017): o NoXi, conversas por tela entre quem sabe e quem quer aprender

## O que mediu

O NoXi é uma base de conversas a dois gravadas em vídeo, áudio e profundidade (Kinect 2). Em cada sessão, uma pessoa que domina um assunto (o especialista) conversa por uma tela grande, de pé, em outra sala, com alguém que escolheu aquele assunto para aprender (o novato). A conversa ia até um fim natural, com pelo menos 10 minutos. Os pesquisadores pediram aos dois que se interrompessem e discordassem, e cerca de 5 minutos depois do começo provocavam uma interrupção de fora (um telefonema ou alguém entrando na sala do especialista).

Depois vieram as anotações: fala e silêncio de cada um e as passagens de vez, gestos, sorriso, olhar, movimentos de cabeça, transcrição, engajamento ao longo da conversa e um interesse estimado pela voz. O artigo descreve a base e como ela foi anotada; não traz nenhum resultado sobre engajamento, interesse ou interrupções.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho | 87 pessoas gravadas em 84 conversas a dois; algumas aparecem em mais de uma | 3.3 Collected Data | "In total, 87 people were recorded during 84 dyadic interactions (some people appeared in more than one session)." |
| Horas gravadas | 25 horas e 18 minutos no total | 3.3 Collected Data | "The total duration of all sessions was 25 hours and 18 minutes." |
| Duração de cada conversa | Em média 18 min 6 s, com desvio de 6 min 28 s; 26 mulheres e 61 homens entre os participantes | Tabela 2 | "Total 84 87 (26/61) 18:06 06:28" |
| Duração mínima | Cada sessão tinha de durar pelo menos 10 minutos | 3.1 Design Principles | "the minimum duration for a recording session was set to 10 minutes" |
| Línguas | Sete línguas: inglês, francês, alemão, espanhol, indonésio, árabe e italiano | 1 Introduction | "spoken in seven languages" |
| Conversas por língua | 40 em inglês, 25 em francês e 19 em alemão, as três línguas principais | 3.3 Collected Data | "For the three main languages English, French, and German, we had 40, 25, and 19 interactions." |
| Idade | De 21 a 50 anos | 3.3 Collected Data | "Participants' age is in the range of 21-50 years old." |
| Desconhecidos | Parte das duplas era de colegas e parte de pessoas que nunca tinham se visto; o artigo não diz quantas de cada | 3.1 Design Principles | "we obtained dyads of both colleagues as well as entirely unacquainted persons" |
| Primeiro contato | Nas duplas de desconhecidos, os dois não eram apresentados: a primeira interação era pela tela | 3.1 Design Principles | "we did not introduce participants to each other, therefore their very first interaction happened when they both saw each other on the displays" |
| Interrupção provocada | Os pesquisadores interrompiam a sessão de fora cerca de 5 minutos depois do começo | 3.1 Design Principles | "we always interrupted the session at about 5 minutes after it began" |
| Engajamento | Anotado de forma contínua, com marcas de mudança que vão de muito desengajado a muito engajado | 4.3 Multimodal Signals of Engagement | "we added continuous annotations of engagement and then provided discrete instances when a change occurs ranging from strongly disengaged to strongly engaged" |
| Interesse | Uma nota contínua de 0 a 1, estimada automaticamente pela voz, como a valência e a ativação | 4.2 Available Descriptions | "Each dimension is represented by a continuous score between 0 and 1, which we automatically derive from the user's voice." |
| De onde vem o modelo do interesse | O modelo que estima pela voz aprendeu com 1,2 mil falas emocionais de dez atores profissionais | 4.2 Available Descriptions | "It contains 1.2 k instances of emotional speech from ten professional actors" |
| Anotadores | Mais de 30 anotadores de três países | 4.2 Available Descriptions | "More than 30 annotators from three countries" |
| Assuntos | 58 assuntos ao todo, como viagens, tecnologia, videogames e esportes | 3.3 Collected Data | "A total of 58 topics were discussed" |
| Uso permitido | Os dados só podem ser usados em pesquisa e fins não comerciais | 3.4 Availability | "NoXi is made freely available to the research community and for non-commercial uses." |

Valência é o quanto a emoção é agradável ou desagradável; ativação, o quanto é calma ou agitada. O desvio mostra o quanto as durações variam em torno da média.

## Limitações

- Não é encontro nem paquera: é uma conversa para trocar informação, com papéis fixos de quem ensina e quem aprende, por tela, de pé, em salas de laboratório.
- O artigo diz que há duplas de colegas e de desconhecidos e que a relação entre os dois foi registrada por sessão (conhecidos, amigos), mas não diz quantas sessões são de desconhecidos.
- A amostra é de conveniência, das instituições dos autores e do círculo social deles, e tem mais que o dobro de homens que de mulheres (61 e 26).
- As contas por língua não fecham: o texto diz que houve também conversas em quatro outras línguas, mas as três principais (40, 25 e 19) já somam as 84 sessões. As contas por lugar da Tabela 2 são as mesmas (Reino Unido 40, França 25, Alemanha 19); talvez o texto conte por lugar e chame de língua.
- O interesse não foi dado por pessoas: sai de um modelo de voz treinado com fala de atores (GEMEP), sem conferência relatada contra julgamento humano nesta base.
- O artigo não diz quantas sessões já tinham engajamento anotado, quem anotou nem quanto os anotadores concordaram. Para anotar engajamento, o áudio foi filtrado para tirar o conteúdo e deixar só a melodia da fala.
- Não há nenhuma medida do que cada um achou da conversa ou do outro, como gostar ou querer conversar de novo, além dos questionários de personalidade e dados demográficos.
- O artigo não dá as datas das gravações.
- O endereço de acesso do artigo (noxi.aria-agent.eu) mudou. Na página do MultiMediate, consultada em 2026-11-26, o EULA vai para um contato da Universidade de Augsburg, e os dados são só para pesquisa científica não comercial.

## Como usamos

- [Catálogo de bases de conversa e encontros](../reports/2026-11-26-bases-de-conversa-e-encontros.md): uma base com engajamento anotado ao longo da conversa, em parte entre desconhecidos.
