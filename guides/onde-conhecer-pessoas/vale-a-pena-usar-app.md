---
question: Vale a pena usar ==app de namoro==?
confidence: moderate
findings:
  - text: Entre os americanos que já usaram site ou app de namoro, 77% saíram com alguém que conheceram ali, e 39% namoraram sério ou casaram com alguém de lá. Os 39% contam a vida toda e incluem namoros que já acabaram.
    fact_sheets: [pew-2023-2020-online-dating]
    period: '2019'
    myths:
      - claim: O app acabou com o namoro.
        why_not: Entre os americanos que usaram site ou app, 39% namoraram sério ou casaram com alguém de lá. E só 20% dos adultos com parceiro com menos de 30 anos o conheceram em site ou app de namoro, então os outros caminhos continuam funcionando.
        fact_sheets: [pew-2023-2020-online-dating]
  - text: Entre quem usou, 53% descrevem a experiência como positiva e 46%, como negativa.
    fact_sheets: [pew-2023-2020-online-dating]
  - text: Entre os adultos com parceiro, 24% dos lésbicas, gays e bissexuais o conheceram em site ou app, contra 9% dos héteros. Entre os casais do mesmo sexo formados na década antes de 2009, 41% se conheceram online, contra 17% dos casais héteros.
    fact_sheets:
      [pew-2023-2020-online-dating, rosenfeld-2012-searching-for-a-mate]
  - text: Gays, lésbicas e héteros de meia-idade, que têm poucos parceiros possíveis por perto, eram os que mais dependiam da internet para achar alguém. Os héteros jovens estavam entre os que menos conheciam o parceiro online.
    fact_sheets: [rosenfeld-2012-searching-for-a-mate]
    period: '2009'
  - text: Num site de namoro, homens e mulheres escreveram, em média, para pessoas cerca de 25% mais "desejáveis" que eles no ranking do estudo. Quanto maior a distância, menor a chance de resposta.
    fact_sheets: [bruch-2018-aspirational-pursuit]
    period: '2014'
    tips: [mensagem-um-pouco-acima]
  - text: Entre quem já usou, 38% receberam mensagem ou imagem sexual sem pedir, 30% continuaram sendo procurados depois de dizer não, 24% foram xingados e 6% foram ameaçados de agressão. Ao menos uma das quatro coisas aconteceu com 48%, e com 64% dos usuários lésbicas, gays e bissexuais.
    fact_sheets: [pew-2023-2020-online-dating]
  - text: Entre as usuárias com menos de 50 anos, 66% passaram por ao menos uma dessas quatro coisas.
    fact_sheets: [pew-2023-2020-online-dating]
    applies_to: { genders: [woman], ages: { min: 18, max: 49 } }
  - text: Entre quem já usou, 52% acham que cruzaram com um golpista no app. Entre os homens com menos de 50 anos, 63%; entre as mulheres, 44%.
    fact_sheets: [pew-2023-2020-online-dating]
  - text: Em 2022, quase 70 mil pessoas relataram golpe romântico à FTC, com US$ 1,3 bilhão em perdas. Entre quem perdeu dinheiro, o contato começou em rede social para 40% e em site ou app para 19%.
    fact_sheets: [ftc-2023-golpe-romantico]
    period: '2022'
    tips: [seguranca-no-app]
  - text: Em 27 estudos, quem usa app de namoro estava um pouco pior de saúde mental do que quem não usa. A diferença foi maior no uso compulsivo e na preocupação com o corpo, e quase todos os estudos olharam um momento só.
    fact_sheets: [cela-2026-meta-analise-apps]
    myths:
      - claim: App de namoro causa depressão.
        why_not: O que existe é uma associação pequena, medida quase sempre num momento só. Os autores da meta-análise de 27 estudos dizem que não dá para saber se o app piora a saúde mental ou se quem já está pior usa mais o app.
        fact_sheets: [cela-2026-meta-analise-apps]
  - text: Em laboratório, a chance de aceitar alguém caiu 27% em média do primeiro ao último perfil de uma sequência, e quem recusou mais ficou menos satisfeito até com quem aceitou.
    fact_sheets: [pronk-2020-mentalidade-rejeicao]
    tips: [limitar-a-busca]
related:
  [
    app-ou-presencial,
    o-lugar-muda-a-relacao,
    apps-fazem-mal,
    ver-perfis-demais,
    silencio-do-app,
  ]
