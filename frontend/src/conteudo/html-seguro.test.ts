// O HTML que o servidor monta do Markdown do acervo entra na página sem
// filtro (o `Html` de `ui/guia.tsx`), e os Trechos das Fichas são copiados de
// fontes de fora. Estes testes passam Markdown malicioso por `html` e
// `htmlEmLinha` e conferem que só sai o que o acervo de fato usa.
import { resolve } from 'node:path'
import { carregarAcervo } from '@tem-estudo/content'
import { guiaPorSlug } from '@tem-estudo/content/queries'
import { describe, expect, it } from 'vite-plus/test'
import { html, htmlEmLinha } from './vista'
import { vistaDoGuia } from './vista-guia'

describe('html do acervo', () => {
  it('tira o <script>, com o conteúdo', () => {
    expect(html('Antes <script>alert(1)</script> depois')).toBe(
      '<p>Antes  depois</p>\n',
    )
  })

  it('tira atributo de evento e o `style`', () => {
    expect(
      htmlEmLinha('<span onerror="alert(1)" style="color:red">oi</span>'),
    ).toBe('<span>oi</span>')
    expect(html('![x](https://exemplo.org/a.png "t")')).toBe('<p></p>\n')
    expect(htmlEmLinha('<img src=x onerror=alert(1)>')).toBe('')
  })

  it('tira `<iframe>` e `<style>` com o conteúdo', () => {
    expect(
      html(
        'a <iframe src="https://mal.example">fora</iframe> b <style>p{}</style>',
      ),
    ).toBe('<p>a  b </p>\n')
  })

  it('um link com `href` que não é http(s), âncora ou relativo vira texto', () => {
    expect(htmlEmLinha('[clique](javascript:alert(1))')).toBe('clique')
    expect(htmlEmLinha('<a href="JaVaScRiPt&colon;alert(1)">x</a>')).toBe('x')
    expect(htmlEmLinha('<a href="data:text/html,oi">x</a>')).toBe('x')
    expect(htmlEmLinha('<a href="//mal.example">x</a>')).toBe('x')
    // O GFM faz link de e-mail sozinho, como no título "Rel@cionamentos.com".
    expect(htmlEmLinha('*Rel@cionamentos.com*')).toBe(
      '<em>Rel@cionamentos.com</em>',
    )
  })

  it('link externo leva `rel="noopener noreferrer"`; âncora e caminho não', () => {
    expect(htmlEmLinha('[Pew](https://www.pewresearch.org/x)')).toBe(
      '<a href="https://www.pewresearch.org/x" rel="noopener noreferrer">Pew</a>',
    )
    expect(htmlEmLinha('<a href="https://a.example" rel="opener">a</a>')).toBe(
      '<a href="https://a.example" rel="noopener noreferrer">a</a>',
    )
    expect(htmlEmLinha('[outra](../estudos/costa-2018.md)')).toBe(
      '<a href="/estudos/costa-2018">outra</a>',
    )
    expect(htmlEmLinha('[acima](#limitacoes)')).toBe(
      '<a href="#limitacoes">acima</a>',
    )
  })

  it('classe só passa se for uma das que o app usa naquela tag', () => {
    expect(
      htmlEmLinha('<span class="nw x">a</span><mark class="ref">b</mark>'),
    ).toBe('<span class="nw">a</span><mark>b</mark>')
  })
})

describe('o acervo passa pelo filtro sem mudar', () => {
  const resultado = carregarAcervo(
    resolve(import.meta.dirname, '../../e2e/acervo'),
  )
  if (!resultado.ok) throw new Error('fixture do e2e inválida')
  const { acervo } = resultado
  const guia = (slug: string) => {
    const achado = guiaPorSlug(acervo, slug)
    if (!achado) throw new Error(`sem o Guia ${slug}`)
    return vistaDoGuia(achado, acervo)
  }

  it('o número-chave e a referência numerada, grudada na palavra', () => {
    expect(guia('onde-os-casais-se-conhecem').respostaHtml).toBe(
      '<p>No Brasil, <mark class="numero-chave">18% dos adultos jovens</mark> conheceram o parceiro por <span class="nw">app<a class="ref" href="#ficha-silva-2020-apps-brasil" aria-label="Ficha 1: Silva e Souza (2020): apps de namoro no Brasil">1</a>.</span> Os estudos divergem sobre o lugar mudar a relação, e o de melhor desenho diz que o app junta muitos <span class="nw">casais<a class="ref" href="#ficha-costa-2018-satisfacao" aria-label="Ficha 2: Costa (2018): satisfação e onde os casais se conheceram">2</a>.</span></p>\n',
    )
  })

  it('o `<details>` dobrável, com o `id` que guarda a dobra aberta', () => {
    expect(guia('onde-os-casais-se-conhecem').limitacoesHtml).toContain(
      '<details id="detalhe-capitais"><summary>Quais capitais</summary><p>São Paulo, Recife e Porto Alegre.</p>\n</details>',
    )
  })
})
