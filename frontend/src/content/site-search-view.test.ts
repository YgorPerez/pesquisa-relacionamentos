// The site search (#275) over the e2e fixture: what a query finds, in which
// order, and the link that lands on the sentence. The expected links are
// written by hand from the fixture's text as the page renders it. The browser
// matches a Text Fragment only inside a run of plain text: the reference ring
// and the "no Brasil" mark are boxes of their own, so the fragment stops
// before `perto2.`'s ring and starts after the mark.
import { fileURLToPath } from 'node:url'
import { formatProblems, loadLibrary } from '@tem-estudo/content'
import { describe, expect, it } from 'vite-plus/test'
import { searchSite, type SearchHit } from './site-search-view'

const FIXTURE = fileURLToPath(new URL('../../e2e/library', import.meta.url))

function fixture() {
  const result = loadLibrary(FIXTURE)
  if (!result.ok) throw new Error(formatProblems(result.errors))
  return result.library
}

const library = fixture()

/** The hit's sentence as the result shows it, the matches in brackets. */
const shown = (hit: SearchHit) =>
  hit.pieces.map((p) => (p.match ? `[${p.text}]` : p.text)).join('')

describe('searchSite', () => {
  it('finds the sentence in the Guide and links to it through its Chapter and a Text Fragment', () => {
    const results = searchSite(library, 'pessoalmente')
    const guide = results.groups.find(
      (g) => g.path === '/onde-conhecer-pessoas',
    )
    const hit = guide?.hits.find(
      (h) => h.place === 'O lugar quase não muda a relação',
    )
    expect(hit && shown(hit)).toBe(
      'A satisfação de quem se conheceu online e de quem se conheceu [pessoalmente] fica perto.',
    )
    expect(hit?.href).toBe(
      '/onde-conhecer-pessoas#o-lugar-quase-nao-muda-a-relacao:~:text=A%20satisfa%C3%A7%C3%A3o%20de%20quem,conheceu%20pessoalmente%20fica%20perto',
    )
  })

  it('starts the Text Fragment after the "no Brasil" mark, which the result still shows', () => {
    const [guide] = searchSite(library, 'adultos jovens, 18%').groups
    const hit = guide?.hits[0]
    expect(hit && shown(hit)).toBe(
      'no Brasil Entre [adultos jovens, 18%] conheceram o parceiro por app.',
    )
    expect(hit?.href).toBe(
      '/onde-conhecer-pessoas#o-app-virou-um-caminho-comum:~:text=Entre%20adultos%20jovens%2C%2018%25,o%20parceiro%20por%20app',
    )
  })

  it('an answer\'s first sentence is found in "Em resumo", where the browser meets it first', () => {
    const [guide] = searchSite(library, 'dos adultos jovens').groups
    expect(guide?.hits.map((h) => [h.place, h.href])).toEqual([
      [
        'Em resumo',
        '/onde-conhecer-pessoas#em-resumo:~:text=No%20Brasil%2C%2018%25%20dos,o%20parceiro%20por%20app',
      ],
    ])
  })

  it("reads a Visual's labels and values as separate words, without its hidden axis", () => {
    const hits = searchSite(library, '18 a 24 anos').groups.flatMap((g) =>
      g.hits.map(shown),
    )
    expect(hits).toContain('[18 a 24 anos] 24%')
    expect(hits.some((hit) => /anos\]?\d/.test(hit))).toBe(false)
  })

  it('ignores accents and case, and marks the text as the page writes it', () => {
    const results = searchSite(library, 'SATISFACAO DE QUEM')
    expect(results.match).toBe('phrase')
    expect(results.groups.flatMap((g) => g.hits.map(shown))).toContain(
      'A [satisfação de quem] se conheceu online e de quem se conheceu pessoalmente fica perto.',
    )
  })

  it('without the exact phrase, finds the sentences that have every word', () => {
    const results = searchSite(library, 'pessoalmente satisfação')
    expect(results.match).toBe('words')
    expect(results.groups.flatMap((g) => g.hits.map(shown))).toContain(
      'A [satisfação] de quem se conheceu online e de quem se conheceu [pessoalmente] fica perto.',
    )
  })

  it('lists Guides, then Tips, then Fact sheets, and a sentence repeated on a page once', () => {
    const results = searchSite(library, 'complemento')
    expect(
      results.groups.map((g) => [g.path, g.hits.map((h) => h.href)]),
    ).toEqual([
      [
        '/escolher-parceiro',
        [
          expect.stringMatching(
            /^\/escolher-parceiro#o-que-levar:~:text=Use%20o%20app%20como,/,
          ),
        ],
      ],
      [
        '/onde-conhecer-pessoas',
        [
          '/onde-conhecer-pessoas#o-lugar-quase-nao-muda-a-relacao:~:text=Use%20o%20app%20como,como%20o%20%C3%BAnico%20caminho',
        ],
      ],
      [
        '/dicas/apps-como-complemento',
        [
          '/dicas/apps-como-complemento#:~:text=Use%20o%20app%20como,como%20o%20%C3%BAnico%20caminho',
        ],
      ],
    ])
    expect(results.total).toBe(3)
  })

  it('does not cut a sentence at an abbreviation', () => {
    const hits = searchSite(library, 'presencial').groups.flatMap((g) =>
      g.hits.map(shown),
    )
    expect(hits).toContain('Diferença de satisfação, online vs. [presencial]')
    expect(hits).not.toContain('[presencial]')
  })

  it('a heading leads to its anchor alone', () => {
    const [guide] = searchSite(library, 'quase não muda a relação').groups
    expect(guide?.hits[0]?.href).toBe(
      '/onde-conhecer-pessoas#o-lugar-quase-nao-muda-a-relacao',
    )
  })

  it('leaves out the Excerpts in English and the text the page hides', () => {
    expect(searchSite(library, 'aplicativo').match).toBe('none')
    expect(searchSite(library, 'vale para você').match).toBe('none')
  })

  it('a query shorter than two letters searches nothing', () => {
    expect(searchSite(library, ' a ')).toEqual({
      query: 'a',
      match: 'none',
      groups: [],
      total: 0,
    })
  })
})
