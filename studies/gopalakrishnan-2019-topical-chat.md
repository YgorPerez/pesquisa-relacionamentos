---
reference: "Gopalakrishnan K, Hedayatnia B, Chen Q, Gottardi A, Kwatra S, Venkatesh A, Gabriel R, Hakkani-Tür D. *Topical-Chat: Towards Knowledge-Grounded Open-Domain Conversations*. Proc. Interspeech 2019, pp. 1891–1895, 2019. Texto completo aberto: https://www.isca-archive.org/interspeech_2019/gopalakrishnan19_interspeech.pdf. Dados: https://github.com/alexa/Topical-Chat."
link: https://doi.org/10.21437/Interspeech.2019-3079
status: verified
verified_on: 2026-11-26
strength: weak
strength_reason: "Base grande (cerca de 11 mil conversas), mas feita e descrita pela própria Amazon, com trabalhadores experientes do Mechanical Turk numa tarefa paga de conversar sobre textos dados, não conversa espontânea nem amostra de alguma população."
countries: []
period: "não informado no texto lido"
sample:
  n: 11319
  description: "Conversas por texto entre pares de trabalhadores do Amazon Mechanical Turk (com pelo menos 1.000 tarefas aprovadas e 99% de aprovação), cada par com textos de leitura sobre um de 8 grandes assuntos; pelo menos 20 turnos por conversa. O artigo conta 11.319 conversas nos cinco conjuntos; o README da versão publicada conta 10.784."
  representative: false
design: cross-sectional
conflict: "Todos os autores são da Amazon Alexa AI, que coletou e publicou a base; o artigo não declara financiamento nem conflito."
covers: {}
---

# Gopalakrishnan et al. (2019): o Topical-Chat, 11 mil conversas por texto com nota a cada mensagem

## O que mediu

A Amazon juntou pares de trabalhadores do Mechanical Turk num chat e deu a cada um textos para ler: um artigo do Washington Post, o começo da Wikipédia sobre três assuntos do artigo e curiosidades tiradas do Reddit. O par devia conversar de um jeito natural e envolvente a partir desses textos, sem papéis fixos. A cada turno, enquanto esperava a resposta, cada um marcava o sentimento da própria mensagem, de onde tirou a informação e uma nota para a mensagem anterior do parceiro. No fim, os dois davam nota à conversa. A base serve para treinar e testar robôs de conversa; o artigo traz também os primeiros modelos treinados nela.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Tamanho | Cerca de 11 mil conversas entre pessoas, sobre 8 grandes assuntos | 1. Introduction | "a dataset of ∼11K human-human conversations about knowledge spanning 8 broad topics" | |
| Soma dos cinco conjuntos | Somando treino, validação e teste na tabela do artigo, são 11.319 conversas e 248.014 mensagens | 3.3 e tabela de estatísticas | "Statistics about our dataset are shown in Table 2." | scripts/calculations/gopalakrishnan-2019-topical-chat.ts |
| Conjunto de treino | 9.058 conversas no conjunto de treino | Tabela 2 | "Train 2199 2114 2259 2486 9058" | |
| Quem conversou | Só entraram trabalhadores com pelo menos 1000 tarefas aprovadas e 99% de aprovação | 3.3 Conversation Collection | "Turkers qualify for our HITs if their past approved HITs and approval rates are at least 1000 and 99% respectively" | |
| Tamanho mínimo | Uma conversa só podia ser entregue com pelo menos 20 turnos | 3.3 Conversation Collection | "We allow partner Turkers to submit their conversation only if they have conversed for at least 20 turns." | |
| Sentimento | Cada um marcou o sentimento da própria mensagem entre 8 opções | 3.3 Conversation Collection | "annotate the sentiment of their message on an 8-point scale" | |
| Nota a cada mensagem | A cada turno, cada um deu nota à mensagem anterior do parceiro, numa escala de 5 pontos, de ruim a excelente | 3.3 Conversation Collection | "rate the quality of their partner's previous message on a 5-point scale (Poor, Not Good, Passable, Good and Excellent)" | |
| Nota da conversa | No fim, os dois deram nota à conversa, na mesma escala de 5 pontos | 3.3 Conversation Collection | "At the end of a conversation, we ask both partners to rate the quality of the conversation on the same 5-point scale." | |
| Bônus | Quem teve conversas de qualidade muito alta ganhou bônus | 3.3 Conversation Collection | "Turkers who had conversations of exceptionally high quality were awarded bonuses." | |

## Limitações

- É conversa de tarefa, paga, entre desconhecidos que conversam sobre textos que receberam. O artigo não diz se os pares já se conheciam, de que país eram nem quando a coleta foi feita.
- O bônus para conversas muito boas e as checagens automáticas de qualidade podem ter puxado as notas e o jeito de escrever.
- O artigo conta 11.319 conversas, e o README da versão publicada no GitHub conta 10.784. O texto não explica a diferença; o README cita uma versão estendida do artigo no arXiv (2308.11995), que a Ficha não leu.
- Montar os textos de leitura pede uma credencial da API do Reddit. As conversas vêm prontas, e o repositório traz a licença CDLA-Sharing 1.0 para os dados.

## Como usamos

- [Catálogo de bases de conversa e encontros](../reports/2026-11-26-bases-de-conversa-e-encontros.md): a melhor base aberta com nota a cada mensagem.
- [Quando um fala demais, o outro gosta menos](../reports/2026-11-26-topical-chat-mensagem-e-fatia.md): reanálise nossa das notas por mensagem e por conversa.
