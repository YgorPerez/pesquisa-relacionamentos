---
reference: "IBGE. *Pesquisa Nacional por Amostra de Domicílios: Práticas de Esporte e Atividade Física 2015*. Rio de Janeiro: IBGE, 2017."
link: https://biblioteca.ibge.gov.br/visualizacao/livros/liv100364.pdf
status: verified
verified_on: 2026-10-20
strength: moderate
strength_reason: "Amostra probabilística nacional de 71.142 pessoas, mas os dados são de 2015, cada um diz se o que fez é esporte ou atividade física, e modalidades pequenas como dança não trazem o erro da célula no livro."
countries: [Brasil]
period: "27 de setembro de 2014 a 26 de setembro de 2015"
sample:
  n: 71142
  description: "71.142 pessoas de 15 anos ou mais, uma por domicílio sorteado numa subamostra da PNAD 2015, que responderam por si mesmas."
  representative: true
design: cross-sectional
conflict: "Órgão oficial de estatística; o questionário partiu da pesquisa Diesporte, do Ministério do Esporte."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); a biblioteca do IBGE não traz termo de licença."
covers:
  genders: [man, woman]
  ages: { min: 15, max: 99 }
---

# IBGE (2015): PNAD, práticas de esporte e atividade física

## O que mediu

Suplemento da PNAD 2015 que perguntou a uma pessoa de 15 anos ou mais por domicílio se ela tinha praticado esporte ou atividade física no tempo livre nos 12 meses anteriores, e qual a modalidade principal. A própria pessoa decidia se o que fazia era esporte ou atividade física, então a mesma prática aparece nas duas listas. As tabelas dão, para cada modalidade principal, a parcela de homens e de mulheres entre os praticantes.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Pessoas entrevistadas no suplemento | 71 142, de 15 anos ou mais | p. 24 do PDF, Tamanho da amostra | "Para o tema suplementar Práticas de Esporte e Atividade Física, foram investigadas 71 142 pessoas de 15 anos ou mais de idade." | |
| Quem respondia | A própria pessoa sorteada | p. 19 do PDF, Plano amostral | "Uma característica importante dessa investigação é a necessidade de entrevistar a própria pessoa selecionada para a pesquisa" | |
| Esporte ou atividade física | Classificação da própria pessoa | p. 25 do PDF | "não foi estabelecida uma diferenciação entre esporte e atividade física, ficando a cargo da pessoa investigada a classificação da atividade por ela realizada" | |
| Praticantes de esporte ou atividade física, por sexo | 53,9% homens, 46,1% mulheres | p. 26 do PDF | "observou-se que 46,1% eram mulheres e 53,9%, homens" | |
| Praticantes de esporte, por sexo | 63,2% homens, 36,8% mulheres | Tabela 5, linha Total | "Total 100,0 63,2 36,8" | |
| Praticantes de atividade física, por sexo | 44,3% homens, 55,7% mulheres | Tabela 13, linha Total | "Total 100,0 44,3 55,7" | |
| Dança e balé como esporte principal | 85,0% mulheres, 15,0% homens | Tabela 5 | "Dança e ballet 100,0 15,0 85,0" | |
| Mulheres por homem na dança e balé | 5,7 | Tabela 5 | "Dança e ballet 100,0 15,0 85,0" | `scripts/calculations/ibge-2015-pnad-esporte.ts Dança e ballet` |
| O que conta como dança | Clássico, contemporâneo, moderno, salão, esportivo e outro | Anexo 1, p. 58 do PDF | "180 Dança/Ballet 18001 Clássico 18002 Contemporâneo 18003 Moderno 18004 Salão 18005 Esportivo 18006 Outro" | |
| Ginástica rítmica e artística | 80,5% mulheres | Tabela 5 | "Ginástica rítmica e artística 100,0 19,5 80,5" | |
| Fitness como esporte principal | 64,4% mulheres | Tabela 5 | "Fitness 100,0 35,6 64,4" | |
| Caminhada como esporte principal | 65,5% mulheres | Tabela 5 | "Caminhada 100,0 34,5 65,5" | |
| Voleibol, basquete e handebol | 57,0% mulheres | Tabela 5 | "Voleibol, basquetebol e handebol 100,0 43,0 57,0" | |
| Futebol como esporte principal | 94,5% homens | Tabela 5 | "Futebol 100,0 94,5 5,5" | |
| Ciclismo como esporte principal | 75,2% homens | Tabela 5 | "Ciclismo 100,0 75,2 24,8" | |
| Lutas e artes marciais | 70,0% homens | Tabela 5 | "Lutas e artes marciais 100,0 70,0 30,0" | |
| Atletismo (inclui corrida de rua) como esporte principal | 64,5% homens | Tabela 5 | "Atletismo 100,0 64,5 35,5" | |
| Atletismo inclui corrida de rua | Código 7007 | Anexo 1, p. 56 do PDF | "7007 Corrida de rua" | |
| Corrida como atividade física principal | 79,2% homens, 20,8% mulheres | Tabela 13 | "Corrida 100,0 79,2 20,8" | |
| Homens por mulher na corrida como atividade física | 3,8 | Tabela 13 | "Corrida 100,0 79,2 20,8" | `scripts/calculations/ibge-2015-pnad-esporte.ts Corrida` |
| Fitness ou academia como atividade física | 66,4% mulheres | Tabela 13 | "Fitness ou academia 100,0 33,6 66,4" | |
| Musculação como atividade física | 57,3% homens | Tabela 13 | "Culturismo e musculação 100,0 57,3 42,7" | |
| Falta de companhia como motivo para não praticar esporte | 1,7% | Tabela 10, p. 41 do PDF | "Não terem companhia para praticar o esporte 1,7 1,9 1,7 1,6 2,1 1,7" | |

Fonte local: `sources/ibge-2015-pnad-esporte.txt`, com o texto das páginas citadas da publicação, sob a URL de onde saiu.

## Limitações

- Os dados são de 2014–2015. A corrida de rua e o beach tennis, por exemplo, cresceram desde então, e a divisão por sexo pode ter mudado.
- As tabelas são da modalidade **principal**. Quem dança como segunda atividade não entra na linha da dança.
- A mesma prática aparece como esporte para uns e como atividade física para outros: a corrida está dentro de atletismo na Tabela 5 (64,5% homens) e sozinha na Tabela 13 (79,2% homens). A dança só tem linha própria na Tabela 5; na Tabela 13 está em "outras atividades".
- A dança é uma modalidade pequena: na Tabela 4 ela está dentro de "outros esportes", que somam 14,7% dos praticantes. O livro não dá o número de pessoas nem o coeficiente de variação da linha; o IBGE diz que publicou os coeficientes no portal, que não conferimos.
- A tabela por sexo não vem cruzada com idade. Não dá para dizer a proporção na dança entre pessoas de 25 a 39 anos, por exemplo.
- A pesquisa mede quem pratica, não se a prática é em grupo. Caminhada e corrida podem ser solitárias; a dança de salão e os esportes coletivos, não.
- Sexo é o registrado na PNAD; não há identidade de gênero nem orientação sexual.
- No texto da p. 44 o futebol como atividade física aparece com 94,4% de homens, e a Tabela 13 traz 94,6%. A Ficha usa a tabela.
