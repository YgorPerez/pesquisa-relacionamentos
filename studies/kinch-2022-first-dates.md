---
reference: "Kinch M. *First Dates Dataset*. figshare, conjunto de dados, 2022. Lida: a página do item no figshare (pela API, https://api.figshare.com/v2/articles/20219411) e o único arquivo dele, First-Dates-Dataset.csv. Não há artigo publicado sobre a base."
link: https://doi.org/10.6084/m9.figshare.20219411.v1
license: "CC BY 4.0 (como diz a página do item no figshare); os direitos do programa são dos donos do conteúdo original"
status: partial
verified_on: 2026-11-26
strength: weak
strength_reason: "São 12 encontros de um programa de TV editado, anotados por uma só pessoa que via o programa e sabia o desfecho, sem artigo que descreva como as anotações foram feitas."
countries: []
period: "não informado na página lida"
sample:
  n: 12
  description: "1.928 falas transcritas de 12 encontros do programa First Dates, do Channel 4, cada fala com o sexo de quem fala, a emoção de quem fala e de quem ouve, o jeito de falar e a quem a fala se dirige; o desfecho de cada encontro diz se deu certo."
  representative: false
design: cross-sectional
conflict: "Não informado na página."
covers:
  genders: [man, woman]
---

# Kinch (2022): o First Dates Dataset, 12 encontros de TV transcritos fala a fala

## O que mediu

Martin Kinch transcreveu falas de episódios do programa de TV *First Dates*, do Channel 4, em que dois desconhecidos jantam num restaurante. Cada fala vem anotada com a emoção de quem fala e de quem ouve, o jeito de falar (por exemplo, flerte ou nervosismo) e o alvo da fala: o par, a câmera ou outra pessoa. Cada encontro tem o desfecho, se deu certo ou não. A base é um arquivo CSV só, publicado no figshare, sem artigo.

Ficha parcial: a fonte primária é a página do conjunto de dados, sem texto mais completo publicado. A página não diz como as anotações foram feitas nem como "deu certo" foi decidido.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| De onde vem | De vários episódios do programa First Dates, do Channel 4 | Página, descrição | "A dataset generated from several episodes of the Channel 4 programme First Dates." | |
| Falas e encontros | 1.928 falas de 12 encontros | CSV, colunas id e transcript | "transcript - The speech spoken in that time segment." | scripts/calculations/kinch-2022-first-dates.ts |
| Deu certo | 4 encontros deram certo e 8 não | CSV, coluna label | "label - 0 for an unsuccessful date, 1 for a successul date." | scripts/calculations/kinch-2022-first-dates.ts |
| Emoção | Cada fala traz a emoção de quem fala e a de quem ouve | Página, descrição | "emo_speaker - Emotional response of the speaker (their speech is seen in the transcripts)" | |
| Jeito de falar | Cada fala traz o jeito como a pessoa falou | Página, descrição | "speaker_intonation - The manner in which the speaker spoke." | |
| Alvo | Cada fala diz a quem a pessoa falava | Página, descrição | "target - Who the speaker was speaking to." | |
| Direitos do programa | Os direitos do conteúdo do programa continuam com os donos dele | Página, descrição | "All rights belonging to the oringinal progammes content belongs with the respective copyright holders." | |
| Publicação | Publicada em 17/07/2022 | Página, metadados | "2022-07-17T09:38:22Z" | |

## Limitações

- São 12 encontros, escolhidos e editados pelo programa, com gente que sabe que está sendo filmada. Servem de exemplo, não de taxa.
- Quem anotou a emoção, o jeito de falar e o desfecho foi o autor da base, que via o programa e sabia como cada encontro acabou. A página não diz o critério de nenhuma dessas anotações.
- O texto vem em minúsculas e sem pontuação, e um dos encontros parece ser entre duas mulheres (só há falas femininas dirigidas ao par).
- A página não diz em que anos foram os episódios.

## Como usamos

- [Catálogo de bases de conversa e encontros](../reports/2026-11-26-bases-de-conversa-e-encontros.md): uma das três bases abertas de primeiro encontro com a conversa e o desfecho.
- [O que separa o primeiro encontro que vira segundo](../reports/2026-11-26-primeiro-encontro-que-vira-segundo.md): reanálise nossa das anotações de flerte e emoção.
