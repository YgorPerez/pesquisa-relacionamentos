---
reference: "IBGE. *Estatísticas do Registro Civil 2024*. Rio de Janeiro: IBGE, v. 51, 2025 (informativo), com a apresentação de divulgação de 10/12/2025 e as tabelas 4406 e 1695 do SIDRA. Texto completo aberto: https://biblioteca.ibge.gov.br/visualizacao/periodicos/135/rc_2024_v51_informativo.pdf"
link: https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/031ad256f70356ed66b25e4ff01767cc.pdf
status: verified
verified_on: 2026-10-21
strength: strong
strength_reason: "Registro administrativo de todos os casamentos civis do país, informados por 8.022 cartórios; os divórcios podem estar subenumerados em 2024, porque o IBGE teve dificuldade de coletá-los nas varas e nos tabelionatos."
countries: [Brasil]
period: "2024, comparado com 2004, 2014 e a média de 2015 a 2019"
sample:
  n: 948925
  description: "Os 948.925 casamentos civis registrados em cartório em 2024 e os 428.301 divórcios entre pessoas de sexos diferentes concedidos em primeira instância ou por escritura."
  representative: true
design: administrative
conflict: "Órgão oficial de estatística."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); a biblioteca do IBGE e o SIDRA não trazem termo de licença."
covers:
  genders: [man, woman]
institution: ibge
---

# IBGE (2024): Estatísticas do Registro Civil

## O que mediu

Os casamentos civis registrados nos Cartórios de Registro Civil de Pessoas Naturais e os divórcios concedidos pelas varas de família ou lavrados em escritura nos tabelionatos em 2024. O [[IBGE]] publica quantos houve, a idade média ao casar e ao divorciar, o estado civil anterior dos cônjuges e o tempo entre o casamento e o divórcio. A Ficha usa o informativo da pesquisa, a apresentação de divulgação e duas tabelas do SIDRA para os totais.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Casamentos civis, 2024 | 948.925 casamentos | SIDRA 4406, Número de casamentos, Brasil | "2023":"940799","2024":"948925" | |
| Casamentos em relação a 2023 | Aumento de 0,9% | Informativo, p. 4 | "o que representa um aumento de 0,9% em relação ao ano anterior" | |
| Casamentos entre cônjuges de sexos diferentes, 2024 | 936.738 casamentos | SIDRA 4406, cônjuges masculino e feminino | "2023":"929601","2024":"936738" | |
| Casamentos entre cônjuges do mesmo sexo, 2024 | 12.187 casamentos | SIDRA 4406: 4.311 entre homens e 7.876 entre mulheres | "2023":"7023","2024":"7876" | `scripts/calculations/ibge-2024-registro-civil.ts same-sex` |
| Casamentos do mesmo sexo entre mulheres, 2024 | 64,6% dos casamentos do mesmo sexo foram entre mulheres | Informativo, p. 4 | "os ocorridos entre mulheres representaram 64,6% dos casamentos civis entre pessoas do mesmo sexo" | |
| Média anual de casamentos, 2015 a 2019 | 1.076.280 casamentos por ano | SIDRA 4406, 2015 a 2019; o informativo, p. 5, traz o mesmo número | "2015":"1137348" | `scripts/calculations/ibge-2024-registro-civil.ts mean-2015-2019` |
| Taxa de casamento civil, pessoas de 15 anos ou mais, 2024 | Em cada mil pessoas nessa idade, 5,6 se casaram no civil | Informativo, p. 6 | "para cada 1 000 habitantes dessa faixa etária, 5,6 pessoas, em média, uniram-se por meio do casamento civil em 2024" | |
| Idade ao casar, solteiros de sexos diferentes, 2024 | Em média, os homens casaram aos 31,5 anos, e as mulheres, aos 29,3 | Informativo, p. 6 | "os homens se casaram, em média, aos 31,5 anos, e as mulheres, aos 29,3 anos de idade" | |
| A mesma idade em 2004 e 2014 | Em média, os homens casaram aos 27,8 e aos 29,8 anos, e as mulheres, aos 24,9 e aos 27,1 | Apresentação, p. 28, rótulos do gráfico (posição de cada rótulo conferida no PDF) | "31.5 29.8 29.3 27.8 27.1 Idade média ao casar 24.9" | |
| Idade ao casar, solteiros do mesmo sexo, 2024 | Em média, os homens casaram aos 34,7 anos, e as mulheres, aos 32,5 | Informativo, p. 6 | "idade média ao contrair a união foi de 34,7 anos, entre os homens, e de 32,5 anos, entre as mulheres" | |
| Mulheres com 40 anos ou mais entre as que casaram com homem | Foram 8,5% em 2004 e 25,3% em 2024 | Informativo, p. 7 | "Em 2004, 8,5% das mulheres que se casaram tinham 40 anos ou mais de idade. Em 2024, 25,3%" | |
| Homens com 40 anos ou mais entre os que casaram com mulher | Foram 13,2% em 2004 e 31,3% em 2024 | Informativo, p. 7 | "entre 2004 (13,2%) e 2024 (31,3%)" | |
| Casamentos com pelo menos um cônjuge divorciado ou viúvo | Foram 13,5% em 2004, 23,4% em 2014 e 31,1% em 2024 | Informativo, p. 7 | "variou de 13,5%, em 2004, a 23,4%, em 2014, alcançando, em 2024, 31,1%" | |
| Divórcios, 2024 | 428.301 divórcios | SIDRA 1695, Brasil | "2023":"440827","2024":"428301" | |
| Divórcios em relação a 2023 | Queda de 2,8% | Informativo, p. 7 | "o que representa uma redução de 2,8% em relação ao total contabilizado em 2023" | |
| Divórcios judiciais, 2024 | 81,8% dos divórcios foram judiciais, em primeira instância | Informativo, p. 7 | "Os divórcios judiciais concedidos em primeira instância corresponderam a 81,8% dos divórcios" | |
| Divórcios por casamento, sexos diferentes, 2024 | Cerca de 45,7 divórcios a cada 100 casamentos registrados | Informativo, p. 7 | "a cada 100 casamentos entre pessoas de sexos diferentes que foram registrados, ocorreram cerca de 45,7 divórcios" | |
| Taxa geral de divórcios, 2024 | Cerca de 2,7 divórcios por mil pessoas de 20 anos ou mais | Informativo, p. 7 | "1 000 pessoas de 20 anos ou mais de idade foi de aproximadamente 2,7‰ em 2024" | |
| Idade ao divorciar, 2024 | Em média, os homens tinham 44,5 anos, e as mulheres, 41,6 | Informativo, p. 8 | "os homens tinham, em média, 44,5 anos, enquanto as mulheres, 41,6 anos de idade" | |
| Tempo entre o casamento e o divórcio | Em média, cerca de 16,0 anos em 2010 e 13,8 anos em 2024 | Informativo, p. 8 | "em 2010, o tempo médio entre a data do casamento e a data da sentença ou escritura do divórcio era de aproximadamente 16,0 anos. Em 2024, houve uma diminuição no tempo de duração dos casamentos para 13,8 anos" | |
| Divórcios de casamentos com menos de 10 anos, de 2014 a 2024 | A parte deles subiu de 43,6% para 47,5% | Apresentação, p. 36, rótulos do gráfico "Menos de 10 anos" | "43.6 47.5" | |
| Divórcios judiciais de casais sem filhos, 2024 | 30,4% dos divórcios judiciais foram de casais sem filhos | Informativo, p. 8 | "30,4% dos divórcios ocorreram entre casais sem filhos" | |
| Guarda compartilhada nos divórcios judiciais com filhos menores | Passou de 7,5% em 2014 para 44,6% em 2024 | Informativo, p. 8 | "Em 2014, a proporção de guarda compartilhada entre os pais com filhos menores era de 7,5%. Essa modalidade passou a representar 44,6% em 2024" | |

