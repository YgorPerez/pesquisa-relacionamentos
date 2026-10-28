// "Seus trechos" (`/trechos`, #335, #347) in a real Chrome, over the fixture
// content: the footer leads there, a Grifo's link and a sent Comentário's
// land on their sentence through the Text Fragment and the Guide paints the
// Grifo, "Tirar grifo" and "Tirar da lista" empty their sections for good,
// the old `/grifos` leads here, and axe passes on the lists and on the empty
// page. The grouping, the changed passage and the storage are
// `ui/highlight-layer.test.tsx`'s; making a Grifo is `highlight.e2e.ts`'s
// and sending a Comentário `selection-comment.e2e.ts`'s, so here both are
// seeded as they are saved.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { tap } from './touch'

const GUIDE = '/onde-conhecer-pessoas'
const SENTENCE =
  'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto'
const NOTE = 'Ver a amostra'
const LINK = `${GUIDE}#o-lugar-quase-nao-muda-a-relacao:~:text=A%20satisfa%C3%A7%C3%A3o%20de%20quem,conheceu%20pessoalmente%20fica%20perto`

/** A Grifo as Grifar leaves it (`ui/highlight-layer.test.tsx` checks the
 * link). */
const SAVED = {
  id: 'grifo-e2e',
  path: GUIDE,
  pageTitle: 'Onde conhecer pessoas',
  link: LINK,
  text: SENTENCE,
  exact: SENTENCE,
  prefix: '',
  suffix: '',
  note: NOTE,
  changed: false,
  at: 1,
}

/** A Comentário as Comentar leaves it. */
const SENT = {
  ...SAVED,
  id: 'comentario-e2e',
  kind: 'wrong',
  comment: 'O número não bate.',
  issue: 57,
  at: Date.parse('2026-10-20T15:00:00Z'),
}

async function seed(page: Page) {
  await page.goto('/privacidade')
  await page.evaluate(
    ([saved, sent]) => {
      localStorage.setItem('tem-estudo:highlights', JSON.stringify([saved]))
      localStorage.setItem('tem-estudo:sent-comments', JSON.stringify([sent]))
    },
    [SAVED, SENT] as const,
  )
}

/** The text the browser paints as Grifos. */
const painted = (page: Page) =>
  page.evaluate(() =>
    [...(CSS.highlights.get('grifo') ?? [])]
      .map((range) => (range as Range).toString())
      .join(''),
  )

const highlightsRegion = (page: Page) =>
  page.getByRole('region', { name: 'Grifos' })
const commentsRegion = (page: Page) =>
  page.getByRole('region', { name: 'Comentários' })

async function noViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()
  expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
}

test('a changed status stays unread below the fold until its comment enters the viewport', async ({
  page,
}) => {
  await seed(page)
  await page.evaluate(
    ([saved, sent]) => {
      localStorage.setItem(
        'tem-estudo:highlights',
        JSON.stringify(
          Array.from({ length: 20 }, (_, i) => ({
            ...saved,
            id: `saved-${i}`,
          })),
        ),
      )
      localStorage.setItem(
        'tem-estudo:sent-comments',
        JSON.stringify([
          { ...sent, status: 'corrected', seenStatus: 'received' },
        ]),
      )
    },
    [SAVED, SENT] as const,
  )
  await page.goto('/trechos', { waitUntil: 'networkidle' })
  const comment = page
    .getByRole('region', { name: 'Comentários' })
    .getByRole('listitem')
  await expect(comment).not.toBeInViewport()
  const seenStatus = () =>
    page.evaluate(
      () =>
        (
          JSON.parse(
            localStorage.getItem('tem-estudo:sent-comments')!,
          ) as Array<{ seenStatus: string }>
        )[0]?.seenStatus,
    )
  expect(await seenStatus()).toBe('received')
  await page.goto('/privacidade')
  await page.goto('/trechos', { waitUntil: 'networkidle' })
  await expect(comment.getByText('Status atualizado')).toBeVisible()
  await comment.scrollIntoViewIfNeeded()
  await expect(comment).toBeInViewport()
  await expect.poll(seenStatus).toBe('corrected')
})

test('the footer leads to Seus trechos, and the Grifo’s link lands on the painted sentence', async ({
  page,
}) => {
  await seed(page)
  await page.reload({ waitUntil: 'networkidle' })
  await tap(
    page.getByRole('contentinfo').getByRole('link', { name: 'Seus trechos' }),
  )
  await expect(page).toHaveURL('/trechos')
  await expect(
    highlightsRegion(page).getByText('1 grifo em 1 página'),
  ).toBeVisible()
  await expect(highlightsRegion(page).getByText(NOTE)).toBeVisible()
  await expect(
    commentsRegion(page).getByText('1 comentário enviado'),
  ).toBeVisible()
  await expect(commentsRegion(page).getByText(SENT.comment)).toBeVisible()
  await noViolations(page)

  await tap(highlightsRegion(page).getByRole('link', { name: SENTENCE }))
  await expect(page).toHaveURL(/\/onde-conhecer-pessoas#o-lugar/)
  await expect(page.getByText(SENTENCE)).toBeInViewport()
  await expect.poll(() => painted(page)).toBe(SENTENCE)
})

test('a sent Comentário’s quote lands on its sentence', async ({ page }) => {
  await seed(page)
  await page.goto('/trechos', { waitUntil: 'networkidle' })
  await tap(commentsRegion(page).getByRole('link', { name: SENTENCE }))
  await expect(page).toHaveURL(/\/onde-conhecer-pessoas#o-lugar/)
  await expect(page.getByText(SENTENCE)).toBeInViewport()
})

test('"Tirar grifo" and "Tirar da lista" empty their sections, and the Guide no longer paints the Grifo', async ({
  page,
}) => {
  await seed(page)
  await page.goto('/trechos', { waitUntil: 'networkidle' })
  await tap(page.getByRole('button', { name: /^Tirar grifo/ }))
  await tap(page.getByRole('button', { name: /^Tirar da lista/ }))
  await expect(
    highlightsRegion(page).getByText(/^Nenhum grifo ainda/),
  ).toBeVisible()
  await expect(
    commentsRegion(page).getByText(/^Nenhum comentário enviado/),
  ).toBeVisible()
  await noViolations(page)

  await page.reload({ waitUntil: 'networkidle' })
  await expect(
    highlightsRegion(page).getByText(/^Nenhum grifo ainda/),
  ).toBeVisible()
  await expect(
    commentsRegion(page).getByText(/^Nenhum comentário enviado/),
  ).toBeVisible()
  await page.goto(GUIDE, { waitUntil: 'networkidle' })
  expect(await painted(page)).toBe('')
})

test.describe('Seus trechos without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the old /grifos leads here, the page says it needs JavaScript, and shows no empty list', async ({
    page,
  }) => {
    await page.goto('/grifos')
    await expect(page).toHaveURL('/trechos')
    await expect(page.getByText(/precisa de JavaScript/)).toBeVisible()
    await expect(page.getByText(/^Nenhum grifo ainda/)).toHaveCount(0)
    await expect(page.getByText(/^Nenhum comentário enviado/)).toHaveCount(0)
  })
})
