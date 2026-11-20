---
reference: "Jang J, Kwon S, Park S-H. *Beauty vs. Vibe: Deconstructing visual appeal in online dating with large multimodal models*. Computers in Human Behavior 173:108792, 2025. A cópia lida é o preprint do SSRN (abstract 5191741), de 24 de março de 2025, anônimo e marcado como não revisado por pares, enviado à revista com o título 'Beauty vs. vibe in online dating with large multimodal models'; fica no repositório privado das Fontes. Os nomes dos autores e o título publicado vêm da divulgação do artigo, não do texto lido. Preprint: https://ssrn.com/abstract=5191741"
link: https://doi.org/10.1016/j.chb.2025.108792
status: verified
verified_on: 2026-11-20
strength: weak
strength_reason: "Registros de 45.399 usuários de um app de namoro sul-coreano, mas a versão lida é um preprint sem revisão por pares; o 'match' é uma nota de 4 ou 5 dada por outro usuário, não um match dos dois lados; as cinco medidas da foto vêm de um modelo de inteligência artificial sem conferência com pessoas nas fotos do app; e o texto troca números da tabela e diz no resumo um aumento de 200% onde a conta dá 100%."
countries: [Coreia do Sul]
period: "não informado no texto lido"
sample:
  n: 45399
  description: "45.399 usuários ativos de um grande app de namoro da Coreia do Sul (35.476 homens e 9.923 mulheres, de 18 a 51 anos, média de 27,6), com 123.501 fotos de perfil e 603.741 notas de 1 a 5 dadas por um usuário ao perfil de outro. O texto diz que as análises principais usam os 11.627 usuários avaliados por pelo menos 15 pessoas, mas as tabelas de regressão dão 35.476 observações nos homens e 9.923 nas mulheres."
  representative: false
design: platform
conflict: "A versão lida é anônima, para revisão, e não traz autores, financiamento nem conflitos de interesse. O artigo não diz como os dados do app foram obtidos."
covers:
  genders: [man, woman]
  ages: { min: 18, max: 51 }
---

# Jang et al. (2025): beleza e "clima" das fotos num app coreano, medidos por inteligência artificial

## O que mediu

O estudo usou os registros de um grande app de namoro da Coreia do Sul. No app, um usuário dá ao perfil de outro uma nota de 1 a 5; os autores tratam uma nota de 4 ou 5 como um "match", isto é, interesse de um lado. Para cada usuário, contaram quantas dessas notas altas ele recebeu, levando em conta quantas vezes o perfil foi mostrado.

As fotos de perfil foram medidas por um modelo de inteligência artificial que lê imagens e texto, o InternVL-G, sem treino extra, só com instruções escritas. Ele deu a cada foto cinco notas: beleza do rosto; "clima" geral, que os autores descrevem como o ar romântico e acessível da foto (expressão, postura, luz, cores); e três tipos de capital, na linha de Bourdieu: social (gente, festas, convívio), econômico (marcas, carros, restaurantes caros) e cultural (museus, livrarias, concertos). Cada nota virou posição relativa na amostra, de 0 (a mais baixa) a 1 (a mais alta). Com regressões de Poisson separadas para homens e mulheres, levando em conta idade, altura, tipo sanguíneo, bebida e cigarro, os autores compararam as notas das fotos com o número de notas altas recebidas.

## Achados

