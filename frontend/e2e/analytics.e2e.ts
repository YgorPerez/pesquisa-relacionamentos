// A contagem de uso (#35, ADR 0001) sobre o conteúdo de fixture. Os envios ao
// GoatCounter de stats.temestudo.com são interceptados e nunca saem da
// máquina. Eles levam o caminho sem query, a referência, a largura da tela e,
// nos eventos, o nome do evento. Nada do Perfil, nem se ele foi preenchido.
import { expect, test, type Page } from '@playwright/test'
import { queryDoLink } from '@tem-estudo/regras/link'
import { tocar } from './toque'

const GUIA = '/onde-conhecer-pessoas/onde-os-casais-se-conhecem'
/** A query de um link de verdade, com o Perfil. */
const QUERY_COM_PERFIL = queryDoLink({
  calculadora: 'grupo-possivel',
  perfil: { genero: 'homem', procura: 'mulheres', idade: 30 },
  requisitos: null,
})
const STATS = 'https://stats.temestudo.com/'
const CAMPOS = ['p', 'r', 's', 'e', 'b', 'rnd']

/** Os envios ao GoatCounter, sem o `rnd` (que só fura o cache). */
function gravarEnvios(page: Page) {
  const envios: Record<string, string>[] = []
  const pedidos: string[] = []
  page.on('request', (pedido) => {
    if (/goatcounter/i.test(pedido.url())) pedidos.push(pedido.url())
  })
  void page.route(`${STATS}**`, async (rota) => {
    const url = new URL(rota.request().url())
    pedidos.push(url.href)
    if (url.pathname === '/count') {
      const campos = Object.fromEntries(url.searchParams)
      delete campos.rnd
      envios.push(campos)
    }
    await rota.fulfill({ status: 204 })
  })
  return { envios, pedidos }
}

