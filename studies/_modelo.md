---
# Citação completa. Markdown inline vale (*título em itálico*). Links extras
# (PDF aberto, PMC, cópia local) vão no fim: "Texto completo aberto: <url>".
reference: "<Autores. *Título*. Revista volume(número):páginas, ano.>"
# Uma URL só, a principal: o DOI (https://doi.org/...) quando houver.
link: <https://doi.org/...>
# verified (lido no original) | partial (resumo, página oficial) | unverified
status: unverified
# Obrigatório em verified e partial: a data da conferência (AAAA-MM-DD). Uma ficha verified
# precisa de Trecho em cada linha dos Achados.
# verified_on: 2026-10-19
# strong | moderate | weak (rubrica no README)
strength: <strong | moderate | weak>
# Por que essa força, numa frase.
strength_reason: "<amostra, desenho, viés ou conflito que justifica a força>"
# Países dos dados, em português: [Brasil], [EUA, França]. [] se o texto não diz.
countries: []
# Período dos dados: "2017", "2005–2013", "não informado no texto lido".
period: "<período dos dados>"
sample:
  # Número principal (pessoas, casais ou registros). Omita se não houver um só.
  n: 0
  description: "<n, quem são, como foram recrutados>"
  # true só se a amostra for probabilística/representativa da população.
  representative: false
# longitudinal | cross-sectional | experiment | platform | administrative | meta-analysis
design: <design>
# Financiamento e conflitos de interesse. Omita só se não houver informação nenhuma.
conflict: "<quem financiou; vínculos dos autores>"
# Quem a amostra cobre. Todas as chaves são opcionais; na dúvida, omita.
# genders: man | woman (presentes na amostra)
# seeks: men | women (com quem os participantes se relacionam)
# ages: { min, max } em anos inteiros
# couple: different-sex | same-sex, só se a amostra for restrita a um tipo de casal
# Sem nada a dizer: covers: {}
covers:
  genders: [man, woman]
  ages: { min: 18, max: 99 }
---

# <Autor et al. (ano)>: <título curto>

## O que mediu

<O que o estudo mediu e como, em 1–3 frases.>

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| <o que foi medido> | <número> | <tabela, figura ou página> | <trecho do original, quando verificado> |

## Limitações

- <limitação>

## Como usamos

<Quais relatórios e pesquisas citam este estudo e para afirmar o quê.>
