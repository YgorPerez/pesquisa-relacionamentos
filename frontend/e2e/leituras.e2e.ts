// As leituras das páginas (#56, ADR 0031): o servidor desenha a página com os
// dados e os entrega ao navegador no HTML. Hidratar não pede nada de novo às
// server functions, e voltar a uma página já lida também não.
import { expect, test, type Page } from '@playwright/test'

/** Os pedidos às server functions (`/_serverFn/…`) desde agora. */
function pedidosAoServidor(page: Page) {
  const urls: string[] = []
  page.on('request', (pedido) => {
    if (new URL(pedido.url()).pathname.startsWith('/_serverFn/'))
      urls.push(pedido.url())
  })
  return urls
}

const PAGINAS = [
  '/',
  '/estudos',
  '/estudos/lima-2015-encontros',
  '/onde-conhecer-pessoas',
  '/onde-conhecer-pessoas/onde-os-casais-se-conhecem',
  '/dicas',
  '/dicas/apps-como-complemento',
  '/grupo-possivel',
  '/prioridades',
]

for (const caminho of PAGINAS) {
  test(`${caminho} hidrata sem pedir os dados de novo`, async ({ page }) => {
    const pedidos = pedidosAoServidor(page)
    await page.goto(caminho, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(pedidos).toEqual([])
  })
}

test('voltar a uma página já lida não pede os dados de novo', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const pedidos = pedidosAoServidor(page)

  await page.getByRole('link', { name: 'Todos os estudos' }).click()
  await expect(page).toHaveURL(/\/estudos$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.waitForLoadState('networkidle')
  // A navegação no cliente lê pela server function: o detector enxerga.
  expect(pedidos.length).toBeGreaterThan(0)
  pedidos.length = 0

  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await page.waitForLoadState('networkidle')
  expect(pedidos).toEqual([])
})