visuals:
  - id: quem-conheceu-online
    kind: bars
    title: Quem conheceu o parceiro online, nos EUA, conforme quem procura
    unit: '%'
    bars:
      - label: Lésbicas, gays e bissexuais com parceiro, em 2022
        value: 24
        fact_sheet: pew-2023-2020-online-dating
      - label: Héteros com parceiro, em 2022
        value: 9
        fact_sheet: pew-2023-2020-online-dating
      - label: Casais do mesmo sexo formados na década antes de 2009
        value: 41
        fact_sheet: rosenfeld-2012-searching-for-a-mate
      - label: Casais héteros formados na década antes de 2009
        value: 17
        fact_sheet: rosenfeld-2012-searching-for-a-mate
    highlight: Lésbicas, gays e bissexuais com parceiro, em 2022
    note: os de 2022 contam só site ou app; os de 2009, qualquer meio online
  - id: assedio-no-app
    kind: bars
    title: Usuários de app que passaram por assédio, nos EUA
    unit: '%'
    bars:
      - label: Todos os usuários
        value: 48
        fact_sheet: pew-2023-2020-online-dating
      - label: Usuários lésbicas, gays e bissexuais
        value: 64
        fact_sheet: pew-2023-2020-online-dating
      - label: Usuárias com menos de 50 anos
        value: 66
        fact_sheet: pew-2023-2020-online-dating
    highlight: Usuárias com menos de 50 anos
    note: ao menos uma de quatro coisas, de imagem sexual sem pedir a ameaça
  - id: onde-comecou-o-golpe
    kind: bars
    title: Onde começou o contato, entre quem perdeu dinheiro com golpe romântico nos EUA
    unit: '%'
    bars:
      - label: Rede social
        value: 40
        fact_sheet: ftc-2023-golpe-romantico
      - label: Site ou app de namoro
        value: 19
        fact_sheet: ftc-2023-golpe-romantico
    highlight: Rede social
    note: queixas à FTC em 2022, não uma amostra
---

Vale, como um caminho entre outros, não como a única aposta. Nos EUA, ==39% de quem já usou== site ou app de namoro namorou sério ou casou com alguém de lá [@pew-2023-2020-online-dating], e os casais que se conhecem online não terminam mais que os outros [@rosenfeld-2017-marriage-choice-couplehood]. O app rende mais para lésbicas, gays e bissexuais e para quem tem poucas opções por perto [@rosenfeld-2012-searching-for-a-mate]. Rende menos para homens héteros, que mandam a maior parte das mensagens e recebem resposta a menos de 20% delas [@bruch-2018-aspirational-pursuit]. Entre as usuárias com menos de 50 anos, 66% já passaram por assédio no app [@pew-2023-2020-online-dating]. Não achamos dado brasileiro sobre quantos usuários chegam a namorar.

## O que o app dá

Se ninguém mediu a chance de cada caminho, a pergunta prática fica outra: quem tenta o app sai com alguma coisa? Nos EUA, 77% de quem já usou site ou app de namoro saiu com alguém que conheceu ali, e 39% namoraram sério ou casaram com alguém de lá [@pew-2023-2020-online-dating]. Os 39% contam a vida toda e incluem namoros que já acabaram. A experiência divide as pessoas quase ao meio: 53% a descrevem como positiva e 46%, como negativa [@pew-2023-2020-online-dating].

O app rende mais para quem tem poucos parceiros possíveis por perto. Antes dos apps de celular, gays, lésbicas e héteros de meia-idade eram os que mais dependiam da internet para achar alguém, e os héteros jovens estavam entre os que menos conheciam o parceiro online [@rosenfeld-2012-searching-for-a-mate]. A diferença continua: nos EUA de 2022, 24% dos adultos lésbicas, gays e bissexuais com parceiro o conheceram em site ou app, contra 9% dos héteros [@pew-2023-2020-online-dating].

{{visual:quem-conheceu-online}}

Dentro do app, em média, as pessoas miram um pouco acima de si. Num site de namoro dos EUA, homens e mulheres escreveram, em média, para pessoas cerca de 25% mais "desejáveis" que eles, e quanto maior a distância, menor a chance de resposta [@bruch-2018-aspirational-pursuit].

## O que o app custa

O custo mais comum é o assédio. Entre os americanos que já usaram, 38% receberam mensagem ou imagem sexual sem pedir, 30% continuaram sendo procurados depois de dizer não, 24% foram xingados e 6% foram ameaçados de agressão [@pew-2023-2020-online-dating]. Pelo menos uma das quatro coisas aconteceu com 48% dos usuários, e com perto de dois em cada três entre os usuários lésbicas, gays e bissexuais (64%) e entre as usuárias com menos de 50 anos (66%) [@pew-2023-2020-online-dating].

