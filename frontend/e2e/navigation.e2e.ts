// The reference that circles the Fact sheet and the navigation between
// Guides (#28), over the fixture content (`e2e/library`): "Escolher
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

test.describe('reference that circles the Fact sheet', () => {
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

  test('tapping scrolls to the Fact sheet, draws the loop and the arrow and shows "voltar ao texto"', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const ref = answerRef(page)
    await tap(ref)

    const factSheet = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(factSheet).toBeInViewport()
    await expect(factSheet).toBeFocused()
    await expect(page).toHaveURL(GUIDE)

    const loop = factSheet.locator('svg.laco path')
    const arrow = factSheet.locator('svg.seta-laco path')
    await expect(loop).toHaveCSS('animation-duration', '0.9s')
    await expect(arrow).toHaveCSS('animation-duration', '0.5s')
    await expect(arrow).toHaveCSS('animation-delay', '0.7s')
    // The loop is redone at the Fact sheet's real size: the drawing's box is
    // its box.
    const box = await factSheet.evaluate((li: HTMLElement) => {
      const svg = li.querySelector('svg.laco')
      return {
        viewBox: svg?.getAttribute('viewBox'),
        w: li.offsetWidth + 20,
        h: li.offsetHeight + 20,
      }
    })
    expect(box.viewBox).toBe(`0 0 ${box.w} ${box.h}`)
    // Once the animation ends, the stroke is whole.
    await expect(loop).toHaveCSS('stroke-dashoffset', '0px')
    await expect(arrow).toHaveCSS('stroke-dashoffset', '0px')

    const back = factSheet.getByRole('button', { name: 'voltar ao texto' })
    await expect(back).toBeVisible()
    expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    // Only the tapped Fact sheet stays circled.
    await expect(page.locator('svg.laco')).toHaveCount(1)
  })

  test('with prefers-reduced-motion, the loop and the arrow show up ready', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(GUIDE)
    await tap(answerRef(page))
    const factSheet = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(factSheet.locator('svg.laco path')).toHaveCSS(
      'animation-name',
      'none',
    )
    await expect(factSheet.locator('svg.laco path')).toHaveCSS(
      'stroke-dashoffset',
      '0px',
    )
    await expect(factSheet.locator('svg.seta-laco path')).toHaveCSS(
      'animation-name',
      'none',
    )
    await expect(factSheet.locator('svg.seta-laco path')).toHaveCSS(
      'stroke-dashoffset',
      '0px',
    )
  })

  test('"voltar ao texto" returns the scroll and the focus to the number it came from', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    // Fact sheet 1 is cited in the short answer and again in the Myth: it
    // leaves from the Myth.
    const ref = page
      .locator('[data-slot="mito"]')
      .getByRole('link', { name: /^Ficha 1:/ })
    await tap(ref)
    const factSheet = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(factSheet).toBeInViewport()

    await tap(factSheet.getByRole('button', { name: 'voltar ao texto' }))
    await expect(ref).toBeFocused()
    await expect(ref).toBeInViewport()
    await expect(page.locator('svg.laco')).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'voltar ao texto' }),
    ).toHaveCount(0)
  })

  test('by keyboard, Enter on the number goes to the Fact sheet and back', async ({
    page,
  }) => {
    await page.goto(GUIDE)
    const ref = answerRef(page)
    await ref.focus()
    await page.keyboard.press('Enter')
    const factSheet = page.locator('#ficha-silva-2020-apps-brasil')
    await expect(factSheet).toBeFocused()
    await factSheet
      .getByRole('button', { name: 'voltar ao texto' })
      .press('Enter')
    await expect(ref).toBeFocused()
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
