import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  factSheetPath,
  loadLibrary,
  isFactSheetIndexable,
  factSheetBySlug,
  formatProblems,
  buildLibrary,
  type Library,
  type LoadResult,
} from './index.ts'

const fixture = (name: string) =>
  fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url))

function libraryOf(result: LoadResult): Library {
  if (!result.ok) throw new Error(formatProblems(result.errors))
  return result.library
}

const fixtureText = (folder: string, slug: string) =>
  readFileSync(`${fixture(folder)}/studies/${slug}.md`, 'utf8')

function errorsOf(result: LoadResult): string[] {
  if (result.ok) throw new Error('the library should have failed')
  return result.errors.map((e) => e.message)
}

describe('loading the library', () => {
  it('reads the fact sheets in studies/ by file name, skipping _modelo', () => {
    const library = libraryOf(loadLibrary(fixture('valid')))
    expect(library.factSheets.map((f) => f.slug)).toEqual([
      'costa-2018-satisfacao',
      'lima-2015-encontros',
      'silva-2020-apps-brasil',
    ])
  })

  it('returns the fact sheet with the frontmatter, the title and the DOI taken from the link', () => {
    const factSheet = factSheetBySlug(
      libraryOf(loadLibrary(fixture('valid'))),
      'silva-2020-apps-brasil',
    )
    expect(factSheet).toMatchObject({
      file: 'studies/silva-2020-apps-brasil.md',
      title: 'Silva e Souza (2020): apps de namoro no Brasil',
      status: 'verified',
      verified_on: '2026-10-19',
      strength: 'strong',
      strength_reason: 'Amostra probabilística nacional, grande.',
      countries: ['Brasil'],
      period: '2019',
      sample: { n: 2400, representative: true },
      design: 'cross-sectional',
      license: 'CC BY 4.0',
      doi: '10.1234/exemplo.2020.1',
      covers: {
        genders: ['man', 'woman'],
        seeks: ['men', 'women'],
        ages: { min: 18, max: 35 },
      },
    })
  })

  it('cuts the body into O que mediu, Achados with excerpts, Limitações and Como usamos', () => {
    const factSheet = factSheetBySlug(
      libraryOf(loadLibrary(fixture('valid'))),
      'silva-2020-apps-brasil',
    )
    expect(factSheet?.whatItMeasured).toBe(
      'Quantos adultos jovens conheceram o parceiro atual por app.',
    )
    expect(factSheet?.findings).toEqual([
      {
        measure: 'Conheceram o parceiro por app',
        value: '18%',
        locator: 'Tabela 2, p. 50',
        excerpt:
          '"18% dos participantes conheceram o parceiro atual por aplicativo"',
        calculation: null,
      },
      {
        measure: 'Entre 18 e 24 anos',
        value: '24%',
        locator: 'Tabela 2, p. 50',
        excerpt: '"entre os de 18 a 24 anos, 24%"',
        calculation: null,
      },
    ])
    expect(factSheet?.limitations).toBe('- Autorrelato.\n- Só capitais.')
    expect(factSheet?.howWeUseIt).toBe('- Exemplo de fixture.')
  })

  it('accepts an unverified fact sheet without excerpt, without date and with an extra section', () => {
    const factSheet = factSheetBySlug(
      libraryOf(loadLibrary(fixture('valid'))),
      'lima-2015-encontros',
    )
    expect(factSheet?.status).toBe('unverified')
    expect(factSheet?.verified_on).toBeUndefined()
    expect(factSheet?.findings[0]?.excerpt).toBeNull()
    expect(factSheet?.otherSections).toEqual([
      {
        title: 'Brasil na amostra',
        markdown: 'Nenhum participante brasileiro.',
      },
    ])
    expect(factSheet?.howWeUseIt).toBeNull()
    expect(factSheet?.doi).toBe('10.5555/lima.2015')
  })

  it('a folder without studies/ gives an empty library', () => {
    expect(libraryOf(buildLibrary([])).factSheets).toEqual([])
  })
})