async function abrir(page: Page, caminho: string) {
  await page.goto(caminho, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

async function dizerPerfil(page: Page, botao: string) {
  const form = page.getByRole('form', { name: 'Seu Perfil' })
  await form.getByRole('group', { name: 'Você é' }).getByRole('radio', { name: 'homem', exact: true }).check()
  await form.getByRole('group', { name: 'Você procura' }).getByRole('radio', { name: 'mulheres', exact: true }).check()
  await form.getByLabel('Sua idade').fill('30')
  await form.getByRole('button', { name: botao }).click()
}

const ajudou = (page: Page) => page.getByRole('region', { name: 'Ajudou?' })

/** Uma visita inteira: o Guia com "Ajudou?" e uma Ficha aberta dele, e as
 * duas calculadoras mexidas duas vezes cada. */
async function percorrer(page: Page, comPerfil: boolean, envios: Record<string, string>[]) {
  await abrir(page, GUIA)
  if (comPerfil) await dizerPerfil(page, 'Ver o que vale para mim')
  await ajudou(page).getByRole('button', { name: 'Não' }).click()
  await ajudou(page).getByRole('button', { name: 'Difícil de entender' }).click()
  await expect(ajudou(page)).toContainText('Obrigado')
  await page.locator('.fichas-citadas a.ficha-titulo').first().click()
  await expect(page).toHaveURL(/\/estudos\//)
  // A visita da Ficha sai depois da navegação: espere antes de sair dela.
  await expect.poll(() => envios.some((e) => e.p.startsWith('/estudos/'))).toBe(true)

  await abrir(page, '/grupo-possivel')
  const fuma = page.locator('#req-fumo').getByRole('checkbox', { name: 'Só quem não fuma' })
  await fuma.check()
  await fuma.uncheck()

  await abrir(page, '/prioridades')
  const chips = page.getByRole('region', { name: 'Seu topo 3' })
  await tocar(chips.getByRole('button', { name: /Renda$/ }))
  await tocar(chips.getByRole('button', { name: /Aparência$/ }))
  await page.waitForLoadState('networkidle')
}

test.describe('contagem de uso', () => {
  test('cada página conta o caminho sem query, e os eventos saem com o nome certo', async ({ page }) => {
    const { envios } = gravarEnvios(page)
    await abrir(page, `${GUIA}?${QUERY_COM_PERFIL}`)
    await expect.poll(() => envios.length).toBeGreaterThan(0)
    expect(envios[0].p).toBe(GUIA)
    expect(envios[0].e).toBeUndefined()
    expect(Number(envios[0].s)).toBeGreaterThan(0)

    await ajudou(page).getByRole('button', { name: 'Sim' }).click()
    await expect(ajudou(page)).toContainText('Obrigado')
    await expect.poll(() => envios.map((e) => e.p)).toContain('ajudou/sim/onde-os-casais-se-conhecem')
    const evento = envios.find((e) => e.p.startsWith('ajudou/'))
    expect(evento?.e).toBe('true')
  })

  test('"Ajudou?" no fim do Guia: sim, ou não com um de quatro motivos, sem campo livre', async ({ page }) => {
    const { envios } = gravarEnvios(page)
    await abrir(page, GUIA)
    const titulos = await page.locator('main h2').allTextContents()
    expect(titulos.indexOf('Ajudou?')).toBe(titulos.indexOf('Fichas citadas') + 1)

    await ajudou(page).getByRole('button', { name: 'Não' }).click()
    const motivos = ajudou(page).getByRole('group', { name: 'O que faltou?' }).getByRole('button')
    await expect(motivos).toHaveText([
      'Não respondeu minha dúvida',
      'Não confio na resposta',
      'Difícil de entender',
      'Não vale para mim',
    ])
    for (const motivo of await motivos.all()) {
      expect((await motivo.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    }
    await expect(ajudou(page).locator('input, textarea')).toHaveCount(0)
    await motivos.filter({ hasText: 'Não confio na resposta' }).click()
    await expect(ajudou(page)).toContainText('Obrigado')
    await expect.poll(() => envios.map((e) => e.p)).toContain('ajudou/nao/nao-confio/onde-os-casais-se-conhecem')
  })

  test('nenhum envio leva campo do Perfil, nem se ele foi preenchido', async ({ browser }) => {
    const visitas: Record<string, string>[][] = []
    for (const comPerfil of [false, true]) {
      const contexto = await browser.newContext({ ...test.info().project.use })
      const page = await contexto.newPage()
      const { envios } = gravarEnvios(page)
      await percorrer(page, comPerfil, envios)
      visitas.push(envios.map(({ r: _r, ...resto }) => resto))
      for (const envio of envios) {
        expect(CAMPOS).toEqual(expect.arrayContaining(Object.keys(envio)))
        expect(envio.p).not.toContain('?')
        expect(JSON.stringify(envio)).not.toMatch(/homem|mulher|30|perfil/i)
      }
      await contexto.close()
    }
    const [semPerfil, comPerfil] = visitas
    expect(comPerfil).toEqual(semPerfil)
    const eventos = semPerfil.filter((e) => e.e === 'true').map((e) => e.p)
    expect(eventos).toEqual([
      'ajudou/nao/dificil/onde-os-casais-se-conhecem',
      expect.stringMatching(/^ficha\/onde-os-casais-se-conhecem\/[a-z0-9-]+$/),
      'calculadora/grupo-possivel',
      'calculadora/prioridades',
    ])
  })

  for (const [nome, sinal] of [
    ['GPC', 'globalPrivacyControl'],
    ['Do Not Track', 'doNotTrack'],
  ] as const) {
    test(`com ${nome}, o script nem carrega e a chave diz por quê`, async ({ page }) => {
      await page.addInitScript((sinal) => {
        Object.defineProperty(Navigator.prototype, sinal, {
          get: () => (sinal === 'doNotTrack' ? '1' : true),
        })
      }, sinal)
      const { pedidos } = gravarEnvios(page)
      await abrir(page, GUIA)
      await ajudou(page).getByRole('button', { name: 'Sim' }).click()
      await abrir(page, '/privacidade')
      const chave = page.getByRole('main').getByRole('switch', { name: 'Contar minhas visitas' })
      await expect(chave).not.toBeChecked()
      await expect(chave).toBeDisabled()
      await expect(page.getByRole('main')).toContainText('seu navegador pede para não contar')
      expect(pedidos).toEqual([])
    })
  }

  test('a chave do rodapé desliga a contagem, e um link recebido não a religa', async ({ page }) => {
    const { pedidos } = gravarEnvios(page)
    await abrir(page, '/')
    await expect.poll(() => pedidos.length).toBeGreaterThan(0)
    const chave = page.getByRole('contentinfo').getByRole('switch', { name: 'Contar minhas visitas' })
    await expect(chave).toBeChecked()
    await chave.uncheck()
    expect(await page.evaluate(() => localStorage.getItem('tem-estudo:nao-contar'))).toBe('true')

    pedidos.length = 0
    await abrir(page, `/grupo-possivel?${QUERY_COM_PERFIL}&contar=1`)
    await abrir(page, GUIA)
    await ajudou(page).getByRole('button', { name: 'Sim' }).click()
    await expect(ajudou(page)).toContainText('não sai do aparelho')
    await expect(page.getByRole('contentinfo').getByRole('switch', { name: 'Contar minhas visitas' })).not.toBeChecked()
    expect(pedidos).toEqual([])

    // A da página de privacidade é a mesma preferência.
    await abrir(page, '/privacidade')
    const daPagina = page.getByRole('main').getByRole('switch', { name: 'Contar minhas visitas' })
    await expect(daPagina).not.toBeChecked()
    await daPagina.check()
    await expect(page.getByRole('contentinfo').getByRole('switch', { name: 'Contar minhas visitas' })).toBeChecked()
    // Religar não conta a página em que se está; a próxima conta.
    await page.waitForTimeout(500)
    expect(pedidos).toEqual([])
    await page.getByRole('banner').getByRole('link').first().click()
    await expect.poll(() => pedidos.length).toBeGreaterThan(0)
  })
})

test('a página de privacidade diz o que fica no aparelho, no link, no log e no analytics', async ({ page }) => {
  await abrir(page, '/privacidade')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacidade')
  const secoes = await page.locator('main h2').allTextContents()
  expect(secoes).toEqual([
    'O que fica no seu aparelho',
    'O que vai no link',
    'O que o servidor anota',
    'O que a contagem de visitas guarda',
    'Não ser contado',
  ])
  await expect(page.getByRole('main')).toContainText('31 dias')
  // A coleta do GoatCounter não tem sessões (`COLETA_DO_STATS`, `scripts/vps.ts`).
  await expect(page.getByRole('main')).toContainText('não liga as páginas de uma mesma visita')
  await expect(page.getByRole('main')).not.toContainText('8 horas')
  await expect(page.getByRole('main')).toContainText('3 dias')
  await expect(page.getByRole('main')).toContainText('14 dias')
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacidade' })).toHaveAttribute(
    'href',
    '/privacidade',
  )
})