{{visual:assedio-no-app}}

O golpe é o segundo custo. Entre os usuários, 52% acham que já cruzaram com um golpista [@pew-2023-2020-online-dating]. Nas queixas de golpe romântico à FTC em 2022, quem perdeu dinheiro tinha sido abordado mais em rede social (40%) do que em site ou app (19%) [@ftc-2023-golpe-romantico].

{{visual:onde-comecou-o-golpe}}

O custo psicológico médio é pequeno. Numa meta-análise de 27 estudos, quem usa app estava um pouco pior de saúde mental do que quem não usa, com a diferença maior no uso compulsivo e na preocupação com o corpo [@cela-2026-meta-analise-apps]. Quase todos os estudos olharam um momento só, então ninguém sabe se o app piora a pessoa ou se quem já está pior usa mais o app. Em laboratório, a vontade de aceitar alguém caiu 27% em média do primeiro ao último perfil de uma sequência [@pronk-2020-mentalidade-rejeicao]. A Pergunta [Usar apps de namoro faz mal à saúde mental?](/apps-e-saude-mental#apps-fazem-mal) trata disso com mais estudos.

## Então, vale a pena?

Sim, para a maioria das pessoas que querem conhecer alguém, desde que o app seja um dos caminhos e não o único. A recomendação é nossa, tirada dos estudos acima: nenhum estudo testou se quem usa app acaba mais acompanhado do que quem não usa.

Use com um objetivo que você saiba dizer. Entre os americanos que usaram app no último ano, 44% dizem que um motivo principal é achar alguém para uma relação longa, 40% querem encontros casuais, 24%, sexo casual e 22%, fazer amigos [@pew-2023-2020-online-dating]. Nenhum estudo comparou a chance de dar certo conforme o objetivo de quem usa.

A resposta muda com o Perfil:

- **Lésbicas, gays, bissexuais e quem tem poucas opções por perto.** Vale mais. É o grupo que mais conheceu o parceiro online, antes e depois dos apps [@rosenfeld-2012-searching-for-a-mate] [@pew-2023-2020-online-dating].
- **Homens héteros.** Vale como complemento. Contando só com o app, o mais provável é muita mensagem sem resposta [@bruch-2018-aspirational-pursuit].
- **Mulheres.** Vale, sabendo que o assédio é comum [@pew-2023-2020-online-dating]. A Dica sobre golpe e assédio, junto do achado da FTC, diz o que observar.
- **Quem nota que usa sem conseguir parar, ou que sai pior de cada sessão.** Vale dar uma pausa. É o grupo em que a diferença de saúde mental aparece mais [@cela-2026-meta-analise-apps].

## E no Brasil?

Não achamos dado brasileiro sobre quantos usuários de app chegam a namorar, nem sobre assédio ou golpe em app. O mais perto é um painel online de 2017: 37% dos internautas já tinham se relacionado com alguém que conheceram na internet, e 27% já tinham marcado encontro com alguém de app de paquera [@opinionbox-2017-relacionamentos-brasil]. Painel online tende a inflar esses números.

O que deve se transferir é o padrão de quem ganha mais com o app. Os autores americanos ligam esse padrão a ter poucas opções por perto [@rosenfeld-2012-searching-for-a-mate], o que não depende do país. Nenhum estudo brasileiro testou isso.

## Varia conforme o Perfil?

Varia bastante com o gênero, com quem você procura e com a idade.

- **Homens e mulheres.** Num site de namoro, os homens mandaram mais de 80% das primeiras mensagens e tiveram resposta a menos de 20% delas [@bruch-2018-aspirational-pursuit]. Mesmo assim, mais homens que mulheres contam uma experiência boa, 57% contra 48% [@pew-2023-2020-online-dating]. Para as mulheres, o problema é o excesso: 66% das usuárias com menos de 50 anos passaram por assédio [@pew-2023-2020-online-dating].
- **Lésbicas, gays e bissexuais.** O app pesa mais e a experiência é melhor: 61% contam uma experiência positiva, contra 53% dos héteros [@pew-2023-2020-online-dating]. O assédio também é maior, 64% contra 48% dos usuários em geral [@pew-2023-2020-online-dating].
- **Idade.** Abaixo dos 30 anos, 20% dos adultos com parceiro o conheceram em site ou app, o dobro da média [@pew-2023-2020-online-dating]. Golpe também muda com a idade e o gênero: 63% dos homens com menos de 50 anos acham que cruzaram com um golpista no app, contra 44% das mulheres [@pew-2023-2020-online-dating].
