---
question: 'App ou presencial: onde tenho mais ==chance==?'
confidence: moderate
findings:
  - text: Em 2022, 20% dos adultos com parceiro com menos de 30 anos o conheceram em site ou app de namoro. Em todas as idades, a fatia foi de 10%.
    fact_sheets: [pew-2023-2020-online-dating]
    tips: [convivencia-repetida]
    myths:
      - claim: Quem é jovem hoje só conhece alguém por app.
        why_not: Nos EUA, só 20% dos adultos com parceiro com menos de 30 anos o conheceram em site ou app de namoro.
        fact_sheets: [pew-2023-2020-online-dating]
  - text: Entre quem usou site ou app no último ano, 64% dos homens se sentiram inseguros por receber poucas mensagens, contra 40% das mulheres. Já 54% das mulheres se sentiram sobrecarregadas por receber mensagens demais, contra 25% dos homens.
    fact_sheets: [pew-2023-2020-online-dating]
    tips: [apps-como-complemento]
  - text: Num site de namoro em quatro cidades, os homens mandaram mais de 80% das primeiras mensagens, e a taxa média de resposta das mulheres a elas ficou abaixo de 20%.
    fact_sheets: [bruch-2018-aspirational-pursuit]
    period: '2014'
  - text: Num teste com 14 perfis criados pelos autores no Tinder, os perfis de homem deram match com 0,6% de quem curtiram, e os de mulher, com 10,5%. São poucos perfis, então o número ilustra a diferença, mas não é a taxa de um usuário real.
    fact_sheets: [tyson-2016-tinder]
  - text: Entre as usuárias com menos de 50 anos, 56% já receberam mensagem ou imagem sexual que não pediram.
    fact_sheets: [pew-2023-2020-online-dating]
    applies_to: { genders: [woman], ages: { min: 18, max: 49 } }
  - text: Entre os casais que passaram a morar juntos de 2008 a 2012, amigos e família continuavam sendo o lugar onde mais casais se conheceram (25,8%).
    fact_sheets: [lampard-2020-natsal-reino-unido]
  - text: Entre casais que passaram a morar juntos, quem ainda estudava em tempo integral tinha bem menos chance de ter conhecido o parceiro online, e a chance subia com a idade.
    fact_sheets: [lampard-2020-natsal-reino-unido]
  - text: Entre jovens de 18 a 29 anos, quem conheceu o parceiro por app tinha menos parceiros da mesma idade e mais pares em que o homem é mais velho do que quem o conheceu fora da internet.
    fact_sheets: [potarca-2020-suica-apps]
    applies_to: { ages: { min: 18, max: 29 }, couple: different-sex }
  - text: Entre brasileiros com smartphone, 29% dos que têm de 16 a 29 anos já saíram com alguém que conheceram em app de relacionamento. Na média de todas as idades, 23%. A pesquisa mede ter saído com alguém, não namoro.
    fact_sheets: [mobiletime-2025-apps-relacionamento-brasil]
  - text: Uma rede de anúncios estima que 83,1% dos usuários do Tinder no Brasil sejam homens. Ela deduz o gênero pelo celular, sem perguntar a ninguém, e o número muda a cada atualização da página.
    fact_sheets: [startio-tinder-brasil-genero]
related: [onde-os-casais-se-conhecem, o-lugar-muda-a-relacao, silencio-do-app]
visuals:
  - id: mensagens-de-menos-e-de-mais
    kind: bars
    title: Como homens e mulheres vivem as mensagens no app, nos EUA
    unit: '%'
    bars:
      - label: Homens que se sentiram inseguros por receber poucas mensagens
        value: 64
        fact_sheet: pew-2023-2020-online-dating
      - label: Mulheres que se sentiram inseguras por receber poucas mensagens
        value: 40
        fact_sheet: pew-2023-2020-online-dating
      - label: Mulheres que se sentiram sobrecarregadas por mensagens demais
        value: 54
        fact_sheet: pew-2023-2020-online-dating
      - label: Homens que se sentiram sobrecarregados por mensagens demais
        value: 25
        fact_sheet: pew-2023-2020-online-dating
    highlight: Homens que se sentiram inseguros por receber poucas mensagens
    note: usuários do último ano, em 2022
  - id: match-no-tinder
    kind: bars
    title: Matches sobre os likes dados, num teste com perfis criados no Tinder
    unit: '%'
    max: 20
    bars:
      - label: Perfis de homem
        value: 0.6
        fact_sheet: tyson-2016-tinder
      - label: Perfis de mulher
        value: 10.5
        fact_sheet: tyson-2016-tinder
    note: 14 perfis só; mostra a diferença, não a taxa de um usuário real
  - id: encontro-por-app-por-idade
    kind: bars
    title: Brasileiros com smartphone que já saíram com alguém de app, por idade
    unit: '%'
    bars:
      - label: 16 a 29 anos
        value: 29
        fact_sheet: mobiletime-2025-apps-relacionamento-brasil
      - label: 30 a 49 anos
        value: 25
        fact_sheet: mobiletime-2025-apps-relacionamento-brasil
      - label: 50 anos ou mais
        value: 14
        fact_sheet: mobiletime-2025-apps-relacionamento-brasil
      - label: Média de todas as idades
        value: 23
        fact_sheet: mobiletime-2025-apps-relacionamento-brasil
    highlight: 16 a 29 anos
    note: ter saído com alguém, não namoro; painel online de 2025
