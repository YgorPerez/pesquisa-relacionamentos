// A Verbete's way to the Glossário and back (#358), over the fixture content
// (`e2e/library`): the answer of "App ou presencial" marks "satisfação".
// Like a reference ring (`navigation.e2e.ts`), the entry the reader came to
// gets the loop and "voltar ao texto", which goes back to the sentence.
import { expect, test, type Page } from '@playwright/test'
import { tap } from './touch'

const GUIDE = '/onde-conhecer-pessoas'
const ENTRY = '/glossario#satisfacao'

/** The marked word, in the answer that cites Costa. */
const word = (page: Page) =>
  page
    .getByRole('region', { name: /^App ou presencial/ })
    .getByRole('link', { name: 'satisfação', exact: true })

async function toTheGlossary(page: Page) {
  await page.goto(GUIDE)
  await tap(word(page))
  await tap(
    page
      .getByRole('dialog', { name: 'O que é satisfação' })
      .getByRole('link', { name: 'Ver no Glossário' }),
  )
  await expect(page).toHaveURL(ENTRY)
  return page.locator('#satisfacao [data-alvo]')
}

test('from a text, the Verbete is circled and "voltar ao texto" goes back to the sentence', async ({
  page,
}) => {
  const entry = await toTheGlossary(page)
  await expect(entry).toBeInViewport()
  await expect(entry).toBeFocused()
  await expect(entry.locator('svg.laco path')).toHaveCSS(
    'stroke-dashoffset',
    '0px',
  )
  await expect(page.locator('svg.laco')).toHaveCount(1)

  const back = entry.getByRole('button', { name: 'voltar ao texto' })
  expect((await back.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  await tap(back)
  await expect(page).toHaveURL(GUIDE)
  await expect(word(page)).toBeInViewport()
})

test('a visit straight to the entry lands on it with no loop and no way back', async ({
  page,
}) => {
  await page.goto(ENTRY)
  await expect(page.locator('#satisfacao')).toBeInViewport()
  await expect(page.locator('svg.laco')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'voltar ao texto' }),
  ).toHaveCount(0)
})
