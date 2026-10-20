import { readFileSync } from 'node:fs'
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
  readFileSync(`${fixture(folder)}/estudos/${slug}.md`, 'utf8')

function errorsOf(result: LoadResult): string[] {
  if (result.ok) throw new Error('the library should have failed')
  return result.errors.map((e) => e.message)
}

describe('loading the library', () => {
  it('reads the fact sheets in estudos/ by file name, skipping _modelo', () => {
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
      file: 'estudos/silva-2020-apps-brasil.md',
      title: 'Silva e Souza (2020): apps de namoro no Brasil',
      status: 'ok',
      verificado_em: '2026-10-19',
      forca: 'forte',
      forca_porque: 'Amostra probabilística nacional, grande.',
      paises: ['Brasil'],
      periodo: '2019',
      amostra: { n: 2400, representativa: true },
      desenho: 'transversal',
      licenca: 'CC BY 4.0',
      doi: '10.1234/exemplo.2020.1',
      cobre: {
        generos: ['homem', 'mulher'],
        procura: ['homens', 'mulheres'],
        idades: { min: 18, max: 35 },
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
    expect(factSheet?.status).toBe('nao-verificado')
    expect(factSheet?.verificado_em).toBeUndefined()
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

  it('a folder without estudos/ gives an empty library', () => {
    expect(libraryOf(buildLibrary([])).factSheets).toEqual([])
  })
})

describe('build errors', () => {
  it('an invalid field names the file, the field and the value it got', () => {
    const errors = errorsOf(loadLibrary(fixture('invalid-field')))
    const file = 'estudos/rocha-2021-invalida.md'
    expect(errors).toEqual(
      expect.arrayContaining([
        `${file}: status: value outside the closed list (ok | parcial | nao-verificado) (got "talvez")`,
        `${file}: link: must be a URL starting with http (got "doi 10.1/abc")`,
        `${file}: amostra.n: must be a number (got "muitos")`,
        `${file}: amostra.representativa: must be true or false (got "sim")`,
        `${file}: autor: unknown field`,
      ]),
    )
  })

  it('a value outside the closed lists of design, strength and coverage fails', () => {
    const errors = errorsOf(loadLibrary(fixture('closed-list')))
    const file = 'estudos/alves-2022-fora-da-lista.md'
    expect(errors).toEqual(
      expect.arrayContaining([
        `${file}: forca: value outside the closed list (forte | moderada | fraca) (got "muito-forte")`,
        `${file}: desenho: value outside the closed list (longitudinal | transversal | experimento | plataforma | administrativo | meta-analise) (got "survey")`,
        `${file}: cobre.generos.1: value outside the closed list (homem | mulher) (got "outro")`,
        `${file}: cobre.procura.0: value outside the closed list (homens | mulheres) (got "ambos")`,
        `${file}: cobre.casal: value outside the closed list (hetero | mesmo-sexo) (got "misto")`,
      ]),
    )
  })

  it('cobre.idades with min above max fails', () => {
    const text = `---
referencia: "X."
link: https://exemplo.org/x
status: nao-verificado
forca: fraca
forca_porque: "X."
paises: []
periodo: "2020"
amostra: { descricao: "X.", representativa: false }
desenho: transversal
cobre: { idades: { min: 40, max: 30 } }
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
      errorsOf(buildLibrary([{ path: 'estudos/x-2020.md', text }])),
    ).toEqual(['estudos/x-2020.md: cobre.idades: min (40) is above max (30)'])
  })

  it('two studies with the same DOI fail, even when written differently', () => {
    expect(errorsOf(loadLibrary(fixture('duplicate-doi')))).toEqual([
      'estudos/mendes-2019-original.md: link: the DOI 10.9999/repetido.2019 is already in estudos/mendes-2019-copia.md; a study has a single fact sheet',
    ])
  })

  it('a body without the sections or with the old table fails', () => {
    const file = 'estudos/nunes-2020-corpo.md'
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
        buildLibrary([{ path: 'estudos/lima-2015-encontros.md', text }]),
      ),
    ).toEqual([
      'estudos/lima-2015-encontros.md: Achados: the table needs the columns | Medida | Valor | Onde | Trecho | (and an optional | Cálculo |), got | Medida | Valor | Onde no texto |',
    ])
  })

  it('an ok fact sheet needs a date and an excerpt in every finding', () => {
    const file = 'estudos/pires-2023-sem-trecho.md'
    expect(errorsOf(loadLibrary(fixture('ok-without-excerpt')))).toEqual([
      `${file}: verificado_em: an ok or partial fact sheet needs the date it was checked`,
      `${file}: Achados: row 2 ("Sem trecho") has no Trecho; an ok fact sheet quotes the original in every finding`,
    ])
  })

  it('a missing or broken frontmatter fails', () => {
    expect(
      errorsOf(
        buildLibrary([
          { path: 'estudos/sem-2020.md', text: '# Sem (2020): nada\n' },
          {
            path: 'estudos/quebrado-2020.md',
            text: '---\nstatus: [ok\n---\n# Q\n',
          },
        ]),
      ),
    ).toEqual(
      expect.arrayContaining([
        'estudos/sem-2020.md: missing the frontmatter (the --- block at the top)',
        expect.stringMatching(
          /^estudos\/quebrado-2020\.md: the frontmatter is not valid YAML/,
        ),
      ]),
    )
  })

  it('formats the errors one line per problem', () => {
    const result = loadLibrary(fixture('duplicate-doi'))
    expect(result.ok ? '' : formatProblems(result.errors)).toBe(
      '- estudos/mendes-2019-original.md: link: the DOI 10.9999/repetido.2019 is already in estudos/mendes-2019-copia.md; a study has a single fact sheet',
    )
  })
})

describe('data origin (.meta.yaml)', () => {
  const factSheet = (folder: string, slug: string) => ({
    path: `estudos/${slug}.md`,
    text: fixtureText(folder, slug),
  })
  const meta = (body: string) => ({
    path: 'dados/grupo-possivel/censo.meta.yaml',
    text: body,
  })
  const META_OK = `ficha: silva-2020-apps-brasil
tabela: ["Microdados, arquivo de pessoas"]
variaveis: [P0110, P0150]
baixado_em: 2026-10-19
script: scripts/grupo-possivel/pipeline.ts
versao: "arquivo de 2026-09-14"
`

  it('reads the .meta.yaml of each data file in dados/', () => {
    const library = libraryOf(loadLibrary(fixture('valid')))
    expect(library.data).toEqual([
      {
        file: 'dados/grupo-possivel/exemplo.meta.yaml',
        ficha: 'silva-2020-apps-brasil',
        tabela: ['SIDRA 9514'],
        baixado_em: '2026-10-19',
        script: 'scripts/grupo-possivel/pipeline.ts',
        versao: 'Censo 2022, universo',
      },
    ])
  })

  it('accepts a .meta.yaml that cites a ✅ fact sheet', () => {
    const result = buildLibrary([
      factSheet('valid', 'silva-2020-apps-brasil'),
      meta(META_OK),
    ])
    expect(libraryOf(result).data[0]?.variaveis).toEqual(['P0110', 'P0150'])
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
      'dados/grupo-possivel/censo.meta.yaml: ficha: lima-2015-encontros is ⬜ (unverified); data only cites ✅ or 🟡 fact sheets',
    ])
  })

  it('fails when the cited fact sheet does not exist', () => {
    expect(errorsOf(buildLibrary([meta(META_OK)]))).toEqual([
      'dados/grupo-possivel/censo.meta.yaml: ficha: the fact sheet estudos/silva-2020-apps-brasil.md does not exist',
    ])
  })

  it('fails with a missing field, a wrong date or neither table nor variables', () => {
    const text =
      'ficha: silva-2020-apps-brasil\nbaixado_em: ontem\nscript: x.ts\n'
    expect(
      errorsOf(
        buildLibrary([
          factSheet('valid', 'silva-2020-apps-brasil'),
          meta(text),
        ]),
      ),
    ).toEqual(
      expect.arrayContaining([
        'dados/grupo-possivel/censo.meta.yaml: baixado_em: write the date as YYYY-MM-DD (got "ontem")',
        'dados/grupo-possivel/censo.meta.yaml: versao: required field missing',
      ]),
    )
    const withoutTable = META_OK.replace(/^tabela:.*\n/m, '').replace(
      /^variaveis:.*\n/m,
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
      'dados/grupo-possivel/censo.meta.yaml: say the table or the variables the data came from',
    ])
  })
})

describe("the repository's library", () => {
  it('loads the fact sheets: the 30 old ones unverified until they are redone (#6), the IBGE ones checked (#36)', () => {
    const root = fileURLToPath(new URL('../../..', import.meta.url))
    const library = libraryOf(loadLibrary(root))
    const checked = library.factSheets
      .filter((f) => f.status !== 'nao-verificado')
      .map((f) => f.slug)
    expect(checked).toEqual(['ibge-2019-pns', 'ibge-2022-censo-amostra'])
    expect(library.factSheets).toHaveLength(32)
  })

  it('the possible group data cites the Census and PNS fact sheets', () => {
    const root = fileURLToPath(new URL('../../..', import.meta.url))
    const library = libraryOf(loadLibrary(root))
    expect(library.data.map((d) => [d.file, d.ficha])).toEqual([
      ['dados/grupo-possivel/censo-2022.meta.yaml', 'ibge-2022-censo-amostra'],
      ['dados/grupo-possivel/pns-2019.meta.yaml', 'ibge-2019-pns'],
      [
        'dados/grupo-possivel/sidra-10185-municipios.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
      [
        'dados/grupo-possivel/sidra-9514-idade.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
      [
        'dados/grupo-possivel/sidra-9514-municipios.meta.yaml',
        'ibge-2022-censo-amostra',
      ],
    ])
  })

  it('carries the tips of the old table, one per file, without the ⬜ ones, and none published yet', () => {
    const root = fileURLToPath(new URL('../../..', import.meta.url))
    const library = libraryOf(loadLibrary(root))
    expect(library.tips.map((d) => [d.slug, d.forca, d.inferencia])).toEqual([
      ['apps-como-complemento', 'forte', false],
      ['convivencia-repetida', 'moderada', true],
      ['escola-e-eventos-sociais', 'moderada', false],
      ['mensagem-um-pouco-acima', 'moderada', false],
      ['sem-pressa-para-casar', 'forte', false],
    ])
    // The fact sheets behind them are still ⬜: the tips wait for the check.
    expect(library.tips.filter((d) => d.published)).toEqual([])
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
