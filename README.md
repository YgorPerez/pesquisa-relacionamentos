# Pesquisa: relacionamentos, apps de namoro e onde conhecer pessoas

![fallow health](docs/badges/fallow.svg) ![react doctor](docs/badges/react-doctor.svg) ![cobertura](docs/badges/cobertura.svg)

Documentação pessoal de estudos sobre como casais se conhecem, a qualidade e a duração dessas relações e o que funciona para conhecer alguém, com foco em um homem de 21 anos no Brasil.

A regra é simples: **cada afirmação aponta para a fonte primária que a sustenta**, e cada estudo diz até que ponto foi conferido.

## Estrutura

| Pasta/arquivo                      | O que tem                                                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`estudos/`](estudos/)             | Uma ficha por estudo ou fonte: o que mediu, números principais, limitações e status de verificação                                              |
| [`relatorios/`](relatorios/)       | Sínteses que cruzam vários estudos para responder a uma pergunta, com o `ticket:` que as pediu no topo                                          |
| [`dicas/`](dicas/)                 | Conclusões práticas, cada uma ligada aos estudos que a sustentam                                                                                |
| [`fontes/`](fontes/)               | Fontes locais de licença aberta ou domínio público, com a licença registrada na Ficha. O resto vai para `fontes/privado/`, que fica fora do git |
| [`docs/deploy.md`](docs/deploy.md) | Como o site vai ao ar em temestudo.cloud e como voltar à versão anterior                                                                        |

