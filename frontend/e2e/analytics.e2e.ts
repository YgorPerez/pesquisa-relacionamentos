// The usage count (#35, ADR 0001) over the fixture content. The sends to the
// GoatCounter at stats.temestudo.cloud are intercepted and never leave the
// machine. They carry the path without query, the referrer, the screen width
// and, in events, the event name. Nothing of the Profile, nor whether it was
// filled in.
import { expect, test, type Page } from '@playwright/test'
import { linkQuery } from '@tem-estudo/rules/link'
import { tap } from './touch'

const GUIDE = '/onde-conhecer-pessoas'
/** The query of a real link, with the Profile. */
const QUERY_WITH_PROFILE = linkQuery({
  calculator: 'grupo-possivel',
  profile: { gender: 'homem', seeks: 'mulheres', age: 30 },
  requirements: null,
})
const STATS = 'https://stats.temestudo.cloud/'
const FIELDS = ['p', 'r', 's', 'e', 'b', 'rnd']

/** The sends to GoatCounter, without the `rnd` (which only busts the
 * cache). */
function recordHits(page: Page) {
  const hits: Record<string, string>[] = []
  const requests: string[] = []
  page.on('request', (request) => {
    if (/goatcounter/i.test(request.url())) requests.push(request.url())
  })
  void page.route(`${STATS}**`, async (route) => {
    const url = new URL(route.request().url())
    requests.push(url.href)
    if (url.pathname === '/count') {
      const fields = Object.fromEntries(url.searchParams)
      delete fields.rnd
      hits.push(fields)
    }
    await route.fulfill({ status: 204 })
  })
  return { hits, requests }
}

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

async function fillProfile(page: Page, button: string) {
  const form = page.getByRole('form', { name: 'Seu Perfil' })
  await form
    .getByRole('group', { name: 'Você é' })
    .getByRole('radio', { name: 'homem', exact: true })
    .check()
  await form
    .getByRole('group', { name: 'Você procura' })
    .getByRole('radio', { name: 'mulheres', exact: true })
    .check()
  await form.getByLabel('Sua idade').fill('30')
  await form.getByRole('button', { name: button }).click()
}

/** The Guide's one "Ajudou?", near the end (#194). */
const helped = (page: Page) => page.getByRole('region', { name: 'Ajudou?' })

/** A whole visit: the Guide with "Ajudou?" and a Fact sheet opened from it,
 * and the two calculators used twice each. */
