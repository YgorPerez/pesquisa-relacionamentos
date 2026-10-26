// The site search (#275) over the fixture content: the header's magnifier,
// the page with and without JavaScript, the hit that lands on its sentence,
// the anchors on each page, and the count of a search with no result, which
// never carries the term (#18). The sends to GoatCounter are intercepted and
// never leave the machine.
import { expect, test } from '@playwright/test'

const STATS = 'https://stats.temestudo.cloud/'

test.describe('site search', () => {
  test('the magnifier opens the search with the cursor in the field, and Enter shows the results', async ({
    page,
  }) => {
    // The page hydrates before the tap, so the router takes it.
    await page.goto('/dicas', { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Buscar no site' }).click()
    const field = page.getByRole('searchbox', { name: 'Palavra ou frase' })
    await expect(field).toBeFocused()
    await field.pressSequentially('Pessoalmente')
    await field.press('Enter')
    await expect(page).toHaveURL('/busca?q=Pessoalmente')
    await expect(
      page.getByRole('heading', { name: '1 trecho em 1 página' }),
    ).toBeVisible()
  })

  // The search copies each section's anchor from the pages
  // (`ui/guide-sections.tsx`, `routes/estudos/$slug.tsx`): a renamed section
  // would leave its hits stopping at the top of the page.
  test('every anchor a hit leads to is on its page', async ({ request }) => {
    const anchors = new Map<string, Set<string>>()
    for (const query of ['de', 'app', 'complemento', 'capitais']) {
      const html = await (
        await request.get(`/busca?q=${encodeURIComponent(query)}`)
      ).text()
      for (const [, path = '', anchor = ''] of html.matchAll(
        /data-slot="trecho"><a href="([^"#]+)#([a-z0-9-]+)/g,
      ))
        anchors.set(path, (anchors.get(path) ?? new Set()).add(anchor))
    }
    const all = new Set([...anchors.values()].flatMap((a) => [...a]))
    for (const fixed of [
      'em-resumo',
      'o-que-levar',
      'o-que-nao-se-sabe',
      'o-que-mediu',
      'achados',
      'limitacoes',
    ])
      expect(all).toContain(fixed)
    for (const [path, ids] of anchors) {
      const html = await (await request.get(path)).text()
      for (const id of ids)
        expect(html, `${path}#${id}`).toContain(`id="${id}"`)
    }
  })

  test('a hit leads to its page with the sentence on the screen', async ({
    page,
  }) => {
    await page.goto('/busca?q=pessoalmente')
    await page
      .getByRole('link', { name: /O lugar quase não muda a relação/ })
      .click()
    await expect(page).toHaveURL(/\/onde-conhecer-pessoas#/)
    await expect(
      page.getByText(
        'A satisfação de quem se conheceu online e de quem se conheceu pessoalmente fica perto',
      ),
    ).toBeInViewport()
  })

  test('a Text Fragment with no anchor keeps the page on the sentence after hydration', async ({
    page,
  }) => {
    // The browser applies a Text Fragment only to a followed link, never to
    // `page.goto`; and the router would scroll back to the top (`router.tsx`).
    await page.goto('/busca')
    await page.evaluate(() => {
      const link = document.createElement('a')
      link.href =
        '/onde-conhecer-pessoas#:~:text=Nenhum%20estudo%20separou%20app'
      link.textContent = 'ir'
      link.id = 'ir'
      document.body.prepend(link)
    })
    await page.locator('#ir').click()
    await expect(page).toHaveURL(/\/onde-conhecer-pessoas/)
    // The reading bar mounts after hydration, when the router would scroll.
    await page.locator('[data-slot="leitura"]').waitFor({ state: 'attached' })
    await expect(
      page.getByText('Nenhum estudo separou app de rede social'),
    ).toBeInViewport()
  })

  test('a search with no result counts the fact, never the term', async ({
    page,
  }) => {
    const sent: string[] = []
    await page.route(`${STATS}**`, async (route) => {
      sent.push(route.request().url())
      await route.fulfill({ status: 204 })
    })
    await page.goto('/busca?q=poliamor', { waitUntil: 'networkidle' })
    await expect(
      page.getByRole('heading', { name: 'Nada encontrado para “poliamor”.' }),
    ).toBeVisible()
    await expect
      .poll(() => sent.map((url) => new URL(url).searchParams.get('p')))
      .toContain('search/no-result')
    for (const url of sent) expect(url).not.toMatch(/poliamor/i)
  })
})

test.describe('site search without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the magnifier opens the search, and the field sends the query to the results', async ({
    page,
  }) => {
    await page.goto('/dicas')
    await page.getByRole('link', { name: 'Buscar no site' }).click()
    await expect(page).toHaveURL('/busca')
    await page
      .getByRole('searchbox', { name: 'Palavra ou frase' })
      .fill('complemento')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await expect(page).toHaveURL('/busca?q=complemento')
    await expect(
      page.getByRole('heading', { name: '3 trechos em 3 páginas' }),
    ).toBeVisible()
    // One hit per page; the Tip's title is a link too.
    await expect(
      page.locator('[data-slot=trecho] a', {
        hasText: 'complemento, não como o único caminho',
      }),
    ).toHaveCount(3)
  })
})
