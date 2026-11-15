---
reference: "Ranganath R, Jurafsky D, McFarland DA. *Detecting friendly, flirtatious, awkward, and assertive speech in speed-dates*. Computer Speech and Language 27:89–115, 2013. Texto completo no site de Jurafsky: https://web.stanford.edu/~jurafsky/pubs/ranganath2013.pdf"
link: https://doi.org/10.1016/j.csl.2012.01.005
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Estudantes de pós-graduação voluntários de uma só universidade, em três eventos de speed dating de 2005; os programas foram treinados só com as notas extremas, em conjuntos de menos de 200 conversas, e os próprios autores pedem cautela porque a amostra é pequena e não aleatória."
countries: [EUA]
period: "2005"
sample:
  n: 946
  description: "946 encontros presenciais de 4 minutos entre um homem e uma mulher, com áudio e transcrição completos, de três eventos de speed dating feitos em 2005 numa universidade particular de elite americana, com algumas semanas entre um e outro e participantes diferentes em cada um. Os participantes eram estudantes de pós-graduação voluntários, a quem se prometeu o e-mail de quem marcasse interesse recíproco. O artigo não diz quantas pessoas participaram. Cada programa usa só as conversas com notas extremas: 174, por exemplo, para o flerte que os homens deram a si mesmos."
  representative: false
design: cross-sectional
conflict: "Financiamento parcial de um Google Research Award. Autores da Stanford University; o artigo não traz declaração de conflito de interesse."
covers:
  genders: [man, woman]
  seeks: [men, women]
  couple: different-sex
---

# Ranganath, Jurafsky & McFarland (2013): flerte, simpatia e falta de jeito na fala de um speed dating

## O que mediu

Os autores gravaram encontros presenciais de speed dating de 4 minutos. Depois de cada um, cada pessoa deu uma nota de 1 (nunca) a 10 (o tempo todo) para o quanto ela própria e o par foram simpáticos, paqueradores, sem jeito e assertivos. Com o áudio (tom e volume da voz, duração das falas) e a transcrição (palavras, risos, perguntas, interrupções, quanto um repete as palavras do outro), treinaram programas para separar, em cada traço, as conversas com as notas mais altas das com as mais baixas, em separado para homens e mulheres e para a nota dada pela própria pessoa e pelo par. Também compararam a nota que cada pessoa deu ao par com a que ela deu a si mesma e com a que o par deu a si mesmo.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Encontros analisados | 946 encontros de speed dating com áudio e transcrição completos | Seção 3 | "The current study focuses on the 946 clean dates for which we had complete audio and transcripts." | |
| Perceber o flerte do par | A nota que cada pessoa deu ao flerte do par andou muito junto com a nota que ela deu ao próprio flerte (r = 0,73) e pouco com a nota que o par deu ao próprio flerte (r = 0,15) | Tabela 20 | "Flirting Friendly Awkward Assertive .73 .77 .58 .58 .15 .05 .07 .09" | |
| Perceber simpatia, falta de jeito e assertividade | Nos outros três traços, a nota dada ao par andou junto com a nota que a pessoa deu a si mesma (r de 0,58 a 0,77) e quase nada com a que o par deu a si mesmo (r de 0,05 a 0,09) | Tabela 20 | "Flirting Friendly Awkward Assertive .73 .77 .58 .58 .15 .05 .07 .09" | |
| Programa que detecta flerte, com pessoas já vistas | Separando as conversas com as notas de flerte mais altas das com as mais baixas, com pessoas que também apareciam no treino, o programa acertou 66% nos homens e 74% nas mulheres pela nota que deram a si mesmos, e 65% e 78% pela nota dada pelo par; no chute, acertaria metade | Tabela 9, colunas Flirt, linhas SVM | ".66 .65 .62 .60 .74 .78 .75 .76" | `scripts/calculations/ranganath-2013-flerte-fala.ts table9` |
| Programa que detecta flerte, com pessoas novas | Treinado em dois eventos e testado no terceiro, com pessoas que nunca tinha visto, o programa acertou 57% (nota dos homens a si mesmos) e 59% (nota dada aos homens pelo par), contra 48% de um palpite que sempre aposta no grupo mais comum; nas mulheres, 53% e 52%, contra 37% e 34% | Tabela 16, colunas Flirt | ".57 .48 .59 .48 .53 .37 .52 .34" | `scripts/calculations/ranganath-2013-flerte-fala.ts table16` |
| Fala das mulheres com nota alta de flerte | As mulheres com nota alta de flerte, dada por elas mesmas ou pelo par, usaram mais negações (sobretudo "don't", e também "no" e "not"), a palavra "like" e riso no meio ou no fim da própria fala, comparadas às de nota baixa | Seção 4.5 | "Women rated as flirting (whether by self or other, generally whether in the decile or quartile studies) tend to use negation (especially the word don’t but also no and not), use the word like, and use medial laughter." | |
| Fala dos homens com nota alta de flerte | Os homens com nota alta de flerte usaram mais "you", "you know" e "um" e falaram menos do próprio trabalho acadêmico, comparados aos de nota baixa | Seção 4.5 | "Men rated as flirting (generally either by self or other, in both the decile and quartile studies) tend to use the words you, you know, and um, and are less likely to use words about their academic work." | |
| Fala dos homens diante de uma mulher com nota alta de flerte | Os homens que conversavam com mulheres de nota alta de flerte usaram mais expressões de apreço ("wow", "that's true") e repetiram mais as palavras gramaticais que a mulher tinha acabado de usar | Seção 4.5 | "There are also strong characteristics of the speech of men talking to flirting women; in both the decile and quartile studies these men use appreciations and accommodate the woman’s function words." | |
| Altura, peso e interesses contra a fala | Para prever a nota que cada pessoa deu ao próprio flerte, só altura, IMC, diferença de idade, ordem do encontro e interesses em comum acertaram 64% nos homens e 55% nas mulheres; só a fala, 66% e 74%; as duas juntas, 72% e 76%; no chute, acertaria metade | Tabela 18, linhas Male Flirt e Female Flirt | ".66 .74 .73 .64 .55 .55 .72 .76 .72" | `scripts/calculations/ranganath-2013-flerte-fala.ts table18` |
| Corpo e flerte | Quem tinha IMC mais alto deu a si mesmo nota mais alta de flerte, assim como os homens mais altos e as mulheres mais baixas. Os homens se deram nota mais alta de flerte diante de mulheres de IMC mais baixo, e as mulheres, diante de homens de IMC mais alto | Seção 6.4 e Tabela 19 | "Men or women with higher BMI are more likely to report themselves as flirting, as are both taller men and shorter women. Men tend to flirt with low-BMI women, while women, by contrast, flirt with high-BMI men." | |
| Interesses em comum | Ter interesses parecidos na lista de atividades do cadastro não andou junto com a nota de nenhum dos quatro traços | Seção 6.4 | "Interest homophily was not a significant predictor of any of the stances." | |

