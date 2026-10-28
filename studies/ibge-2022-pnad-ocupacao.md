---
reference: "IBGE. *Pesquisa Nacional por Amostra de Domicílios Contínua*: microdados trimestrais do 3º trimestre de 2022 (PNADC_032022_20250815), dicionário de variáveis e tabela 5435 do SIDRA. Rio de Janeiro: IBGE, 2022–2025."
link: https://ftp.ibge.gov.br/Trabalho_e_Rendimento/Pesquisa_Nacional_por_Amostra_de_Domicilios_continua/Trimestral/Microdados/2022/
status: verified
verified_on: 2026-10-26
strength: strong
strength_reason: "Amostra probabilística nacional grande, com estrato e UPA no microdado e pesos refeitos sobre a população do Censo 2022; a ocupação é a declarada na semana de referência."
countries: [Brasil]
period: "3º trimestre de 2022"
sample:
  n: 487786
  description: "487.786 moradores entrevistados no 3º trimestre de 2022 (contagem no microdado), numa amostra probabilística de domicílios com estrato e UPA; a ocupação é perguntada a quem tem 14 anos ou mais."
  representative: true
design: cross-sectional
conflict: "Órgão oficial de estatística."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); o FTP do IBGE e o SIDRA não trazem termo de licença."
covers:
  genders: [man, woman]
  ages: { min: 14, max: 99 }
institution: ibge
---

# IBGE (2022): PNAD Contínua, ocupação

## O que mediu

Inquérito domiciliar trimestral que pergunta a cada morador de 14 anos ou mais se trabalhou na semana de referência e em quê. O [[IBGE]] classifica a ocupação do trabalho principal em 11 grupamentos (VD4011). O microdado traz no mesmo registro o sexo, a idade, o nível de instrução (VD3004), o peso calibrado (V1028), o estrato e a UPA, o que dá a proporção de cada grupamento por sexo, idade e escolaridade, com o intervalo de 95%.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Diretores e gerentes, o primeiro dos que o Grupo possível conta como escritório | Grupamento 1 | Dicionário de variáveis, VD4011 | "1	Diretores e gerentes" |
| Profissionais das ciências e intelectuais | Grupamento 2 | Dicionário de variáveis, VD4011 | "2	Profissionais das ciências e intelectuais" |
| Técnicos | Grupamento 3 | Dicionário de variáveis, VD4011 | "3	Técnicos e profissionais de nível médio" |
| Apoio administrativo | Grupamento 4 | Dicionário de variáveis, VD4011 | "4	Trabalhadores de apoio administrativo" |
| Ocupados de 14 anos ou mais, Brasil | 97.435 mil | SIDRA 5435, variável 4090, Total, 3º tri 2022 | {"202203":"97435"} |
| Diretores e gerentes | 3.444 mil | SIDRA 5435, variável 4090, 3º tri 2022 | {"202203":"3444"} |
| Profissionais das ciências e intelectuais | 11.658 mil | SIDRA 5435, variável 4090, 3º tri 2022 | {"202203":"11658"} |
| Técnicos e profissionais de nível médio | 8.104 mil | SIDRA 5435, variável 4090, 3º tri 2022 | {"202203":"8104"} |
| Trabalhadores de apoio administrativo | 8.016 mil | SIDRA 5435, variável 4090, 3º tri 2022 | {"202203":"8016"} |

O pipeline do Grupo possível soma os pesos do microdado por grupamento e reproduz cada um dos 11 valores da tabela 5435 e o total, no milhar publicado; se um não bate, ele não escreve o arquivo.

Fonte local: `sources/ibge-2022-pnad-ocupacao.txt`, com as linhas do dicionário (VD3004, VD4002 e VD4011) e a resposta da API do SIDRA 5435, cada um sob a URL de onde saiu. O microdado fica no cache do pipeline, fora do repositório.

## Limitações

- "Escritório" é uma definição nossa sobre os grupamentos da classificação de ocupações (COD), decidida em 26/10/2026: entram médicos, professores e técnicos de saúde, que não trabalham num escritório, e ficam de fora vendedores e atendentes, que às vezes trabalham.
- Um trimestre só: a proporção é a do 3º trimestre de 2022, o da data de referência do Censo (31 de julho de 2022). A ocupação muda com o mercado de trabalho, e o número de hoje pode ser outro.
- A ocupação é a do trabalho principal na semana de referência. Quem estava sem trabalho naquela semana não conta como escritório.
- Com poucos registros, o intervalo da linearização encolhe demais. Por isso o arquivo deixa de fora as linhas de escolaridade com menos de 30 registros, e a conta usa a linha de todas as escolaridades daquele sexo e idade.
- O Grupo possível multiplica a célula do Censo por essa proporção dentro de sexo, idade e escolaridade, supondo que, dentro disso, ela não depende de renda, cor, religião ou união.

## Como usamos

- Dados do Grupo possível: `data/possible-group/pnad-2022.csv`, gerado por `scripts/possible-group/pipeline.ts --pnad-only`, para o Requisito "trabalha em escritório" (#294).
- [Relatório 2026-10-26 sobre calculadoras de grupo possível](../reports/2026-10-26-calculadoras-grupo-possivel.md).
