---
reference: "IBGE. *Pesquisa Nacional por Amostra de Domicílios Contínua: Outras formas de trabalho 2022* (informativo). Rio de Janeiro: IBGE, 2023. Com as tabelas 7080, 7081, 7085 e 7096 do SIDRA."
link: https://biblioteca.ibge.gov.br/visualizacao/livros/liv102020_informativo.pdf
status: verified
verified_on: 2026-10-20
strength: strong
strength_reason: "Amostra probabilística nacional da PNAD Contínua, com tabelas oficiais por sexo e idade; o voluntariado é contado só na semana de referência."
countries: [Brasil]
period: "2022"
sample:
  description: "Moradores de 14 anos ou mais dos domicílios da PNAD Contínua na quinta visita; o informativo não diz quantas pessoas foram entrevistadas."
  representative: true
design: cross-sectional
conflict: "Órgão oficial de estatística."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); a biblioteca do IBGE e o SIDRA não trazem termo de licença."
covers:
  genders: [man, woman]
  ages: { min: 14, max: 99 }
---

# IBGE (2022): PNAD Contínua, trabalho voluntário

## O que mediu

Na quinta visita ao domicílio, a PNAD Contínua pergunta se cada morador de 14 anos ou mais fez trabalho voluntário, sem pagamento, por pelo menos uma hora na semana de referência: em igreja, sindicato, escola, hospital, ONG, associação de moradores ou esportiva, mutirão, proteção de animais, ou ajudando quem não é parente. O IBGE publica a taxa de quem fez e a contagem de voluntários por sexo, idade e forma de inserção.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Definição de trabalho voluntário | Sem remuneração, por pelo menos uma hora na semana, para terceiros | Informativo, p. 11 | "realizado por pelo menos uma hora na semana de referência, sem receber nenhuma remuneração em dinheiro ou benefícios, com o objetivo de produzir bens ou serviços para terceiros" | |
| Voluntários no Brasil | 7,3 milhões; taxa de 4,2% | Informativo, p. 11 | "Em 2022, 7,3 milhões de pessoas de 14 anos ou mais de idade realizaram trabalho voluntário na semana de referência da pesquisa, o que corresponde a uma taxa de realização de 4,2%" | |
| Taxa de realização por sexo | Mulheres 4,9%, homens 3,5% | Informativo, p. 12, gráfico por características | "Sexo Homem 3,5 Mulher 4,9" | |
| Mulheres entre os voluntários | 60,3% | SIDRA 7080, variável 10238, Mulheres, 2022 | "2022":"60.3" | |
| Homens entre os voluntários | 39,7% | SIDRA 7080, variável 10238, Homens, 2022 | "2022":"39.7" | |
| Taxa de realização das mulheres de 25 a 49 anos | 5,3% | SIDRA 7096, Mulheres, 25 a 49 anos, 2022 | "2022":"5.3" | |
| Taxa de realização dos homens de 25 a 49 anos | 3,8% | SIDRA 7096, Homens, 25 a 49 anos, 2022 | "2022":"3.8" | |
| Taxa de realização das mulheres de 14 a 24 anos | 2,9% | SIDRA 7096, Mulheres, 14 a 24 anos, 2022 | "2022":"2.9" | |
| Taxa de realização dos homens de 14 a 24 anos | 2,1% | SIDRA 7096, Homens, 14 a 24 anos, 2022 | "2022":"2.1" | |
| Voluntárias de 25 a 49 anos | 2.188 mil | SIDRA 7081, variável 10236, Mulheres, 25 a 49 anos, 2022 | "2022":"2188" | |
| Voluntários de 25 a 49 anos, os dois sexos | 3.694 mil | SIDRA 7081, variável 10236, Total, 25 a 49 anos, 2022 | "2022":"3694" | |
| Mulheres entre os voluntários de 25 a 49 anos | 59,2% | SIDRA 7081: 2.188 mil mulheres de 3.694 mil voluntários (linhas acima) | "2022":"2188" | `scripts/calculations/ibge-2022-pnad-voluntariado.ts 7081 25 a 49 anos` |
| Voluntariado por empresa, organização ou instituição | 86,4% dos voluntários | Informativo, p. 11 | "Em 2022, 86,4% das pessoas que realizaram trabalho voluntário o fizeram por meio de empresa, organização ou instituição" | |
| Voluntárias por empresa, organização ou instituição | 3.828 mil | SIDRA 7085, variável 10236, Mulheres, Empresa, organização ou instituição, 2022 | "2022":"3828" | |
| Voluntários por empresa, organização ou instituição, os dois sexos | 6.291 mil | SIDRA 7085, variável 10236, Total, Empresa, organização ou instituição, 2022 | "2022":"6291" | |
| Mulheres entre os voluntários de organização | 60,8% | SIDRA 7085: 3.828 mil mulheres de 6.291 mil (linhas acima) | "2022":"3828" | `scripts/calculations/ibge-2022-pnad-voluntariado.ts 7085 Empresa, organização ou instituição` |
| Onde: igreja, sindicato, condomínio, partido, escola, hospital ou asilo | 76,6% | Informativo, p. 11 | "76,6% o fizeram por meio de congregação religiosa, sindicato, condomínio" | |
| Onde: associação de moradores ou esportiva, ONG, grupo de apoio | 12,6% | Informativo, p. 12 | "12,6% o realizaram por meio de associação de moradores, associação esportiva, ONG, grupo de apoio ou outra organização" | |
| Frequência | 42,3% quatro ou mais vezes por mês | Informativo, p. 12 | "42,3% o fizeram quatro ou mais vezes por mês" | |
| Horas por semana | 6,6 em média | Informativo, p. 12 | "ficou estável em 6,6 horas semanais, em média" | |

Os trechos do SIDRA são a célula da resposta da API. Fonte local: `sources/ibge-2022-pnad-voluntariado.txt`, com o texto das páginas 1, 11 e 12 do informativo e as quatro respostas do SIDRA, cada uma sob a URL de onde saiu.

## Limitações

- O voluntariado é o da semana de referência. Quem faz de vez em quando aparece menos do que quem faz toda semana.
- A maior parte passa por igreja, sindicato, condomínio, partido, escola, hospital ou asilo (76,6%), numa só categoria. O SIDRA não separa por sexo o lugar do voluntariado, então não dá para dizer a proporção de mulheres numa ONG ou numa igreja.
- A taxa é baixa (4,2%): um voluntário em cada 24 pessoas. Uma pessoa pode fazer voluntariado em mais de um lugar.
- Sexo é o registrado na PNAD; não há identidade de gênero nem orientação sexual.
- O informativo não traz o tamanho da amostra nem o coeficiente de variação; o SIDRA publica os coeficientes ao lado de cada contagem (variáveis 10237 e 10239), que não conferimos.
- 2022 é o ano mais recente no SIDRA. O tema não foi a campo em 2020 e 2021, por causa da pandemia.