O que falta verificar ou pesquisar está nas [issues com o label `acervo`](https://github.com/YgorPerez/pesquisa-relacionamentos/issues?q=is%3Aissue+is%3Aopen+label%3Aacervo). O passo a passo para trabalhar uma delas está na skill [`acervo`](.claude/skills/acervo/SKILL.md).

## Convenções

**Status de verificação** (campo `status` no frontmatter de cada ficha: `ok`, `parcial` ou `nao-verificado`):

- ✅ **Lido no original:** números conferidos no texto completo do artigo/relatório.
- 🟡 **Parcial:** conferido no resumo, página oficial ou comunicado, mas não no texto completo.
- ⬜ **Não verificado:** citado de memória ou por fonte secundária; precisa ser conferido antes de usar.

**Força da evidência:**

- **Forte:** amostra grande e representativa, replicado, ou meta-análise.
- **Moderada:** bom desenho, mas uma única amostra, transversal ou com algum viés conhecido.
- **Fraca:** amostra pequena, não representativa, comercial ou com conflito de interesse relevante.

**Nomes de arquivo:** `estudos/<sobrenome-primeiro-autor>-<ano>-<tema-curto>.md`. Relatórios: `relatorios/<AAAA-MM-DD>-<tema>.md`. Fonte local: `fontes/<slug-da-ficha>.<pdf|html|txt>` ou `fontes/privado/<slug-da-ficha>.<pdf|html|txt>`.

Para uma ficha nova, copie [`estudos/_modelo.md`](estudos/_modelo.md). Os campos do cabeçalho ficam no frontmatter YAML, e o build do site (`packages/conteudo`) falha com a lista de erros quando um campo é inválido, sai de uma lista fechada ou repete o DOI de outra ficha.

## Índice de estudos

Desde a migração para frontmatter (#26), as fichas antigas estão `nao-verificado` até serem refeitas com Fonte local e trecho conferido (#6). O Status delas abaixo é o de antes da migração e fica guardado no comentário `# Antes da migração` de cada ficha. As duas do IBGE que sustentam o Grupo possível (#36) já foram feitas pelo processo novo.

### Como os casais se conhecem

- [Rosenfeld, Thomas & Hausen 2019](estudos/rosenfeld-2019-disintermediating-friends.md): online virou o canal mais comum nos EUA (39% em 2017) · ✅ · forte
- [Pew Research 2023 e 2020](estudos/pew-2023-2020-online-dating.md): 10% dos adultos com parceiro o conheceram online (20% < 30 anos); homens recebem poucas mensagens · ✅ · forte
- [Mobile Time/Opinion Box 2025](estudos/mobiletime-2025-apps-relacionamento-brasil.md): 29% dos brasileiros de 16–29 já tiveram encontro por app · ✅ · moderada
- [Opinion Box 2017](estudos/opinionbox-2017-relacionamentos-brasil.md): 23% dos internautas brasileiros com parceiro o conheceram online · ✅ · fraca
- [Bergström 2016](estudos/bergstrom-2016-epic-franca.md): França, amostra aleatória: < 9% dos casais de 2005–2013 vieram de sites · ✅ · forte
- [Lampard 2020](estudos/lampard-2020-natsal-reino-unido.md): Grã-Bretanha: 10,9% online em 2008–2012; amigos/família seguem na frente · ✅ · forte

### Qualidade e duração

- [Rosenfeld 2017](estudos/rosenfeld-2017-marriage-choice-couplehood.md): como se conheceram não prevê término; online casa mais rápido · ✅ · forte
- [Cacioppo et al. 2013](estudos/cacioppo-2013-satisfacao-por-local.md): satisfação por local onde se conheceram · ✅ · moderada (financiado pela eHarmony)
- [Kowal et al. 2025](estudos/kowal-2025-50-paises.md): online ligado a satisfação um pouco menor em 50 países · ✅ · moderada
- [Potarca 2020](estudos/potarca-2020-suica-apps.md): casais de app na Suíça não diferem em satisfação · ✅ · moderada
- [Potarca 2021](estudos/potarca-2021-alemanha-pairfam.md): Alemanha: casais online não casam menos (homens casam mais) · 🟡 · moderada
- [Sharabi & Dorrance-Hall 2024](estudos/sharabi-2024-online-dating-effect.md): casamentos online um pouco menos satisfeitos (EUA) · ⬜ · moderada
- [Haack & Falcke 2017](estudos/haack-2017-relacionamentos-mediados-internet.md): Brasil: relações mantidas pela internet vs. presenciais · ✅ · fraca

### Dinâmica dos apps

- [Bruch & Newman 2018](estudos/bruch-2018-aspirational-pursuit.md): as pessoas miram ~25% "acima"; resposta cai com a distância · ✅ · moderada
- [Tyson et al. 2016](estudos/tyson-2016-tinder.md): 0,6% de match para perfis masculinos de teste · ✅ · fraca
- [Start.io (estimativa)](estudos/startio-tinder-brasil-genero.md): ~71% de homens no Tinder Brasil · 🟡 · fraca

### Características do parceiro

- [Joel et al. 2020](estudos/joel-2020-machine-learning-43-datasets.md): em 11.196 casais, percepções da relação explicam 45% da satisfação; traços do parceiro, 5% · ✅ · forte
- [Malouff et al. 2010](estudos/malouff-2010-personalidade-parceiro.md): neuroticismo baixo, amabilidade, conscienciosidade e extroversão do parceiro se associam à satisfação · 🟡 · forte
- [Dyrenforth et al. 2010](estudos/dyrenforth-2010-personalidade-similaridade.md): personalidade do parceiro explica 1–3%; similaridade, < 0,5% · 🟡 · forte
- [Montoya et al. 2008](estudos/montoya-2008-similaridade-real-percebida.md): similaridade real não prevê atração em relações existentes; a percebida prevê · 🟡 · forte
- [Eastwick & Finkel 2008](estudos/eastwick-2008-preferencias-speed-dating.md): preferências declaradas não preveem desejo real no speed dating · ✅ · moderada
- [Eastwick et al. 2014](estudos/eastwick-2014-meta-analise-preferencias.md): atratividade r ≈ 0,40 e renda r ≈ 0,10, iguais nos dois sexos · 🟡 · forte
- [Eastwick et al. 2024](estudos/eastwick-2024-preferencias-43-paises.md): 43 países; encaixe com a lista pessoal tem efeito pequeno (β por traço = 0,04) · ✅ · forte
- [Meltzer et al. 2014](estudos/meltzer-2014-atratividade-casamento.md): atratividade da esposa, r = 0,10 na satisfação inicial do marido; nada para esposas · ✅ · moderada
- [Francis-Tan & Mialon 2015](estudos/francis-tan-2015-gastos-casamento-divorcio.md): diferença de idade e de escolaridade, religião e gastos vs. divórcio · ✅ · fraca
- [Schwartz & Han 2014](estudos/schwartz-2014-homogamia-educacional.md): mesma escolaridade ficou mais estável; esposa mais escolarizada deixou de ser risco · ✅ · forte
- [Lehrer & Chiswick 1993](estudos/lehrer-1993-religiao-estabilidade.md): uniões inter-religiosas se dissolvem mais · 🟡 · moderada
- [Le et al. 2010](estudos/le-2010-preditores-termino.md): compromisso e amor preveem término; personalidade pouco · 🟡 · forte
- [Killewald et al. 2023](estudos/killewald-2023-riqueza-divorcio.md): patrimônio do casal reduz divórcio, sobretudo saindo do zero · 🟡 · moderada

### Brasil: dados oficiais

- [IBGE Registro Civil 2024](estudos/ibge-2024-registro-civil.md): idade ao casar, divórcios, duração · ✅ · forte
- [IBGE Censo 2022, microdados da amostra](estudos/ibge-2022-censo-amostra.md): base do Grupo possível; o arquivo público vai só até a UF e traz a idade em grupos de 5 anos · ✅ · forte
- [IBGE PNS 2019](estudos/ibge-2019-pns.md): orientação sexual dos adultos (1,4% dos homens e 0,9% das mulheres homossexuais), altura e tabaco · ✅ · moderada

## Relatórios

- [2026-10-18: Casamentos, apps de namoro e onde procurar](relatorios/2026-10-18-casamentos-apps-e-onde-procurar.md)
- [2026-10-18: Dados oficiais para estimar o Grupo possível](relatorios/2026-10-18-dados-grupo-possivel.md) (ticket #2)
- [2026-10-18: Características do parceiro, o que se diz vs. o que prevê](relatorios/2026-10-18-caracteristicas-parceiro.md) (ticket #3)
- [2026-10-18: Onde casais se conhecem, especialmente no Brasil](relatorios/2026-10-18-onde-casais-se-conhecem.md) (ticket #4)
- [2026-10-18: Base legal LGPD para o estado do link em log e analytics](relatorios/2026-10-18-lgpd-estado-link.md) (ticket #18)

## Dicas práticas

- Uma Dica por arquivo em [`dicas/`](dicas/), com `fichas`, `forca` e `inferencia` no frontmatter. O site lista as que se apoiam em Fichas ✅ ou 🟡 em `/dicas`.
- [Dicas que esperam Ficha](dicas/_sem-ficha.md)
