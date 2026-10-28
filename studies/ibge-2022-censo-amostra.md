---
reference: "IBGE. *Censo Demográfico 2022: microdados da amostra, acesso público*, com o Dicionário de Variáveis e as Notas metodológicas 03/2026 (controle de confidencialidade) e 05/2026 (microdados da amostra). Rio de Janeiro: IBGE, 2026."
link: https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/
status: verified
verified_on: 2026-10-25
strength: strong
strength_reason: "Questionário da amostra do Censo, aplicado 7,8 milhões de vezes; o arquivo público perde o município e a idade exata."
countries: [Brasil]
period: "2022 (data de referência: 31 de julho)"
sample:
  n: 7793421
  description: "7.793.421 questionários da amostra, 10,6% do total de questionários do Censo; o arquivo público traz um registro por morador, com peso amostral."
  representative: true
design: cross-sectional
conflict: "Órgão oficial de estatística."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); o FTP do IBGE não traz termo de licença."
covers:
  genders: [man, woman]
institution: ibge
---

# IBGE (2022): Censo Demográfico, microdados da amostra

## O que mediu

O questionário da amostra do Censo 2022, por pessoa: sexo, idade, UF, estado conjugal, escolaridade, rendimento, cor ou raça, religião e, para mulheres, filhos nascidos vivos. O arquivo de acesso público vem com peso amostral (P0110) e permite cruzar essas variáveis entre si, até o nível de UF.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Questionários da amostra aplicados | 7.793.421 (10,6% do total) | Notas metodológicas 05/2026, p. 12 | "O Questionário da Amostra foi realizado 7.793.421 vezes, equivalente a 10,6% do total de questionários" | |
| Data de referência | 31 de julho de 2022 | Notas metodológicas 05/2026, p. 20 | "teve como data de referência a meia-noite do dia 31 de julho para 1° de agosto de 2022" | |
| Menor recorte geográfico do arquivo público | UF | Notas metodológicas 03/2026, p. 8 | "a Unidade da Federação constituiu o nível geográfico mais desagregado disponibilizado nessa modalidade" | |
| Idade no arquivo público | Grupos quinquenais, com 80 anos ou mais no topo | Notas metodológicas 03/2026, p. 8 | "a variável de idade foi recodificada em grupos quinquenais, com recodificação adicional para a categoria superior a 80 anos" | |
| Domicílios tirados na subamostra de confidencialidade | ~116 mil (~1,5%), com os demais reponderados | Notas metodológicas 03/2026, p. 8 | "aproximadamente 116 mil domicílios, correspondentes a cerca de 1,5% dos domicílios, foram suprimidos nesse processo, sendo os registros restantes reponderados" | |
| O que os pesos públicos garantem | Só a população total de cada UF | Notas metodológicas 03/2026, p. 11 | "o processo de calibração garante, no nível de Unidade da Federação, a coincidência apenas dos resultados referentes à população total" | |
| Supressão de sexo e idade | Em registros com risco de revelação, junto com a fecundidade | Notas metodológicas 03/2026, p. 8 | "Entre as variáveis afetadas encontram-se sexo e idade. Nos casos correspondentes, também foram suprimidas variáveis que dependiam diretamente do sexo, como as relacionadas à fecundidade" | |
| "Vivia em união" | Cônjuge ou companheiro(a) morador do domicílio | Notas metodológicas 05/2026, p. 41 | "Vivia em união - para a pessoa que vivia em união conjugal com cônjuge ou companheiro(a) que era morador no domicílio" | |
| Filhos nascidos vivos | Só para mulheres de 12 anos ou mais | Dicionário de Variáveis, P0320 (p. 28 do PDF) | "Investigou-se a quantidade de filhos homens nascidos vivos para mulher de 12 anos ou mais de idade" | |
| Sexo | Biológico, atribuído ao nascer | Dicionário de Variáveis, P0150 (p. 22 do PDF) | "Sexo biológico do morador (atribuído ao nascer)." | |
| População residente, Brasil | 203.080.756 | SIDRA 9514 pela API de agregados: variável 93, Brasil, sexo, idade e forma de declaração totais | "2022":"203080756" | |
| Mulheres de 25 a 29 anos em SP que não viviam em união, no SIDRA | 747.507 | SIDRA 10185 pela API de agregados: variável 140, São Paulo (N3 35), Não viviam em união, Mulheres, 25 a 29 anos, cor ou raça total | "2022":"747507" | |
| A mesma célula, somando os pesos do microdado público | 746.284 | `data/possible-group/censo-2022.csv.gz`, gerado do arquivo de pessoas | "P0110 – Peso Amostral (acesso público)" | `scripts/calculations/ibge-2022-censo-amostra.ts` |
| Homens de 25 a 29 anos no Brasil, no SIDRA | 7.593.659 | SIDRA 10185 pela API de agregados: variável 140, Brasil, estado conjugal Total, Homens, 25 a 29 anos, cor ou raça total | "2022":"7593659" | |
| Homens de 25 a 29 anos no Brasil que não viviam em união, no SIDRA | 3.939.138 | SIDRA 10185, a mesma consulta: Não viviam em união, Homens | "2022":"3939138" | |
| Mulheres de 25 a 29 anos no Brasil, no SIDRA | 7.804.840 | SIDRA 10185, a mesma consulta: estado conjugal Total, Mulheres | "2022":"7804840" | |
| Mulheres de 25 a 29 anos no Brasil que não viviam em união, no SIDRA | 3.309.733 | SIDRA 10185, a mesma consulta: Não viviam em união, Mulheres | "2022":"3309733" | |
| Parte dos homens de 25 a 29 anos no Brasil que não vivia em união | 51,9% | SIDRA 10185, a mesma consulta: Não viviam em união sobre o Total, Homens | "2022":"3939138" | `scripts/calculations/ibge-2022-censo-amostra-brasil.ts men` |
| Parte das mulheres de 25 a 29 anos no Brasil que não vivia em união | 42,4% | SIDRA 10185, a mesma consulta: Não viviam em união sobre o Total, Mulheres | "2022":"3309733" | `scripts/calculations/ibge-2022-censo-amostra-brasil.ts women` |

