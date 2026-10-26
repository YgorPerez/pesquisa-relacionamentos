// The pages' reads (#56, ADR 0031): the server draws the page with the data
// and hands it to the browser in the HTML. Hydrating asks the server
// functions for nothing new, and neither does going back to a page already
// read.
import { expect, test, type Page } from '@playwright/test'

/** The requests to the server functions (`/_serverFn/…`) from now on. */
function serverRequests(page: Page) {
  const urls: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/_serverFn/'))
      urls.push(request.url())
  })
  return urls
}

const PAGES = [
  '/',
  '/estudos',
  '/estudos/lima-2015-encontros',
  '/onde-conhecer-pessoas',
  '/escolher-parceiro',
  '/dicas',
  '/dicas/apps-como-complemento',
  '/grupo-possivel',
  '/prioridades',
]

for (const path of PAGES) {
  test(`${path} hydrates without requesting the data again`, async ({
    page,
  }) => {
    const requests = serverRequests(page)
    await page.goto(path, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(requests).toEqual([])
  })
}

test('going back to a page already read does not request the data again', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const requests = serverRequests(page)

  await page.getByRole('link', { name: 'Todos os estudos' }).click()
  await expect(page).toHaveURL(/\/estudos$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.waitForLoadState('networkidle')
  // Client navigation reads through the server function: the detector sees
  // it.
  expect(requests.length).toBeGreaterThan(0)
  requests.length = 0

  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await page.waitForLoadState('networkidle')
  expect(requests).toEqual([])
})
