import { resolve } from 'node:path'
import { loadLibrary } from '@tem-estudo/content'
import { describe, expect, it } from 'vite-plus/test'
import { keyNumberFactSheets, tipView, withoutMarks } from './guide-view'
import { html, inlineHtml } from './view'

describe("a Tip's page (#360)", () => {
  const result = loadLibrary(resolve(import.meta.dirname, '../../e2e/library'))
  if (!result.ok) throw new Error('invalid e2e fixture')
  const { library } = result
  const tip = library.tips.find((t) => t.slug === 'apps-como-complemento')!

  it("links its Verbetes to the Tip's Fact sheets, and sends their views", () => {
    const view = tipView(
      {
        ...tip,
        text: 'A [[satisfação]] quase não muda [@costa-2018-satisfacao].',
      },
      library,
    )
    expect(view.textHtml).toBe(
      'A <a class="verbete" href="/glossario#satisfacao" data-verbete="satisfacao" data-fichas="silva-2020-apps-brasil costa-2018-satisfacao">satisfação</a> quase não muda.',
    )
    expect(view.text).toBe('A satisfação quase não muda.')
    expect(Object.keys(view.terms)).toEqual(['satisfacao'])
  })

  it('without a Verbete, is its plain text', () => {
    const view = tipView(tip, library)
    expect(view.textHtml).toBe(tip.text)
    expect(view.terms).toEqual({})
  })
})

describe('a Verbete mark (#350)', () => {
  it('reaches the page as the word the reader sees', () => {
    const text = 'O [[Pew]] mede a [[satisfacao|satisfação]] dos casais.'
    expect(html(text)).toBe('<p>O Pew mede a satisfação dos casais.</p>\n')
    expect(inlineHtml(text)).toBe('O Pew mede a satisfação dos casais.')
    expect(withoutMarks(text)).toBe('O Pew mede a satisfação dos casais.')
  })
})

describe('fichasDoNumeroChave', () => {
  it('takes the Fact sheets cited in the key-number sentence', () => {
    expect(
      keyNumberFactSheets(
        'No Brasil, ==18% dos adultos jovens== conheceram o parceiro por app [@silva-2020]. O resto diverge [@costa-2018].',
      ),
    ).toEqual(['silva-2020'])
  })

  it('takes every Fact sheet in the sentence, even before the number', () => {
    expect(
      keyNumberFactSheets(
        'Dois estudos [@a] acham ==39%== [@b][@c]! Outro [@d].',
      ),
    ).toEqual(['a', 'b', 'c'])
  })

  it('without a key number, or without a Fact sheet in its sentence, returns null', () => {
    expect(
      keyNumberFactSheets('Depende de quem você procura [@costa-2018].'),
    ).toBeNull()
    expect(
      keyNumberFactSheets(
        'Foram ==18%== no total. Fonte depois [@silva-2020].',
      ),
    ).toBeNull()
  })
})
