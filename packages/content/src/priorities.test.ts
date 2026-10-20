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
  path: `estudos/${slug}.md`,
  text: readFileSync(`${fixture('valid')}/estudos/${slug}.md`, 'utf8'),
})
// silva-2020 is ✅, costa-2018 is 🟡, lima-2015 is ⬜.
const FACT_SHEETS = [
  factSheet('silva-2020-apps-brasil'),
  factSheet('costa-2018-satisfacao'),
  factSheet('lima-2015-encontros'),
]

const FILE = 'dados/prioridades/prioridades.yaml'
const META: ContentFile = {
  path: 'dados/prioridades/prioridades.meta.yaml',
  text: `ficha: silva-2020-apps-brasil
variaveis: [degrau, medida, texto_simples, ficha, vies]
baixado_em: 2026-10-19
script: compilado à mão a partir das Fichas de cada célula
versao: "1"
`,
}

const PRIORITIES = `satisfacao_explicada:
  ficha: silva-2020-apps-brasil
  relacao: 45
  parceiro: 5
  sem_explicacao: 50
caracteristicas:
  - id: aparencia
    nome: Aparência
    atracao: { degrau: 3, medida: "r ≈ 0,40", texto_simples: Quem é mais bonito atrai mais., ficha: silva-2020-apps-brasil }
    satisfacao: { degrau: 2, texto_simples: "Só um pouco, e só no começo.", ficha: costa-2018-satisfacao }
    duracao: { degrau: 0, texto_simples: Nenhum estudo lido mede isso. }
    vies: { todos: As pessoas dão menos peso à aparência quando dizem o que querem. }
  - id: renda
    nome: Renda
    atracao: { degrau: 2, texto_simples: Pesa pouco na atração., ficha: silva-2020-apps-brasil }
    satisfacao: { degrau: 0, texto_simples: Nenhum estudo lido mede isso. }
    duracao: { degrau: 1, texto_simples: Quase nada., ficha: costa-2018-satisfacao }
    vies: { homem: Homens dão menos peso., mulher: Mulheres dão mais peso. }
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
    expect(priorities?.satisfacao_explicada).toEqual({
      ficha: 'silva-2020-apps-brasil',
      relacao: 45,
      parceiro: 5,
      sem_explicacao: 50,
    })
    expect(
      priorities?.caracteristicas.map((c) => [
        c.id,
        c.atracao.degrau,
        c.satisfacao.degrau,
        c.duracao.degrau,
      ]),
    ).toEqual([
      ['aparencia', 3, 2, 0],
      ['renda', 2, 0, 1],
    ])
    expect(priorities?.caracteristicas[0]?.atracao).toEqual({
      degrau: 3,
      medida: 'r ≈ 0,40',
      texto_simples: 'Quem é mais bonito atrai mais.',
      ficha: 'silva-2020-apps-brasil',
    })
    expect(priorities?.caracteristicas[1]?.vies).toEqual({
      homem: 'Homens dão menos peso.',
      mulher: 'Mulheres dão mais peso.',
    })
  })

  it('its .meta.yaml goes into the data like the others', () => {
    const result = buildLibrary(filesWith(PRIORITIES))
    if (!result.ok) throw new Error(formatProblems(result.errors))
    expect(result.library.data.map((d) => d.file)).toEqual([
      'dados/prioridades/prioridades.meta.yaml',
    ])
  })

  it('without the file, there are no priorities', () => {
    expect(prioritiesOf(buildLibrary(FACT_SHEETS))).toBeNull()
  })

  it('fails without the .meta.yaml next to it', () => {
    expect(
      errors(buildLibrary([...FACT_SHEETS, { path: FILE, text: PRIORITIES }])),
    ).toEqual([
      `${FILE}: missing the prioridades.meta.yaml next to it, with the fact sheet, the variables, the date, the script and the version`,
    ])
  })

  it('fails when a cell cites a ⬜ or missing fact sheet', () => {
    const text = PRIORITIES.replace(
      'ficha: costa-2018-satisfacao }\n    duracao: { degrau: 0',
      'ficha: lima-2015-encontros }\n    duracao: { degrau: 0',
    ).replace(
      'Pesa pouco na atração., ficha: silva-2020-apps-brasil',
      'Pesa pouco na atração., ficha: sumida-2000',
    )
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: caracteristicas.0.satisfacao.ficha: lima-2015-encontros is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets`,
      `${FILE}: caracteristicas.1.atracao.ficha: the fact sheet estudos/sumida-2000.md does not exist`,
    ])
  })

  it('fails when the satisfaction bar cites a ⬜ fact sheet', () => {
    const text = PRIORITIES.replace(
      '  ficha: silva-2020-apps-brasil\n  relacao',
      '  ficha: lima-2015-encontros\n  relacao',
    )
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: satisfacao_explicada.ficha: lima-2015-encontros is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets`,
    ])
  })

  it('fails when a level above "não sabemos" does not name the fact sheet', () => {
    const text = PRIORITIES.replace(
      'Pesa pouco na atração., ficha: silva-2020-apps-brasil',
      'Pesa pouco na atração.',
    )
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: caracteristicas.1.atracao.ficha: level 2 needs the fact sheet that backs it; without a fact sheet, only 0 ("não sabemos")`,
    ])
  })

  it('fails with a level outside 0 to 3, a repeated id and a bar that does not add up to 100', () => {
    const text = PRIORITIES.replace('degrau: 3, medida', 'degrau: 4, medida')
      .replace('id: renda', 'id: aparencia')
      .replace('parceiro: 5', 'parceiro: 6')
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: caracteristicas.0.atracao.degrau: value outside the closed list (0 | 1 | 2 | 3) (got 4)`,
    ])
    const validLevels = PRIORITIES.replace(
      'id: renda',
      'id: aparencia',
    ).replace('parceiro: 5', 'parceiro: 6')
    expect(errors(buildLibrary(filesWith(validLevels)))).toEqual([
      `${FILE}: satisfacao_explicada: relacao, parceiro and sem_explicacao add up to 101%, not 100%`,
      `${FILE}: caracteristicas.1.id: the trait "aparencia" appears more than once`,
    ])
  })

  it('fails with an unknown field and a bias with no gender at all', () => {
    const text = PRIORITIES.replace('vies: { todos:', 'vies: { todas:')
    expect(errors(buildLibrary(filesWith(text)))).toEqual([
      `${FILE}: caracteristicas.0.vies.todas: unknown field`,
    ])
  })
})

describe("the repository's priorities draft", () => {
  const root = fileURLToPath(new URL('../../..', import.meta.url))

  it('stays out of the build while the fact sheets it cites are ⬜ (#39)', () => {
    const paths = readFiles(root).map((a) => a.path)
    expect(paths.filter((c) => c.startsWith('dados/prioridades/'))).toEqual([])
  })

  it('only fails for citing ⬜ fact sheets: with the fact sheets checked, it publishes', () => {
    const draft = (name: string): ContentFile => ({
      path: `dados/prioridades/${name}`,
      text: readFileSync(`${root}/dados/prioridades/_${name}`, 'utf8'),
    })
    const result = buildLibrary([
      ...readFiles(root),
      draft('prioridades.yaml'),
      draft('prioridades.meta.yaml'),
    ])
    const problems = result.ok ? [] : result.errors.map((e) => e.message)
    expect(problems.length).toBeGreaterThan(0)
    expect(problems.filter((m) => !m.includes('is ⬜ (unverified)'))).toEqual(
      [],
    )

    // With the cited fact sheets marked as checked, the same draft passes.
    const checked = readFiles(root).map((a) =>
      a.path.startsWith('estudos/')
        ? {
            ...a,
            text: a.text.replace(
              /^status: nao-verificado$/m,
              'status: parcial\nverificado_em: 2026-10-19',
            ),
          }
        : a,
    )
    const published = buildLibrary([
      ...checked,
      draft('prioridades.yaml'),
      draft('prioridades.meta.yaml'),
    ])
    if (!published.ok) throw new Error(formatProblems(published.errors))
    expect(
      published.library.priorities?.caracteristicas.map((c) => c.id),
    ).toEqual([
      'aparencia',
      'sexo',
      'renda',
      'calma',
      'gentileza',
      'responsavel',
      'parecido',
      'escolaridade',
      'religiao',
      'idade',
    ])
  })
})
