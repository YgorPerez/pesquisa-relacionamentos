---
question: Com que ==idade== se casa no Brasil?
confidence: strong
findings:
  - text: Em 2024, os homens solteiros que se casaram no civil com uma mulher tinham em média 31,5 anos.
    fact_sheets: [ibge-2024-registro-civil]
    applies_to: { genders: [man], couple: different-sex }
    tips: [sem-pressa-para-casar]
  - text: Em 2024, as mulheres solteiras que se casaram no civil com um homem tinham em média 29,3 anos.
    fact_sheets: [ibge-2024-registro-civil]
    applies_to: { genders: [woman], couple: different-sex }
  - text: Nos casamentos entre pessoas do mesmo sexo, a idade média dos solteiros foi de 34,7 anos entre os homens e de 32,5 entre as mulheres.
    fact_sheets: [ibge-2024-registro-civil]
    applies_to: { couple: same-sex }
  - text: A idade ao casar subiu de 2004 para cá. Em 2004, homens e mulheres solteiros se casavam em média aos 27,8 e aos 24,9 anos; em 2014, aos 29,8 e aos 27,1.
    fact_sheets: [ibge-2024-registro-civil]
  - text: A primeira união, com ou sem casamento, sai mais cedo. A idade média a ela foi de 26,3 anos para os homens e de 23,6 para as mulheres em 2022.
    fact_sheets: [ibge-2022-censo-unioes]
  - text: Entre as pessoas de 20 a 24 anos que viviam com alguém, 75,6% estavam em união sem casamento. De 25 a 29 anos, 62,2%.
    fact_sheets: [ibge-2022-censo-unioes]
  - text: Casar com 40 anos ou mais ficou bem mais comum. Das mulheres que se casaram com homens em 2024, contando quem casava de novo, 25,3% tinham 40 anos ou mais; em 2004 eram 8,5%. Entre os homens, a fatia foi de 13,2% para 31,3%.
    fact_sheets: [ibge-2024-registro-civil]
  - text: Em 31,1% dos casamentos de 2024, pelo menos um dos dois já tinha sido casado antes e estava divorciado ou viúvo. Em 2004 eram 13,5%.
    fact_sheets: [ibge-2024-registro-civil]
  - text: Casa-se menos que antes da pandemia. Foram 948.925 casamentos civis em 2024, contra uma média de 1.076.280 por ano de 2015 a 2019.
    fact_sheets: [ibge-2024-registro-civil]
  - text: Entre mulheres brancas americanas, a chance de a separação vir até o quinto ano de casamento caiu de 31% para quem casou antes dos 20 anos a 9% para quem casou aos 30 a 32, e ficou em 11% depois dos 33.
    fact_sheets: [lehrer-2013-idade-casamento]
    applies_to: { genders: [woman], couple: different-sex }
related:
  [onde-os-casais-se-conhecem, casar-cedo-e-divorcio, mais-parceiros-faz-mal]
visuals:
  - id: idade-media-ao-casar
    kind: bars
    title: Idade média ao casar no civil, solteiros de casais homem-mulher
    unit: anos
    max: 40
    bars:
      - label: Homens, 2004
        value: 27.8
        fact_sheet: ibge-2024-registro-civil
      - label: Homens, 2014
        value: 29.8
        fact_sheet: ibge-2024-registro-civil
      - label: Homens, 2024
        value: 31.5
        fact_sheet: ibge-2024-registro-civil
      - label: Mulheres, 2004
        value: 24.9
        fact_sheet: ibge-2024-registro-civil
      - label: Mulheres, 2014
        value: 27.1
        fact_sheet: ibge-2024-registro-civil
      - label: Mulheres, 2024
        value: 29.3
        fact_sheet: ibge-2024-registro-civil
    highlight: Homens, 2024
    note: a idade subiu a cada década, para homens e para mulheres
  - id: uniao-e-casamento
    kind: bars
    title: Idade média à primeira união e ao casamento civil
    unit: anos
    max: 40
    bars:
      - label: Primeira união, homens (2022)
        value: 26.3
        fact_sheet: ibge-2022-censo-unioes
      - label: Primeira união, mulheres (2022)
        value: 23.6
        fact_sheet: ibge-2022-censo-unioes
      - label: Casamento civil, homens com mulher (2024)
        value: 31.5
        fact_sheet: ibge-2024-registro-civil
      - label: Casamento civil, mulheres com homem (2024)
        value: 29.3
        fact_sheet: ibge-2024-registro-civil
      - label: Casamento civil, dois homens (2024)
        value: 34.7
        fact_sheet: ibge-2024-registro-civil
      - label: Casamento civil, duas mulheres (2024)
        value: 32.5
        fact_sheet: ibge-2024-registro-civil
    note: a primeira união vem do Censo de 2022, e o casamento, do registro civil de 2024
  - id: casar-depois-dos-40
    kind: bars
    title: Quem se casou com 40 anos ou mais, casais homem-mulher
    unit: '%'
    bars:
      - label: Mulheres, 2004
        value: 8.5
        fact_sheet: ibge-2024-registro-civil
      - label: Mulheres, 2024
        value: 25.3
        fact_sheet: ibge-2024-registro-civil
      - label: Homens, 2004
        value: 13.2
        fact_sheet: ibge-2024-registro-civil
      - label: Homens, 2024
        value: 31.3
        fact_sheet: ibge-2024-registro-civil
    highlight: Mulheres, 2024
    note: conta também quem casava de novo
  - id: segundo-casamento
    kind: timeline
    title: Casamentos em que um dos dois já tinha sido casado
    events:
      - year: 2004
        label: Pelo menos um divorciado ou viúvo
        value: 13.5
        unit: '%'
        fact_sheet: ibge-2024-registro-civil
      - year: 2014
        label: Pelo menos um divorciado ou viúvo
        value: 23.4
        unit: '%'
        fact_sheet: ibge-2024-registro-civil
      - year: 2024
        label: Pelo menos um divorciado ou viúvo
        value: 31.1
        unit: '%'
        fact_sheet: ibge-2024-registro-civil
    highlight: 2024
  - id: separacao-por-idade-ao-casar
    kind: bars
    title: Separação até o quinto ano, por idade da mulher ao casar, nos EUA
    unit: '%'
    max: 40
    bars:
      - label: Casou antes dos 20 anos
        value: 31
        fact_sheet: lehrer-2013-idade-casamento
      - label: Casou aos 30 a 32 anos
        value: 9
        fact_sheet: lehrer-2013-idade-casamento
      - label: Casou aos 33 anos ou mais
        value: 11
        fact_sheet: lehrer-2013-idade-casamento
    note: mulheres brancas, casamentos até 2010; associação, não causa
