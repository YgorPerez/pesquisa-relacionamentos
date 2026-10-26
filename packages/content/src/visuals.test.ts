// The Visuals (#182): the format in a Question's frontmatter, its place in
// the body and the build's checks against the Fact sheets. Each failing case
// starts from the valid fixture with one Visual that passes and changes one
// thing.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import { readFactSheet } from './fact-sheet.ts'
import {
  buildLibrary,
  formatProblems,
  guideBySlug,
  readFiles,
  type LoadResult,
} from './index.ts'
import { compute, factSheetText, numbersInText } from './visuals.ts'

const VALID = fileURLToPath(new URL('../fixtures/valid', import.meta.url))
const GUIDE = 'guides/onde-conhecer/onde-os-casais-se-conhecem.md'
const OTHER_GUIDE = 'guides/onde-conhecer/app-ou-presencial.md'

/** The valid Question with a `visuals:` block (YAML, indented under the
 * key) and the body lines after "Varia conforme o Perfil?". */
function withVisuals(yaml: string, body: string, path = GUIDE): LoadResult {
  const files = [...readFiles(VALID)].map((file) =>
    file.path === path
      ? {
          ...file,
          text: file.text
            .replace(/\n---\n/, `\nvisuals:\n${yaml}\n---\n`)
            .replace(
              /(## Varia conforme o Perfil\?\n\n[^\n]+\n)/,
              `$1\n${body}\n`,
            ),
        }
      : file,
  )
  return buildLibrary(files)
}

function errorsOf(result: LoadResult): string[] {
  if (result.ok) throw new Error('the library should have failed')
  return result.errors.map((e) => e.message)
}

const BARS = `  - id: app-por-idade
    kind: bars
    title: Quem conheceu o parceiro por app
    unit: '%'
    bars:
      - label: 18 a 35 anos
        value: 18
        fact_sheet: silva-2020-apps-brasil
      - label: 18 a 24 anos
        value: 24
        fact_sheet: silva-2020-apps-brasil
      - label: Por outro caminho
        value: 82
        calculation:
          operation: complement
          inputs: [{ value: 18, fact_sheet: silva-2020-apps-brasil }]`

const PLACED = '{{visual:app-por-idade}}'

describe('a Visual that passes', () => {
  it('comes into the Question with its data, the own calculation included', () => {
    const result = withVisuals(BARS, PLACED)
    if (!result.ok) throw new Error(formatProblems(result.errors))
    const guide = guideBySlug(result.library, 'onde-os-casais-se-conhecem')
    expect(guide?.visuals?.[0]).toMatchObject({
      id: 'app-por-idade',
      kind: 'bars',
      bars: [{ value: 18 }, { value: 24 }, { value: 82 }],
    })
  })

  it('takes each of the four kinds', () => {
    const yaml = `${BARS}
  - id: dois-retratos
    kind: timeline
    title: Dois retratos
    events:
      - { year: 2017, label: EUA, value: 0.1, unit: ponto, fact_sheet: costa-2018-satisfacao }
      - { year: 2019, label: Brasil, value: 18, unit: '%', fact_sheet: silva-2020-apps-brasil }
  - id: lado-a-lado
    kind: study-table
    title: Lado a lado
    rows:
      - { fact_sheet: silva-2020-apps-brasil, measure: Por app, value: 18, unit: '%' }
      - { fact_sheet: costa-2018-satisfacao, measure: Satisfação, value: 0.1, unit: ponto }
  - id: relacoes
    kind: diagram
    title: Relações
    nodes: [{ id: app, label: App }, { id: casal, label: Casal }]
    arrows:
      - { from: app, to: casal, evidence: association, text: Um em cinco., fact_sheets: [silva-2020-apps-brasil] }`
    const body = [
      PLACED,
      '{{visual:dois-retratos}}',
      '{{visual:lado-a-lado}}',
      '{{visual:relacoes}}',
    ].join('\n\n')
    const result = withVisuals(yaml, body)
    expect(result.ok ? [] : result.errors.map((e) => e.message)).toEqual([])
  })
})

describe('the build rejects', () => {
  it('a number that is not in the cited Fact sheet', () => {
    const result = withVisuals(BARS.replace('value: 24', 'value: 25'), PLACED)
    expect(errorsOf(result)).toEqual([
      `${GUIDE}: visuals.0.bars.1.fact_sheet: the number 25 is not in the fact sheet "silva-2020-apps-brasil"; write it in the Visual as the fact sheet has it`,
    ])
  })

  it('a number from a Fact sheet that is not ✅ or 🟡', () => {
    const result = withVisuals(
      BARS.replace(
        'value: 24\n        fact_sheet: silva-2020-apps-brasil',
        'value: 2.1\n        fact_sheet: lima-2015-encontros',
      ),
      PLACED,
    )
    expect(errorsOf(result)).toContainEqual(
      expect.stringContaining(
        'visuals.0.bars.1.fact_sheet: the fact sheet "lima-2015-encontros" was not verified (⬜)',
      ),
    )
  })

  it('a Fact sheet the Question does not cite', () => {
    // `app-ou-presencial` cites only Costa (2018).
    const result = withVisuals(BARS, PLACED, OTHER_GUIDE)
    expect(errorsOf(result)).toContainEqual(
      `${OTHER_GUIDE}: visuals.0.bars.0.fact_sheet: the Question does not cite the fact sheet "silva-2020-apps-brasil"; the text the Visual illustrates cites it with [@silva-2020-apps-brasil], so it has a number in the page's list`,
    )
  })

  it('an own calculation that does not recompute', () => {
    const result = withVisuals(BARS.replace('value: 82', 'value: 80'), PLACED)
    expect(errorsOf(result)).toEqual([
      `${GUIDE}: visuals.0.bars.2.value: the own calculation gives 82, not 80 (complement of 18, rounded to 0 decimal(s))`,
    ])
  })

  it('an own calculation over a number the Fact sheet does not have', () => {
    const result = withVisuals(
      BARS.replace('value: 82', 'value: 81').replace(
        'inputs: [{ value: 18,',
        'inputs: [{ value: 19,',
      ),
      PLACED,
    )
    expect(errorsOf(result)).toEqual([
      `${GUIDE}: visuals.0.bars.2.calculation.inputs.0: the number 19 is not in the fact sheet "silva-2020-apps-brasil"; write it in the Visual as the fact sheet has it`,
    ])
  })

  it('a number with no source, or with two', () => {
    const none = withVisuals(
      BARS.replace(
        '        value: 24\n        fact_sheet: silva-2020-apps-brasil',
        '        value: 24',
      ),
      PLACED,
    )
    expect(errorsOf(none)).toEqual([
      `${GUIDE}: visuals.0.bars.1: missing where the number comes from: \`fact_sheet\`, or \`calculation\` for an own calculation`,
    ])
  })

  it('a diagram arrow with no Fact sheet', () => {
    const yaml = `  - id: relacoes
    kind: diagram
    title: Relações
    nodes: [{ id: app, label: App }, { id: casal, label: Casal }]
    arrows:
      - { from: app, to: casal, evidence: inference, text: Nossa ideia., fact_sheets: [] }`
    expect(errorsOf(withVisuals(yaml, '{{visual:relacoes}}'))).toEqual([
      `${GUIDE}: visuals.0.arrows.0.fact_sheets: an arrow is a finding and cites at least one fact sheet, our inference too`,
    ])
  })

  it('a solid arrow backed by no experiment', () => {
    const yaml = `  - id: relacoes
    kind: diagram
    title: Relações
    nodes: [{ id: app, label: App }, { id: casal, label: Casal }]
    arrows:
      - { from: app, to: casal, evidence: cause, text: Causa., fact_sheets: [silva-2020-apps-brasil] }`
    expect(errorsOf(withVisuals(yaml, '{{visual:relacoes}}'))).toEqual([
      `${GUIDE}: visuals.0.arrows.0.evidence: a solid arrow (a study tested the cause) cites an experiment or a meta-analysis; otherwise it is an association`,
    ])
  })

  it('a Visual declared and not placed, or placed and not declared', () => {
    expect(errorsOf(withVisuals(BARS, '{{visual:outro}}'))).toEqual([
      `${GUIDE}: the body places the Visual "outro", which \`visuals\` does not declare`,
      `${GUIDE}: visuals.0: the Visual "app-por-idade" is declared and not placed; put {{visual:app-por-idade}} on a line of its own in the body`,
    ])
  })

  it('a placeholder in the middle of a sentence', () => {
    expect(errorsOf(withVisuals(BARS, `Veja ${PLACED} aqui.`))).toContainEqual(
      `${GUIDE}: "Veja {{visual:app-por-idade}} aqui.": a Visual goes alone on its line, written {{visual:<id>}}`,
    )
  })

  it('an unknown kind', () => {
    const result = withVisuals(BARS.replace('kind: bars', 'kind: pie'), PLACED)
    expect(errorsOf(result)).toEqual([
      expect.stringContaining(
        `${GUIDE}: visuals.0: \`kind\` is one of bars | timeline | study-table | diagram`,
      ),
    ])
  })
})

describe('the numbers in a Fact sheet', () => {
  it('read Portuguese and English separators, the percent sign and trailing zeros', () => {
    const found = numbersInText(
      '39% e 39,0; 2.400 pessoas, "2,400 people", 0.1 points',
    )
    expect([...found].sort((a, b) => a - b)).toEqual([0.1, 2.4, 39, 2400])
  })

  it('keep a minus sign, but not the dash of a range', () => {
    const found = numbersInText('caiu −0,3; de 18-24 anos; -5 pontos')
    expect([...found].sort((a, b) => a - b)).toEqual([-5, -0.3, 18, 24])
  })

  it("come from the Fact sheet's sections and sample, not from the locator", () => {
    const path = 'studies/costa-2018-satisfacao.md'
    const original = readFileSync(`${VALID}/${path}`, 'utf8')
    const parsed = readFactSheet(
      path,
      original.replace(
        '## Limitações',
        '## Outra seção\n\nForam 37 casais.\n\n## Limitações',
      ),
    )
    if (!parsed.ok) throw new Error(formatProblems(parsed.errors))
    const found = numbersInText(factSheetText(parsed.factSheet))
    expect(found.has(37)).toBe(true)
    expect(found.has(0.1)).toBe(true)
    expect(found.has(2017)).toBe(true)
  })
})

describe('the build also rejects', () => {
  const arrow = (fields: string) =>
    `  - id: relacoes
    kind: diagram
    title: Relações
    nodes: [{ id: app, label: App }, { id: casal, label: Casal }]
    arrows:
      - { ${fields}, text: Achado., fact_sheets: [silva-2020-apps-brasil] }`
  const bars = (list: string, extra = '') =>
    `  - id: barras
    kind: bars
    title: Barras
    unit: '%'
    bars:
${list}${extra}`
  const bar18 = `      - { label: A, value: 18, fact_sheet: silva-2020-apps-brasil }\n`
  const bar24 = `      - { label: B, value: 24, fact_sheet: silva-2020-apps-brasil }\n`
  const timeline = (events: string, extra = '') =>
    `  - id: tempo
    kind: timeline
    title: Tempo
    events:
${events}${extra}`
  const in2019 = `      - { year: 2019, label: A, value: 18, unit: '%', fact_sheet: silva-2020-apps-brasil }\n`
  const in2017 = `      - { year: 2017, label: B, value: 0.1, unit: ponto, fact_sheet: costa-2018-satisfacao }\n`

  it.each([
    [
      'one bar alone',
      bars(bar18),
      '{{visual:barras}}',
      'visuals.0.bars: a bar comparison has two or more bars',
    ],
    [
      'an axis top below the largest bar',
      bars(bar18 + bar24, '    max: 20'),
      '{{visual:barras}}',
      'visuals.0.max: the axis top (20) is below the largest bar (24)',
    ],
    [
      'a highlight no bar has',
      bars(bar18 + bar24, '    highlight: C'),
      '{{visual:barras}}',
      'visuals.0.highlight: no bar is labelled "C"',
    ],
    [
      'a bar below zero',
      bars(
        bar18 +
          `      - label: C\n        value: -6\n        calculation: { operation: difference, inputs: [{ value: 18, fact_sheet: silva-2020-apps-brasil }, { value: 24, fact_sheet: silva-2020-apps-brasil }] }\n`,
      ),
      '{{visual:barras}}',
      'visuals.0.bars: a bar starts at zero and does not go below it',
    ],
    [
      'an own calculation with the inputs the wrong way round',
      bars(
        bar18 +
          `      - label: C\n        value: 6\n        calculation: { operation: difference, inputs: [{ value: 18, fact_sheet: silva-2020-apps-brasil }, { value: 24, fact_sheet: silva-2020-apps-brasil }] }\n`,
      ),
      '{{visual:barras}}',
      'visuals.0.bars.1.value: the own calculation gives -6, not 6',
    ],
    [
      'a complement outside a percentage',
      bars(
        bar18 +
          `      - label: C\n        value: 82\n        calculation: { operation: complement, inputs: [{ value: 18, fact_sheet: silva-2020-apps-brasil }] }\n`,
      ).replace("unit: '%'", 'unit: pontos'),
      '{{visual:barras}}',
      'visuals.0.bars.1.calculation: "complement" is 100 minus a percentage, and the unit here is "pontos"',
    ],
    [
      'an operation with the wrong number of inputs',
      bars(
        bar18 +
          `      - label: C\n        value: 1\n        calculation: { operation: ratio, inputs: [{ value: 18, fact_sheet: silva-2020-apps-brasil }] }\n`,
      ),
      '{{visual:barras}}',
      'visuals.0.bars.1.calculation: "ratio" takes exactly two inputs',
    ],
    [
      'a number with two sources',
      bars(
        bar18 +
          `      - label: C\n        value: 82\n        fact_sheet: silva-2020-apps-brasil\n        calculation: { operation: complement, inputs: [{ value: 18, fact_sheet: silva-2020-apps-brasil }] }\n`,
      ),
      '{{visual:barras}}',
      'visuals.0.bars.1: a number comes from a fact sheet or from an own calculation, not both',
    ],
    [
      'a Fact sheet that does not exist',
      bars(bar18 + `      - { label: B, value: 24, fact_sheet: nao-existe }\n`),
      '{{visual:barras}}',
      'visuals.0.bars.1.fact_sheet: the fact sheet "nao-existe" does not exist in studies/',
    ],
    [
      'a time line with one point',
      timeline(in2019),
      '{{visual:tempo}}',
      'visuals.0.events: a time line has two or more points',
    ],
    [
      'a time line out of year order',
      timeline(in2019 + in2017),
      '{{visual:tempo}}',
      'visuals.0.events: the time line goes in year order',
    ],
    [
      'a year the Fact sheet does not have',
      timeline(in2017 + in2019.replace('2019', '2021')),
      '{{visual:tempo}}',
      'visuals.0.events.1.year: the number 2021 is not in the fact sheet "silva-2020-apps-brasil"',
    ],
    [
      'a time line highlight on no point',
      timeline(in2017 + in2019, '    highlight: 2018'),
      '{{visual:tempo}}',
      'visuals.0.highlight: no point is in 2018',
    ],
    [
      'a table of one Study',
      `  - id: tabela
    kind: study-table
    title: Tabela
    rows:
      - { fact_sheet: silva-2020-apps-brasil, measure: App, value: 18, unit: '%' }`,
      '{{visual:tabela}}',
      'visuals.0.rows: a table of Studies has two or more rows',
    ],
    [
      'an arrow to a node that does not exist',
      arrow('from: app, to: bar, evidence: association'),
      '{{visual:relacoes}}',
      'visuals.0.arrows.0: the node "bar" does not exist in `nodes`',
    ],
    [
      'an arrow from a node to itself',
      arrow('from: app, to: app, evidence: association'),
      '{{visual:relacoes}}',
      'visuals.0.arrows.0: an arrow links two different nodes',
    ],
    [
      'two nodes with one id and no arrow',
      `  - id: relacoes
    kind: diagram
    title: Relações
    nodes: [{ id: app, label: App }, { id: app, label: Outro }]
    arrows: []`,
      '{{visual:relacoes}}',
      'visuals.0.nodes: two nodes have the same id',
    ],
    [
      'a diagram with no arrow',
      `  - id: relacoes
    kind: diagram
    title: Relações
    nodes: [{ id: app, label: App }, { id: casal, label: Casal }]
    arrows: []`,
      '{{visual:relacoes}}',
      'visuals.0.arrows: a relation diagram has at least one arrow',
    ],
    [
      'an arrow citing an unverified Fact sheet',
      arrow('from: app, to: casal, evidence: cause').replace(
        'silva-2020-apps-brasil',
        'lima-2015-encontros',
      ),
      '{{visual:relacoes}}',
      'visuals.0.arrows.0.fact_sheets: the fact sheet "lima-2015-encontros" was not verified (⬜)',
    ],
    [
      'a Visual declared twice',
      `${BARS}\n${BARS}`,
      PLACED,
      'visuals.1.id: the Visual "app-por-idade" is declared twice',
    ],
    [
      'a Visual placed twice',
      BARS,
      `${PLACED}\n\n${PLACED}`,
      'the body places the Visual "app-por-idade" 2 times',
    ],
  ])('%s', (_, yaml, body, message) => {
    expect(errorsOf(withVisuals(yaml, body))).toContainEqual(
      expect.stringContaining(message),
    )
  })

  it('a Visual in the short answer', () => {
    const files = [...readFiles(VALID)].map((file) =>
      file.path === GUIDE
        ? {
            ...file,
            text: file.text
              .replace(/\n---\n/, `\nvisuals:\n${BARS}\n---\n`)
              .replace('\nNo Brasil,', `\n${PLACED}\n\nNo Brasil,`),
          }
        : file,
    )
    expect(errorsOf(buildLibrary(files))).toContainEqual(
      `${GUIDE}: a Visual does not go in the short answer, which the search and the Topic page also show as text`,
    )
  })
})

describe('an own calculation', () => {
  it('redoes each operation', () => {
    const input = (value: number) => ({ value, fact_sheet: 'x' })
    expect(
      compute({ operation: 'difference', inputs: [input(24), input(18)] }),
    ).toBe(6)
    expect(
      compute({ operation: 'ratio', inputs: [input(24), input(12)] }),
    ).toBe(2)
    expect(
      compute({ operation: 'mean', inputs: [input(1), input(2), input(3)] }),
    ).toBe(2)
    expect(compute({ operation: 'sum', inputs: [input(1), input(2)] })).toBe(3)
    expect(compute({ operation: 'complement', inputs: [input(18)] })).toBe(82)
    expect(compute({ operation: 'ratio', inputs: [input(1), input(0)] })).toBe(
      null,
    )
  })
})
