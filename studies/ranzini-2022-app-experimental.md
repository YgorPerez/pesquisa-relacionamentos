---
reference: "Ranzini G, Rosenbaum JE, Tybur JM. *Assortative (online) dating: Insights into partner choice from an experimental dating app*. Computers in Human Behavior 127:107039, 2022 (publicado online em 1º de outubro de 2021)."
link: https://doi.org/10.1016/j.chb.2021.107039
license: "CC BY 4.0 (\"This is an open access article under the CC BY license\", como diz a primeira página do artigo)"
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Experimento pré-registrado, com 110 perfis por pessoa, mas os 522 jovens vieram de um painel comercial e do Prolific, sem representar ninguém, e escolheram num app de teste, sem consequência; os resultados sobre a origem do participante se apoiam em poucos participantes de família não holandesa, e as tabelas trazem números que não fecham entre si."
countries: [Holanda]
period: "não informado no texto lido"
sample:
  n: 522
  description: "522 adultos jovens (menos de 28 anos) que moravam na Holanda, em duas coletas. Na primeira, 252 recrutados por uma empresa de painel (Flycatcher), com idade média de 23,21 anos, 68,5% mulheres, 66,7% num relacionamento e 91,3% de família holandesa. Na segunda, 270 recrutados pelo Prolific, com idade média de 24 anos, 58% homens, 53,5% solteiros e 85,2% de família holandesa. Só entrou quem completou a tarefa. Cada um escolheu se via perfis de homens ou de mulheres."
  representative: false
design: experiment
conflict: "Financiado pela NWO, a Organização Holandesa para a Pesquisa Científica. O texto lido não traz declaração de conflito de interesse. Ranzini e Tybur assinam pela Vrije Universiteit Amsterdam, e Rosenbaum pela University of Maine."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 27 }
---

# Ranzini, Rosenbaum e Tybur (2022): foto, nome e escolaridade num app de teste

## O que mediu

Os autores montaram um app de namoro de teste, o Finder, com perfis no estilo do Tinder e do Bumble: foto, nome, idade e escola. Cada participante viu 110 perfis do sexo que escolheu e, para cada um, clicou num coração se escolheria a pessoa num app de verdade ou num X se a rejeitaria. As fotos vieram de um banco de rostos para pesquisa, o Chicago Face Database, com 50 pessoas brancas, 30 negras e 30 asiáticas, e a beleza de cada foto é a nota média que o banco traz. O nome e a escola foram sorteados: cada foto podia vir com um nome holandês ou com um nome de outra origem (polonês, surinamês ou indonésio, conforme a foto), e com uma universidade ou uma escola profissionalizante holandesa. O desenho e as hipóteses foram registrados antes, e os dados estão no OSF.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Quanto se escolheu | Em média, cada participante escolheu 12,3% dos perfis e rejeitou 87,7% | Measures, p. 4 | "The average respondent selected 12.3% of profiles and rejected 87.7%." |
| Homens e mulheres | Os participantes que se disseram homens escolheram mais perfis que as participantes mulheres: 14,3% contra 8,1% | Results, p. 4 | "respondents identifying as men were more likely to indicate an intention to date targets (i.e., stimuli profiles') than participants who identified as women (14.3% versus 8.1%" |
| Beleza da foto | A beleza da foto, pela nota do banco de rostos, foi o que mais pesou na escolha (B = 1,85) | Results, p. 4 | "The strongest predictor of selection of a dating profile was target attractiveness (B = 1.85, p ≤.001)" |
| Escolaridade de quem escolhia | Os participantes com curso superior escolheram mais os perfis com universidade que os com escola profissionalizante (B = 0,36); os sem curso superior não fizeram diferença pela escola do perfil (B = 0,06, p = 0,627) | Results, p. 4 | "higher-educated participants selected higher-educated targets more than lower-educated targets (B = 0.36, p≤.001), but that lower-educated targets did not discriminate based on education level (B = 0.06, p = .627)" |
| Nome holandês ou não | O nome do perfil, holandês ou não, não mudou as escolhas, nem levando em conta a origem da família ou a nacionalidade de quem escolhia | Discussion, p. 5 | "Profile names did not have any effect on participant choices, even when controlling for participant ancestry or ethnicity." |
| Nome e família holandesa | Quem tinha família holandesa não preferiu os nomes holandeses mais que os outros participantes (B = 0,10, p = 0,33) | Results, p. 4 | "we did not detect an interaction between participants' ancestry and preferences for profiles with Dutch versus non-Dutch names (RQ1), (B = 0.10, p = .33)" |
| Foto de pessoa branca | Tanto os participantes de família holandesa quanto os de outra origem escolheram mais as fotos de pessoas brancas que as de pessoas não brancas; a diferença foi maior nos de família holandesa (B = 1,36) que nos outros (B = 0,82) | Results, p. 5 | "both participants with Dutch and non-Dutch ancestry selected White targets more than non-White targets, though this effect was stronger for participants with a Dutch ancestry (B = 1.36, p≤.001), than for those with non-Dutch family ancestry (B = 0.82, p≤.001)" |
| Foto de pessoa branca e nacionalidade | Quando os autores separaram os participantes pela nacionalidade, e não pela origem da família, a diferença entre os de nacionalidade holandesa e os outros na preferência por fotos de pessoas brancas pode ser acaso (B = 0,62, p = 0,10) | Results, p. 5 | "The interaction between target ethnicity and participant Dutch nationality (RQ3) was not statistically significant, (B = 0.62, p = .10)." |

