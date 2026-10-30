---
reference: "IBGE. *Censo Demográfico 2022: Nupcialidade e Família, resultados preliminares da amostra*. Apresentação de 05/11/2025 e tabelas 10185 e 10187 do SIDRA; para 2010, tabelas 3193 e 3484 do SIDRA (Censo Demográfico 2010, resultados da amostra). Rio de Janeiro: IBGE."
link: https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/ceae9194efd93875393399287b9d34f6.pdf
status: verified
verified_on: 2026-10-20
strength: strong
strength_reason: "Questionário da amostra de dois Censos, representativo do país; os números de 2022 ainda saem como resultados preliminares e o Censo só vê o casal que mora junto."
countries: [Brasil]
period: "2010 e 2022"
sample:
  description: "Pessoas de 10 anos ou mais estimadas pelo questionário da amostra: 176.095.831 em 2022 e 161.981.299 em 2010, das quais 90.315.395 e 81.080.710 viviam em união."
  representative: true
design: cross-sectional
conflict: "Órgão oficial de estatística."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); o IBGE não traz termo de licença próprio nas tabelas."
covers:
  genders: [man, woman]
  ages: { min: 10, max: 99 }
institution: ibge
---

# IBGE (2022): uniões consensuais no Censo

## O que mediu

O tema Nupcialidade do Censo pergunta a quem tem 10 anos ou mais se vive com cônjuge ou companheiro(a) no domicílio e, se vive, a natureza da união: casamento civil e religioso, só civil, só religioso ou união consensual (sem casamento). A união consensual é o que o senso comum chama de união estável, mas o Censo não pergunta se ela foi registrada em cartório. A Ficha usa a apresentação de divulgação de novembro de 2025 e as tabelas do SIDRA para o Brasil, por sexo e grupo de idade, em 2022 e 2010.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quantas pessoas em união sem casamento, 2022 | 35.149.318 pessoas a partir dos dez anos | SIDRA 10187, União consensual, total | "2022":"35149318" | |
| Quantas pessoas em união sem casamento, 2010 | 29.509.397 pessoas a partir dos dez anos | SIDRA 3484, União consensual, total | "2010":"29509397" | |
| Entre quem vivia em união, 2022 | 38,9% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 10187 | "2022":"35149318" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 unions total total` |
| Entre quem vivia em união, 2010 | 36,4% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 3484 | "2010":"29509397" | `scripts/calculations/ibge-2022-censo-unioes.ts 2010 unions total total` |
| Entre todas as pessoas, 2022 | Contando todo mundo a partir dos dez anos, com ou sem parceiro, 20,0% estavam em união sem casamento | SIDRA 10187 e 10185 | "2022":"35149318" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 people total total` |
| Entre todas as pessoas, 2010 | Contando todo mundo a partir dos dez anos, com ou sem parceiro, 18,2% estavam em união sem casamento | SIDRA 3484 e 3193 | "2010":"29509397" | `scripts/calculations/ibge-2022-censo-unioes.ts 2010 people total total` |
| Homens em união sem casamento, 2022 | 17.500.051 homens | SIDRA 10187, Homens | "2022":"17500051" | |
| Mulheres em união sem casamento, 2022 | 17.649.266 mulheres | SIDRA 10187, Mulheres | "2022":"17649266" | |
| Quem vivia em união, de 2010 a 2022 | A parte das pessoas a partir dos dez anos que vivia em união, casada ou não, subiu de 50,1% para 51,3% | Apresentação, p. 8 | "49,5 50,1 51,3" | |
| Dos 20 aos 24 anos, 2022 | 75,6% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 10187, 20 a 24 anos | "2022":"3655409" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 unions total 20-24` |
| Dos 20 aos 24 anos, 2010 | 66,7% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 3484, 20 a 24 anos | "2010":"3931263" | `scripts/calculations/ibge-2022-censo-unioes.ts 2010 unions total 20-24` |
| Homens dos 20 aos 24 anos, 2022 | 79,1% dos que viviam em união não tinham casamento civil nem religioso | SIDRA 10187, Homens, 20 a 24 anos | "2022":"1518043" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 unions men 20-24` |
| Mulheres dos 20 aos 24 anos, 2022 | 73,3% das que viviam em união não tinham casamento civil nem religioso | SIDRA 10187, Mulheres, 20 a 24 anos | "2022":"2137366" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 unions women 20-24` |
| Dos 25 aos 29 anos, 2022 | 62,2% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 10187, 25 a 29 anos | "2022":"5069257" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 unions total 25-29` |
| Dos 25 aos 29 anos, 2010 | 53,9% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 3484, 25 a 29 anos | "2010":"5167823" | `scripts/calculations/ibge-2022-censo-unioes.ts 2010 unions total 25-29` |
| Todos os homens dos 25 aos 29 anos, 2022 | Contando todos eles, com ou sem parceiro, 31,6% estavam em união sem casamento | SIDRA 10187 e 10185, Homens, 25 a 29 anos | "2022":"2395860" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 people men 25-29` |
| Todas as mulheres dos 25 aos 29 anos, 2022 | Contando todas elas, com ou sem parceiro, 34,3% estavam em união sem casamento | SIDRA 10187 e 10185, Mulheres, 25 a 29 anos | "2022":"2673397" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 people women 25-29` |
| Dos 60 aos 64 anos, 2022 | 21,6% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 10187, 60 a 64 anos | "2022":"1353071" | `scripts/calculations/ibge-2022-censo-unioes.ts 2022 unions total 60-64` |
| Dos 60 aos 64 anos, 2010 | 16,4% de quem vivia em união não tinham casamento civil nem religioso | SIDRA 3484, 60 a 64 anos | "2010":"707812" | `scripts/calculations/ibge-2022-censo-unioes.ts 2010 unions total 60-64` |
| Idade na primeira união | No Brasil, os homens tinham em média 25,9 anos em 2010 e 26,3 em 2022; as mulheres, 23,0 e 23,6 | Apresentação, p. 13 | "2000 2010 2022 2000 2010 2022 2000 2010 2022 24,2 24,4 25,0 25,8 25,9 26,3 22,7 23,0 23,6" | |
| Casas com casal do mesmo sexo, 2022 | 480 mil lares (unidades domésticas), 0,7% do total | Apresentação, p. 28 | "2022: 480 mil – 0,7% do total de unidades domésticas" | |
| Casais do mesmo sexo sem casamento, 2022 | 77,6% das pessoas em união com alguém do mesmo sexo não tinham casamento civil nem religioso | Apresentação, p. 28 | "Casamento civil e religioso So casamento civil So casamento religioso Uniao consensual Total % 7,7 13,5 1,2 77,6 100,0" | |

