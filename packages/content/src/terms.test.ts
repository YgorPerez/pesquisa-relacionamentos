// Verbetes in the library (#349): the file, the marks in the text, the
// definition each Fact sheet gives and the institution. The cases start from
// the valid fixture and add or swap files.
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import {
  buildLibrary,
  formatProblems,
  readFiles,
  withoutTermMarks,
  type ContentFile,
  type LoadResult,
} from './index.ts'

const VALID = fileURLToPath(new URL('../fixtures/valid', import.meta.url))
const GUIDE = 'guides/onde-conhecer.md'
const COSTA = 'studies/costa-2018-satisfacao.md'
const SILVA = 'studies/silva-2020-apps-brasil.md'

const term = (name: string, frontmatter: string, definition: string): string =>
  `---\nname: ${name}\n${frontmatter}---\n\n${definition}\n`

const SATISFACTION = {
  path: 'terms/satisfacao.md',
  text: term(
    'satisfação',
    'varies_by_study: true\n',
    'Quanto a pessoa diz gostar da relação. Cada estudo mede de um jeito.',
  ),
}
const INSTITUTE = {
  path: 'terms/instituto-exemplo.md',
  text: term(
    'Instituto Exemplo',
    'forms: [Exemplo]\ninstitution: true\n',
    'Um instituto de pesquisa que faz levantamentos sobre casais.',
  ),
}

const COSTA_DEFINITION = `## Definições

| Verbete | Definição | Onde | Trecho |
|---|---|---|---|
| satisfacao | Uma nota de 1 a 7 para o casamento. | Methods | "rated their marriage from 1 to 7" |

## Limitações`

/** The valid fixture with files added or swapped. */
function library(
  extra: ReadonlyArray<ContentFile>,
  swaps: Record<string, (original: string) => string> = {},
): LoadResult {
  const files = [...readFiles(VALID)].map((f) => {
    const swap = swaps[f.path]
    return swap ? { ...f, text: swap(f.text) } : f
  })
  return buildLibrary([...files, ...extra])
}

const errorsOf = (result: LoadResult): string[] =>
  result.ok ? [] : result.errors.map((e) => e.message)
const warningsOf = (result: LoadResult): string[] =>
  result.warnings.map((w) => w.message)

/** The Guide sentence on satisfaction, marked. */
const markSatisfaction = (guide: string) =>
  guide.replace(
    'A diferença de satisfação é pequena',
    'A diferença de [[satisfação]] é pequena',
  )
const defineInCosta = (sheet: string) =>
  sheet.replace('## Limitações', COSTA_DEFINITION)

describe('a Verbete', () => {
  it('comes into the library with its forms and its general definition', () => {
    const result = library([SATISFACTION, INSTITUTE])
    if (!result.ok) throw new Error(formatProblems(result.errors))
    expect(result.library.terms.map((t) => [t.slug, t.forms])).toEqual([
      ['instituto-exemplo', ['Instituto Exemplo', 'Exemplo']],
      ['satisfacao', ['satisfação']],
    ])
    expect(result.library.terms[1]?.variesByStudy).toBe(true)
  })

  it('has no number in its general definition', () => {
    const result = library([
      {
        path: 'terms/painel-online.md',
        text: term(
          'painel online',
          '',
          'Gente que se cadastra para responder pesquisas, 18% no Brasil.',
        ),
      },
    ])
    expect(errorsOf(result)).toEqual([
      'terms/painel-online.md: the general definition carries no number; a number belongs to a Fact sheet, cited in a Guide',
    ])
  })

  it('is not an institution and a measure at once', () => {
    const result = library([
      {
        path: 'terms/ibge.md',
        text: term(
          'IBGE',
          'institution: true\nvaries_by_study: true\n',
          'O instituto de estatística do governo.',
        ),
      },
    ])
    expect(errorsOf(result)).toEqual([
      'terms/ibge.md: an institution does not vary by Study; choose one of varies_by_study and institution',
    ])
  })

  it('does not share a form with another Verbete', () => {
    const result = library([
      INSTITUTE,
      {
        path: 'terms/exemplo.md',
        text: term('exemplo', '', 'Um caso que ilustra.'),
      },
    ])
    expect(errorsOf(result)).toEqual([
      'terms/instituto-exemplo.md: forms: the form "Exemplo" is already a form of terms/exemplo.md; a word leads to a single Verbete',
    ])
  })
})

