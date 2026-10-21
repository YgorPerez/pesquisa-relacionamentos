// The priorities file (story 99): per trait × outcome, the level, the
// measure, the plain text and the fact sheet, and the bias by gender.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  formatProblems,
  readFiles,
  buildLibrary,
  type ContentFile,
  type LoadResult,
} from './index.ts'

const fixture = (name: string) =>
  fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))
const factSheet = (slug: string): ContentFile => ({
  path: `studies/${slug}.md`,
  text: readFileSync(`${fixture('valid')}/studies/${slug}.md`, 'utf8'),
})
// silva-2020 is ✅, costa-2018 is 🟡, lima-2015 is ⬜.
const FACT_SHEETS = [
  factSheet('silva-2020-apps-brasil'),
  factSheet('costa-2018-satisfacao'),
  factSheet('lima-2015-encontros'),
]

const FILE = 'data/priorities/priorities.yaml'
const META: ContentFile = {
  path: 'data/priorities/priorities.meta.yaml',
  text: `fact_sheet: silva-2020-apps-brasil
variables: [level, measure, plain_text, fact_sheet, bias]
downloaded_on: 2026-10-19
script: compilado à mão a partir das Fichas de cada célula
version: "1"
`,
}

const PRIORITIES = `explained_satisfaction:
  fact_sheet: silva-2020-apps-brasil
  relationship: 45
  partner: 5
  unexplained: 50
traits:
  - id: aparencia
    name: Aparência
    attraction: { level: 3, measure: "r ≈ 0,40", plain_text: Quem é mais bonito atrai mais., fact_sheet: silva-2020-apps-brasil }
    satisfaction: { level: 2, plain_text: "Só um pouco, e só no começo.", fact_sheet: costa-2018-satisfacao }
    duration: { level: 0, plain_text: Nenhum estudo lido mede isso. }
    bias: { all: As pessoas dão menos peso à aparência quando dizem o que querem. }
  - id: renda
    name: Renda
    attraction: { level: 2, plain_text: Pesa pouco na atração., fact_sheet: silva-2020-apps-brasil }
    satisfaction: { level: 0, plain_text: Nenhum estudo lido mede isso. }
    duration: { level: 1, plain_text: Quase nada., fact_sheet: costa-2018-satisfacao }
    bias: { man: Homens dão menos peso., woman: Mulheres dão mais peso. }
`

const filesWith = (text: string, ...others: ContentFile[]): ContentFile[] => [
  ...FACT_SHEETS,
  META,
  { path: FILE, text },
  ...others,
]

function errors(result: LoadResult): string[] {
  if (result.ok) throw new Error('the library should have failed')
  return result.errors.map((e) => e.message)
}

function prioritiesOf(result: LoadResult) {
  if (!result.ok) throw new Error(formatProblems(result.errors))
  return result.library.priorities
}

