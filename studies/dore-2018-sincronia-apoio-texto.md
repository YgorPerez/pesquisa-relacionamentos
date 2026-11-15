---
reference: "Doré BP, Morris RR. *Linguistic synchrony predicts the immediate and lasting impact of text-based emotional support*. Psychological Science 29(10), 2018 (lida a versão online, pp. 1–8). Texto completo aberto: https://brucedore.github.io/Dore&Morris_PsychSci_2018.pdf"
link: https://doi.org/10.1177/0956797618779971
status: verified
verified_on: 2026-11-15
strength: weak
strength_reason: "Mais de um milhão de respostas de verdade num app de apoio emocional entre desconhecidos anônimos, mas um dos dois autores é cofundador da Koko, a empresa dona do app e dos dados; o estudo só observa, dá o tamanho das ligações apenas em curvas, mede a nota da resposta e a melhora com uma pergunta só cada e não pré-registrou a análise."
countries: []
period: "1º de junho de 2016 a 20 de junho de 2017"
sample:
  n: 169376
  description: "Todos os usuários do Koko, um app de apoio emocional anônimo por texto, entre junho de 2016 e junho de 2017: 169.376 pessoas, que postaram cerca de 361.139 situações de estresse e receberam 1.161.360 mensagens de apoio de outros usuários. O app não coletava idade nem gênero. Os autores sortearam 20% dos usuários (33.875) para explorar os dados e montar os modelos, e 80% (135.501) para conferi-los. Não é namoro: são desconhecidos anônimos trocando apoio sobre problemas da vida."
  representative: false
design: platform
conflict: "Robert R. Morris é cofundador da Koko, empresa com fins lucrativos que oferece serviços de saúde mental e segurança a redes sociais; o serviço de apoio da Koko foi o usado na pesquisa, e foi Morris quem criou o app e supervisionou a coleta. Doré declarou não ter conflito. O artigo não informa financiamento."
covers: {}
---

# Doré & Morris (2018): linguagem parecida no apoio emocional por texto

## O que mediu

No Koko, um usuário anônimo descreve uma situação que o estressa e outros usuários, desconhecidos, mandam mensagens de apoio, orientados a dar uma visão mais positiva da situação. Logo depois de ler cada resposta, quem pediu ajuda dá uma nota a ela (ruim, ok ou boa) e pode mandar um agradecimento. Depois de pelo menos 30 minutos (cerca de uma hora, na mediana), responde se se sente pior, igual ou melhor com a situação.