async function walkThrough(
  page: Page,
  withProfile: boolean,
  hits: Record<string, string>[],
) {
  await open(page, GUIDE)
  if (withProfile) await fillProfile(page, 'Ver o que vale para mim')
  await helped(page).getByRole('button', { name: 'Não' }).click()
  await helped(page)
    .getByRole('button', { name: 'Difícil de entender' })
    .click()
  await expect(helped(page)).toContainText('Obrigado')
  await page
    .locator('[data-slot="fichas-citadas"] li > div > a')
    .first()
    .click()
  await expect(page).toHaveURL(/\/estudos\//)
  // The Fact sheet visit goes out after the navigation: wait before leaving
  // it.
  await expect
    .poll(() => hits.some((e) => e.p.startsWith('/estudos/')))
    .toBe(true)

  await open(page, '/grupo-possivel')
  const smokes = page
    .locator('#req-smoking')
    .getByRole('checkbox', { name: 'Só quem não fuma' })
  await smokes.check()
  await smokes.uncheck()

  await open(page, '/prioridades')
  const chips = page.getByRole('region', { name: 'Seu topo 3' })
  await tap(chips.getByRole('button', { name: /Renda$/ }))
  await tap(chips.getByRole('button', { name: /Aparência$/ }))
  await page.waitForLoadState('networkidle')
}

test.describe('usage count', () => {
  test('each page counts the path without query, and the events go out with the right name', async ({
    page,
  }) => {
    const { hits } = recordHits(page)
    await open(page, `${GUIDE}?${QUERY_WITH_PROFILE}`)
    await expect.poll(() => hits.length).toBeGreaterThan(0)
    expect(hits[0].p).toBe(GUIDE)
    expect(hits[0].e).toBeUndefined()
    expect(Number(hits[0].s)).toBeGreaterThan(0)

    await helped(page).getByRole('button', { name: 'Sim' }).click()
    await expect(helped(page)).toContainText('Obrigado')
    await expect
      .poll(() => hits.map((e) => e.p))
      .toContain('helped/yes/onde-conhecer-pessoas')
    const event = hits.find((e) => e.p.startsWith('helped/'))
    expect(event?.e).toBe('true')
  })

  test('one "Ajudou?" for the whole Guide, after the Fact sheets: yes, or no with one of four reasons, no free field', async ({
    page,
  }) => {
    const { hits } = recordHits(page)
    await open(page, GUIDE)
    await expect(helped(page)).toHaveCount(1)
    await expect(page.locator('#fichas ~ #ajudou')).toHaveCount(1)

    await helped(page).getByRole('button', { name: 'Não' }).click()
    const reasons = helped(page)
      .getByRole('group', { name: 'O que faltou?' })
      .getByRole('button')
    await expect(reasons).toHaveText([
      'Não respondeu minha dúvida',
      'Não confio na resposta',
      'Difícil de entender',
      'Não vale para mim',
    ])
    for (const reason of await reasons.all()) {
      expect((await reason.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    }
    await expect(helped(page).locator('input, textarea')).toHaveCount(0)
    await reasons.filter({ hasText: 'Não confio na resposta' }).click()
    await expect(helped(page)).toContainText('Obrigado')
    await expect
      .poll(() => hits.map((e) => e.p))
      .toContain('helped/no/do-not-trust/onde-conhecer-pessoas')
  })

  test('no send carries a Profile field, nor whether it was filled in', async ({
    browser,
  }) => {
    const visits: Record<string, string>[][] = []
    for (const withProfile of [false, true]) {
      const context = await browser.newContext({ ...test.info().project.use })
      const page = await context.newPage()
      const { hits } = recordHits(page)
      await walkThrough(page, withProfile, hits)
      visits.push(hits.map(({ r: _r, ...rest }) => rest))
      for (const hit of hits) {
        expect(FIELDS).toEqual(expect.arrayContaining(Object.keys(hit)))
        expect(hit.p).not.toContain('?')
        expect(JSON.stringify(hit)).not.toMatch(/homem|mulher|30|perfil/i)
      }
      await context.close()
    }
    const [withoutProfile, withProfile] = visits
    expect(withProfile).toEqual(withoutProfile)
    const events = withoutProfile.filter((e) => e.e === 'true').map((e) => e.p)
    expect(events).toEqual([
      'helped/no/hard-to-understand/onde-conhecer-pessoas',
      // A Fact sheet opened from the Guide counts by the Topic.
      expect.stringMatching(/^fact-sheet\/onde-conhecer-pessoas\/[a-z0-9-]+$/),
      'calculator/possible-group',
      'calculator/priorities',
    ])
  })

  for (const [name, signal] of [
    ['GPC', 'globalPrivacyControl'],
    ['Do Not Track', 'doNotTrack'],
  ] as const) {
    test(`with ${name}, the script does not even load and the switch says why`, async ({
      page,
    }) => {
      await page.addInitScript((signal) => {
        Object.defineProperty(Navigator.prototype, signal, {
          get: () => (signal === 'doNotTrack' ? '1' : true),
        })
      }, signal)
      const { requests } = recordHits(page)
      await open(page, GUIDE)
      await helped(page).getByRole('button', { name: 'Sim' }).click()
      await open(page, '/privacidade')
      const toggle = page
        .getByRole('main')
        .getByRole('switch', { name: 'Contar minhas visitas' })
      await expect(toggle).not.toBeChecked()
      await expect(toggle).toBeDisabled()
      await expect(page.getByRole('main')).toContainText(
        'seu navegador pede para não contar',
      )
      expect(requests).toEqual([])
    })
  }

  test('the footer switch turns the count off, and a received link does not turn it back on', async ({
    page,
  }) => {
    const { requests } = recordHits(page)
    await open(page, '/')
    await expect.poll(() => requests.length).toBeGreaterThan(0)
    const toggle = page
      .getByRole('contentinfo')
      .getByRole('switch', { name: 'Contar minhas visitas' })
    await expect(toggle).toBeChecked()
    await toggle.uncheck()
    expect(
      await page.evaluate(() =>
        localStorage.getItem('tem-estudo:do-not-count'),
      ),
    ).toBe('true')

    requests.length = 0
    await open(page, `/grupo-possivel?${QUERY_WITH_PROFILE}&contar=1`)
    await open(page, GUIDE)
    await helped(page).getByRole('button', { name: 'Sim' }).click()
    await expect(helped(page)).toContainText('não sai do aparelho')
    await expect(
      page
        .getByRole('contentinfo')
        .getByRole('switch', { name: 'Contar minhas visitas' }),
    ).not.toBeChecked()
    expect(requests).toEqual([])

    // The privacy page one is the same preference.
    await open(page, '/privacidade')
    const onPage = page
      .getByRole('main')
      .getByRole('switch', { name: 'Contar minhas visitas' })
    await expect(onPage).not.toBeChecked()
    await onPage.check()
    await expect(
      page
        .getByRole('contentinfo')
        .getByRole('switch', { name: 'Contar minhas visitas' }),
    ).toBeChecked()
    // Turning it back on does not count the current page; the next one
    // counts.
    await page.waitForTimeout(500)
    expect(requests).toEqual([])
    await page.getByRole('banner').getByRole('link').first().click()
    await expect.poll(() => requests.length).toBeGreaterThan(0)
  })
})

test('the privacy page says what stays on the device, in the link, in the log and in analytics', async ({
  page,
}) => {
  await open(page, '/privacidade')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Privacidade',
  )
  const sections = await page.locator('main h2').allTextContents()
  expect(sections).toEqual([
    'O que fica no seu aparelho',
    'O que vai no link',
    'O que o servidor anota',
    'O que a contagem de visitas guarda',
    'Não ser contado',
  ])
  await expect(page.getByRole('main')).toContainText('31 dias')
  // GoatCounter's collection has no sessions (`COLETA_DO_STATS`,
  // `scripts/vps.ts`).
  await expect(page.getByRole('main')).toContainText(
    'não liga as páginas de uma mesma visita',
  )
  await expect(page.getByRole('main')).not.toContainText('8 horas')
  await expect(page.getByRole('main')).toContainText('3 dias')
  await expect(page.getByRole('main')).toContainText('14 dias')
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'Privacidade' }),
  ).toHaveAttribute('href', '/privacidade')
})

test.describe('usage count inside the Guide', () => {
  test('a Fact sheet opened from a link in a Chapter counts by the Topic', async ({
    page,
  }) => {
    const { hits } = recordHits(page)
    await open(page, '/escolher-parceiro')
    await page
      .locator('[data-slot="capitulo"]')
      .getByRole('link', { name: 'a Ficha do estudo brasileiro' })
      .click()
    await expect(page).toHaveURL('/estudos/silva-2020-apps-brasil')
    await expect
      .poll(() => hits.map((e) => e.p))
      .toContain('fact-sheet/escolher-parceiro/silva-2020-apps-brasil')
  })
})