describe('the mark in the text', () => {
  it('passes once the cited Fact sheet says how its Study defined the word', () => {
    const result = library([SATISFACTION], {
      [GUIDE]: markSatisfaction,
      [COSTA]: defineInCosta,
    })
    expect(errorsOf(result)).toEqual([])
    const costa = result.ok
      ? result.library.factSheets.find((f) => f.file === COSTA)
      : undefined
    expect(costa?.definitions).toEqual([
      {
        term: 'satisfacao',
        text: 'Uma nota de 1 a 7 para o casamento.',
        locator: 'Methods',
        excerpt: '"rated their marriage from 1 to 7"',
      },
    ])
  })

  it('fails when a sentence cites a Fact sheet that does not define a word that varies by Study', () => {
    const result = library([SATISFACTION], { [GUIDE]: markSatisfaction })
    expect(errorsOf(result)).toEqual([
      'guides/onde-conhecer.md: O lugar quase não importa: marks satisfação, which varies by Study, and cites studies/costa-2018-satisfacao.md, whose "## Definições" table does not say how that Study defined it',
    ])
  })

  it('fails when a Fact sheet marks a word that varies by Study and does not define it', () => {
    const result = library([SATISFACTION], {
      [COSTA]: (sheet) =>
        sheet.replace('A satisfação conjugal', 'A [[satisfação]] conjugal'),
    })
    expect(errorsOf(result)).toEqual([
      'studies/costa-2018-satisfacao.md: body: marks satisfação, which varies by Study, and the "## Definições" table does not say how this Study defined it',
    ])
  })

  it('fails on a word that is no Verbete and on a slug that does not exist', () => {
    const result = library([SATISFACTION], {
      [GUIDE]: (guide) =>
        guide.replace(
          'Onde os casais se conhecem',
          'Onde os [[casais]] se [[encontro|conhecem]]',
        ),
    })
    expect(errorsOf(result)).toEqual([
      'guides/onde-conhecer.md: opening: [[casais]] is not a form of any Verbete in terms/',
      'guides/onde-conhecer.md: opening: [[encontro|conhecem]]: the Verbete terms/encontro.md does not exist',
    ])
  })

  it('takes the slug and the shown text apart', () => {
    const result = library([SATISFACTION], {
      [GUIDE]: (guide) =>
        guide.replace(
          'A diferença de satisfação é pequena',
          'Os [[satisfacao|satisfeitos]] diferem pouco',
        ),
      [COSTA]: defineInCosta,
    })
    expect(errorsOf(result)).toEqual([])
    expect(withoutTermMarks('Os [[satisfacao|satisfeitos]] e o [[Pew]].')).toBe(
      'Os satisfeitos e o Pew.',
    )
  })

  it('is marked once per Chapter', () => {
    const result = library([SATISFACTION], {
      [GUIDE]: (guide) =>
        markSatisfaction(guide).replace(
          '{{question:app-ou-presencial}}',
          'A [[satisfação]] de novo.\n\n{{question:app-ou-presencial}}',
        ),
      [COSTA]: defineInCosta,
    })
    expect(errorsOf(result)).toEqual([
      'guides/onde-conhecer.md: O lugar quase não importa: satisfação is marked 2 times; mark only its first use here',
    ])
  })

  it('warns when the first use in a text is not marked', () => {
    const result = library([INSTITUTE], {
      [GUIDE]: (guide) =>
        guide.replace(
          'Onde os casais se conhecem',
          'O Instituto Exemplo e o [[Exemplo]] contam onde os casais se conhecem',
        ),
    })
    expect(errorsOf(result)).toEqual([])
    expect(warningsOf(result)).toEqual([
      'guides/onde-conhecer.md: opening: the first use of Instituto Exemplo is not marked; write [[Instituto Exemplo]] (terms/instituto-exemplo.md)',
    ])
  })

  it('does not count a reference slug as a use of the word', () => {
    const result = library([
      {
        path: 'terms/silva.md',
        text: term('silva', '', 'Um sobrenome comum.'),
      },
    ])
    expect(warningsOf(result).filter((w) => w.startsWith('guides/'))).toEqual(
      [],
    )
  })
})

describe('the institution of a Fact sheet', () => {
  const withInstitution = (slug: string) => (sheet: string) =>
    sheet.replace('design: ', `institution: ${slug}\ndesign: `)

  it('is a Verbete marked as an institution', () => {
    const result = library([INSTITUTE, SATISFACTION], {
      [SILVA]: withInstitution('instituto-exemplo'),
    })
    expect(errorsOf(result)).toEqual([])
  })

  it('fails when the Verbete is missing or is not an institution', () => {
    expect(
      errorsOf(library([], { [SILVA]: withInstitution('nenhum') })),
    ).toEqual([
      'studies/silva-2020-apps-brasil.md: institution: the Verbete terms/nenhum.md does not exist',
    ])
    expect(
      errorsOf(
        library([SATISFACTION], { [SILVA]: withInstitution('satisfacao') }),
      ),
    ).toEqual([
      'studies/silva-2020-apps-brasil.md: institution: terms/satisfacao.md is not an institution (institution: true)',
    ])
  })
})

describe('the Definições of a Fact sheet', () => {
  it('only define a Verbete that exists and varies by Study, once', () => {
    const result = library([INSTITUTE], {
      [COSTA]: (sheet) =>
        sheet.replace(
          '## Limitações',
          `## Definições

| Verbete | Definição | Onde | Trecho |
|---|---|---|---|
| amor | Uma pergunta só. | Methods | "a single item" |
| instituto-exemplo | Um instituto. | Methods | "an institute" |
| instituto-exemplo | Um instituto. | Methods | "an institute" |

## Limitações`,
        ),
    })
    expect(errorsOf(result)).toEqual([
      'studies/costa-2018-satisfacao.md: Definições: the Verbete terms/amor.md does not exist',
      'studies/costa-2018-satisfacao.md: Definições: terms/instituto-exemplo.md does not vary by Study (varies_by_study: true), so it has no definition per Fact sheet',
      'studies/costa-2018-satisfacao.md: Definições: terms/instituto-exemplo.md does not vary by Study (varies_by_study: true), so it has no definition per Fact sheet',
      'studies/costa-2018-satisfacao.md: Definições: instituto-exemplo is defined twice',
    ])
  })

  it('always quote the original', () => {
    const result = library([SATISFACTION], {
      [COSTA]: (sheet) =>
        sheet.replace(
          '## Limitações',
          `## Definições

| Verbete | Definição | Onde | Trecho |
|---|---|---|---|
| satisfacao | Uma nota. | Methods | |

## Limitações`,
        ),
    })
    expect(errorsOf(result)).toEqual([
      'studies/costa-2018-satisfacao.md: Definições: row 1 of the table needs Verbete, Definição, Onde and Trecho',
    ])
  })
})