---

Nenhum estudo mediu a chance de cada caminho dar em namoro. Nos EUA, ==20% dos adultos com parceiro com menos de 30 anos== o conheceram em site ou app; a maioria se conheceu de outro jeito [@pew-2023-2020-online-dating]. Dentro do app, homens e mulheres vivem coisas opostas: os homens contam que recebem mensagens de menos, e as mulheres, de mais [@pew-2023-2020-online-dating]. No Brasil, não há pesquisa representativa sobre onde os casais se formam.

## O que dá para comparar

Saber onde os casais se conheceram não diz onde você tem mais chance. Para isso, seria preciso contar também quem tentou cada caminho e não achou ninguém, e nenhum estudo do acervo fez essa conta. Ninguém comparou, por exemplo, uma hora no app com uma hora numa aula de dança. O que existe dá duas pistas.

A primeira é que, mesmo entre os jovens, a maioria dos casais começa fora do app. Nos EUA, só 20% dos adultos com parceiro com menos de 30 anos o conheceram em site ou app de namoro [@pew-2023-2020-online-dating]. No Reino Unido, amigos e família eram o lugar onde mais casais se conheciam, 25,8% dos que passaram a morar juntos de 2008 a 2012 [@lampard-2020-natsal-reino-unido]. Esses caminhos têm em comum reencontrar as mesmas pessoas várias vezes.

A segunda é que, dentro do app, a disputa é desigual. Num site de namoro em quatro cidades dos EUA, os homens mandaram mais de 80% das primeiras mensagens, e as mulheres responderam a menos de 20% delas [@bruch-2018-aspirational-pursuit]. Num teste no Tinder com 14 perfis criados pelos autores, os de homem deram match com 0,6% de quem curtiram, e os de mulher, com 10,5% [@tyson-2016-tinder]. Com tão poucos perfis, o número mostra o tamanho da diferença, não a taxa de um usuário real.

{{visual:match-no-tinder}}

Nos EUA, 64% dos homens que usaram app no último ano se sentiram inseguros por receber poucas mensagens, e 54% das mulheres se sentiram sobrecarregadas por receber demais [@pew-2023-2020-online-dating].

{{visual:mensagens-de-menos-e-de-mais}}

Na prática, um homem hétero que conta só com o app tende a mandar muita mensagem sem resposta, e para uma mulher o trabalho é filtrar o excesso e o assédio. Para os dois, faz sentido ter também um caminho fora do app.

## E no Brasil?

Não achamos estudo brasileiro sobre onde os casais se formam, nem sobre a chance em cada caminho. Há dois indícios sobre o app. Entre brasileiros com smartphone, 29% dos que têm de 16 a 29 anos já saíram com alguém que conheceram em app, contra 14% dos que têm 50 anos ou mais [@mobiletime-2025-apps-relacionamento-brasil]. É ter saído com alguém, não namorado, e a amostra é de um painel online.

{{visual:encontro-por-app-por-idade}}

O outro indício é fraco. Uma rede de anúncios estima que 83,1% dos usuários do Tinder no Brasil sejam homens, deduzindo o gênero pelo celular, sem perguntar a ninguém [@startio-tinder-brasil-genero]. Se a proporção estiver perto disso, o desequilíbrio de mensagens que os americanos contam deve valer aqui também. É inferência nossa; ninguém mediu as mensagens no Brasil.

## Varia conforme o Perfil?

Varia bastante com o gênero, com quem você procura e com a idade.

- **Homens e mulheres.** Nos EUA, os homens contam que recebem mensagens de menos, e as mulheres, de mais. Mesmo assim, mais homens que mulheres dizem ter tido uma experiência boa: 57% contra 48% [@pew-2023-2020-online-dating]. Para as mulheres, há também o assédio: 56% das usuárias com menos de 50 anos receberam conteúdo sexual que não pediram [@pew-2023-2020-online-dating].
- **Lésbicas, gays e bissexuais.** O app pesa mais. Nos EUA, 51% dos adultos LGB já usaram site ou app de namoro, contra 28% dos héteros, e 24% dos LGB com parceiro o conheceram assim, contra 9% dos héteros [@pew-2023-2020-online-dating].
- **Idade.** Nos EUA, quem tem menos de 30 anos conheceu o parceiro em site ou app duas vezes mais que a média [@pew-2023-2020-online-dating]. No Reino Unido, quem estudava em tempo integral tinha bem menos chance de ter conhecido o parceiro online [@lampard-2020-natsal-reino-unido]. Na Suíça, entre os jovens de 18 a 29 anos, quem conheceu o parceiro por app tinha mais pares em que o homem é mais velho [@potarca-2020-suica-apps].
