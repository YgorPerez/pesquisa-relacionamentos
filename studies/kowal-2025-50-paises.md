---
reference: "Kowal M, Sorokowski P, Bode A, Misiak M, Malecki WP, Sorokowska A, Roberts SC. *Meeting partners online is related to lower relationship satisfaction and love: Data from 50 countries*. Telematics and Informatics 101:102309, 2025. Texto completo aberto: https://www.stir.ac.uk/research/hub/file/2181268. Dados: https://osf.io/uzf37"
link: https://doi.org/10.1016/j.tele.2025.102309
status: verified
verified_on: 2026-10-21
strength: moderate
strength_reason: "6.646 pessoas com parceiro em 50 países, mas recrutadas por painel online com cotas de idade, gênero e região (não é amostra probabilística), transversal, com online/offline numa pergunta binária e diferenças que, nos dados públicos, são bem menores que os d publicados."
countries: [Argélia, Argentina, Austrália, Bangladesh, Bolívia, Brasil, Bulgária, Chile, China, Colômbia, Equador, Egito, Etiópia, França, Alemanha, Gana, Grécia, Guatemala, Honduras, Índia, Indonésia, Itália, Japão, Cazaquistão, Quênia, Malásia, México, Marrocos, Nova Zelândia, Nicarágua, Nigéria, Paquistão, Panamá, Paraguai, Peru, Filipinas, Polônia, Romênia, Singapura, África do Sul, Coreia do Sul, Espanha, Sri Lanka, Tailândia, Turquia, Reino Unido, EUA, Uganda, Venezuela, Vietnã]
period: "2024"
sample:
  n: 6646
  description: "6.646 pessoas com parceiro, de 18 a 73 anos, dentre 10.482 respondentes recrutados pelos painéis online da Syno International, com pelo menos 200 por país e cotas de idade (quatro faixas de 25%), gênero (cerca de metade mulheres) e área urbana ou rural. Os modelos de satisfação e amor usam só as relações iniciadas em 2010 ou depois. A lista de países vem do arquivo público do OSF; o artigo mostra os países só num mapa."
  representative: false
design: cross-sectional
conflict: "Financiado pelo IDN Being Human Lab (Universidade de Wrocław); Marta Kowal teve bolsa START da Fundação para a Ciência Polonesa (FNP). Os autores declaram não ter conflito de interesse."
license: "CC BY 4.0 (como diz a primeira página do artigo)"
covers:
  genders: [man, woman]
  ages: { min: 18, max: 73 }
---

# Kowal et al. (2025): conhecer-se online e satisfação em 50 países

## O que mediu

Os autores perguntaram a pessoas com parceiro, em 50 países, se conheceram o parceiro "online" ou "do jeito tradicional", quanto estão satisfeitas com a relação (uma pergunta, de 1 a 5) e quanto sentem de intimidade, paixão e compromisso (escala triangular do amor de Sternberg, versão de 15 itens, de 1 a 5). Com modelos mistos, que aninham as pessoas nos países e controlam gênero, idade, tempo de relação e nível socioeconômico, compararam quem se conheceu online com quem se conheceu fora da internet. Repetiram a análise com pesos de escore de propensão, para tentar corrigir o viés de que casais offline infelizes já teriam se separado.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Respondentes e pessoas com parceiro | 10.482 respondentes, 6.646 com parceiro | p. 3, 2.1 Participants | "This resulted in a total sample of 10,482 individuals, of whom 6,646 were in romantic relationships" | |
| Cota por país | Pelo menos 200 pessoas por país | p. 3, 2.1 Participants | "we recruited at least 200 individuals from each country" | |
| Conheceram o parceiro fora da internet | 5.578 (84%) | p. 3, 2.1 Participants | "The majority of participants had met their romantic partners offline (n = 5,578, 84 %)." | |
| Conheceram o parceiro online | 16%, de 7% em Gana a 33% na Polônia | p. 7, Discussion | "on average, 16 % of participants met their partners online, with rates ranging from 33 % in Poland to 7 %" | |
| Conheceram online, relações iniciadas em 2010 ou depois | 21%, de 8% em Gana a 48% na Polônia | p. 7, Discussion | "Among those who entered relationships in 2010 or later, the prevalence increased to 21 %, ranging from 48 % in Poland to 8" | |
| Conheceram online, relações de 2023 | 50% nos EUA | p. 7, Discussion | "across all countries and 50 % of those in the U.S. reported meeting their partners online" | |
| Quem conheceu online: nível socioeconômico | Menor (log-odds −0,063, p = 0,004) | p. 5, Results | "were more likely to have a lower SES (log odds = -0.063, SE = 0.022, 95 %CI [-0.106,-0.021], p = 0.004)" | |
| Quem conheceu online: tempo de relação | Relações mais curtas (log-odds −0,097, p < 0,001) | p. 5, Results | "be in shorter romantic relationships (log odds = -0.097, SE = 0.011, 95 %CI [-0.118,-0.076], p < 0.001)" | |
| Quem conheceu online: gênero e idade | Sem associação significativa | p. 5, Results | "No significant associations were found with gender or age." | |
| Satisfação, médias marginais estimadas | Offline 4,28 vs. online 4,20 | p. 5, Results | "The estimated marginal means (EMM) for relationship satisfaction were: offline = 4.28, SE = 0.03, online EMM = 4.20" | |
| Diferença em satisfação e intimidade, como publicada | d = 0,43 e d = 0,35 | p. 5, Results | "(d = 0.43, 95 %CI[0.36,0.50], d = 0.35, 95 %CI[0.28,0.43]" | |
| Diferença em paixão, como publicada | d = 0,37 | p. 6, Results | "0.37, 95 %CI[0.30,0.44], respectively)" | |
| Diferença em compromisso, como publicada | d = 0,51, moderada | p. 6, Results | "moderate for Commitment (d = 0.51, 95 %CI[0.44,0.58])" | |
| Diferença padronizada bruta nos dados públicos, relações de 2010 em diante (cálculo próprio) | Satisfação 0,11; intimidade 0,09; paixão 0,10; compromisso 0,12 | p. 10, Data availability (dados no OSF) | "Data has been made publicly available at the OSF: https://osf.io/uzf37." | `scripts/calculations/kowal-2025-50-paises.py gap` |
| Com pesos do escore de propensão | Mesmo padrão: offline com mais satisfação e amor | p. 6–7, Results | "Re-running the analyses with weights from the propensity score analysis yielded the same pattern of results" | |
| Idade a partir da qual a diferença aparece | Por volta de 33 anos | p. 7, Results | "differences in relationship satisfaction and love intensity were most pronounced among individuals older than approximately 33 years" | |
| Brasil: pessoas com parceiro e quantas se conheceram online (cálculo próprio) | 23 de 119 (19,3%) | p. 10, Data availability (dados no OSF) | "Data has been made publicly available at the OSF: https://osf.io/uzf37." | `scripts/calculations/kowal-2025-50-paises.py country Brazil` |
| Brasil: satisfação, online vs. offline (cálculo próprio, média simples) | 4,48 vs. 4,50 | p. 10, Data availability (dados no OSF) | "Data has been made publicly available at the OSF: https://osf.io/uzf37." | `scripts/calculations/kowal-2025-50-paises.py country Brazil` |
| Brasil: intimidade, online vs. offline (cálculo próprio) | 4,41 vs. 4,44 | p. 10, Data availability (dados no OSF) | "Data has been made publicly available at the OSF: https://osf.io/uzf37." | `scripts/calculations/kowal-2025-50-paises.py country Brazil` |
| Brasil: paixão, online vs. offline (cálculo próprio) | 4,30 vs. 4,21 | p. 10, Data availability (dados no OSF) | "Data has been made publicly available at the OSF: https://osf.io/uzf37." | `scripts/calculations/kowal-2025-50-paises.py country Brazil` |
| Brasil: compromisso, online vs. offline (cálculo próprio) | 4,56 vs. 4,61 | p. 10, Data availability (dados no OSF) | "Data has been made publicly available at the OSF: https://osf.io/uzf37." | `scripts/calculations/kowal-2025-50-paises.py country Brazil` |
| Brasil: relações iniciadas em 2010 ou depois que começaram online (cálculo próprio) | 21 de 73 (29%) | p. 4, 2.4 Statistical analyses | "we calculated the year each participant's romantic relationship began by subtracting their reported relationship length from 2024" | `scripts/calculations/kowal-2025-50-paises.py since2010 Brazil` |
| Brasil: posição entre os 50 países na fatia online (cálculo próprio) | 15º de 50 (19,3%) | p. 10, Data availability (dados no OSF) | "Data has been made publicly available at the OSF: https://osf.io/uzf37." | `scripts/calculations/kowal-2025-50-paises.py rank Brazil` |

