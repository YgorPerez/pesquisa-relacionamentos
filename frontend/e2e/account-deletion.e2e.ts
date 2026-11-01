import { expect, test } from '@playwright/test'
import { seed, signIn, unique } from './accounts'

const signedInAs = (googleSub: string) =>
  seed((db) =>
    db.prepare('SELECT * FROM accounts WHERE google_sub = ?').get(googleSub),
  )

test('deleting from /conta asks for the word, ends the session and tells the device', async ({
  page,
  context,
}) => {
  const googleSub = unique()
  await signIn(context, googleSub)
  await page.goto('/conta')
  await page.evaluate(() => {
    localStorage.setItem('tem-estudo:sync-account', '5')
    localStorage.setItem('tem-estudo:profile', JSON.stringify({ age: 37 }))
  })
  const submit = page.getByRole('button', {
    name: 'Excluir a conta para sempre',
  })
  // The browser refuses an empty field, and nothing happens.
  await submit.click()
  await expect(page.getByRole('status')).toHaveCount(0)
  expect(signedInAs(googleSub)).toBeDefined()

  await page.getByLabel('Para confirmar, escreva EXCLUIR').fill('EXCLUIR')
  await submit.click()
  await expect(page.getByText(/Sua conta foi excluída/)).toBeVisible()
  expect(signedInAs(googleSub)).toBeUndefined()
  await expect(
    page.getByRole('link', { name: 'Entrar com Google' }),
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem('tem-estudo:sync-account')),
    )
    .toBeNull()
  expect(
    await page.evaluate(() => localStorage.getItem('tem-estudo:profile')),
  ).not.toBeNull()

  // The notice is read once.
  await page.reload()
  await expect(page.getByText(/Sua conta foi excluída/)).toHaveCount(0)
})

test('keeping the comments shows them as "leitor removido" on the page', async ({
  page,
  context,
}) => {
  const googleSub = unique()
  const nickname = await signIn(context, googleSub)
  const body = `Comentário que fica ${unique()}`
  const path = await page
    .goto('/estudos')
    .then(() =>
      page.locator('main a[href^="/estudos/"]').first().getAttribute('href'),
    )
  seed((db) => {
    db.prepare(
      `INSERT INTO public_comments (account_id, path, quote, body, created_at)
      SELECT id, ?, 'um trecho', ?, 1 FROM accounts WHERE google_sub = ?`,
    ).run(path, body, googleSub)
  })
  await page.goto('/conta')
  await page.getByRole('checkbox', { name: /leitor removido/ }).click()
  await page.getByLabel('Para confirmar, escreva EXCLUIR').fill('excluir')
  await page
    .getByRole('button', { name: 'Excluir a conta para sempre' })
    .click()
  await expect(page.getByText(/Sua conta foi excluída/)).toBeVisible()
  await page.goto(path!)
  await expect(page.getByText(body)).toBeVisible()
  await expect(page.getByText('leitor removido').first()).toBeVisible()
  await expect(page.getByText(nickname)).toHaveCount(0)
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('the form still deletes, with the default of erasing the comments', async ({
    page,
    context,
  }) => {
    const googleSub = unique()
    await signIn(context, googleSub)
    await page.goto('/conta')
    await page.getByLabel('Para confirmar, escreva EXCLUIR').fill('EXCLUIR')
    await page
      .getByRole('button', { name: 'Excluir a conta para sempre' })
      .click()
    await expect(page.getByText(/Sua conta foi excluída/)).toBeVisible()
    expect(signedInAs(googleSub)).toBeUndefined()
  })
})
