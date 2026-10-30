---
reference: "IBGE. *Pesquisa Nacional de Saúde 2019: microdados e dicionário*, versão de maio de 2022. Estimativa própria de composição por sexo na dança."
link: https://ftp.ibge.gov.br/PNS/2019/Microdados/
status: verified
verified_on: 2026-10-28
strength: moderate
strength_reason: "Amostra probabilística nacional com pesos calibrados e erro estimado pelo desenho, mas só 625 respondentes declararam dança como exercício principal; a medida é autorrelatada e de 2019."
countries: [Brasil]
period: "2019; exercício nos três meses anteriores à entrevista"
sample:
  n: 625
  description: "625 moradores selecionados de 15 anos ou mais que responderam P036 = 16, entre 90.846 respondentes com peso calibrado positivo."
  representative: true
design: cross-sectional
conflict: "Pesquisa oficial do IBGE em parceria com o Ministério da Saúde; cálculo desta Ficha feito no repositório, não publicado pelo IBGE."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); o diretório do IBGE não traz termo específico de licença."
covers:
  genders: [man, woman]
institution: ibge
---

# IBGE (2019): composição por sexo na dança como exercício

## O que mediu

A PNS sorteou um morador de 15 anos ou mais por domicílio para o questionário individual. Entre quem praticou exercício físico ou esporte nos três meses anteriores, P036 pergunta qual praticava com mais frequência e registra apenas o primeiro citado. A opção de dança é "Dança (com o objetivo de praticar atividade física)".

Calculamos a parcela de mulheres e de homens **entre esses praticantes de dança**, com o peso calibrado do morador selecionado (V00291). Não é a parcela das mulheres brasileiras que dança. A análise inclui pessoas de 15 a 17 anos, diferentemente das tabelas de atividade física da publicação, voltadas aos adultos.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Mulheres entre quem dança como exercício | Entre as pessoas que citaram a dança como o exercício que praticam ou praticavam com mais frequência, 88,4% eram mulheres (IC de 95%: 83,4% a 93,4%) | Microdados, P036, C006, V00291; agregados por V0024 e UPA_PNS | "16 Dança (com o objetivo de praticar atividade física)" | `scripts/calculations/ibge-2019-pns-danca.py` |
| Homens entre quem dança como exercício | Nesse mesmo grupo, 11,6% eram homens (IC de 95%: 6,6% a 16,6%) | Mesmos microdados e desenho | "16 Dança (com o objetivo de praticar atividade física)" | `scripts/calculations/ibge-2019-pns-danca.py` |
| Quantos entrevistados citaram a dança | 625 pessoas: 557 mulheres e 68 homens, contados um a um, sem o ajuste que a pesquisa faz para representar a população | Extração dos microdados, P036 e C006 | "16 Dança (com o objetivo de praticar atividade física)" | `scripts/calculations/ibge-2019-pns-danca.py` |

Fonte local: `sources/ibge-2019-pns-danca.txt`, com transcrição das entradas do dicionário e do método oficial. Os insumos numéricos estão em `sources/ibge-2019-pns-danca-psu.csv`, agregados reproduzíveis dos microdados oficiais, e não uma tabela publicada pelo IBGE. O script tem um modo `extract` que verifica o checksum do arquivo bruto e reconstrói esses agregados.

O IC de 95% é o intervalo de confiança: a faixa em que o número provavelmente está, já que a pesquisa ouviu só uma parte da população.

O erro padrão da parcela feminina é de 2,538 pontos percentuais. Usamos linearização de Taylor da razão de totais ponderados, com estratos V0024 e conglomerados UPA_PNS, mantendo todas as unidades dos respondentes selecionados, inclusive as sem praticantes de dança. Há 8.027 UPAs em 574 estratos; nenhum estrato tem uma única UPA. O IC bilateral usa a aproximação normal de Wald e amostragem com reposição no primeiro estágio, sem correção de população finita. Não recalculamos a incerteza da calibração dos pesos.

## Limitações

- A opção reúne estilos de dança e não diz se a prática foi em aula, em grupo ou em casa. Não mede oportunidades de conhecer parceiros.
- Quem dança como segunda atividade não aparece nesse subgrupo. Há autorrelato e só um exercício mais frequente registrado.
- A célula masculina tem poucos respondentes; o intervalo informa essa incerteza. Os pesos mudam a composição em relação à contagem simples.
- Os dados são de 2019 e representam moradores de domicílios particulares permanentes na abrangência da PNS, com as exclusões de setores especiais descritas nas notas técnicas. Não são um retrato atual das academias ou escolas de dança.
- C006 registra sexo como homem ou mulher; a tabela não mede identidade de gênero nem orientação sexual.
- A PNAD 2015 perguntou sobre dança e balé como esporte principal, com outro período e definição. A diferença entre suas estimativas e esta não demonstra uma tendência temporal.
