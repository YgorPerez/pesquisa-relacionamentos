---
reference: "IBGE. *Pesquisa Nacional de Saúde 2019*: microdados (PNS_2019_20220525), dicionário de variáveis, tabelas de *Orientação sexual autoidentificada da população adulta* e Nota técnica 01/2021 (medidas antropométricas). Rio de Janeiro: IBGE, 2021–2022."
link: https://ftp.ibge.gov.br/PNS/2019/
status: verified
verified_on: 2026-10-19
strength: moderate
strength_reason: "Amostra probabilística nacional grande, mas a orientação sexual é tema novo, com 3,4% de não sabe ou recusa, e a altura é quase toda autodeclarada."
countries: [Brasil]
period: "2019"
sample:
  n: 88531
  description: "88.531 moradores selecionados de 18 anos ou mais com entrevista realizada (contagem no microdado), numa amostra probabilística de domicílios com estrato e UPA."
  representative: true
design: cross-sectional
conflict: "Órgão oficial de estatística."
license: "Dados abertos do Executivo federal (Decreto 8.777/2016, art. 4º); o FTP do IBGE não traz termo de licença."
covers:
  genders: [man, woman]
institution: ibge
---

# IBGE (2019): Pesquisa Nacional de Saúde

## O que mediu

Inquérito domiciliar com um morador selecionado por domicílio. Para o Grupo possível interessam três perguntas feitas a quem tem 18 anos ou mais: orientação sexual (Y008), altura (P00404, quase sempre informada pela pessoa) e uso atual de tabaco (P050). O microdado traz o peso do morador selecionado (V00291), o estrato (V0024) e a UPA, o que dá o intervalo de 95% de cada proporção.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Como perguntaram a orientação sexual | A própria pessoa respondeu sobre si | Dicionário de variáveis, Y008 | "Qual é a sua orientação sexual?" |
| Heterossexuais, 18 anos ou mais | 94,8% se declararam heterossexuais (IC 94,5–95,0) | Tabela 1.1.1, linha Heterossexual, coluna Total | "Heterossexual 94,8 94,5 95,0 94,7 94,3 95,1 94,8 94,4 95,2" |
| Homossexuais | 1,2% se declararam homossexuais; entre os homens, 1,4% (IC 1,2–1,6); entre as mulheres, 0,9% (IC 0,8–1,1) | Tabela 1.1.1, linha Homossexual | "Homossexual 1,2 1,0 1,3 1,4 1,2 1,6 0,9 0,8 1,1" |
| Bissexuais | 0,7% se declararam bissexuais; entre os homens, 0,5% (IC 0,4–0,7); entre as mulheres, 0,8% (IC 0,7–1,0) | Tabela 1.1.1, linha Bissexual | "Bissexual 0,7 0,6 0,8 0,5 0,4 0,7 0,8 0,7 1,0" |
| Não sabe | 1,1% disseram não saber | Tabela 1.1.1, linha Não sabe | "Não sabe 1,1 1,0 1,2 1,1 0,9 1,3 1,1 0,9 1,3" |
| Recusou-se a responder | 2,3% se recusaram a responder | Tabela 1.1.1, linha Recusou-se a responder | "Recusou-se a responder 2,3 2,1 2,5 2,3 2,0 2,6 2,3 2,0 2,5" |
| Homossexuais ou bissexuais, 18 a 29 anos | 4,8% se declararam homossexuais ou bissexuais (IC 4,2–5,5) | Tabela 1.2.1, linha 18 a 29 | "18 a 29 100,0 - - 89,8 88,9 90,6 4,8 4,2 5,5 5,3 4,7 6,0" |
| Homossexuais ou bissexuais, 60 anos ou mais | 0,2% se declararam homossexuais ou bissexuais (IC 0,2–0,3) | Tabela 1.2.1, linha 60 ou mais | "60 ou mais 100,0 - - 97,2 96,8 97,6 0,2 0,2 0,3 2,5 2,2 2,9" |
| Qual altura foi usada | A altura final registrada, em centímetros | Dicionário de variáveis, P00404 | "Altura - Final (em cm)" |
| Quem teve a altura medida | Em 2019, só uma parte dos moradores selecionados de 15 anos ou mais | Nota técnica 01/2021, p. 1 | "Em 2019, entretanto, a aferição dessas medidas ocorreu em uma subamostra dos moradores selecionados de 15 anos ou mais de idade." |
| O que a pergunta sobre tabaco mede | Se a pessoa fuma hoje algum produto do tabaco | Dicionário de variáveis, P050 | "Atualmente, o(a) Sr(a) fuma algum produto do tabaco?" |

As tabelas trazem, por linha, Total, Homem e Mulher (Tabela 1.1.1) ou Total, Heterossexual, Homossexual ou Bissexual e Recusou ou não sabia (Tabela 1.2.1), cada um com o percentual e os limites inferior e superior. Esses limites são o IC (intervalo de confiança) das linhas acima: a faixa em que o número da população provavelmente está, já que a pesquisa ouviu só uma parte dela. O pipeline do Grupo possível reproduz a Tabela 1.1.1 por sexo a partir do microdado, na casa decimal publicada.

Fonte local: `sources/ibge-2019-pns.txt`, com o texto das Tabelas 1.1.1 e 1.2.1, das linhas do dicionário e da página 1 da nota técnica, cada um sob a URL de onde saiu. O microdado fica no cache do pipeline, fora do repositório.

## Limitações

- A orientação sexual é autodeclarada a um entrevistador, com provável subdeclaração por estigma. 3,4% não souberam ou recusaram.
- A PNS não tem município nem religião, e a amostra por UF é pequena. O Grupo possível usa as proporções por sexo e faixa de idade do Brasil.
- A altura da P00404 é, na maior parte, a informada pela pessoa; a medida existe só numa subamostra.
- Dados de 2019, aplicados ao Censo de 2022, supondo que dentro de sexo e idade independem dos Requisitos do Censo.
- Não mede identidade de gênero.

## Como usamos

- Dados do Grupo possível: `dados/grupo-possivel/pns-2019.csv`, gerado por `scripts/possible-group/pipeline.ts`.
- [Relatório 2026-10-18 sobre os dados do Grupo possível](../reports/2026-10-18-dados-grupo-possivel.md).