describe('build errors', () => {
  it('an invalid field names the file, the field and the value it got', () => {
    const errors = errorsOf(loadLibrary(fixture('invalid-field')))
    const file = 'studies/rocha-2021-invalida.md'
    expect(errors).toEqual(
      expect.arrayContaining([
        `${file}: status: value outside the closed list (verified | partial | unverified) (got "talvez")`,
        `${file}: link: must be a URL starting with http (got "doi 10.1/abc")`,
        `${file}: sample.n: must be a number (got "muitos")`,
        `${file}: sample.representative: must be true or false (got "sim")`,
        `${file}: autor: unknown field`,
      ]),
    )
  })

  it('a value outside the closed lists of design, strength and coverage fails', () => {
    const errors = errorsOf(loadLibrary(fixture('closed-list')))
    const file = 'studies/alves-2022-fora-da-lista.md'
    expect(errors).toEqual(
      expect.arrayContaining([
        `${file}: strength: value outside the closed list (strong | moderate | weak) (got "muito-forte")`,
        `${file}: design: value outside the closed list (longitudinal | cross-sectional | experiment | platform | administrative | meta-analysis) (got "survey")`,
        `${file}: covers.genders.1: value outside the closed list (man | woman) (got "outro")`,
        `${file}: covers.seeks.0: value outside the closed list (men | women) (got "ambos")`,
        `${file}: covers.couple: value outside the closed list (different-sex | same-sex) (got "misto")`,
      ]),
    )
  })

  it('covers.ages with min above max fails', () => {
    const text = `---
reference: "X."
link: https://exemplo.org/x
status: unverified
strength: weak
strength_reason: "X."
countries: []
period: "2020"
sample: { description: "X.", representative: false }
design: cross-sectional
covers: { ages: { min: 40, max: 30 } }
---

# X (2020): x

## O que mediu

X.

## Achados

| Medida | Valor | Onde | Trecho |
|---|---|---|---|
| A | 1 | — | |

## Limitações

X.
`
    expect(
      errorsOf(buildLibrary([{ path: 'studies/x-2020.md', text }])),
    ).toEqual(['studies/x-2020.md: covers.ages: min (40) is above max (30)'])
  })

  it('two studies with the same DOI fail, even when written differently', () => {
    expect(errorsOf(loadLibrary(fixture('duplicate-doi')))).toEqual([
      'studies/mendes-2019-original.md: link: the DOI 10.9999/repetido.2019 is already in studies/mendes-2019-copia.md; a study has a single fact sheet',
    ])
  })

  it('a body without the sections or with the old table fails', () => {
    const file = 'studies/nunes-2020-corpo.md'
    expect(errorsOf(loadLibrary(fixture('incomplete-body')))).toEqual([
      `${file}: O que mediu: missing the section "## O que mediu"`,
      `${file}: Achados: missing the section "## Achados"`,
    ])
  })

  it('the Achados table needs the columns Medida, Valor, Onde and Trecho', () => {
    const text = fixtureText('valid', 'lima-2015-encontros').replace(
      '| Medida | Valor | Onde | Trecho |',
      '| Medida | Valor | Onde no texto |',
    )
    expect(
      errorsOf(
        buildLibrary([{ path: 'studies/lima-2015-encontros.md', text }]),
      ),
    ).toEqual([
      'studies/lima-2015-encontros.md: Achados: the table needs the columns | Medida | Valor | Onde | Trecho | (and an optional | Cálculo |), got | Medida | Valor | Onde no texto |',
    ])
  })

  it('a verified fact sheet needs a date and an excerpt in every finding', () => {
    const file = 'studies/pires-2023-sem-trecho.md'
    expect(errorsOf(loadLibrary(fixture('ok-without-excerpt')))).toEqual([
      `${file}: verified_on: a verified or partial fact sheet needs the date it was checked`,
      `${file}: Achados: row 2 ("Sem trecho") has no Trecho; a verified fact sheet quotes the original in every finding`,
    ])
  })

  it('a missing or broken frontmatter fails', () => {
    expect(
      errorsOf(
        buildLibrary([
          { path: 'studies/sem-2020.md', text: '# Sem (2020): nada\n' },
          {
            path: 'studies/quebrado-2020.md',
            text: '---\nstatus: [ok\n---\n# Q\n',
          },
        ]),
      ),
    ).toEqual(
      expect.arrayContaining([
        'studies/sem-2020.md: missing the frontmatter (the --- block at the top)',
        expect.stringMatching(
          /^studies\/quebrado-2020\.md: the frontmatter is not valid YAML/,
        ),
      ]),
    )
  })

  it('formats the errors one line per problem', () => {
    const result = loadLibrary(fixture('duplicate-doi'))
    expect(result.ok ? '' : formatProblems(result.errors)).toBe(
      '- studies/mendes-2019-original.md: link: the DOI 10.9999/repetido.2019 is already in studies/mendes-2019-copia.md; a study has a single fact sheet',
    )
  })
})

