---
question: App ou presencial, onde tenho mais ==chance==?
confidence: moderate
findings:
  - text: A satisfação quase não muda entre quem se conheceu online e pessoalmente.
    fact_sheets: [costa-2018-satisfacao]
tips: [apps-como-complemento]
related: [onde-os-casais-se-conhecem]
calculator: possible-group
previous: [app-ou-bar, escolher-parceiro/onde-procurar]
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
---

Depende de quem você procura. A diferença de satisfação entre os dois caminhos é pequena [@costa-2018-satisfacao].

## Então, vale a pena?

Vale como um caminho entre outros, porque a satisfação quase não muda [@costa-2018-satisfacao].

## Varia conforme o Perfil?

Nenhum estudo separou por idade.

{{visual:app-por-idade}}

{{visual:dois-retratos}}

{{visual:estudos-lado-a-lado}}

{{visual:app-e-satisfacao}}

## Limitações

- Uma amostra só, dos EUA.
