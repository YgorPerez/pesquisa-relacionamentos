// `/grifos` (#335) in a real Chrome, over the fixture content: the footer
// leads there, a Grifo's link lands on its sentence through the Text
// Fragment and the Guide paints it, "Tirar grifo" empties the list for good,
// and axe passes on the list and on the empty page. The grouping, the
// changed passage and the storage are `ui/highlight-list.test.tsx`'s; making
// a Grifo is `highlight.e2e.ts`'s, so here it is seeded as Grifar saves it.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { tap } from './touch'

const GUIDE = '/onde-conhecer-pessoas'
const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto'
const NOTE = 'Ver a amostra'

/** A Grifo as Grifar leaves it (`ui/highlight-layer.test.tsx` checks the
 * link). */
const SAVED = {
  id: 'grifo-e2e',
  path: GUIDE,
  pageTitle: 'Onde conhecer pessoas',
  link: `${GUIDE}#o-lugar-quase-nao-muda-a-relacao:~:text=A%20satisfa%C3%A7%C3%A3o%20de%20quem,conheceu%20pessoalmente%20fica%20perto`,
  text: SENTENCE,
  exact: SENTENCE,
  prefix: '',
  suffix: '',
  note: NOTE,
  changed: false,
  at: 1,
}

async function seed(page: Page) {
  await page.goto('/privacidade')
  await page.evaluate(
    (saved) =>
      localStorage.setItem('tem-estudo:highlights', JSON.stringify([saved])),
    SAVED,
  )
}

/** The text the browser paints as Grifos. */
const painted = (page: Page) =>
  page.evaluate(() =>
    [...(CSS.highlights.get('grifo') ?? [])]
      .map((range) => (range as Range).toString())
      .join(''),
  )

async function noViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}

test('the footer leads to the Grifo, and its link lands on the painted sentence', async ({
  page,
}) => {
  await seed(page)
  await page.reload({ waitUntil: 'networkidle' })
  await tap(page.getByRole('contentinfo').getByRole('link', { name: 'Grifos' }))
  await expect(page).toHaveURL('/grifos')
  await expect(
    page.getByRole('heading', { name: '1 grifo em 1 página' }),
  ).toBeVisible()
  await expect(page.getByText(NOTE)).toBeVisible()
  await noViolations(page)

  await tap(page.getByRole('link', { name: SENTENCE }))
  await expect(page).toHaveURL(/\/onde-conhecer-pessoas#o-lugar/)
  await expect(page.getByText(SENTENCE)).toBeInViewport()
  await expect.poll(() => painted(page)).toBe(SENTENCE)
})

test('"Tirar grifo" empties the list, and the Guide no longer paints it', async ({
  page,
}) => {
  await seed(page)
  await page.goto('/grifos', { waitUntil: 'networkidle' })
  await tap(page.getByRole('button', { name: /^Tirar grifo/ }))
  await expect(
    page.getByRole('heading', { name: 'Nenhum grifo ainda' }),
  ).toBeVisible()
  await noViolations(page)

  await page.reload({ waitUntil: 'networkidle' })
  await expect(
    page.getByRole('heading', { name: 'Nenhum grifo ainda' }),
  ).toBeVisible()
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  expect(await painted(page)).toBe('')
})

test.describe('Grifos without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the page says the Grifos need it, and shows no empty list', async ({
    page,
  }) => {
    await page.goto('/grifos')
    await expect(page.getByText(/precisa de JavaScript/)).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Nenhum grifo ainda' }),
    ).toHaveCount(0)
  })
})