describe('priorities file', () => {
  it("reads the traits with each outcome's level and the satisfaction bar", () => {
    const priorities = prioritiesOf(buildLibrary(filesWith(PRIORITIES)))
    expect(priorities?.file).toBe(FILE)
    expect(priorities?.explained_satisfaction).toEqual({
      fact_sheet: 'silva-2020-apps-brasil',
      relationship: 45,
      partner: 5,
      unexplained: 50,
    })
    expect(
      priorities?.traits.map((c) => [
        c.id,
        c.attraction.level,
        c.satisfaction.level,
        c.duration.level,
      ]),
    ).toEqual([
      ['aparencia', 3, 2, 0],
      ['renda', 2, 0, 1],
    ])
    expect(priorities?.traits[0]?.attraction).toEqual({
      level: 3,
      measure: 'r ≈ 0,40',
      plain_text: 'Quem é mais bonito atrai mais.',
      fact_sheet: 'silva-2020-apps-brasil',
    })
    expect(priorities?.traits[1]?.bias).toEqual({
      man: 'Homens dão menos peso.',
      woman: 'Mulheres dão mais peso.',
    })
  })

  it('its .meta.yaml goes into the data like the others', () => {
    const result = buildLibrary(filesWith(PRIORITIES))
    if (!result.ok) throw new Error(formatProblems(result.errors))
    expect(result.library.data.map((d) => d.file)).toEqual([
      'data/priorities/priorities.meta.yaml',
    ])
  })

  it('without the file, there are no priorities', () => {
    expect(prioritiesOf(buildLibrary(FACT_SHEETS))).toBeNull()
  })

  it('fails without the .meta.yaml next to it', () => {
    expect(
      errors(buildLibrary([...FACT_SHEETS, { path: FILE, text: PRIORITIES }])),
    ).toEqual([
      `${FILE}: missing the priorities.meta.yaml next to it, with the fact sheet, the variables, the date, the script and the version`,
    ])
  })

  it('fails when a cell cites a ⬜ or missing fact sheet', () => {
    const text = PRIORITIES.replace(
      'fact_sheet: costa-2018-satisfacao }\n    duration: { level: 0',
      'fact_sheet: lima-2015-encontros }\n    duration: { level: 0',
    ).replace(
      'Pesa pouco na atração., fact_sheet: silva-2020-apps-brasil',
      'Pesa pouco na atração., fact_sheet: sumida-2000',
    )
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: traits.0.satisfaction.fact_sheet: lima-2015-encontros is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets`,
      `${FILE}: traits.1.attraction.fact_sheet: the fact sheet studies/sumida-2000.md does not exist`,
    ])
  })

  it('fails when the satisfaction bar cites a ⬜ fact sheet', () => {
    const text = PRIORITIES.replace(
      '  fact_sheet: silva-2020-apps-brasil\n  relationship',
      '  fact_sheet: lima-2015-encontros\n  relationship',
    )
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: explained_satisfaction.fact_sheet: lima-2015-encontros is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets`,
    ])
  })

  it('fails when a level above "não sabemos" does not name the fact sheet', () => {
    const text = PRIORITIES.replace(
      'Pesa pouco na atração., fact_sheet: silva-2020-apps-brasil',
      'Pesa pouco na atração.',
    )
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: traits.1.attraction.fact_sheet: level 2 needs the fact sheet that backs it; without a fact sheet, only 0 ("não sabemos")`,
    ])
  })

  it('fails with a level outside 0 to 3, a repeated id and a bar that does not add up to 100', () => {
    const text = PRIORITIES.replace('level: 3, measure', 'level: 4, measure')
      .replace('id: renda', 'id: aparencia')
      .replace('partner: 5', 'partner: 6')
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: traits.0.attraction.level: value outside the closed list (0 | 1 | 2 | 3) (got 4)`,
    ])
    const validLevels = PRIORITIES.replace(
      'id: renda',
      'id: aparencia',
    ).replace('partner: 5', 'partner: 6')
    expect(errors(buildLibrary(filesWith(validLevels)))).toEqual([
      `${FILE}: explained_satisfaction: relationship, partner and unexplained add up to 101%, not 100%`,
      `${FILE}: traits.1.id: the trait "aparencia" appears more than once`,
    ])
  })

  it('fails with an unknown field and a bias with no gender at all', () => {
    const text = PRIORITIES.replace('bias: { all:', 'bias: { todas:')
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: traits.0.bias.todas: unknown field`,
    ])
  })
})

describe("the repository's priorities file", () => {
  const root = fileURLToPath(new URL('../../..', import.meta.url))

  it('is published with the real library, every cell citing a ✅ or 🟡 fact sheet (#129)', () => {
    const files = readFiles(root)
    expect(files.map((a) => a.path)).toContain(FILE)
    const result = buildLibrary(files)
    if (!result.ok) throw new Error(formatProblems(result.errors))
    expect(result.library.priorities?.file).toBe(FILE)
  })
})
