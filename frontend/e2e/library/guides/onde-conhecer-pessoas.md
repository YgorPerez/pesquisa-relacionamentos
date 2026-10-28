---
title: Onde conhecer pessoas
position: 10
questions:
  - slug: onde-os-casais-se-conhecem
    question: Onde os casais se ==conhecem== hoje?
    answer: No Brasil, ==18% dos adultos jovens== conheceram o parceiro por app [@silva-2020-apps-brasil]. Os estudos divergem sobre o lugar mudar a relação, e o de melhor desenho diz que o app junta muitos casais [@costa-2018-satisfacao].
    confidence: moderate
    findings: [app-no-brasil, satisfacao-online]
  - slug: app-ou-presencial
    question: App ou presencial, onde tenho mais ==chance==?
    answer: Depende de quem você procura. A diferença de [[satisfação]] entre os dois caminhos é pequena [@costa-2018-satisfacao].
    confidence: moderate
    findings: [satisfacao-online]
    calculator: possible-group
    previous: [app-ou-bar, escolher-parceiro/onde-procurar]
findings:
  - id: app-no-brasil
    text: Entre adultos jovens no Brasil, 18% conheceram o parceiro por app.
    fact_sheets: [silva-2020-apps-brasil]
  - id: app-entre-os-mais-novos
    text: Entre 18 e 24 anos, a fatia sobe para 24%.
    fact_sheets: [silva-2020-apps-brasil]
    applies_to: { ages: { min: 18, max: 24 } }
  - id: satisfacao-online
    text: Nos EUA, a satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica a 0,1 ponto de distância.
    fact_sheets: [costa-2018-satisfacao]
myths:
  - id: metade-por-app
    claim: Mais da metade dos casais se conhece por app.
    why_not: No Brasil, foi menos de um em cada cinco.
    fact_sheets: [silva-2020-apps-brasil]
visuals:
  - id: app-por-idade
    kind: bars
    title: Quem conheceu o parceiro por app, no Brasil
    unit: '%'
    bars:
      - label: 18 a 35 anos
        value: 18
        fact_sheet: silva-2020-apps-brasil
      - label: 18 a 24 anos
        value: 24
        fact_sheet: silva-2020-apps-brasil
      - label: Por outro caminho (18 a 35 anos)
        value: 82
        calculation:
          operation: complement
          inputs: [{ value: 18, fact_sheet: silva-2020-apps-brasil }]
    highlight: 18 a 24 anos
    note: entre os mais novos, a fatia sobe
  - id: dois-retratos
    kind: timeline
    title: Dois retratos, dois países
    events:
      - year: 2017
        label: Nos EUA, diferença de satisfação entre online e presencial
        value: 0.1
        unit: ponto
        fact_sheet: costa-2018-satisfacao
      - year: 2019
        label: No Brasil, conheceram o parceiro por app
        value: 18
        unit: '%'
        fact_sheet: silva-2020-apps-brasil
    highlight: 2019
  - id: estudos-lado-a-lado
    kind: study-table
    title: Os dois estudos lado a lado
    rows:
      - fact_sheet: silva-2020-apps-brasil
        measure: Conheceram o parceiro por app
        value: 18
        unit: '%'
      - fact_sheet: costa-2018-satisfacao
        measure: Diferença de satisfação, online vs. presencial
        value: 0.1
        unit: ponto
  - id: app-e-satisfacao
    kind: diagram
    title: O app, o encontro e a satisfação
    nodes:
      - id: app
        label: Usar app de namoro
      - id: casal
        label: Conhecer o parceiro
      - id: satisfacao
        label: Satisfação no casamento
    arrows:
      - from: app
        to: casal
        evidence: association
        text: Quase um em cada cinco adultos jovens conheceu o parceiro por app.
        fact_sheets: [silva-2020-apps-brasil]
      - from: casal
        to: satisfacao
        evidence: association
        text: O lugar onde o casal se conheceu quase não muda a satisfação.
        fact_sheets: [costa-2018-satisfacao]
      - from: app
        to: satisfacao
        evidence: inference
        text: Se o lugar quase não muda a satisfação, o app não deixa a relação pior.
        fact_sheets: [silva-2020-apps-brasil, costa-2018-satisfacao]
takeaways: [apps-como-complemento]
related: [que-caracteristicas-preveem]
---

Onde os casais se conhecem hoje e se o lugar muda a relação. Conteúdo de fixture para o teste de ponta a ponta.

## O app virou um caminho comum

{{brazil}} Entre adultos jovens, 18% conheceram o parceiro por app [@silva-2020-apps-brasil]. {{you:app-entre-os-mais-novos}} Entre 18 e 24 anos, a fatia sobe para 24% [@silva-2020-apps-brasil].

{{visual:app-por-idade}}

{{question:onde-os-casais-se-conhecem}}

{{myth:metade-por-app}}

{{visual:dois-retratos}}

## O lugar quase não muda a relação

A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto [@costa-2018-satisfacao].

{{visual:estudos-lado-a-lado}}

{{question:app-ou-presencial}}

{{tip:apps-como-complemento}}

{{visual:app-e-satisfacao}}

## O que não se sabe

Nenhum estudo separou app de rede social, e o estudo brasileiro só ouviu capitais.
