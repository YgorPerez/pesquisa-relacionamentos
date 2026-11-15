---
reference: "Scissors LE, Gill AJ, Gergle D. *Linguistic mimicry and trust in text-based CMC*. Proceedings of the 2008 ACM Conference on Computer Supported Cooperative Work (CSCW '08), San Diego, p. 277–280, 2008. Texto completo no site do laboratório: https://collablab.northwestern.edu//pubs/ScissorsGillGergle_MimicryCMC_CSCW2008.pdf"
link: https://doi.org/10.1145/1460563.1460608
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Artigo curto de conferência com 26 duplas de estudantes desconhecidos num jogo de investimento por chat; a imitação foi medida como aconteceu, ninguém mexeu nela, e o resultado principal fica no limite do acaso (z = −1,91, o que dá p perto de 0,056, que a tabela arredonda para 0,05 e chama de significativo)."
countries: []
period: "não informado no texto lido"
sample:
  n: 52
  description: "52 estudantes de uma universidade de porte médio do Meio-Oeste (44% homens, 56% mulheres), postos em 26 duplas por sorteio; os dois da dupla não se conheciam antes do estudo. Das duplas, 6 eram de dois homens, 9 de duas mulheres e 11 mistas. O texto não nomeia o país; os autores são da Northwestern University, em Evanston, Illinois, EUA. A conversa era sobre as jogadas de um jogo de investimento entre desconhecidos, não paquera nem namoro. Estas 52 pessoas estão também entre as 124 de Scissors et al. (2009)."
  representative: false
design: cross-sectional
conflict: "Financiado pela National Science Foundation dos EUA (bolsa 0705901). O artigo não traz declaração de conflito de interesses. Os três autores eram da Northwestern University."
covers:
  genders: [man, woman]
---

# Scissors et al. (2008): repetir as palavras do outro no chat e confiança

## O que mediu

Duplas de estudantes que não se conheciam jogaram o DayTrader, um jogo de investimento em 28 rodadas. A cada rodada, cada um recebia 60 fichas e decidia quanto pôr no mercado comum: o que ia para o mercado era triplicado e dividido entre os dois, e o que ficava com a pessoa voltava dobrado só para ela. A dupla ganha mais quando os dois investem tudo, mas cada um ganha mais segurando fichas enquanto o outro investe. O jogo tinha uma variação aleatória do mercado e um bônus para quem ganhasse mais a cada cinco rodadas, que ajudavam a esconder quem segurava fichas. A cada cinco rodadas, a dupla podia conversar por chat por até 5 minutos.

Antes de cada rodada, cada jogador dizia quanto achava que o parceiro ia investir. Os autores contaram uma "quebra" na rodada em que ao menos um dos dois investiu menos do que esperava que o outro investisse, e usam as quebras como medida inversa da confiança na dupla. Nas conversas, codificaram à mão quantas vezes os dois usavam a mesma palavra ou expressão (dentro da mesma sessão de chat e de uma sessão para outra), a mesma estrutura de frase, os mesmos emoticons ou pontos de exclamação e as mesmas abreviações de chat, como "u" no lugar de "you". Um modelo para contagens ligou cada tipo de repetição ao número de quebras, levando em conta quantas palavras a dupla escreveu. Ninguém mexeu na repetição: ela foi medida como aconteceu.

