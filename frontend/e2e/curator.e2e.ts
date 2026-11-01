// Reports and `/curadoria` (#560) in a real browser, against the real server and
// a database of its own. The e2e server has a blank `COMMENT_GITHUB_TOKEN`, so
// no notice reaches GitHub: each first report here is a notice that failed.
import { expect, test, type Browser, type Page } from '@playwright/test'
import { seed, signIn, unique } from './accounts'

const TIP = '/dicas/apps-como-complemento'
const TIP_TEXT = 'Use o app como complemento, não como o único caminho.'
/** `playwright.config.ts` gives the server this subject. */
const CURATOR_SUB = 'e2e-curator'

function seedComment(body: string) {
  seed((db) => {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO accounts (google_sub, nickname) VALUES (?, ?)')
      .run(unique(), `Autora ${unique()}`)
    db.prepare(
      'INSERT INTO public_comments (account_id, path, quote, body, created_at) VALUES (?, ?, ?, ?, ?)',
    ).run(lastInsertRowid, TIP, TIP_TEXT, body, Date.now())
  })
}

const entry = (page: Page, body: string) =>
  page.getByRole('article').filter({ hasText: body })

/** A page in a session of its own, for one more person. */
async function asAnother(browser: Browser, sub?: string) {
  const context = await browser.newContext()
  await signIn(context, sub)
  return { context, page: await context.newPage() }
}

async function report(page: Page, body: string) {
  await page.goto(TIP, { waitUntil: 'networkidle' })
  await entry(page, body).getByRole('button', { name: 'Denunciar' }).click()
  await entry(page, body)
    .getByRole('button', { name: 'Confirmar denúncia' })
    .click()
}

test('three accounts hide a comment, and the curator restores it for good and then removes it', async ({
  page,
  context,
  browser,
}) => {
  const body = `Denunciável ${unique()}`
  seedComment(body)

  await signIn(context)
  await report(page, body)
  await expect(entry(page, body)).toContainText(
    'Você denunciou este comentário.',
  )
  await page.reload({ waitUntil: 'networkidle' })
  await expect(
    entry(page, body).getByRole('button', { name: 'Denunciar' }),
  ).toHaveCount(0)

  for (const round of [1, 2]) {
    const another = await asAnother(browser)
    await report(another.page, body)
    if (round === 1)
      await expect(entry(another.page, body)).toContainText('Você denunciou')
    else await expect(entry(another.page, body)).toHaveCount(0)
    await another.context.close()
  }

  const curator = await asAnother(browser, CURATOR_SUB)
  const response = await curator.page.goto('/curadoria', {
    waitUntil: 'networkidle',
  })
  expect(response?.headers()['cache-control']).toContain('no-store')
  expect(await response?.text()).not.toContain(CURATOR_SUB)
  const card = entry(curator.page, body)
  await expect(card).toContainText('Oculto')
  await expect(card).toContainText('3 denúncias')
  await expect(card).toContainText('O aviso não saiu')

  await card.getByRole('button', { name: 'Restaurar' }).click()
  await expect(card).not.toContainText('3 denúncias')
  await page.reload({ waitUntil: 'networkidle' })
  await expect(entry(page, body)).toBeVisible()

  await card.getByRole('button', { name: 'Remover' }).click()
  await card.getByRole('button', { name: 'Confirmar remoção' }).click()
  await expect(card).toHaveCount(0)
  await page.reload({ waitUntil: 'networkidle' })
  await expect(entry(page, body)).toHaveCount(0)
  await curator.context.close()
})

test('the curator reads the versions an edit replaced', async ({ browser }) => {
  const body = `Atual ${unique()}`
  const earlier = `Antiga ${unique()}`
  seedComment(body)
  seed((db) => {
    const { id } = db
      .prepare('SELECT id FROM public_comments WHERE body = ?')
      .get(body)!
    db.prepare(
      'INSERT INTO public_comment_history (comment_id, body, replaced_at) VALUES (?, ?, ?)',
    ).run(id!, earlier, Date.now())
    db.prepare('UPDATE public_comments SET edited_at = ? WHERE id = ?').run(
      Date.now(),
      id!,
    )
  })
  const curator = await asAnother(browser, CURATOR_SUB)
  await curator.page.goto('/curadoria', { waitUntil: 'networkidle' })
  const card = entry(curator.page, body)
  await card.getByRole('button', { name: 'Versões anteriores (1)' }).click()
  await expect(card).toContainText(earlier)
  await curator.context.close()
})

test('nobody else reads the desk or decides anything', async ({
  page,
  context,
}) => {
  const body = `Só do curador ${unique()}`
  seedComment(body)
  const denied = async () => {
    const response = await page.goto('/curadoria', {
      waitUntil: 'networkidle',
    })
    expect(await response?.text()).not.toContain(body)
    await expect(page.getByText(/só do curador/)).toBeVisible()
    await expect(page.getByRole('article')).toHaveCount(0)
    await expect(page.getByRole('main').getByRole('button')).toHaveCount(0)
  }
  await denied()
  await signIn(context)
  await denied()
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the curator reads the desk, with no button that would do nothing', async ({
    page,
    context,
  }) => {
    const body = `Sem JS ${unique()}`
    seedComment(body)
    await signIn(context, CURATOR_SUB)
    await page.goto('/curadoria')
    await expect(entry(page, body)).toBeVisible()
    await expect(entry(page, body).getByRole('button')).toHaveCount(0)
  })
})
