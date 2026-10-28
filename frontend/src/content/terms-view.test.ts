// The Verbetes on the server (#351), over the e2e fixture: the answer of
// app-ou-presencial marks "satisfação" in a sentence that cites Costa, which
// defines it; Silva is of the Instituto Exemplo.
import { resolve } from 'node:path'
import { loadLibrary } from '@tem-estudo/content'
import { describe, expect, it } from 'vite-plus/test'
import { glossaryView, withTermLinks } from './terms-view'
import { inlineHtml } from './view'

const result = loadLibrary(resolve(import.meta.dirname, '../../e2e/library'))
if (!result.ok) throw new Error('invalid e2e fixture')
const { library } = result

describe('a Verbete mark', () => {
  it('becomes a link to its entry, carrying the Fact sheets its sentence cites', () => {
    const used = new Set<string>()
    expect(
      withTermLinks(
        'Sem fonte, [[satisfação]] aqui. Com fonte, [[satisfacao|satisfeitos]] [@costa-2018-satisfacao].',
        library.terms,
        used,
      ),
    ).toBe(
      'Sem fonte, <a class="verbete" href="/glossario#satisfacao" data-verbete="satisfacao" data-fichas="">satisfação</a> aqui. Com fonte, <a class="verbete" href="/glossario#satisfacao" data-verbete="satisfacao" data-fichas="costa-2018-satisfacao">satisfeitos</a> [@costa-2018-satisfacao].',
    )
    expect([...used]).toEqual(['satisfacao'])
  })

  it('stays its plain word when no Verbete has it', () => {
    expect(withTermLinks('O [[casais]] e só.', library.terms, new Set())).toBe(
      'O casais e só.',
    )
  })

  it('goes through the filter with its slug and its Fact sheets, and nothing else', () => {
    const link = withTermLinks(
      '[[satisfação]] [@costa-2018-satisfacao].',
      library.terms,
      new Set(),
    )
    expect(inlineHtml(link)).toContain(
      '<a class="verbete" href="/glossario#satisfacao" data-verbete="satisfacao" data-fichas="costa-2018-satisfacao">satisfação</a>',
    )
    expect(
      inlineHtml(
        '<a class="verbete x" href="/glossario#a" data-verbete="A B" data-fichas="x;y">p</a>',
      ),
    ).toBe('<a class="verbete" href="/glossario#a">p</a>')
  })
})

it('the Glossário lists the Verbetes alphabetically, an institution with its Studies', () => {
  expect(
    glossaryView(library).map((t) => [t.slug, t.studies.map((s) => s.slug)]),
  ).toEqual([
    ['instituto-exemplo', ['silva-2020-apps-brasil']],
    ['satisfacao', []],
  ])
})