Os autores mediram quatro tipos de semelhança entre o post e cada resposta: a repetição do texto (distância de Levenshtein), o estilo (usar as palavras de ligação na mesma proporção, o que chamam de *language style matching*), as emoções expressas (oito categorias de um léxico de palavras em inglês) e o assunto de fundo (análise semântica latente). Modelos aditivos generalizados, que deixam a curva tomar qualquer forma, ligam cada semelhança às reações de quem pediu ajuda, com as quatro semelhanças juntas no mesmo modelo.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Tamanho dos dados | 169.376 usuários postaram cerca de 361.139 situações de estresse e receberam 1.161.360 mensagens de apoio | Method, p. 2 | "a total of 169,376 unique users posted about 361,139 unique stressful situations and received 1,161,360 messages of support in response" |
| Tempo até as respostas | Cada post recebia mensagens de três ou quatro usuários, em geral; a mediana do tempo entre o post e uma resposta foi de 6,2 minutos | Method, p. 2 | "typically from three or four other users starting a few minutes after posting (median delay from post to a response was 6.2 min" |
| Repetir o texto do post | Para quem pediu ajuda, as respostas que quase não repetiam o texto do post e as que o repetiam quase palavra por palavra andaram junto com notas piores, menos agradecimentos e agradecimentos menos positivos do que as que repetiam uma parte moderada | Results, p. 5; Figura 2 | "support responses that were highly asynchronous (showed very little overlap in text used) or highly synchronous (repeated much of the stressor post in a manner close to verbatim) with their corresponding stressor post were less impactful than those showing a moderate degree of surface-level textual similarity" |
| Estilo e emoções parecidos, reação imediata | Quanto mais a resposta usava as palavras de ligação (pronomes, artigos, preposições) na mesma proporção que o post, e quanto mais expressava as mesmas emoções, melhor a nota que quem pediu ajuda deu a ela, maior a chance de um agradecimento e mais positivo o agradecimento | Results, p. 6; Figura 2 | "For both linguistic style synchrony and emotional content synchrony, support responses showing greater synchrony were rated as more effective, were more likely to elicit an expression of gratitude, and elicited more positive language within gratitude expressions." |
| Estilo muito parecido, reação imediata | Na reação imediata de quem pediu ajuda, a ligação com o estilo parecido foi perdendo força: passar de uma semelhança moderada para uma alta andou junto com pouco ganho a mais | Results, p. 6; Figura 2 | "these relationships showed clear nonlinearity in a manner suggesting diminishing additional benefits of high (vs. moderate) synchrony in linguistic style" |
| Mesmo assunto de fundo, reação imediata | Quanto mais a resposta tratava do mesmo assunto de fundo do post, melhor a reação imediata de quem pediu ajuda, numa curva que sobe cada vez mais rápido; os autores leem que essa foi a semelhança mais forte das quatro | Results, p. 6; Figura 2 | "latent semantic synchrony robustly predicted immediate support outcomes with a form suggesting an exponential relationship" |
| Distância do acaso | Na parte dos dados guardada para conferir (80% dos usuários), todas as curvas ficaram longe do acaso (p < 10^-8) | Legenda da Figura 2, p. 6 | "Solid curves (with 95% credible intervals) reflect models fit to a confirmatory subsample (80% of the data), all of which were significant (p < 10−8)" |
| Estilo e emoções, uma hora depois | Na pergunta feita cerca de uma hora depois sobre como quem pediu ajuda se sentia com a situação, os posts cujas respostas tinham, em média, estilo e emoções moderadamente parecidos com o post andaram junto com mais melhora do que os posts cujas respostas eram, em média, muito ou pouco parecidas | Results, p. 7; Figura 2 | "although synchronous linguistic style and emotional content predicted higher immediate ratings of effectiveness, nonmonotonic relationships with these delayed ratings suggested that moderate (rather than high or low) synchrony on these dimensions was more optimal for evoking lasting emotional change" |
| Mesmo assunto de fundo, uma hora depois | Quanto mais as respostas recebidas tratavam do mesmo assunto de fundo do post, mais quem pediu ajuda disse, cerca de uma hora depois, se sentir melhor com a situação, numa linha reta | Results, p. 7; Figura 2 | "Latent semantic synchrony linearly predicted higher lasting recovery" |
| Semelhança e tom positivo | Na nota e no agradecimento logo depois da resposta, as diferenças ligadas à semelhança foram um pouco menores que as ligadas ao tom positivo da resposta | Results, p. 7 | "First, effects of synchrony were somewhat smaller than effects of valence for immediate support outcomes (i.e., effectiveness ratings and thank-you notes)." |

Palavras de ligação são as que não carregam assunto: pronomes, artigos, preposições, conjunções, negações, advérbios comuns, verbos auxiliares e quantificadores. A semelhança de estilo vai de zero a um. Os resultados são curvas desenhadas na Figura 2, sem um número para o tamanho de cada ligação. O p é a probabilidade de uma curva assim aparecer por acaso se não houvesse ligação nenhuma; 10^-8 é um centésimo de milionésimo. Com mais de um milhão de mensagens, um p tão pequeno diz que a ligação existe nos dados, não que ela é grande.

## Limitações

- Não é namoro nem conversa para se conhecer. São desconhecidos anônimos num app de apoio emocional, respondendo a posts sobre situações de estresse, com a orientação de dar uma visão mais positiva da situação.
- Um dos dois autores é cofundador da Koko, a empresa com fins lucrativos dona do app, e criou o app. Os dados foram coletados, segundo o artigo, para avaliar e melhorar o próprio app.
- O estudo só observa. Ninguém sorteou respostas mais ou menos parecidas com o post, então ele não mostra que imitar o estilo de alguém melhora a reação; um post fácil de responder pode render respostas mais parecidas e mais bem recebidas ao mesmo tempo.
- A nota da resposta e a melhora uma hora depois são, cada uma, uma pergunta só, com três opções, respondida por quem pediu ajuda; os autores apontam essa limitação. O agradecimento é o que a pessoa fez, e o tom dele vem de um léxico de palavras. A "melhora duradoura" é a resposta dada cerca de uma hora depois (mediana de 63 minutos, de 40 minutos a 8 horas no intervalo interquartil).
- Cada tipo de semelhança foi estimado descontando os outros três, que, segundo os autores, andam fraca ou moderadamente juntos.
- O app não coletava idade nem gênero, e o texto não diz de que países eram os usuários. Os autores dizem só que quem usa esses canais costuma ser mais jovem que a população. As medidas de emoção e de assunto usam léxicos e textos em inglês.
- O plano de análise não foi pré-registrado. Os dados estão abertos no OSF, e os autores separaram 20% dos usuários para montar os modelos antes de conferi-los nos outros 80%.
- Na fórmula de semelhança de emoções impressa na p. 4, o denominador usa as preposições da resposta no lugar das palavras de medo, o que parece erro de digitação; o texto descreve a conta como igual à do estilo.
