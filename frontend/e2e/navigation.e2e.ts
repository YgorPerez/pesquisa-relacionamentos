// The reference ring that shows what it cites (#467) and the navigation
// between Guides (#28), over the fixture content (`e2e/library`): "Escolher
// parceiro" links to a Question of "Onde conhecer pessoas".
import { expect, test, type Locator, type Page } from '@playwright/test'
import { tap } from './touch'

const GUIDE = '/onde-conhecer-pessoas'
const FIRST = 'Onde os casais se conhecem hoje?'
const OTHER = '/escolher-parceiro'

const firstQuestion = (page: Page) =>
  page.getByRole('region', { name: FIRST, exact: true })

const answerRef = (page: Page) =>
  firstQuestion(page).getByRole('link', { name: /^Ficha 1:/ })

/** The Guide, hydrated before the first tap: before it, the ring is only
 * the link to the list. */
const hydrated = (page: Page) => page.goto(GUIDE, { waitUntil: 'networkidle' })

/** The text the page paints as cited (`::highlight(citacao)`), or `''`. */
const cited = (page: Page) =>
  page.evaluate(() =>
    [...((CSS.highlights.get('citacao') as Set<Range> | undefined) ?? [])]
      .map((range) => range.toString())
      .join(''),
  )

/** Whether the element receiving a tap at `dx`, `dy` px from the target's
 * center is the target. */
const tappedAt = (target: Locator, dx: number, dy: number) =>
  target.evaluate(
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

/** Whether the last letter of the text before the target, in the same
 * paragraph, is on the same line as it: the reference number does not break
 * away from the word. */
const onTheWordLine = (target: Locator) =>
  target.evaluate((el) => {
    const block = el.closest('p, li') ?? el.parentElement
    if (!block) return false
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
    let before: Text | null = null
    while (walker.nextNode()) {
      const text = walker.currentNode as Text
      if (el.contains(text)) break
      if (text.data.trim()) before = text
    }
    if (!before) return false
    const end = before.data.trimEnd().length
    const letter = document.createRange()
    letter.setStart(before, end - 1)
    letter.setEnd(before, end)
    const a = letter.getBoundingClientRect()
    const b = el.getBoundingClientRect()
    return a.bottom > b.top && a.top < b.bottom
  })

test.describe('reference ring', () => {
  test('the number sits in the ring, stuck to the word, with a 44px touch area', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const ref = answerRef(page)
    await ref.scrollIntoViewIfNeeded()
    expect(await onTheWordLine(ref)).toBe(true)
    for (const [dx, dy] of [
      [0, -21],
      [0, 21],
      [-21, 0],
      [21, 0],
    ] as const) {
      expect(await tappedAt(ref, dx, dy)).toBe(true)
    }
  })

  test('a tap marks the cited text and opens the Fact sheet next to the ring, without leaving the text', async ({
    page,
  }) => {
    await hydrated(page)
    const ref = answerRef(page)
    await tap(ref)

    const popover = page.getByRole('dialog', { name: /^Ficha 1:/ })
    await expect(popover).toBeVisible()
    await expect(popover).toContainText('Silva e Souza (2020)')
    await expect(
      popover.getByRole('link', { name: 'abrir Ficha' }),
    ).toHaveAttribute('href', '/estudos/silva-2020-apps-brasil')
    expect(await cited(page)).toBe(
      'No Brasil, 18% dos adultos jovens conheceram o parceiro por app',
    )
    // The ring no longer goes to the list.
    await expect(page).toHaveURL(GUIDE)
    await expect(
      page.locator('#ficha-silva-2020-apps-brasil'),
    ).not.toBeInViewport()
    await expect(ref).toBeInViewport()

    // A tap outside closes it, and the mark goes with it.
    await tap(page.getByRole('heading', { level: 1 }))
    await expect(popover).toBeHidden()
    expect(await cited(page)).toBe('')

    // The next ring of the answer cites from the first one on.
    await tap(firstQuestion(page).getByRole('link', { name: /^Ficha 2:/ }))
    await expect(page.getByRole('dialog', { name: /^Ficha 2:/ })).toBeVisible()
    expect(await cited(page)).toBe(
      'Os estudos divergem sobre o lugar mudar a relação, e o de melhor desenho diz que o app junta muitos casais',
    )
  })

  test('with a mouse, the pointer over the ring marks the text, without the popover', async ({
    page,
  }) => {
    test.skip(Boolean(test.info().project.use.hasTouch), 'no pointer to hover')
    await hydrated(page)
    await answerRef(page).hover()
    await expect.poll(() => cited(page)).not.toBe('')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await page.mouse.move(0, 0)
    await expect.poll(() => cited(page)).toBe('')
  })

  test('by keyboard, the focus marks the text, Enter opens the popover and Escape closes it', async ({
    page,
  }) => {
    await hydrated(page)
    const ref = answerRef(page)
    await ref.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(ref).toBeFocused()
    await expect.poll(() => cited(page)).not.toBe('')
    await page.keyboard.press('Enter')
    const popover = page.getByRole('dialog', { name: /^Ficha 1:/ })
    await expect(popover).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(popover).toBeHidden()
  })
})

test.describe('reference ring without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the ring leads to the Fact sheet in the list at the end', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await answerRef(page).click()
    await expect(page).toHaveURL(`${GUIDE}#ficha-silva-2020-apps-brasil`)
    await expect(page.locator('#ficha-silva-2020-apps-brasil')).toBeInViewport()
  })
})

test.describe('navigation between Guides', () => {
  const elsewhere = (page: Page) =>
    page
      .getByRole('region', { name: 'Perguntas de outros Temas' })
      .getByRole('link', { name: /Onde os casais se conhecem/ })

  test('coming from another Guide, "Voltar para <Guia>" does the same as the browser back', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    await expect(
      page.getByRole('button', { name: /^Voltar para/ }),
    ).toHaveCount(0)

    await page.goto(OTHER)
    await tap(elsewhere(page))
    await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
    await expect(
      firstQuestion(page).getByRole('heading', { level: 3 }),
    ).toBeInViewport()
    const back = page.getByRole('button', {
      name: 'Voltar para Escolher parceiro',
    })
    await expect(back).toBeVisible()
    expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await tap(back)
    await expect(page).toHaveURL(OTHER)
    // It was a step back in the history, not a new entry.
    await page.goForward()
    await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
  })

  for (const how of ['the button', 'the browser back'] as const) {
    test(`going back by ${how} restores the scroll and the open sections`, async ({
      page,
    }) => {
      await page.goto(OTHER)
      const detail = page.locator('details#detalhe-amostra')
      await tap(detail.locator('summary'))
      await expect(detail).toHaveAttribute('open', '')

      const related = elsewhere(page)
      await related.scrollIntoViewIfNeeded()
      const before = await page.evaluate(() => scrollY)
      expect(before).toBeGreaterThan(300)
      await tap(related)
      await expect(page).toHaveURL(`${GUIDE}#onde-os-casais-se-conhecem`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Onde conhecer pessoas',
      )

      if (how === 'the button')
        await tap(page.getByRole('button', { name: /^Voltar para/ }))
      else await page.goBack()

      await expect(page).toHaveURL(OTHER)
      await expect(page.locator('details#detalhe-amostra')).toHaveAttribute(
        'open',
        '',
      )
      await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeGreaterThan(before - 5)
      expect(await page.evaluate(() => scrollY)).toBeLessThan(before + 5)
      await expect(related).toBeInViewport()
    })
  }
})