As linhas de cálculo próprio leem o arquivo público `Dataset_Relationship_Formation.csv` do OSF. São médias e proporções simples, sem peso, sem os controles do artigo e sem teste estatístico; não são números publicados pelos autores.

## Definições

| Verbete | Definição | Onde | Trecho |
|---|---|---|---|
| satisfacao | Uma pergunta, "quão satisfeito você está com a relação com o seu parceiro?", de 1 (nada) a 5 (extremamente) | p. 4, 2.2 Measures | "Relationship satisfaction was measured with the question "How satisfied are you with your relationship with your partner?", using a 5-point Likert scale, ranging from "1 − not at all" to "5 – extremely."" |

## Limitações

- Os autores chamam as amostras de "nacionalmente representativas", mas elas vêm de [[painéis online]] com cotas, não de sorteio. Eles mesmos reconhecem que o recrutamento online deixa de fora quem não tem internet, gente que tende a ter conhecido o parceiro fora dela.
- Transversal: não mostra causa. Quem procura parceiro online pode diferir em valor no mercado de parceiros, apego, autoestima ou personalidade, coisas que o estudo não mediu e que os autores citam.
- Online/offline é uma pergunta binária: não separa app, site de namoro e rede social.
- Os d publicados (0,35 a 0,51) não batem com o resto do artigo. As médias marginais diferem em 0,06 a 0,08 ponto numa escala de 1 a 5, e nos dados públicos a diferença bruta dividida pelo desvio-padrão fica entre 0,09 e 0,12 nas relações de 2010 em diante. O artigo não diz como calculou o d (a Fig. 4 fala em "weighted Cohen's d"). A diferença existe e é estatisticamente significativa, mas é pequena; os d de 0,35 a 0,51 não devem ser repetidos sem essa ressalva.
- Sem dados do parceiro: o estudo não mede homogamia, que os autores citam como possível explicação.
- O artigo traz erros menores de porcentagem: 10 pessoas de 6.646 aparecem como "0.002 %" e 37 como "0.006 %".
- Recorte do Brasil pequeno (119 pessoas com parceiro, 23 online): as médias brutas parecidas não bastam para dizer que o padrão geral não vale aqui.

## Como usamos

- [Relatório 2026-10-18](../reports/2026-10-18-casamentos-apps-e-onde-procurar.md), seções 1.3 e 2.1: estoque de casais online fora dos EUA e evidência contrária a Cacioppo.
- [Relatório 2026-10-18: onde casais se conhecem](../reports/2026-10-18-onde-casais-se-conhecem.md): o Brasil está na amostra; recorte brasileiro.
