---
reference: "O'Nell KC, Sanchez KL, Finn ES. *Pink noise in dyads' semantic similarity trajectories predicts conversation enjoyment*. Science Advances 12(45):eaeb2684, 2026. Texto completo aberto: https://pmc.ncbi.nlm.nih.gov/articles/PMC13742169/. Dados: https://osf.io/7ju2s/."
link: https://doi.org/10.1126/sciadv.aeb2684
license: "CC BY 4.0 (Creative Commons Attribution License 4.0, como diz a página do artigo no PMC)"
status: verified
verified_on: 2026-11-26
strength: moderate
strength_reason: "Observacional, com uma base grande (1.656 conversas do CANDOR) e uma réplica pequena (97 conversas entre amigos), e associações pequenas (R = 0,11); a parte de primeiro encontro tem só 31 encontros de podcast, e a dos diálogos é ficção escrita pelo Claude."
countries: []
period: "não informado no texto lido"
sample:
  n: 1656
  description: "Cinco conjuntos: 1.656 conversas por vídeo entre desconhecidos recrutados no Prolific (CANDOR); 97 conversas por vídeo entre amigos universitários, um negro e um não negro (Interracial Friends); 31 encontros por telefone do podcast Blink Date; 1.032 episódios de 25 podcasts de dois apresentadores; e 100 diálogos escritos pelo Claude 3.7 Sonnet, com nota de leitores do Prolific."
  representative: false
design: cross-sectional
conflict: "Financiado pelo JustX Grant (Wright Center for the Study of Computation and Just Communities, Dartmouth College) e por dois centros da Stanford University; os autores declaram não ter conflito de interesse."
covers: {}
---

# O'Nell, Sanchez e Finn (2026): o vaivém do assunto numa conversa e o quanto ela agrada

## O que mediu

Os autores transformam cada turno de uma conversa num vetor de sentido (o modelo MPNet) e medem a distância de cada turno ao anterior. A sequência dessas distâncias é a trajetória da conversa: os dois ficam perto num assunto, se afastam quando um traz algo novo e voltam a se encontrar. O "ruído rosa" mede o quanto esse vaivém se organiza em várias escalas de tempo ao mesmo tempo, entre o puro acaso (ruído branco) e a deriva lenta (ruído vermelho). A medida do artigo é o PNR, o coeficiente do ruído de cada conversa comparado com 1.000 embaralhamentos dela mesma.