| Medida | Valor | Onde | Trecho | Cálculo |
|---|---|---|---|---|
| Quem entrou | 35.476 homens e 9.923 mulheres, com idade média de 27,6 anos | 3.1, Data Collection (p. 9) | "Within the sample, 35,476 users are male and 9,923 are female. The average age is 27.6" | |
| Notas trocadas | 603.741 notas de um usuário ao perfil de outro | 3.1 (p. 9) | "The dataset also includes 603,741 recorded evaluations of users by other users" | |
| O que conta como match | Uma nota de 4 ou mais conta como sinal de interesse, isto é, um "match" possível | 3.1 (p. 9) | "A rating of 4 or above is interpreted as an expression of genuine interest" | |
| Quem entra nas contas | Segundo o texto, as análises principais usam os 11.627 usuários avaliados por pelo menos 15 pessoas | 3.1 (p. 9) | "analyses focus on users who had been rated by at least 15 different individuals; 11,627 users" | |
| O modelo acerta beleza? | Num banco público de rostos com notas de pessoas, a nota de beleza do modelo andou bem junto com a delas (correlação de 0,7885) | 3.2 (p. 13) | "which achieve a PC of 0.7885, MAE of 0.3478, and RMSE of 0.4398" | |
| Beleza, homens e mulheres | Do usuário de foto menos bonita ao de foto mais bonita da amostra, a taxa de notas altas recebidas multiplicou por cerca de 2,00 nos homens e 1,55 nas mulheres, levando em conta as outras características | 4.1 (p. 25) | "by approximately exp(0.6946)=2.00 times" | `scripts/calculations/jang-2025-beleza-vibe.ts beauty` |
| Beleza, o que o resumo diz | O resumo fala em aumento de 200% nos homens e 155% nas mulheres; pelas contas do próprio texto, o aumento é de cerca de 100,3% e 55,2%, porque 2,00 vezes é o dobro, não o triplo | Resumo; 4.1 (p. 25) | "by 200% for men and 155% for women" | `scripts/calculations/jang-2025-beleza-vibe.ts beauty` |
| "Clima" da foto, homens | Levando em conta a beleza, o "clima" da foto andou junto com mais notas altas nos homens: da foto de clima mais baixo à mais alta, a taxa multiplicou por 1,66 | 4.2 (p. 27) | "matching occurrence rate increases by approximately exp(0.5092)=1.66 times" | |
| Capitais na foto, homens | Nos homens, fotos com mais capital social, econômico e cultural andaram junto com taxas 28,2%, 17,5% e 27,7% maiores, do mais baixo ao mais alto | 4.2 (p. 27) | "matching rates of 28.2, 17.5, and 27.7 percent respectively" | |
| "Clima" da foto, mulheres | Nas mulheres, o texto dá um aumento de 54,5% pelo clima da foto, com coeficiente de 0,4350 | 4.2 (p. 27) | "estimated at 0.4350, demonstrating statistical significance at the 1% level. The exponential transformation indicates that enhancing the overall mood in profile photos increases matching rates by 54.5 percent" | |
| "Clima" das mulheres, pela tabela | A tabela das mulheres dá 0,3453 para o clima nas mulheres, não 0,4350; com o número da tabela, o aumento seria de 41,2%, não 54,5% | Tabela 3 (p. 24), Model 2a | "(0.029) 0.3453" | `scripts/calculations/jang-2025-beleza-vibe.ts mood-women` |
| Capitais na foto, mulheres | Nas mulheres, capital social, econômico e cultural na foto andaram junto com taxas 17,0%, 8,3% e 15,4% maiores | 4.2 (p. 28) | "increases in matching rates of 17.0, 8.3, and 15.4 percent respectively" | |
| Beleza com convívio, homens | Nos homens, a soma de rosto bonito com foto de muito convívio rendeu menos notas altas que a soma dos dois efeitos separados (interação negativa) | 4.3 (p. 29–30) | "attractiveness and social capital (beauty × social) showed a significantly negative coefficient" | |
| Beleza com cultura, mulheres | Nas mulheres, a soma de rosto bonito com sinais de cultura na foto rendeu menos que a soma dos dois efeitos separados (interação negativa) | 4.3 (p. 30) | "shows significant negative interaction between facial attractiveness and cultural capital signals (beauty × culture) in the female user group" | |

As notas das fotos são posições na amostra, de 0 a 1, então "do mais baixo ao mais alto" compara o usuário de nota mais baixa com o de nota mais alta. As porcentagens vêm do exponencial do coeficiente de Poisson: um aumento de 28,2% quer dizer que a taxa de notas altas, por vez que o perfil foi mostrado, ficou 1,282 vez maior. A interação negativa quer dizer que, quando as duas coisas vêm juntas, o ganho é menor que a soma dos dois ganhos separados. Na Tabela 2, a interação da beleza com o capital cultural nos homens e com o econômico nos dois sexos pode ser acaso.

## Limitações

- A versão lida é o preprint anônimo do SSRN, sem revisão por pares; a versão publicada pode ter outros números.
- O "match" não é um match: é uma nota de 4 ou 5 de um usuário a outro, sem saber se o outro respondeu ou se houve conversa.
- As cinco notas das fotos vêm de um modelo de inteligência artificial. Os autores conferiram a nota de beleza num banco público de rostos, o SCUT-FBP5500 (correlação de 0,7885 com as notas de pessoas), não nas fotos do app; as notas de clima e de capital não foram conferidas com pessoas. As imagens de exemplo do artigo foram geradas por inteligência artificial.
- O resumo diz 200% e 155% onde a conta do texto dá 2,00 e 1,55 vezes, ou seja, 100% e 55% a mais. O clima das mulheres é 0,3453 na tabela e 0,4350 no texto (linhas com Cálculo). O texto diz que as análises usam 11.627 usuários avaliados por 15 pessoas ou mais, e as tabelas dão 35.476 e 9.923 observações, o total de cada sexo, embora só 20.834 usuários tenham recebido alguma nota.
- É associação: cada um escolheu as próprias fotos, e quem põe foto de festa ou de concerto pode diferir de quem não põe em muita coisa que o app não registra.
- Um app, de um país, sem período informado, com mais de três homens para cada mulher.
- O texto lê as interações negativas como "excesso de informação" e dá conselhos aos usuários; isso é interpretação dos autores, e o estudo não testou por que a soma rende menos.

## Como usamos

O Relatório [Que fotos de perfil andam junto com mais curtidas, matches e mensagens?](../reports/2026-11-15-fotos-do-perfil.md) usa esta Ficha entre os dados de plataforma: num app coreano, a beleza do rosto e o "clima" da foto, medidos por inteligência artificial, andaram junto com mais notas altas, e a soma de beleza com outros sinais rendeu menos que o esperado.