"União sem casamento", ou sem casamento civil nem religioso, é o que o Censo chama de união consensual, e "vivia em união" é o termo do Censo para quem estava em união conjugal de qualquer tipo. Os percentuais de 38,9% (2022) e 36,4% (2010) que o script tira das tabelas do SIDRA são os mesmos do gráfico da p. 10 da apresentação. Os outros percentuais saem do mesmo script, que divide o total de união sem casamento pelo de quem vivia em união (tabelas 10187 e 3484) ou pelo de todas as pessoas a partir dos 10 anos (tabelas 10185 e 3193), no mesmo sexo e na mesma idade.

Fonte local: `sources/ibge-2022-censo-unioes.txt`, com o texto das páginas citadas da apresentação e as quatro respostas da API de agregados do SIDRA, cada uma sob a URL de onde saiu.

## Limitações

- O Censo só registra a união de quem mora com o cônjuge. Namoro, casal que mora em casas separadas e união estável registrada mas sem coabitação ficam como "não vivia em união".
- "União consensual" não é o mesmo que união estável registrada em cartório: o Censo não pergunta se há escritura. A soma inclui uniões com e sem registro.
- Os números de 2022 vieram como "resultados preliminares da amostra estimados a partir de Áreas de Ponderação preliminares" (rodapé da apresentação). Os microdados definitivos saíram em 2026; nas tabelas por sexo e idade, a diferença nacional ficou abaixo de 2% (Ficha `ibge-2022-censo-amostra`).
- A apresentação diz que os dados de 2010 e 2022 não incluem domicílios em Terras Indígenas. As tabelas do SIDRA usadas aqui não trazem essa nota, mas os totais de 38,9% e 36,4% batem com os do gráfico.
- A participação da união consensual cresceu em todas as idades, mas o número absoluto entre jovens de 20 a 24 anos caiu (de 3.931.263 para 3.655.409), porque menos jovens viviam em união de qualquer tipo.
- A PNAD Contínua não serve para este tema: ela não pergunta a natureza da união, e só identifica o casal pelo cônjuge do responsável pelo domicílio (relatório de 2026-10-18 sobre o Grupo possível).
- Retrato de dois momentos, sem acompanhar as mesmas pessoas: não diz quantas uniões consensuais viram casamento depois.

## Como usamos

- [Relatório 2026-10-18 sobre os dados do Grupo possível](../reports/2026-10-18-dados-grupo-possivel.md), que já cita a tabela 10187 para mostrar que muitos legalmente "solteiros" vivem em união.