describe('data origin (.meta.yaml)', () => {
  const factSheet = (folder: string, slug: string) => ({
    path: `studies/${slug}.md`,
    text: fixtureText(folder, slug),
  })
  const meta = (body: string) => ({
    path: 'data/possible-group/censo.meta.yaml',
    text: body,
  })
  const META_OK = `fact_sheet: silva-2020-apps-brasil
table: ["Microdados, arquivo de pessoas"]
variables: [P0110, P0150]
downloaded_on: 2026-10-19
script: scripts/possible-group/pipeline.ts
version: "arquivo de 2026-09-14"
`

  it('reads the .meta.yaml of each data file in data/', () => {
    const library = libraryOf(loadLibrary(fixture('valid')))
    expect(library.data).toEqual([
      {
        file: 'data/possible-group/exemplo.meta.yaml',
        fact_sheet: 'silva-2020-apps-brasil',
        table: ['SIDRA 9514'],
        downloaded_on: '2026-10-19',
        script: 'scripts/possible-group/pipeline.ts',
        version: 'Censo 2022, universo',
      },
    ])
  })

  it('accepts a .meta.yaml that cites a ✅ fact sheet', () => {
    const result = buildLibrary([
      factSheet('valid', 'silva-2020-apps-brasil'),
      meta(META_OK),
    ])
    expect(libraryOf(result).data[0]?.variables).toEqual(['P0110', 'P0150'])
  })

  it('fails when the .meta.yaml cites a ⬜ fact sheet', () => {
    const text = META_OK.replace(
      'silva-2020-apps-brasil',
      'lima-2015-encontros',
    )
    expect(
      errorsOf(
        buildLibrary([factSheet('valid', 'lima-2015-encontros'), meta(text)]),
      ),
    ).toEqual([
      'data/possible-group/censo.meta.yaml: fact_sheet: lima-2015-encontros is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets',
    ])
  })

  it('fails when the cited fact sheet does not exist', () => {
    expect(errorsOf(buildLibrary([meta(META_OK)]))).toEqual([
      'data/possible-group/censo.meta.yaml: fact_sheet: the fact sheet studies/silva-2020-apps-brasil.md does not exist',
    ])
  })

  it('fails with a missing field, a wrong date or neither table nor variables', () => {
    const text =
      'fact_sheet: silva-2020-apps-brasil\ndownloaded_on: ontem\nscript: x.ts\n'
    expect(
      errorsOf(
        buildLibrary([
          factSheet('valid', 'silva-2020-apps-brasil'),
          meta(text),
        ]),
      ),
    ).toEqual(
      expect.arrayContaining([
        'data/possible-group/censo.meta.yaml: downloaded_on: write the date as YYYY-MM-DD (got "ontem")',
        'data/possible-group/censo.meta.yaml: version: required field missing',
      ]),
    )
    const withoutTable = META_OK.replace(/^table:.*\n/m, '').replace(
      /^variables:.*\n/m,
      '',
    )
    expect(
      errorsOf(
        buildLibrary([
          factSheet('valid', 'silva-2020-apps-brasil'),
          meta(withoutTable),
        ]),
      ),
    ).toEqual([
      'data/possible-group/censo.meta.yaml: say the table or the variables the data came from',
    ])
  })
})

describe("the repository's library", () => {
  // Acervo PRs add and redo fact sheets every week, so this checks that each
  // one in studies/ loads, not which ones exist.
  it('loads every fact sheet in studies/, the IBGE ones checked (#36)', () => {
    const root = fileURLToPath(new URL('../../..', import.meta.url))
    const library = libraryOf(loadLibrary(root))
    const files = readdirSync(`${root}/studies`).filter(
      (name) => name.endsWith('.md') && !name.startsWith('_'),
    )
    const checked = library.factSheets
      .filter((f) => f.status !== 'unverified')
      .map((f) => f.slug)
    expect(library.factSheets).toHaveLength(files.length)
    expect(checked).toEqual(
      expect.arrayContaining(['ibge-2019-pns', 'ibge-2022-censo-amostra']),
    )
  })

  it('the possible group data cites the Census and PNS fact sheets', () => {
    const root = fileURLToPath(new URL('../../..', import.meta.url))
    const library = libraryOf(loadLibrary(root))
    expect(library.data.map((d) => [d.file, d.fact_sheet])).toEqual([
      ['data/possible-group/censo-2022.meta.yaml', 'ibge-2022-censo-amostra'],
      ['data/possible-group/pns-2019.meta.yaml', 'ibge-2019-pns'],
      [
        'data/possible-group/sidra-10185-municipios.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
      [
        'data/possible-group/sidra-9514-idade.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
      [
        'data/possible-group/sidra-9514-municipios.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
    ])
  })

  it('carries the tips of the old table, one per file, without the ⬜ ones, each published once its fact sheets are checked', () => {
    const root = fileURLToPath(new URL('../../..', import.meta.url))
    const library = libraryOf(loadLibrary(root))
    expect(library.tips.map((d) => [d.slug, d.strength, d.inference])).toEqual([
      ['apps-como-complemento', 'strong', false],
      ['convivencia-repetida', 'moderate', true],
      ['escola-e-eventos-sociais', 'moderate', false],
      ['mensagem-um-pouco-acima', 'moderate', false],
      ['sem-pressa-para-casar', 'strong', false],
    ])
    // Acervo PRs verify fact sheets one by one, and a tip goes up with the
    // last of its own.
    const checked = new Set(
      library.factSheets
        .filter((f) => f.status !== 'unverified')
        .map((f) => f.slug),
    )
    for (const tip of library.tips)
      expect([tip.slug, tip.published]).toEqual([
        tip.slug,
        tip.fact_sheets.every((slug) => checked.has(slug)),
      ])
  })
})

describe('paths and index', () => {
  it('a fact sheet lives at /estudos/<slug>', () => {
    expect(factSheetPath({ slug: 'joel-2020-machine-learning' })).toBe(
      '/estudos/joel-2020-machine-learning',
    )
  })

  it('only ✅ and 🟡 fact sheets go to search engines', () => {
    const library = libraryOf(loadLibrary(fixture('valid')))
    expect(
      library.factSheets.filter(isFactSheetIndexable).map((f) => f.slug),
    ).toEqual(['costa-2018-satisfacao', 'silva-2020-apps-brasil'])
  })
})