A soma dos pesos do microdado público dá exatamente a população de cada UF na tabela 9514 (no Brasil, 203.080.756), como a Nota 03/2026 promete. O pipeline (`scripts/possible-group/pipeline.ts`) confere isso e as 1.568 células do estado conjugal da tabela 10185 a cada rodada.

Fonte local: `sources/ibge-2022-censo-amostra.txt`, com o texto das páginas citadas das duas notas metodológicas e do dicionário e as três respostas do SIDRA, cada um sob a URL de onde saiu. Os microdados ficam no cache do pipeline, fora do repositório.

## Limitações

- O arquivo público não tem município nem idade em anos. O Grupo possível usa a composição da UF e rateia pela população do município e da idade simples (SIDRA 9514).
- Fora a população total da UF, os números do microdado podem divergir do SIDRA. No Brasil, a diferença no estado conjugal por sexo e grupo de idade ficou abaixo de 2%; nas UFs pequenas, como Roraima, uma célula chega a 28% (a proporção sem união, a 2,5 pontos).
- "Não vivia em união" inclui quem namora e quem tem cônjuge em outro domicílio. O Censo não pergunta estado civil legal.
- Não há identidade de gênero nem orientação sexual. Filhos só existem para mulheres.
- 19.216 registros com sexo ou idade suprimidos ficam fora do Grupo possível.
- Retrato de julho de 2022: renda e escolaridade mudam.

## Como usamos

- Dados do Grupo possível: `data/possible-group/censo-2022.csv.gz` e as tabelas do SIDRA 9514 ao lado, gerados por `scripts/possible-group/pipeline.ts`.
- [Relatório 2026-10-18 sobre os dados do Grupo possível](../reports/2026-10-18-dados-grupo-possivel.md).
