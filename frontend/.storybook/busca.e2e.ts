// A busca da barra lateral acha a story escrita com acento (`manager.ts`).
// Roda no Storybook de verdade, `pnpm test:storybook`: se um upgrade trocar o
// campo da busca, é aqui que se fica sabendo. Do `busca.e2e.ts` do Festival
// dos Macacos.
import { expect, type Page, test } from '@playwright/test'

const busca = (page: Page) => page.locator('#storybook-explorer-searchfield')
const grupoPossivel = (page: Page) =>
  page.getByRole('option').and(page.locator('[data-id="ui-grupo-possivel"]'))

test('possível acha o Grupo possível', async ({ page }) => {
  await page.goto('/')
  await busca(page).pressSequentially('grupo possível')
  await expect(busca(page)).toHaveValue('grupo possivel')
  await expect(grupoPossivel(page)).toBeVisible()
})

// A tecla morta do teclado ABNT2 no Windows: o `´` fica em composição até o
// `i`, e só então o acento sai.
test('o acento de tecla morta também sai', async ({ page }) => {
  await page.goto('/')
  await busca(page).pressSequentially('grupo poss')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text: '´',
    selectionStart: 1,
    selectionEnd: 1,
  })
  await cdp.send('Input.insertText', { text: 'í' })
  await busca(page).pressSequentially('vel')
  await expect(busca(page)).toHaveValue('grupo possivel')
  await expect(grupoPossivel(page)).toBeVisible()
})
