// The README index generated from the fact sheets. `main` runs against a
// temporary root with a copy of a fixture fact sheet from
// `scripts/fixtures/verification/studies/`.
import assert from 'node:assert/strict'
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, it } from 'vite-plus/test'
import {
  END,
  START,
  main,
  splitTitle,
  studyIndex,
  withIndex,
} from './study-index.ts'

describe('splitTitle', () => {
  it('turns "Autor (ano): tema" into the link label and the finding', () => {
    assert.deepEqual(
      splitTitle('Aron et al. (1997): as "36 perguntas": proximidade'),
      {
        label: 'Aron et al. 1997',
        finding: 'as "36 perguntas": proximidade',
      },
    )
  })

  it('keeps a title without a year or without a theme', () => {
    assert.deepEqual(splitTitle('Start.io: estimativa de gênero'), {
      label: 'Start.io',
      finding: 'estimativa de gênero',
    })
    assert.deepEqual(splitTitle('Datafolha (2009)'), {
      label: 'Datafolha 2009',
      finding: '',
    })
  })
})

describe('studyIndex', () => {
  const sheet = (
    slug: string,
    countries: string[],
    title = `${slug} (2020): achado`,
  ) =>
    ({ slug, title, countries, status: 'partial', strength: 'weak' }) as const

  it('groups by where the data comes from, in slug order, and skips empty groups', () => {
    const index = studyIndex([
      sheet('zeta-2020', ['EUA']),
      sheet('alfa-2020', ['EUA', 'Brasil']),
      sheet('beta-2020', ['França']),
    ])
    assert.equal(
      index,
      [
        '### Com dados do Brasil',
        '',
        '- [alfa-2020 2020](studies/alfa-2020.md): achado · 🟡 · fraca',
        '',
        '### Outros países',
        '',
        '- [beta-2020 2020](studies/beta-2020.md): achado · 🟡 · fraca',
        '- [zeta-2020 2020](studies/zeta-2020.md): achado · 🟡 · fraca',
      ].join('\n'),
    )
  })

  it('puts a fact sheet without countries in its own group', () => {
    assert.match(studyIndex([sheet('meta-2010', [])]), /^### Sem país na Ficha/)
  })
})

describe('withIndex', () => {
  it('replaces only what is between the markers', () => {
    const readme = `antes\n${START}\nvelho\n${END}\ndepois\n`
    assert.equal(
      withIndex(readme, 'novo'),
      `antes\n${START}\n\nnovo\n\n${END}\ndepois\n`,
    )
  })

  it('gives null without the markers', () => {
    assert.equal(withIndex('sem marcador', 'novo'), null)
  })
})

describe('main', () => {
  const fixture = fileURLToPath(
    new URL(
      './fixtures/verification/studies/lima-2021-conferida.md',
      import.meta.url,
    ),
  )
  let root = ''
  const lines: string[] = []
  const run = (...argv: string[]) =>
    main(argv, { root, write: (l) => lines.push(l) })
  const readme = () => readFileSync(join(root, 'README.md'), 'utf8')

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'study-index-'))
    lines.length = 0
    cpSync(fixture, join(root, 'studies', 'lima-2021-conferida.md'), {
      recursive: true,
    })
    writeFileSync(join(root, 'README.md'), `# Acervo\n\n${START}\n${END}\n`)
  })
  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('--check fails on a stale README and names the command that fixes it', () => {
    assert.equal(run('--check'), 1)
    assert.match(lines.join('\n'), /Run `node scripts\/study-index\.ts`/)
    assert.equal(readme(), `# Acervo\n\n${START}\n${END}\n`)
  })

  it('writes the index, after which --check passes', () => {
    assert.equal(run(), 0)
    assert.match(readme(), /\(studies\/lima-2021-conferida\.md\)/)
    assert.equal(run('--check'), 0)
  })

  it('fails when README.md lost the markers', () => {
    writeFileSync(join(root, 'README.md'), '# Acervo\n')
    assert.equal(run(), 1)
    assert.match(lines.join('\n'), /lacks the markers/)
  })

  it('fails with the build errors when a fact sheet does not load', () => {
    writeFileSync(
      join(root, 'studies', 'quebrada-2020.md'),
      '# sem frontmatter\n',
    )
    assert.equal(run('--check'), 1)
    assert.match(lines.join('\n'), /studies\/quebrada-2020\.md/)
  })
})