r vai de −1 a 1 e mede o quanto duas notas andam juntas: perto de 0, quase nada. Nas Tabelas 9, 16 e 18, a conta separa as conversas com as notas mais altas das com as mais baixas, nos 10% de cada ponta (Seção 4); com os 25% de cada ponta, o acerto médio caiu, de 69% para 62% (Seção 4.4).

Para a Tabela 20, os autores dão duas leituras: a pessoa pode não conseguir captar a intenção do outro em 4 minutos e acabar se guiando pela própria; ou, a que eles propõem, as notas descrevem a conversa como um todo ("conversations that felt friendly") mais do que a pessoa. Eles notam que a ligação com a nota do próprio par é um pouco maior no flerte (0,15) e sugerem que, num speed dating, as pessoas prestam mais atenção a ele.

## Limitações

- Estudantes de pós-graduação voluntários de uma só universidade particular americana, em 2005; os autores dizem que a amostra é pequena, não é aleatória e que o speed dating não é um ambiente natural para todo estilo de conversa.
- O artigo não diz quantas pessoas participaram, só quantos encontros.
- Os programas foram treinados só com as conversas de notas extremas, em conjuntos pequenos (174 no flerte que os homens se deram); os próprios autores temem que tantas medidas se ajustem demais a conjuntos tão pequenos. Com pessoas que já estavam no treino, parte do acerto vem de conhecer a pessoa, como dizem os autores.
- As medidas da fala andaram junto com as notas; o estudo não testou se alguma delas leva a ser visto como paquerador.
- O resumo fala em até 75% de acerto com pessoas já vistas; a Tabela 9 e a Discussão chegam a 78%.
- Parte dos encontros perdeu um dos dois áudios (130) e 19 se perderam por inteiro; 38 participantes não deram nota ao próprio flerte.
