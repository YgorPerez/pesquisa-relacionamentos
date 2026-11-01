// Comentário público (#559) in a real browser, against the real server and a
// database of its own (`playwright.config.ts`). The account and its session
// are written straight to the database: Google is `platform/accounts.test.ts`'s.
// A Tip, so the list does not show up among a Guide's headings in another spec.
import { createHash, randomBytes } from 'node:crypto'
import { expect, test, type BrowserContext, type Page } from '@playwright/test'
import { openDatabase } from '../src/platform/database.ts'

const TIP = '/dicas/apps-como-complemento'
const TIP_TEXT = 'Use o app como complemento, não como o único caminho.'
const MISSING = 'Uma frase que saiu da Dica.'
const LIST = 'Comentários públicos'

const unique = () => randomBytes(6).toString('hex')

/** A database connection for the test to seed with. */
function seed<T>(write: (db: ReturnType<typeof openDatabase>) => T): T {
  const db = openDatabase(process.env.E2E_DATABASE_PATH)
  try {
    return write(db)
  } finally {
    db.close()
  }
}

/** A finished account with a live session in `context`. */
async function signIn(context: BrowserContext) {
  const token = randomBytes(32).toString('base64url')
  const nickname = `Leitora ${unique()}`
  seed((db) => {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO accounts (google_sub, nickname) VALUES (?, ?)')
      .run(unique(), nickname)
    db.prepare('INSERT INTO account_sessions VALUES (?, ?, ?)').run(
      createHash('sha256').update(token).digest('base64url'),
      lastInsertRowid,
      Date.now() + 3_600_000,
    )
  })
  await context.addCookies([
    {
      name: 'local-session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
  return nickname
}

/** Writes a comment by a new account, with no browser involved. */
function seedComment(quote: string, body: string, edited = false) {
  return seed((db) => {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO accounts (google_sub, nickname) VALUES (?, ?)')
      .run(unique(), `Autora ${unique()}`)
    db.prepare(
      'INSERT INTO public_comments (account_id, path, quote, body, created_at, edited_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(lastInsertRowid, TIP, quote, body, Date.now(), edited ? 1 : null)
  })
}

/** Selects the Tip's text and presses "Comentar". */
async function openComment(page: Page, touch: boolean) {
  await page.goto(TIP, { waitUntil: 'networkidle' })
  const text = page.getByRole('heading', { name: TIP_TEXT, level: 1 })
  await text.evaluate(
    (el, pointerType) => {
      const press = (type: string) =>
        el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType }))
      if (pointerType) press('pointerdown')
      const range = document.createRange()
      range.selectNodeContents(el)
      document.getSelection()!.removeAllRanges()
      document.getSelection()!.addRange(range)
      if (pointerType) press('pointerup')
    },
    touch ? 'touch' : '',
  )
  const popover = page.getByRole('dialog', { name: 'Trecho selecionado' })
  await popover.getByRole('button', { name: 'Comentar' }).click()
  return touch ? page.getByRole('dialog', { name: 'Comentar' }) : popover
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('anyone reads the list, untrusted text stays text and a gone passage says so', async ({
    page,
  }) => {
    const markup = `<img src=x onerror=alert(1)> ${unique()}`
    seedComment(MISSING, markup, true)
    await page.goto(TIP)
    const entry = page.getByRole('article').filter({ hasText: markup })
    await expect(page.getByRole('heading', { name: LIST })).toBeVisible()
    await expect(entry).toContainText(MISSING)
    await expect(entry).toContainText('este trecho mudou')
    await expect(entry).toContainText('editado')
    await expect(entry.locator('img')).toHaveCount(0)
    await expect(entry.getByRole('button')).toHaveCount(0)
  })

  test('a signed-in reader gets no button that needs JavaScript', async ({
    page,
    context,
  }) => {
    const body = `Sem JS ${unique()}`
    seedComment(TIP_TEXT, body)
    await signIn(context)
    await page.goto(TIP)
    const entry = page.getByRole('article').filter({ hasText: body })
    await expect(entry).toBeVisible()
    await expect(entry).not.toContainText('este trecho mudou')
    await expect(entry.getByRole('button')).toHaveCount(0)
  })
})

test('an anonymous reader still only has the private form', async ({
  page,
  isMobile,
}) => {
  const form = await openComment(page, isMobile)
  await expect(form.getByLabel('Seu comentário')).toBeVisible()
  await expect(form.getByRole('radio', { name: 'Público' })).toHaveCount(0)
})

test('a signed-in reader publishes from the selection, marks the passage, edits, replies and deletes', async ({
  page,
  context,
  isMobile,
}) => {
  const nickname = await signIn(context)
  const body = `Minha dúvida ${unique()}`
  const form = await openComment(page, isMobile)
  await form.getByRole('radio', { name: 'Público' }).click()
  await form.getByLabel('Seu comentário público').fill(body)
  await form.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByText('Comentário publicado.')).toBeVisible()

  const entry = page
    .getByRole('article')
    .filter({ hasText: nickname })
    .filter({ hasText: body })
  await expect(entry).toBeVisible()
  await expect(entry).not.toContainText('este trecho mudou')
  await expect
    .poll(() =>
      page.evaluate(() => CSS.highlights.get('comentario-publico')?.size ?? 0),
    )
    .toBeGreaterThan(0)

  await entry.getByRole('button', { name: 'Editar' }).click()
  const revised = `${body} revista`
  await entry.getByLabel('Seu comentário público').fill(revised)
  await entry.getByRole('button', { name: 'Salvar' }).click()
  const edited = page.getByRole('article').filter({ hasText: revised })
  await expect(edited).toContainText('editado')

  await edited.getByRole('button', { name: 'Responder' }).click()
  const reply = `Resposta ${unique()}`
  await edited.getByLabel('Seu comentário público').fill(reply)
  await edited.getByRole('button', { name: 'Publicar' }).click()
  const replied = page.getByRole('article').filter({ hasText: reply })
  await expect(replied).toBeVisible()
  await expect(replied.getByRole('button', { name: 'Responder' })).toHaveCount(
    0,
  )

  await page.reload()
  await expect(replied).toBeVisible()
  await edited.getByRole('button', { name: 'Apagar' }).click()
  await expect(edited).toHaveCount(0)
  await expect(replied).toHaveCount(0)
})