Fonte local: `sources/ibge-2024-registro-civil.txt`, com o texto das páginas citadas do informativo e da apresentação e as três respostas da API de agregados do SIDRA, cada uma sob a URL de onde saiu. Os totais vêm do SIDRA porque o PDF separa o milhar com espaço ("948 925"), e a conferência leria dois números. O informativo e a apresentação trazem os mesmos totais.

## Limitações

- **Não registra como o casal se conheceu.** Não dá para comparar casais de app e offline no Brasil.
- Uniões estáveis ficam de fora: "As uniões consensuais ou uniões estáveis não fazem parte do âmbito da pesquisa" (informativo, p. 4). Para o tamanho delas, ver a Ficha `ibge-2022-censo-unioes`.
- Os divórcios de 2024 podem estar subenumerados. O informativo (p. 7, nota 9) diz que o IBGE "vem encontrando dificuldades para a realização da coleta dos dados de divórcios" nos tabelionatos e nas varas, e remete a uma nota técnica sobre a "possível subenumeração de divórcios". A página das notas técnicas barrou o `curl` em 2026-10-21 (desafio do Cloudflare); a nota não foi lida. A queda de 2,8% pode ser em parte falta de coleta.
- Os números de divórcio cobrem só casais de sexos diferentes.
- O tempo médio até o divórcio é medido entre os casamentos que acabaram em divórcio naquele ano. Não é a duração de um casamento típico nem a chance de um casamento acabar.
- A idade média ao casar dos solteiros não é a idade da primeira união: quem viveu antes em união estável sem casar conta como solteiro.
- Os valores de 2004 e 2014 da idade ao casar e a divisão por duração dos divórcios saem dos rótulos dos gráficos da apresentação. O informativo de 2024 não os escreve no texto.

## Como usamos

- [Relatório 2026-10-18](../reports/2026-10-18-casamentos-apps-e-onde-procurar.md), seção 3.2; argumento de "sem pressa" nas dicas.
