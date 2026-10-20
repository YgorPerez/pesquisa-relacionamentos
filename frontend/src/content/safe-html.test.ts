// The HTML the server builds from the library's Markdown goes into the page
// unfiltered (`ui/guide.tsx`'s `Html`), and the Fact sheets' Excerpts are
// copied from outside sources. These tests pass malicious Markdown through
// `html` and `inlineHtml` and check that only what the library actually
// uses comes out.
import { resolve } from 'node:path'
import { loadLibrary } from '@tem-estudo/content'
import { guideBySlug } from '@tem-estudo/content/queries'
import { describe, expect, it } from 'vite-plus/test'
import { html, inlineHtml } from './view'
import { guideView } from './guide-view'

describe('the library HTML', () => {
  it('removes <script>, with its content', () => {
    expect(html('Antes <script>alert(1)</script> depois')).toBe(
      '<p>Antes  depois</p>\n',
    )
  })

  it('removes event attributes and `style`', () => {
    expect(
      inlineHtml('<span onerror="alert(1)" style="color:red">oi</span>'),
    ).toBe('<span>oi</span>')
    expect(html('![x](https://exemplo.org/a.png "t")')).toBe('<p></p>\n')
    expect(inlineHtml('<img src=x onerror=alert(1)>')).toBe('')
  })

  it('removes `<iframe>` and `<style>` with their content', () => {
    expect(
      html(
        'a <iframe src="https://mal.example">fora</iframe> b <style>p{}</style>',
      ),
    ).toBe('<p>a  b </p>\n')
  })

  it('a link whose `href` is not http(s), an anchor or relative becomes text', () => {
    expect(inlineHtml('[clique](javascript:alert(1))')).toBe('clique')
    expect(inlineHtml('<a href="JaVaScRiPt&colon;alert(1)">x</a>')).toBe('x')
    expect(inlineHtml('<a href="data:text/html,oi">x</a>')).toBe('x')
    expect(inlineHtml('<a href="//mal.example">x</a>')).toBe('x')
    // GFM links an e-mail on its own, as in the title "Rel@cionamentos.com".
    expect(inlineHtml('*Rel@cionamentos.com*')).toBe(
      '<em>Rel@cionamentos.com</em>',
    )
  })

  it('an external link gets `rel="noopener noreferrer"`; an anchor and a path do not', () => {
    expect(inlineHtml('[Pew](https://www.pewresearch.org/x)')).toBe(
      '<a href="https://www.pewresearch.org/x" rel="noopener noreferrer">Pew</a>',
    )
    expect(inlineHtml('<a href="https://a.example" rel="opener">a</a>')).toBe(
      '<a href="https://a.example" rel="noopener noreferrer">a</a>',
    )
    expect(inlineHtml('[outra](../studies/costa-2018.md)')).toBe(
      '<a href="/estudos/costa-2018">outra</a>',
    )
    expect(inlineHtml('[acima](#limitacoes)')).toBe(
      '<a href="#limitacoes">acima</a>',
    )
  })

  it('a class only passes if it is one the app uses on that tag', () => {
    expect(
      inlineHtml('<span class="nw x">a</span><mark class="ref">b</mark>'),
    ).toBe('<span class="nw">a</span><mark>b</mark>')
  })
})

describe('the library goes through the filter unchanged', () => {
  const result = loadLibrary(resolve(import.meta.dirname, '../../e2e/library'))
  if (!result.ok) throw new Error('invalid e2e fixture')
  const { library } = result
  const guide = (slug: string) => {
    const found = guideBySlug(library, slug)
    if (!found) throw new Error(`no Guide ${slug}`)
    return guideView(found, library)
  }

  it('the key number and the numbered reference, glued to the word', () => {
    expect(guide('onde-os-casais-se-conhecem').answerHtml).toBe(
      '<p>No Brasil, <mark class="numero-chave">18% dos adultos jovens</mark> conheceram o parceiro por <span class="nw">app<a class="ref" href="#ficha-silva-2020-apps-brasil" aria-label="Ficha 1: Silva e Souza (2020): apps de namoro no Brasil">1</a>.</span> Os estudos divergem sobre o lugar mudar a relação, e o de melhor desenho diz que o app junta muitos <span class="nw">casais<a class="ref" href="#ficha-costa-2018-satisfacao" aria-label="Ficha 2: Costa (2018): satisfação e onde os casais se conheceram">2</a>.</span></p>\n',
    )
  })

  it('the collapsible `<details>`, with the `id` that keeps the fold open', () => {
    expect(guide('onde-os-casais-se-conhecem').limitationsHtml).toContain(
      '<details id="detalhe-capitais"><summary>Quais capitais</summary><p>São Paulo, Recife e Porto Alegre.</p>\n</details>',
    )
  })
})