Depois, o artigo pergunta se conversas com mais ruído rosa agradam mais: em conversas entre desconhecidos (CANDOR), entre amigos, em encontros de podcast que viram ou não um segundo encontro, ao longo dos episódios de podcasts e em diálogos que o Claude escreveu como bons ou ruins.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| Conversas entre desconhecidos | No CANDOR, 1.656 conversas livres entre desconhecidos, de 34,1 minutos em média | Results, primeiro parágrafo | "a dataset consisting of 1656 open-ended conversations between strangers [mean conversation length in minutes = 34.1 (SD = 9.2)" |
| Ruído rosa nas conversas | 94% das conversas tinham algum ruído rosa (coeficiente acima de 0,5, o do puro acaso; média de 0,62) | Results, primeiro parágrafo | "94% of conversations had noise scaling coefficients greater than 0.5 (mean = 0.62, SD = 0.08" |
| Agrado e conexão | Nas conversas com mais ruído rosa, os dois gostaram um pouco mais da conversa e se sentiram um pouco mais ligados; a associação é pequena (R = 0,11 para agrado e 0,09 para conexão) | Results, Fig. 3 | "First principal component scores for enjoyment and connection were significantly correlated with PNR after multiple hypothesis correction (correlation coefficient R = 0.11 and 0.09" |
| Contra medidas mais simples | Quando todas as medidas lineares mais complexas entram juntas, o ruído rosa deixa de acompanhar o agrado e a conexão além delas | Results, "Controlling for more complex linear measures" | "PNR is no longer a significant predictor of enjoyment or connection" |
| Conversas entre amigos | Entre amigos, o ruído rosa andou junto com o agrado (R = 0,22, p = 0,03), mas a ligação com a conexão pode ser acaso (R = 0,19, p = 0,07) | Results, "Replication" | "PNR still significantly predicted enjoyment ( R = 0.22, P = 0.03) but was not significantly correlated with connection ( R = 0.19, P = 0.07)" |
| Encontros do Blink Date | 31 encontros por telefone de 10 minutos entre desconhecidos, depois de tirar as conversas com menos de 20 turnos | Materials and Methods, "Speed dating corpus" | "After excluding conversations with fewer than 20 turns, the Blink Date corpus consists of 31 10-min-long audio-only phone conversations between two strangers" |
| Quem quis um segundo encontro | 19 encontros deram match (os dois disseram sim ou talvez a um segundo encontro) e 12 não | Fig. 4 | "The distribution of PNRs for successful (match, N = 19) and unsuccessful (not a match, N = 12) first dates" |
| Transcrição do Blink Date | Todas as conversas, menos uma, foram transcritas pelos apresentadores do podcast; a que faltava saiu do WhisperX | Materials and Methods, "Speed dating corpus" | "All but one of these conversations was transcribed by the podcast hosts" |
| Ruído rosa e segundo encontro | Os encontros que deram match tinham mais ruído rosa que os que não deram (t = 2,05; p = 0,02, num teste de um lado só) | Results, "Pink noise predicts real-world behavioral outcomes" | "successful dates had significantly higher PNRs than those that did not result in matches ( t = 2.05, P = 0.02" |
| Podcasts ao longo do tempo | Em 25 podcasts de dois apresentadores, o ruído rosa cresceu ao longo dos 50 primeiros episódios | Results, "Pairs' repeated conversations" | "Across 25 podcasts in which two hosts have relatively unconstrained conversations (see methods for full criteria), conversation PNR increased significantly across the first 50 episodes" |
| Diálogos do Claude | O Claude escreveu 50 diálogos agradáveis e 50 desagradáveis, de 100 turnos, entre desconhecidos que acabam de se conhecer num café | Materials and Methods, "LLM generated conversations" | "to write 50 high- and 50 low-enjoyment dialogues between strangers who have just met at a coffee shop, each with 100 turns" |
| Nota dos leitores | Leitores do Prolific deram, numa escala até cinco, nota média 4,8 aos diálogos pedidos como agradáveis e 2,4 aos pedidos como desagradáveis | Results, "A LLM produces good conversations" | "received an average score of 4.8 (SD = 0.2), while those generated by asking for unpleasant dialogues received an average score of 2.4 (SD = 0.6)" |
| Ruído rosa nos diálogos | Os diálogos agradáveis tinham mais ruído rosa que os desagradáveis (t = 3,2; p < 0,01) | Results, "A LLM produces good conversations" | "the high-enjoyment conversations had significantly higher PNRs than their low-enjoyment counterparts ( t = 3.2, P < 0.01" |

R é a correlação de Pearson, de 0 (nada) a 1; perto de 0,1 é uma associação pequena. O p é a chance de uma diferença desse tamanho aparecer só por acaso; abaixo de 0,05, os autores a tratam como real. O t é o tamanho da diferença entre dois grupos, medido em erros-padrão.

## Limitações

- É observacional: os autores medem o ruído rosa em conversas que já aconteceram. Eles mesmos dizem que falta um experimento que mexa no vaivém para saber se ele causa o agrado.
- As associações com agrado e conexão são pequenas, e o ruído rosa não acrescenta nada quando compete com todas as medidas lineares mais complexas juntas.
- A parte de primeiro encontro tem 31 encontros de um podcast, por telefone, com uma pergunta de partida imposta. O match conta "talvez" como sim.
- Na réplica entre amigos, o resultado some quando a duração da conversa entra no modelo; os autores atribuem isso a quem gostava ter conversado por mais tempo.
- Os diálogos do Claude são ficção com um pedido explícito de "bom" ou "ruim", e a nota vem de leitores de fora, com pelo menos cinco por diálogo.
- O texto não diz o país dos participantes. As transcrições do CANDOR pedem um cadastro, e as do Interracial Friends não são públicas.
- O projeto no OSF (7ju2s) traz também a pasta de um programa do YouTube, o *Kings and Kweens*, que o artigo não analisa nem cita.
- A Ficha leu o artigo inteiro no PMC, mas não o suplemento (os modelos e as figuras S1 a S7), que o PMC não deixou baixar.

## Como usamos

- [Catálogo de bases de conversa e encontros](../reports/2026-11-26-bases-de-conversa-e-encontros.md): de onde vêm o Blink Date, o Kings and Kweens e os diálogos do Claude.
- [O que separa o primeiro encontro que vira segundo](../reports/2026-11-26-primeiro-encontro-que-vira-segundo.md): reanálise nossa do Blink Date, do Kings and Kweens e dos diálogos do Claude.
