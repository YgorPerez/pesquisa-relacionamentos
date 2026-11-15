---
reference: "Samara I, Roth TS, Kret ME. *The role of emotion projection, sexual desire, and self-rated attractiveness in the sexual overperception bias*. Archives of Sexual Behavior 50(6):2507–2516, 2021. Texto completo aberto: https://pmc.ncbi.nlm.nih.gov/articles/PMC8416843/"
link: https://doi.org/10.1007/s10508-021-02017-5
license: "CC BY 4.0 (Creative Commons Attribution 4.0 International License, como diz a penúltima página do artigo)"
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Um só evento de speed dating com 67 participantes heterossexuais, na maioria universitários, sem que o artigo diga como foram recrutados; os autores chamam o estudo de exploratório, e o achado principal, uma interação entre sexo e interesse próprio, vem com evidência que os próprios autores chamam de moderada."
countries: [Holanda]
period: "não informado no texto lido"
sample:
  n: 67
  description: "80 pessoas recrutadas para um evento de speed dating; 10 não foram e 3 (2 homens) saíram antes de começar, e ficaram 67 participantes heterossexuais, na maioria universitários, com idade média de 22 anos (35 mulheres segundo os métodos, 34 segundo o resumo). Não receberam pagamento, só um ingresso para o Apenheul Primate Park (Apeldoorn, Holanda); a aprovação ética é da Universidade de Leiden. Divididos em quatro grupos, fizeram ao todo 277 encontros de quatro minutos, cara a cara, com as pessoas do outro sexo do seu grupo. Não é um app de namoro."
  representative: false
design: cross-sectional
conflict: "Financiado pela Netherlands Science Foundation (016.VIDI.185.036), pelo European Research Council (#804582) e pela Templeton World Charity Foundation, com verbas concedidas a M. E. Kret, que assina por último. Os autores declaram não ter conflito de interesse."
covers:
  genders: [man, woman]
  seeks: [men, women]
  couple: different-sex
---

# Samara et al. (2021): adivinhar se o par quer outro encontro, no speed dating

## O que mediu

Num evento de speed dating, cada participante teve encontros de quatro minutos, cara a cara, com as pessoas do outro sexo do seu grupo. Depois de cada um, respondeu se queria outro encontro com aquela pessoa e se achava que ela queria outro encontro com ele, além de dar notas de atração. Os autores compararam o palpite de cada um com a resposta real do par (acertou ou errou) e testaram se o acerto andava junto com o sexo, com o próprio interesse no par, com o desejo sexual (um questionário respondido antes) e com quão atraente a pessoa se achava. Separaram também os erros para mais (achar que o par queria quando não queria) dos erros para menos (o contrário).

