---
reference: "Eastwick PW, Finkel EJ, Meza EM, Ammerman K. *No gender differences in attraction to young partners: A study of 4500 blind dates*. Proceedings of the National Academy of Sciences 122(5):e2416984122, 2025. Texto completo aberto: https://pmc.ncbi.nlm.nih.gov/articles/PMC11804577/. Dados e pré-registro: https://osf.io/rkm2d/?view_only=a0fe91dae0464077af7772e6890a8151."
link: https://doi.org/10.1073/pnas.2416984122
status: verified
verified_on: 2026-11-26
strength: weak
strength_reason: "Amostra grande (4.542 encontros às cegas reais) e análises pré-registradas, mas os dados são de clientes de uma agência de namoro cara dos EUA, e uma das autoras é a CEO da Tawkify, dona dos dados, com ações da empresa."
countries: [EUA]
period: "outubro de 2023 a janeiro de 2024"
sample:
  n: 6262
  description: "6.262 clientes e membros da agência de namoro Tawkify, nos EUA, marcados pela agência em 4.542 encontros às cegas (9.084 avaliações, uma de cada lado); idade média de 46,8 anos, de 22 a 85; 3.163 homens e 3.070 mulheres."
  representative: false
design: platform
conflict: "A coautora Kellie Ammerman é CEO, membro do conselho e acionista da Tawkify, a empresa que forneceu os dados. Os três primeiros autores ajudaram a empresa a montar o questionário e mostraram a ela os resultados, sem receber pagamento; o artigo diz que a empresa não influiu na análise nem na publicação."
covers:
  genders: [man, woman]
  ages: { min: 22, max: 85 }
---

# Eastwick et al. (2025): idade e atração em 4.500 encontros às cegas

## O que mediu

A Tawkify é uma agência de namoro dos EUA em que uma pessoa (a "matchmaker") escolhe o par e marca o encontro, presencial ou por vídeo. Depois de cada encontro, os dois respondem um questionário: o quanto se sentiram atraídos, que nota dão ao encontro e se querem um segundo. Os autores perguntam se a idade do par pesa diferente para homens e mulheres, e se o limite de idade que cada um declarou no cadastro funciona como um corte. A base não tem a conversa do encontro, só o questionário.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Tamanho | 6.262 pessoas em 4.542 encontros às cegas, com 9.084 avaliações | The Current Research | "Tawkify, provided data from N = 6,262 people who were set up on N = 4,542 blind dates for a total of N = 9,084 total reports" | |
| Quando | Os encontros foram de outubro de 2023 a janeiro de 2024 | Methods, Participants | "Between October of 2023 and January of 2024, a popular US-based matchmaking company, Tawkify, facilitated dates for N = 6,262 participants" | |
| Idade | Os participantes tinham 46,8 anos em média | Methods, Participants | "These 6,262 participants were M = 46.8 y old (SD = 11.6)" | |
| Faixa de idade | De 22 a 85 anos, a maioria de meia-idade | The Current Research | "The participants were as young as 22 and as old as 85" | |
| Presencial ou por vídeo | 82% dos encontros foram presenciais, de 2,1 horas em média, e 17% por Zoom, de 1,0 hora | Methods, Procedure | "Approximately 82% of the dates were in-person ( M length = 2.1 h, SD = 0.9), 17% were over zoom ( M length = 1.0 h" | |
| Segundo encontro | 58% das avaliações disseram sim a um segundo encontro | Methods, Second date decision | "M = 0.58, SD = 0.49). These three dependent measures were preregistered separately" | scripts/calculations/eastwick-2025-encontros-tawkify.ts |
| Limite de idade declarado | No cadastro, as mulheres aceitavam parceiros até 53,7 anos em média, e os homens até 48,0 | Methods, Maximum age limit | "women reporting a maximum age of M = 53.7 (SD = 10.9) and men reporting a maximum age of M = 48.0" | |
| Idade do par e desejo | Homens e mulheres gostaram um pouco mais de parceiros mais novos, na mesma medida; a diferença entre os sexos é mínima (q = 0,04), e seriam precisas 19.630 pessoas para enxergá-la | Results, Tabela 1 | "it would take N = 19,630 to detect the overall gender difference of q = 0.04 with 80% power. In other words, both men and women slightly preferred younger partners" | |
| Passar do limite | Ninguém avaliou o par de outro jeito quando ele passava do limite de idade que a pessoa tinha declarado | Results, Tabela 2 | "participants did not rate their partners any differently depending on whether the partner was below or above their personal maximum age limit" | |
| Encontros acima do limite | Em 15% dos encontros, o par tinha pelo menos um ano a mais que o limite declarado | Methods, Procedure | "on 15% ( n = 1,357 out of 9,084) of dates, matchmakers found that the participant could be matched with available partners who were at least 1 y above their stated maximum" | |

O q é a diferença entre homens e mulheres no quanto a idade do par pesa, lida como uma correlação: 0,10 já é pequena. Na Tabela 1, o peso da idade é pequeno nos dois sexos (−0,07 nos homens e −0,03 nas mulheres, na média das três medidas).

## Limitações

- Uma das autoras é a CEO da Tawkify e tem ações dela, e a empresa coletou os dados como parte do serviço, sem consentimento para pesquisa (o comitê de ética da UC Davis considerou que não era pesquisa com seres humanos).
- Quem paga uma agência de namoro é diferente da média: a renda anual mediana da amostra era de US$ 150 mil, e a idade média passa dos 46 anos. Os próprios autores dizem que os resultados podem ser desta amostra.
- A agência escolheu os pares, e escolheu homens mais velhos para as mulheres com mais frequência. Isso cria um paradoxo de Simpson que os autores mostram na Figura 2.
- O questionário mede o que a pessoa diz logo depois do encontro, não se o casal se formou.
- Não há conversa gravada nem transcrita: só as respostas do questionário. Os dados abrem pelo link view-only do artigo no OSF, e o texto não declara uma licença para eles.

## Como usamos

- [Catálogo de bases de conversa e encontros](../reports/2026-11-26-bases-de-conversa-e-encontros.md): o maior conjunto de primeiros encontros reais com desfecho, sem a conversa.
