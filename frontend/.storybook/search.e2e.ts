// The sidebar search finds the story typed with an accent (`manager.ts`).
// Runs on the real Storybook, `pnpm test:storybook`: if an upgrade swaps the
// search field, this is where we find out. From the Festival dos Macacos
// `busca.e2e.ts`.
import { expect, type Page, test } from '@playwright/test'

const search = (page: Page) => page.locator('#storybook-explorer-searchfield')
const possibleGroup = (page: Page) =>
  page.getByRole('option').and(page.locator('[data-id="ui-possible-group"]'))

test('possíble finds the Possible group', async ({ page }) => {
  await page.goto('/')
  await search(page).pressSequentially('possíble group')
  await expect(search(page)).toHaveValue('possible group')
  await expect(possibleGroup(page)).toBeVisible()
})

// The dead key of the ABNT2 keyboard on Windows: the `´` stays in
// composition until the `i`, and only then the accent comes out.
test('the dead-key accent comes out too', async ({ page }) => {
  await page.goto('/')
  await search(page).pressSequentially('poss')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.imeSetComposition', {
    text: '´',
    selectionStart: 1,
    selectionEnd: 1,
  })
  await cdp.send('Input.insertText', { text: 'í' })
  await search(page).pressSequentially('ble group')
  await expect(search(page)).toHaveValue('possible group')
  await expect(possibleGroup(page)).toBeVisible()
})
