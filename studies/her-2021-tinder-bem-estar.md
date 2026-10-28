---
reference: "Her Y-C, Timmermans E. *Tinder blue, mental flu? Exploring the associations between Tinder use and well-being*. Information, Communication & Society 24(9):1303–1319, 2021 (online em 2020). Texto completo aberto: https://lirias.kuleuven.be/handle/20.500.12942/761142"
link: https://doi.org/10.1080/1369118X.2020.1764606
status: verified
verified_on: 2026-10-28
strength: weak
strength_reason: "Questionário transversal com 296 usuários do Tinder recrutados no MTurk, sem amostragem probabilística; o bem-estar é autorrelato retrospectivo de uma semana, e motivos, uso compulsivo e sucesso entram juntos num modelo de preditores correlacionados."
countries: [EUA]
period: "não informado no texto lido"
sample:
  n: 296
  description: "Residentes nos EUA que usaram o Tinder na última semana, recrutados no Amazon Mechanical Turk com incentivo de um dólar. Dos 351 que completaram, ficaram 296 de 18 a 29 anos (média de 26,30): 61% homens, 90% heterossexuais e 70% solteiros."
  representative: false
design: cross-sectional
conflict: "Os autores declaram não haver conflito de interesse. O artigo não traz declaração de financiamento. Afiliações: University of Antwerp e Erasmus University Rotterdam."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 29 }
---

# Her & Timmermans (2021): uso do Tinder, motivos e bem-estar

## O que mediu

Um questionário online, respondido por usuários do Tinder recrutados num [[painel online]] (o Mechanical Turk), perguntou como a pessoa se sentiu depois de usar o app na última semana: alegria, tristeza e ansiedade. Os preditores foram o uso compulsivo, quatro motivos da Tinder Motives Scale (entretenimento, aprovação social, busca de relação e experiência sexual), a sensação de ter sucesso no app e a comparação com outros usuários. Regressões hierárquicas puseram os sete preditores juntos, controlando idade, gênero, orientação sexual, situação amorosa, atratividade autoavaliada e humor no momento da resposta, com p corrigido por FDR.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Aprovação social e tristeza, com os outros preditores no modelo | β = 0,070, sem [[significância estatística]]; busca de relação: β = 0,192 | Tabela 3, coluna Sadness | "0.056 (0.062) 0.070 0.141 (0.043) 0.192**" |
| Aprovação social e ansiedade, com os outros preditores no modelo | β = 0,114, sem significância; busca de relação: β = 0,176 | Tabela 3, coluna Anxiety | "0.094 (0.063) 0.114 0.134 (0.044) 0.176**" |
| Hipóteses de entretenimento, aprovação e motivo sexual | Não sustentadas | Resultados, p. 10 | "Nevertheless, H2, H3 and H5 could not be supported." |
| Busca de relação e alegria | β = 0,106 | Tabela 3, coluna Joviality | "0.075 (0.032) 0.106*" |
| Uso compulsivo e tristeza | β = 0,446 | Tabela 3, coluna Sadness | "0.493 (0.076) 0.446***" |
| Uso compulsivo e ansiedade | β = 0,376 | Tabela 3, coluna Anxiety | "0.427 (0.078) 0.376***" |
| Sensação de sucesso no app e tristeza | β = −0,222 | Tabela 3, coluna Sadness | "−0.251 (0.086) −0.222**" |
| Correlação simples da aprovação com a tristeza | r = 0,16 | Tabela 2, linha 9, coluna 3 | ".16**" |
| Correlação simples da aprovação com a ansiedade | r = 0,24 | Tabela 2, linha 10, coluna 3 | ".24**" |
| Correlação da aprovação com o uso compulsivo | r = 0,52 | Tabela 2, linha 3, coluna 1 | ".52**" |

Os β são coeficientes padronizados. Os Trechos da Tabela 2 são uma célula cada, porque a extração do PDF separa as colunas. Sozinha, a aprovação anda com mais tristeza e ansiedade, mas ela se correlaciona 0,52 com o uso compulsivo, e no modelo com tudo junto não sobra efeito dela sobre esses dois desfechos. Com o p sem correção, a aprovação previu um pouco mais de alegria (β = 0,141); depois da correção por FDR, não. Quem usa o app para achar relação relatou um pouco mais de alegria e, com coeficientes maiores, mais tristeza e ansiedade.

## Limitações

- O desenho é transversal e o bem-estar é autorrelato. Os autores dizem que isso limita a leitura causal: não dá para saber se o motivo ou o uso compulsivo pioram o humor ou se quem já está mal usa o app desse jeito.
- Os desfechos são sentimentos depois de usar o app numa semana, não depressão nem satisfação com a vida. Os autores reconhecem que não podem falar do efeito de longo prazo.
- A amostra é de jovens americanos do MTurk, com incentivo, sem grupo de quem não usa o app. Não representa usuários do Tinder em geral nem o Brasil.
- Os preditores são correlacionados (aprovação com uso compulsivo, 0,52; com sucesso percebido, 0,49). O efeito que some da aprovação pode estar contido no do uso compulsivo. Os autores informam que nenhum VIF passou de 2,620.
- O texto dos Resultados dá coeficientes brutos do uso compulsivo (0,129; 0,508; 0,428) que não batem com os da Tabela 3 (0,143; 0,493; 0,427). A Ficha usa a tabela. A cópia lida já é a versão corrigida pela errata (doi 10.1080/1369118X.2020.1779464), que não conferimos à parte.
- A paginação lida é a da publicação online (p. 1–17), não a do volume 24(9).
- O artigo não diz quando os dados foram coletados nem declara financiamento.

## Como usamos

O Relatório [Motivo de usar app e o que acontece depois](../reports/2026-10-28-motivos-app-e-desfecho.md) cita este estudo para mostrar que, com o uso compulsivo no mesmo modelo, buscar aprovação não previu tristeza nem ansiedade, e que buscar relação previu mais das duas.
