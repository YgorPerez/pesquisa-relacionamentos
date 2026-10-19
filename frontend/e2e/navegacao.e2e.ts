// A referência que circula a Ficha e a navegação entre Guias (#28), sobre o
// conteúdo de fixture (`e2e/acervo`).
import { expect, test, type Locator, type Page } from '@playwright/test'
import { tocar } from './toque'

const GUIA = '/onde-conhecer-pessoas/onde-os-casais-se-conhecem'
const OUTRO = '/onde-conhecer-pessoas/app-ou-presencial'

const refDaResposta = (page: Page) =>
  page
    .getByRole('region', { name: 'Resposta curta' })
    .getByRole('link', { name: /^Ficha 1:/ })

/** O elemento que recebe um toque a `dx`, `dy` px do centro do alvo. */
const tocadoEm = (alvo: Locator, dx: number, dy: number) =>
  alvo.evaluate(
    (el, [x, y]) => {
      const r = el.getBoundingClientRect()
      return (
        document.elementFromPoint(
          r.left + r.width / 2 + x,
          r.top + r.height / 2 + y,
        ) === el
      )
    },
    [dx, dy] as const,
  )

test.describe('referência que circula a Ficha', () => {
  test('o número fica no anel, grudado à palavra, com área de toque de 44px', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const ref = refDaResposta(page)
    await ref.scrollIntoViewIfNeeded()
    await expect(ref.locator('xpath=..')).toHaveClass('nw')
    await expect(ref.locator('xpath=..')).toHaveText('app1.')
    for (const [dx, dy] of [
      [0, -21],
      [0, 21],
      [-21, 0],
      [21, 0],
    ] as const) {
      expect(await tocadoEm(ref, dx, dy)).toBe(true)
    }
  })

  test('tocar rola até a Ficha, desenha o laço e a seta e mostra "voltar ao texto"', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const ref = refDaResposta(page)
    await tocar(ref)

    const ficha = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(ficha).toBeInViewport()
    await expect(ficha).toBeFocused()
    await expect(page).toHaveURL(GUIA)

    const laco = ficha.locator('svg.laco path')
    const seta = ficha.locator('svg.seta-laco path')
    await expect(laco).toHaveCSS('animation-duration', '0.9s')
    await expect(seta).toHaveCSS('animation-duration', '0.5s')
    await expect(seta).toHaveCSS('animation-delay', '0.7s')
    // O laço é refeito no tamanho real da Ficha: a caixa do desenho é a dela.
    const caixa = await ficha.evaluate((li: HTMLElement) => {
      const svg = li.querySelector('svg.laco')
      return {
        viewBox: svg?.getAttribute('viewBox'),
        w: li.offsetWidth + 20,
        h: li.offsetHeight + 20,
      }
    })
    expect(caixa.viewBox).toBe(`0 0 ${caixa.w} ${caixa.h}`)
    // Terminada a animação, o traço está inteiro.
    await expect(laco).toHaveCSS('stroke-dashoffset', '0px')
    await expect(seta).toHaveCSS('stroke-dashoffset', '0px')

    const voltar = ficha.getByRole('button', { name: 'voltar ao texto' })
    await expect(voltar).toBeVisible()
    expect((await voltar.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    // Só a Ficha tocada fica circulada.
    await expect(page.locator('svg.laco')).toHaveCount(1)
  })

  test('com prefers-reduced-motion, laço e seta aparecem prontos', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(GUIA)
    await tocar(refDaResposta(page))
    const ficha = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(ficha.locator('svg.laco path')).toHaveCSS(
      'animation-name',
      'none',
    )
    await expect(ficha.locator('svg.laco path')).toHaveCSS(
      'stroke-dashoffset',
      '0px',
    )
    await expect(ficha.locator('svg.seta-laco path')).toHaveCSS(
      'animation-name',
      'none',
    )
    await expect(ficha.locator('svg.seta-laco path')).toHaveCSS(
      'stroke-dashoffset',
      '0px',
    )
  })

  test('"voltar ao texto" devolve a rolagem e o foco ao número de onde saiu', async ({
    page,
  }) => {
    await page.goto(GUIA)
    // A Ficha 1 é citada na resposta curta e de novo no Mito: sai do Mito.
    const mito = page.getByRole('region', {
      name: 'O que circula por aí e não se sustenta',
    })
    const ref = mito.getByRole('link', { name: /^Ficha 1:/ })
    await tocar(ref)
    const ficha = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(ficha).toBeInViewport()

    await tocar(ficha.getByRole('button', { name: 'voltar ao texto' }))
    await expect(ref).toBeFocused()
    await expect(ref).toBeInViewport()
    await expect(page.locator('svg.laco')).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'voltar ao texto' }),
    ).toHaveCount(0)
  })

  test('pelo teclado, Enter no número leva à Ficha e volta', async ({
    page,
  }) => {
    await page.goto(GUIA)
    const ref = refDaResposta(page)
    await ref.focus()
    await page.keyboard.press('Enter')
    const ficha = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(ficha).toBeFocused()
    await ficha.getByRole('button', { name: 'voltar ao texto' }).press('Enter')
    await expect(ref).toBeFocused()
  })
})

test.describe('navegação entre Guias', () => {
  test('vindo de outro Guia, "Voltar para <Pergunta>" faz o mesmo que o voltar do navegador', async ({
    page,
  }) => {
    await page.goto(OUTRO)
    await expect(
      page.getByRole('button', { name: /^Voltar para/ }),
    ).toHaveCount(0)

    await page.goto(GUIA)
    await tocar(
      page
        .getByRole('region', { name: 'Perguntas relacionadas' })
        .getByRole('link', { name: /App ou presencial/ }),
    )
    await expect(page).toHaveURL(OUTRO)
    const voltar = page.getByRole('button', {
      name: 'Voltar para Onde os casais se conhecem hoje?',
    })
    await expect(voltar).toBeVisible()
    expect((await voltar.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tocar(voltar)
    await expect(page).toHaveURL(GUIA)
    // Foi um passo para trás no histórico, não uma entrada nova.
    await page.goForward()
    await expect(page).toHaveURL(OUTRO)
  })

  for (const como of ['o botão', 'o voltar do navegador'] as const) {
    test(`voltar por ${como} restaura a rolagem e as seções abertas`, async ({
      page,
    }) => {
      await page.goto(GUIA)
      const detalhe = page.locator('details#detalhe-capitais')
      await tocar(detalhe.locator('summary'))
      await expect(detalhe).toHaveAttribute('open', '')

      const relacionada = page
        .getByRole('region', { name: 'Perguntas relacionadas' })
        .getByRole('link', { name: /App ou presencial/ })
      await relacionada.scrollIntoViewIfNeeded()
      const antes = await page.evaluate(() => scrollY)
      expect(antes).toBeGreaterThan(300)
      await tocar(relacionada)
      await expect(page).toHaveURL(OUTRO)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'App ou presencial, onde tenho mais chance?',
      )

      if (como === 'o botão')
        await tocar(page.getByRole('button', { name: /^Voltar para/ }))
      else await page.goBack()

      await expect(page).toHaveURL(GUIA)
      await expect(page.locator('details#detalhe-capitais')).toHaveAttribute(
        'open',
        '',
      )
      await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeGreaterThan(antes - 5)
      expect(await page.evaluate(() => scrollY)).toBeLessThan(antes + 5)
      await expect(relacionada).toBeInViewport()
    })
  }
})