É speed dating presencial, não um app. Só os homens trocavam de par a cada encontro. Os autores chamam o estudo de exploratório.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Participantes | Ficaram 67 participantes, 35 delas mulheres segundo os métodos, com idade média de 22,03 anos (mulheres) e 22,61 anos (homens). Ao todo, foram 277 encontros | p. 2508, Participants | "of N = 67 (35 women; women: Mage = 22.03, SD = 2.26; men: Mage = 22.61, SD = 1.75). In total, 277 dates took place." |  |
| Quem quis outro encontro | Depois dos encontros, as mulheres responderam que queriam outro encontro com o par em 26% das vezes, e os homens em 44% | Tabela 1 (sim e não das mulheres, depois dos homens) | "Yes No Women (%) Men (%) 26 74 44 56" |  |
| Acerto no conjunto | Somando todos os encontros, o acerto dos participantes ao adivinhar se o par queria outro encontro não se distinguiu claramente do acaso (razão de chances 1,14; intervalo de 0,86 a 1,52), e não apareceu diferença clara de acerto entre homens e mulheres (1,04; de 0,79 a 1,38) | Tabela 2, Modelo 1: as razões de chances do intercepto, do sexo e do interesse próprio, depois os intervalos na mesma ordem | "1.14 1.04 .71 [.86–1.52] [.79–1.38]" |  |
| Interesse próprio e acerto | Nos encontros em que a própria pessoa queria outro encontro, ela acertou menos a resposta do par do que nos encontros em que não queria (razão de chances 0,71; intervalo de 0,57 a 0,88) | Tabela 2, Modelo 1: as razões de chances do intercepto, do sexo e do interesse próprio, depois os intervalos na mesma ordem | "1.14 1.04 .71 [.86–1.52] [.79–1.38] [.57–.88]" |  |
| Interesse próprio, homens e mulheres | O interesse próprio pesou de um jeito nos homens e de outro nas mulheres (razão de chances da combinação 0,73; intervalo de 0,59 a 0,90). Os homens acertaram mais nos encontros em que não queriam outro encontro que naqueles em que queriam; nas mulheres, não apareceu essa diferença | Tabela 2, Modelo 1, a última razão de chances (sexo × interesse próprio) e seu intervalo | "[.57–.88] .73 [.59–.90]" |  |
| Força da evidência da combinação | Os autores dizem que a evidência a favor de o interesse próprio pesar diferente em homens e mulheres é moderada (BF10 = 7,39) | p. 2510, Accuracy | "The calculated Bayes factor showed moderate evidence in favor of the complex model (BF10 = 7.39)" |  |
| Acerto das mulheres | As mulheres acertaram mais ou menos 50% das vezes se o par queria outro encontro, quisessem elas outro encontro ou não | p. 2512, Discussion | "Women were approximately 50% accurate in detecting attraction, independent of whether they were interested in their partner or not." |  |
| Homens sem interesse | Nos encontros em que o homem não queria outro encontro e disse que a parceira também não queria, ele acertou em 74% das vezes (intervalo de 66% a 81%). Os autores comparam esse número com o chute ao acaso da linha abaixo e leem que os homens não estavam só chutando | p. 2511, Baseline Differences | "The results of the Bayesian binomial test showed that men were more likely to correctly indicate that their partners were interested in them (relative success frequency: 0.74, 95% HDI [0.66, 0.81])." | `scripts/calculations/samara-2021-projecao-superpercepcao.ts binomial` |
| Chute pela taxa de 'sim' | A conta dos autores para o chute ao acaso: quem dissesse 'sim' com a mesma frequência das mulheres acertaria 61% das respostas delas | p. 2511, Baseline Differences | "would be able to accurately guess their responses 61% of the time (0.26 × 0.26 + (1–0.26) × (1–0.26) = 0.61" |  |
| Interesse próprio e erro para menos | Nos encontros em que a pessoa queria outro encontro, ela errou menos para baixo (dizer que o par não queria quando queria) do que nos encontros em que não queria | p. 2511, Tabela 3 | "participants were more likely to accurately detect than underperceive attraction when they were interested in their partner compared to when they were not" |  |
| Interesse próprio e erro para mais | Nos encontros em que a pessoa queria outro encontro, ela errou mais para cima (dizer que o par queria quando não queria) do que nos encontros em que não queria | p. 2511, Tabela 3 | "Participants were more likely to overperceive than accurately detect attraction when they were interested in their partner than when they were not." |  |
| Erro para mais, homens e mulheres | Num teste à parte, nos encontros em que queriam outro encontro, os homens erraram para cima mais que as mulheres (BF10 > 10); nos encontros em que não queriam, os dados não decidem se há diferença entre homens e mulheres (BF10 = 0,95). No modelo dos erros, os autores dizem que a combinação de sexo e interesse próprio no erro para mais não foi firme | p. 2511 | "men were more likely than women to overperceive than accurately detect attraction when interested in their partner (BF10 > 10), whereas there was no difference between men and women when they were not interested in their partner (BF10 = 0.95)" |  |
| Desejo sexual e acerto | O desejo sexual de cada participante não teve ligação clara com o acerto (razão de chances 1,23; intervalo de 0,96 a 1,58), nem combinado com o sexo (0,84; de 0,66 a 1,07) | Tabela 2, Modelo 2: as razões de chances do desejo sexual e de sexo × desejo sexual, cada uma com seu intervalo | "1.23 [.96–1.58] .84 [.66–1.07]" |  |
| Atratividade autoavaliada e acerto | Quão atraente a pessoa se achava não teve ligação clara com o acerto (razão de chances 0,82; intervalo de 0,64 a 1,05), nem combinado com o sexo (1,09; de 0,86 a 1,39) | Tabela 2, Modelo 3: as razões de chances da atratividade autoavaliada e de atratividade × sexo, cada uma com seu intervalo | ".82 [.64–1.05] 1.09 [.86–1.39]" |  |

