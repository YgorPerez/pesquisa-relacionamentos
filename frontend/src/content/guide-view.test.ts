import { describe, expect, it } from 'vite-plus/test'
import { keyNumberFactSheets, withoutMarks } from './guide-view'
import { html, inlineHtml } from './view'

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