B é o coeficiente do modelo que prevê a chance de escolher o perfil: positivo quer dizer mais escolha, e quanto maior, mais peso; ele está na escala do modelo (logaritmo da razão de chances), não em pontos percentuais. O valor-p é a chance de uma diferença daquele tamanho aparecer por acaso; acima de 0,05, os autores tratam como acaso. O nome e a escola foram sorteados; a cor da pele e a beleza vêm da foto, então a comparação entre fotos é entre pessoas diferentes, levando em conta a nota de beleza do banco.

## Limitações

- As escolhas foram feitas num app de teste, sem consequência, e o app funcionava melhor numa tela grande que no celular. Os perfis tinham só foto, nome, idade e escola, sem texto, o que os autores dizem poder ter tirado realismo.
- As fotos vêm de um banco de rostos dos EUA, e a beleza é a nota que o banco traz, não a que os participantes dariam. Os autores dizem que as fotos americanas podem ter enfraquecido o efeito do nome.
- Poucos participantes tinham família ou nacionalidade não holandesa, o que, dizem os autores, reduz o poder do estudo para as comparações por origem. A Holanda tem menos diversidade étnica que os EUA ou a França, e os resultados não se estendem a outros países.
- O resumo e a discussão dizem que a foto pesou na escolha de perfis brancos entre os participantes de família holandesa; os testes por grupo mostram que os de outra origem também escolheram mais as fotos de pessoas brancas (B = 0,82). Com a nacionalidade no lugar da origem, a diferença entre os grupos pode ser acaso.
- As tabelas têm números que não fecham. Na Tabela 1, o erro-padrão da escola do perfil é igual ao coeficiente (0,21) e o do nome aparece negativo; z de 3,00 com p = 0,03, também na escolaridade da Tabela 2 (2,95 com 0,03), não combina, porque um z perto de 3 dá p perto de 0,003. O texto diz "lower-educated targets" onde, pelo contexto, quer dizer os participantes sem curso superior.
- As duas coletas diferem no recrutamento (empresa de painel e Prolific), no sexo (68,5% de mulheres na primeira, 58% de homens na segunda) e na mistura de nomes (75 perfis de nome holandês e 35 de outro na primeira, 55 e 55 na segunda). O modelo leva em conta a coleta.
- A comparação entre homens e mulheres (14,3% contra 8,1%) vem de um teste que trata cada escolha como independente, e não leva em conta que cada pessoa fez 110 escolhas.
- O texto não diz quando os dados foram colhidos. A orientação sexual variou (84,8% heterossexuais na segunda coleta), e cada participante escolheu se via perfis de homens ou de mulheres.
- A Fonte local é o PDF da revista, sob licença CC BY 4.0. O material suplementar, com o modelo completo e as listas de nomes e escolas, está no OSF e não foi lido.