As estatísticas entre parênteses: a razão de chances compara as chances de acertar. Igual a 1, nenhuma diferença; abaixo de 1, menos acerto; acima, mais. Nos modelos, sexo e interesse próprio foram codificados como −1 e 1, e o desejo sexual e a atratividade autoavaliada foram padronizados. O intervalo é a faixa de 95% mais provável para o valor, na análise bayesiana dos autores; quando ele passa por 1, os autores não tratam o resultado como firme. O BF10 diz quantas vezes os dados são mais prováveis se houver a diferença do que se não houver: os autores leem 7,39 como evidência moderada a favor da diferença, e um valor perto de 1 quer dizer que os dados não decidem para nenhum lado. O artigo dá o acerto dos homens sem interesse como proporção (0,74); a Ficha o passa para porcentagem.

## Limitações

- É speed dating presencial, com encontros de quatro minutos num evento de pesquisa, e só heterossexuais. O estudo não diz nada sobre apps ou sobre conversa por texto, e os próprios autores dizem que o resultado não pode ser estendido diretamente a quem não é heterossexual.
- Amostra pequena e de um evento só, na maioria universitários, e o artigo não diz como os participantes foram recrutados. Quase todos queriam uma relação séria (só 2 não), o que, segundo os autores, limitou o teste do papel da estratégia de relacionamento.
- O texto não diz onde o evento aconteceu. A Holanda vem da aprovação ética da Universidade de Leiden e do ingresso dado aos participantes, para um parque em Apeldoorn.
- Os autores chamam o estudo de exploratório. Eles esperavam que os homens acertassem menos que as mulheres, e no conjunto não apareceu diferença clara entre os dois.
- A pergunta foi "quer outro encontro?", não sobre interesse sexual. Os autores apontam que homens e mulheres podem ter entendido a pergunta de jeitos diferentes.
- Só os homens trocavam de par. Os autores citam estudos segundo os quais isso não explica a diferença de seletividade entre homens e mulheres, mas pedem que seja testado.
- O interesse próprio não foi provocado pelo estudo: é a resposta da própria pessoa. Que o acerto ande junto com ele é uma associação.
- O resumo diz 34 mulheres e os métodos, 35. O texto não explica a diferença.
- O texto diz que cada participante foi a 10 encontros, mas 277 encontros entre 67 pessoas dão menos que isso: com 35 mulheres e 32 homens, são 8,7 encontros por homem e 7,9 por mulher, em média (`scripts/calculations/samara-2021-projecao-superpercepcao.ts dates`). O texto não diz quantas pessoas havia em cada grupo.
- No teste dos homens sem interesse, a frase diz que eles acertaram ao indicar que a parceira "estava interessada", mas a conta foi feita só nos encontros em que eles disseram que ela não estava. O acerto de 74% é igual à parte de 'não' das mulheres no conjunto dos encontros (74%, Tabela 1), que é o acerto de quem respondesse sempre 'não'. O texto não dá a parte de 'não' das mulheres só nos encontros em que o homem não queria, e os autores comparam com os 61% de um chute ao acaso, não com esse número.
- A conta do chute ao acaso, 0,26 × 0,26 + 0,74 × 0,74, dá 0,6152, perto de 62%; o artigo escreve 0,61 (`scripts/calculations/samara-2021-projecao-superpercepcao.ts guess`).
- Na Tabela 3, o intervalo da combinação sexo × interesse próprio no erro para mais vai de 0,01 a 0,58, sem passar por zero, o que pela regra da própria tabela a faria firme. O texto diz que ela não foi robusta. Na mesma tabela, o sexo no erro para menos (0,44; de 0,02 a 0,87) também não passa por zero, e o texto não o comenta.
- A Figura 1 mostra o acerto médio de cada grupo, mas o texto não dá esses números, além dos "mais ou menos 50%" das mulheres.
- O questionário de desejo sexual e as tarefas feitas antes dos encontros estão no material suplementar, que não foi lido.