Não é um estudo de paquera ou namoro: os jogadores eram desconhecidos combinando jogadas, e o artigo não mede atração nem interesse.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quem participou | 52 estudantes de uma universidade do Meio-Oeste, 44% homens e 56% mulheres | Method, Participants (p. 278) | "Participants (N=52, 44% male, 56% female) were students at a mid-sized Midwestern university." |
| As duplas | Os participantes foram postos em 26 duplas por sorteio, sem que se conhecessem antes: 6 duplas de dois homens, 9 de duas mulheres e 11 mistas | Method, Participants (p. 278) | "They were randomly assigned to pairs and they did not know one another before the study. Of the 26 pairs, 6 were male-male, 9 were femalefemale, and 11 were male-female." |
| O jogo | Cada dupla jogou 28 rodadas e podia conversar por chat por até 5 minutos a cada 5 rodadas | Method, Procedure (p. 278) | "Participants played 28 rounds of the investment game and could chat via IM with their partners for up to 5 minutes after every 5 rounds." |
| O que conta como quebra | Uma rodada contou como quebra quando ao menos um dos dois investiu menos do que esperava que o parceiro investisse; os autores usam a quebra como medida inversa da confiança | Results (p. 279) | "We define defection as an instance where a participant invests less than he or she expects his or her partner to invest" |
| Tamanho das conversas | As conversas somaram 11.501 palavras, 442 por dupla em média, de 66 a 814 | Analysis (p. 278) | "Our corpus contained a total of 11,501 words, with an average of 442 words per pair (ranging from 66 to 814)." |
| Repetir palavras na mesma conversa | Entre as duplas de estudantes deste jogo, as que mais repetiam as palavras e expressões uma da outra dentro da mesma sessão de chat tiveram menos quebras, levando em conta quantas palavras escreveram: o modelo dá 9,6% menos quebras por unidade de repetição, no limite do que costuma contar como fora do acaso (p = 0,05) | Tabela 1 (p. 279), linha Lexical (within sessions) | "Lexical (within sessions) -0.102 0.053 -1.91 0.05 -9.6%" |
| Repetir palavras de uma conversa para outra | Entre as duplas de estudantes deste jogo, mais repetição das palavras um do outro de uma sessão de chat para outra andou junto com mais quebras, o sentido oposto ao da repetição dentro da mesma sessão: 10,3% a mais por unidade de repetição, levando em conta quantas palavras escreveram (p = 0,03) | Tabela 1 (p. 279), linha Lexical (across sessions) | "Lexical (across sessions) 0.098 0.046 2.14 0.03 +10.3%" |
| Que palavras se repetiam | Os autores leram as conversas e dizem que a repetição dentro da sessão era mais de palavras de conteúdo, como "agree" e "invest", e a repetição entre sessões, sobretudo de respostas-padrão, como "yeah" e "okay" | Discussion (p. 280) | "lexical mimicry within chat sessions consisted of more content words (e.g. "agree", "invest") whereas lexical mimicry across chat sessions consisted mostly of standard response words (e.g. "yeah", "okay")." |
| Abreviações de chat | Entre as duplas de estudantes deste jogo, repetir as abreviações de chat do outro dentro da sessão andou junto com menos quebras (24,4% a menos por unidade de repetição), mas pode ser acaso (p = 0,06); os autores chamam de tendência | Tabela 1 (p. 279), linha Text-chat Abbreviation | "Text-chat Abbreviation -0.282 0.146 -1.93 0.06 -24.4%" |
| Estrutura de frase e emoticons | Entre as duplas de estudantes deste jogo, não apareceu ligação das quebras com a repetição da estrutura de frase do outro nem com a de emoticons e pontos de exclamação (p = 0,59 e p = 0,86) | Results (p. 279) | "measures of syntactic mimicry and emotion-related character mimicry were not found to be associated with trust (p=.59 and, p=.86, respectively)" |
| O que vem antes | Os autores dizem que não sabem se a imitação aumentou a confiança ou se a confiança aumentou a imitação, e propõem um experimento que mexa na imitação para descobrir | Future Work (p. 280) | "we lack an understanding of whether mimicry increased trust or trust increased mimicry." |

"p" é a chance de um resultado assim aparecer só por acaso; abaixo de 0,05 costuma contar como pouco provável. As porcentagens são a coluna "% change defection" da Tabela 1: quanto o número de quebras sobe ou desce, no modelo, a cada unidade a mais da medida de repetição. O artigo não diz qual é essa unidade; como o modelo leva em conta o total de palavras, os autores leem os coeficientes como taxas. A Tabela 1 tem 130 observações (N = 130), o que bate com 26 duplas vezes 5 sessões de chat; o artigo não diz isso com essas palavras.

## Limitações

- Não é sobre paquera ou namoro. Os jogadores eram estudantes desconhecidos combinando jogadas num jogo de investimento, com chats de até 5 minutos, e o artigo não mede atração. Os autores citam como aplicação equipes de trabalho à distância, "online relationship building" e suporte técnico.
- É uma associação. Ninguém mexeu na repetição de palavras, e os autores dizem que não sabem o que vem antes.
- A confiança é medida pelas quebras no jogo, não pelo que as pessoas dizem sentir.
- O resultado principal está no limite do acaso. Na Tabela 1, a repetição dentro da sessão tem z = −1,91 e aparece com p = 0,05, chamada de significativa; a das abreviações tem z = −1,93 e aparece com p = 0,06, chamada de tendência. Pelos próprios z, as duas ficam perto de 0,055 (p = 0,056 e p = 0,054, conta desta Ficha em `scripts/calculations/scissors-2008-mimica-lexical-confianca.ts`). As duas têm, portanto, o mesmo peso de evidência, e nenhuma passa com folga do 0,05.
- As porcentagens da Tabela 1 batem, até a primeira casa decimal, com o jeito usual de ler um coeficiente desse modelo (o número e elevado ao coeficiente, menos 1), conta do mesmo script.
- O artigo não diz se as quebras ligadas a cada chat são das rodadas antes ou depois dele, nem qual é a unidade da medida de repetição.
- O estudo inteiro tem 26 duplas de uma universidade. Os autores não dão a idade dos participantes.
- A interpretação de que a repetição entre sessões é de respostas-padrão, e de que quem trapaceia tem menos recursos para imitar com esforço, é dos autores, a partir da leitura das conversas; não há medida disso no artigo.
- As 52 pessoas deste estudo estão também na amostra de 124 de [Scissors et al. (2009)](scissors-2009-similaridade-confianca-chat.md), que mediu outros tipos de semelhança com os mesmos dados ampliados. O de 2009 não é uma réplica independente.
