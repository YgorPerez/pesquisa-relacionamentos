---
# Citação completa. Markdown inline vale (*título em itálico*). Links extras
# (PDF aberto, PMC, cópia local) vão no fim: "Texto completo aberto: <url>".
referencia: "<Autores. *Título*. Revista volume(número):páginas, ano.>"
# Uma URL só, a principal: o DOI (https://doi.org/...) quando houver.
link: <https://doi.org/...>
# ok (lido no original) | parcial (resumo, página oficial) | nao-verificado
status: nao-verificado
# Obrigatório em ok e parcial: a data da conferência (AAAA-MM-DD). Uma ficha ok
# precisa de Trecho em cada linha dos Achados.
# verificado_em: 2026-10-19
# forte | moderada | fraca (rubrica no README)
forca: <forte | moderada | fraca>
# Por que essa força, numa frase.
forca_porque: "<amostra, desenho, viés ou conflito que justifica a força>"
# Países dos dados, em português: [Brasil], [EUA, França]. [] se o texto não diz.
paises: []
# Período dos dados: "2017", "2005–2013", "não informado no texto lido".
periodo: "<período dos dados>"
amostra:
  # Número principal (pessoas, casais ou registros). Omita se não houver um só.
  n: 0
  descricao: "<n, quem são, como foram recrutados>"
  # true só se a amostra for probabilística/representativa da população.
  representativa: false
# longitudinal | transversal | experimento | plataforma | administrativo | meta-analise
desenho: <desenho>
# Financiamento e conflitos de interesse. Omita só se não houver informação nenhuma.
conflito: "<quem financiou; vínculos dos autores>"
# Quem a amostra cobre. Todas as chaves são opcionais; na dúvida, omita.
# generos: homem | mulher (presentes na amostra)
# procura: homens | mulheres (com quem os participantes se relacionam)
# idades: { min, max } em anos inteiros
# casal: hetero | mesmo-sexo, só se a amostra for restrita a um tipo de casal
# Sem nada a dizer: cobre: {}
cobre:
  generos: [homem, mulher]
  idades: { min: 18, max: 99 }
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