---

No Brasil, quem se casa no civil pela primeira vez tem em média ==31,5 anos, se for homem, e 29,3, se for mulher== [@ibge-2024-registro-civil]. A primeira união, com ou sem papel, sai mais cedo: em média aos 26,3 anos para eles e aos 23,6 para elas [@ibge-2022-censo-unioes]. A idade ao casar subiu de 2004 para cá, e um quarto das mulheres que se casaram com homens em 2024, contando quem casava de novo, tinha 40 anos ou mais [@ibge-2024-registro-civil].

## Mais tarde, e muitas vezes sem papel

Para quem o namoro anda, a pergunta seguinte é quando se casa. No Brasil, a resposta vem de dados bons, que contam todo mundo. Em 2024, os homens solteiros que se casaram no civil tinham em média 31,5 anos, e as mulheres, 29,3 [@ibge-2024-registro-civil]. Em 2004, eram 27,8 e 24,9 anos [@ibge-2024-registro-civil].

{{visual:idade-media-ao-casar}}

O casamento civil chega bem depois de morar junto. A primeira união, com ou sem papel, sai em média aos 26,3 anos para os homens e aos 23,6 para as mulheres [@ibge-2022-censo-unioes]. Entre os jovens, morar junto sem casar é a regra: 75,6% das pessoas de 20 a 24 anos que viviam com alguém estavam em união sem casamento, e 62,2% das de 25 a 29 [@ibge-2022-censo-unioes]. Por isso a idade ao casar não é a idade em que o casal começa a vida junto. Quem morou junto antes entra como solteiro no registro civil [@ibge-2024-registro-civil].

{{visual:uniao-e-casamento}}

Casar mais velho também ficou comum. Das mulheres que se casaram com homens em 2024, contando quem casava de novo, 25,3% tinham 40 anos ou mais; em 2004 eram 8,5% [@ibge-2024-registro-civil]. Parte disso é segundo casamento: em 31,1% dos casamentos de 2024, pelo menos um dos dois já tinha sido casado, contra 13,5% em 2004 [@ibge-2024-registro-civil].

{{visual:segundo-casamento}}

E casa-se menos: foram 948.925 casamentos civis em 2024, contra uma média de 1.076.280 por ano de 2015 a 2019 [@ibge-2024-registro-civil].

{{visual:casar-depois-dos-40}}

## Casar mais tarde é um problema?

Pelo que se mediu, não. Nos EUA, entre mulheres brancas, a chance de a separação vir até o quinto ano caiu de 31% para quem casou antes dos 20 anos a 9% para quem casou aos 30 a 32, e mal subiu depois, 11% aos 33 ou mais [@lehrer-2013-idade-casamento]. É associação, não causa, e o estudo não ouviu homens.

{{visual:separacao-por-idade-ao-casar}}

A Pergunta [Casar cedo aumenta a chance de divórcio?](/manter-a-relacao#casar-cedo-e-divorcio) trata disso com mais estudos.

## E no Brasil?

Esta Pergunta já é sobre o Brasil, e os dados são dos melhores do Guia: o registro civil conta todos os casamentos [@ibge-2024-registro-civil], e o Censo conta todo mundo que mora junto [@ibge-2022-censo-unioes]. O que falta é o que nenhum dos dois vê. O registro não conta as uniões estáveis, e o Censo não vê namoro nem casal que mora em casas separadas.

Sobre idade e separação, o único dado brasileiro que achamos é dos anos 1990. Entre mulheres de 15 a 49 anos, o risco de uma união terminar era maior entre as muito jovens e as mais velhas, e menor por volta dos 25 anos [@leone-2007-dissolucao-brasil]. A união incluía morar junto sem casar. Não achamos estudo brasileiro recente sobre idade ao casar e divórcio.

## Varia conforme o Perfil?

Varia com o gênero e com o tipo de casal.

- **Homens e mulheres.** Os homens se casam dois a três anos mais velhos que as mulheres, no casamento civil e na primeira união [@ibge-2024-registro-civil] [@ibge-2022-censo-unioes].
- **Casais do mesmo sexo.** Casam mais tarde: 34,7 anos entre os homens e 32,5 entre as mulheres [@ibge-2024-registro-civil]. Quase oito em cada dez pessoas que viviam com alguém do mesmo sexo estavam em união sem casamento, 77,6% em 2022 [@ibge-2022-censo-unioes].
- **Idade.** Entre os jovens que vivem com alguém, a regra é morar junto sem casar. Dos homens de 20 a 24 anos que viviam com alguém, 79,1% estavam em união sem casamento; das mulheres, 73,3% [@ibge-2022-censo-unioes].
